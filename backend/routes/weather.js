const express = require('express');
const router = express.Router();
const axios = require('axios');
const { query } = require('../config/db');
const Farmer = require('../models/Farmer');
const { optionalFarmerAuth } = require('../middleware/farmerAuth');

router.use(optionalFarmerAuth);

// Helper to log weather query if farmer is logged in
function logWeatherActivity(req, lat, lon, city = '') {
  if (req.farmerId) {
    Farmer.logActivity(req.farmerId, 'WEATHER_VIEW', { lat, lon, city }).catch(() => {});
  }
}

// In-memory cache for weather data (TTL: 10 mins for current, 30 mins for forecast)
const weatherCache = new Map();
const inFlightWeather = new Map(); // In-flight request deduplication
const CACHE_TTL_CURRENT = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL_FORECAST = 30 * 60 * 1000; // 30 minutes

function getCacheKey(type, lat, lon) {
  return `${type}:${parseFloat(lat).toFixed(2)}:${parseFloat(lon).toFixed(2)}`;
}

function getFromCache(key) {
  const cached = weatherCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  weatherCache.delete(key);
  return null;
}

function setInCache(key, data, ttl) {
  weatherCache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
}

// Persist weather reading into PostgreSQL
async function saveWeatherToDb(lat, lon, weatherData) {
  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const city = weatherData.name || '';
    const temp = weatherData.main?.temp || null;
    const feelsLike = weatherData.main?.feels_like || null;
    const humidity = weatherData.main?.humidity || null;
    const windSpeed = weatherData.wind?.speed || null;
    const condition = weatherData.weather?.[0]?.main || 'Unknown';
    const description = weatherData.weather?.[0]?.description || '';
    const precipitation = weatherData.rain?.['1h'] || weatherData.rain?.['3h'] || 0;
    const recordedAt = weatherData.dt ? new Date(weatherData.dt * 1000) : new Date();

    await query(`
      INSERT INTO weather_data (
        latitude, longitude, geom, city, temperature, feels_like,
        humidity, wind_speed, condition, description, precipitation,
        raw_data, recorded_at
      ) VALUES (
        $1, $2, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12
      )
    `, [
      latitude, longitude, city, temp, feelsLike,
      humidity, windSpeed, condition, description, precipitation,
      JSON.stringify(weatherData), recordedAt
    ]);
  } catch (err) {
    console.warn('⚠️ Non-fatal: Could not persist weather to DB:', err.message);
  }
}

// Retrieve latest stored weather from PostgreSQL as fallback
async function getLatestStoredWeather(lat, lon) {
  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Try finding within 50km or exact coordinate match
    const res = await query(`
      SELECT raw_data, recorded_at 
      FROM weather_data 
      WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 50000)
      ORDER BY recorded_at DESC 
      LIMIT 1
    `, [longitude, latitude]);

    if (res.rows.length > 0 && res.rows[0].raw_data) {
      const parsed = typeof res.rows[0].raw_data === 'string' 
        ? JSON.parse(res.rows[0].raw_data) 
        : res.rows[0].raw_data;
      const recDate = new Date(res.rows[0].recorded_at);
      const isStale = (Date.now() - recDate.getTime()) > (24 * 60 * 60 * 1000);
      return {
        ...parsed,
        _recordedAt: res.rows[0].recorded_at,
        _isStale: isStale
      };
    }
  } catch (err) {
    console.warn('⚠️ Could not query fallback weather from DB:', err.message);
  }
  return null;
}

// GET /api/weather/current
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // Validate coordinates
    if (lat === undefined || lon === undefined || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
      return res.status(400).json({ error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordinates out of bounds: latitude must be between -90 and 90, longitude between -180 and 180.' });
    }

    const cacheKey = getCacheKey('current', latitude, longitude);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, _cached: true });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ OPENWEATHER_API_KEY is not defined. Returning offline fallback.');
      const fallback = await getLatestStoredWeather(latitude, longitude);
      if (fallback) return res.json(fallback);
      return res.status(503).json({ error: 'Weather service is temporarily unconfigured.' });
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url, { timeout: 8000 });
      const weatherData = response.data;

      // Persist to DB & Cache
      await saveWeatherToDb(latitude, longitude, weatherData);
      setInCache(cacheKey, weatherData, CACHE_TTL_CURRENT);
      logWeatherActivity(req, latitude, longitude, weatherData.name || '');

      return res.json(weatherData);
    } catch (apiErr) {
      console.error('❌ OpenWeather API Error:', apiErr.response?.status || apiErr.message);

      // Attempt DB Fallback
      const fallback = await getLatestStoredWeather(latitude, longitude);
      if (fallback) {
        return res.json({ ...fallback, _isFallback: true });
      }

      return res.status(502).json({
        error: 'Unable to retrieve real-time weather at this moment. Please try again shortly.'
      });
    }
  } catch (error) {
    console.error('Weather Route Server Error:', error);
    res.status(500).json({ error: 'Internal server error processing weather request.' });
  }
});

// GET /api/weather/forecast
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (lat === undefined || lon === undefined || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
      return res.status(400).json({ error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Coordinates out of bounds.' });
    }

    const cacheKey = getCacheKey('forecast', latitude, longitude);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, _cached: true });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Weather forecast service is temporarily unconfigured.' });
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url, { timeout: 8000 });
      const forecastData = response.data;

      setInCache(cacheKey, forecastData, CACHE_TTL_FORECAST);
      return res.json(forecastData);
    } catch (apiErr) {
      console.error('❌ OpenWeather Forecast API Error:', apiErr.response?.status || apiErr.message);
      return res.status(502).json({
        error: 'Unable to retrieve weather forecast at this moment. Please try again shortly.'
      });
    }
  } catch (error) {
    console.error('Forecast Route Server Error:', error);
    res.status(500).json({ error: 'Internal server error processing forecast request.' });
  }
});

// GET /api/weather/farmer/:id (Location-based weather for a registered farmer)
router.get('/farmer/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });

    const [lon, lat] = farmer.location.coordinates;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      const fallback = await getLatestStoredWeather(lat, lon);
      if (fallback) return res.json({ farmer: { id: farmer.id, name: farmer.name, city: farmer.city }, weather: fallback });
      return res.status(503).json({ error: 'Weather service unconfigured.' });
    }

    const cacheKey = getCacheKey('current', lat, lon);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({
        farmer: { id: farmer.id, name: farmer.name, city: farmer.city, coordinates: [lon, lat] },
        weather: cached
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url, { timeout: 8000 });
    const weatherData = response.data;

    await saveWeatherToDb(lat, lon, weatherData);
    setInCache(cacheKey, weatherData, CACHE_TTL_CURRENT);

    res.json({
      farmer: { id: farmer.id, name: farmer.name, city: farmer.city, coordinates: [lon, lat] },
      weather: weatherData
    });
  } catch (error) {
    console.error('Farmer Weather Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve farmer weather data.' });
  }
});

module.exports = router;
