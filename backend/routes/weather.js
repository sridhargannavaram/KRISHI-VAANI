const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/current', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required.' });

        if (!process.env.OPENWEATHER_API_KEY) {
            // Mock response if no key
            return res.json({
                name: 'Unknown Location (Mock)',
                main: { temp: 32, humidity: 65, wind_speed: 12 },
                weather: [{ description: 'clear sky', icon: '01d' }]
            });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        
        res.json(response.data);
    } catch (error) {
         console.error('Weather API Error:', error.message);
         res.status(500).json({ error: 'Failed to fetch weather data.' });
    }
});

// 24 Hour Forecast
router.get('/forecast', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required.' });

        if (!process.env.OPENWEATHER_API_KEY) {
            // Mock forecast
            return res.json({
                list: Array.from({ length: 8 }).map((_, i) => ({
                    dt_txt: new Date(Date.now() + i * 10800000).toISOString(),
                    main: { temp: 28 + Math.random() * 5 },
                    weather: [{ description: 'mock weather', icon: '01d' }]
                }))
            });
        }

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        
        res.json(response.data);
    } catch (error) {
         console.error('Forecast API Error:', error.message);
         res.status(500).json({ error: 'Failed to fetch forecast.' });
    }
});

module.exports = router;
