const express = require('express');
const router = express.Router();
const axios = require('axios');
const Farmer = require('../models/Farmer');
const twilio = require('twilio');
const { requireFarmerAuth, optionalFarmerAuth } = require('../middleware/farmerAuth');

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// In-memory cache & in-flight deduplication for reverse geocoding (~100m precision)
const geocodeCache = new Map();
const inFlightGeocode = new Map();
const GEOCODE_TTL = 30 * 60 * 1000; // 30 minutes

function getGeocodeCacheKey(lat, lon) {
    return `${parseFloat(lat).toFixed(3)}:${parseFloat(lon).toFixed(3)}`;
}

/**
 * Helper: Reverse Geocode via OpenStreetMap Nominatim with retry, timeout & in-memory caching
 */
async function reverseGeocode(lat, lon) {
    const key = getGeocodeCacheKey(lat, lon);
    const cached = geocodeCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
    }

    if (inFlightGeocode.has(key)) {
        return await inFlightGeocode.get(key);
    }

    const fetchPromise = (async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en&addressdetails=1`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'KrishiVaani-App/1.0 (Agriculture Telemetry Platform; contact@krishivaani.in)',
                    'Accept': 'application/json'
                },
                timeout: 6000
            });

            const address = response.data?.address || {};
            const state = address.state || address.state_district || '';
            const district = address.district || address.state_district || address.county || '';
            
            // Priority order for Indian urban/rural settlements
            let city = address.city || 
                       address.town || 
                       address.municipality || 
                       address.suburb || 
                       address.neighbourhood || 
                       address.residential || 
                       address.village || 
                       address.hamlet || 
                       address.city_district || 
                       district || 
                       'My Farm';
                       
            // Clean up common suffix noise if present
            if (city && typeof city === 'string') {
                city = city.replace(/ taluku?$/i, '').replace(/ district$/i, '').trim();
            }

            const village = address.village || address.hamlet || address.isolated_dwelling || '';
            const postalCode = address.postcode || '';
            const formattedAddress = response.data?.display_name || '';

            const result = {
                state,
                district,
                city,
                village,
                postalCode,
                formattedAddress,
                raw: address
            };

            geocodeCache.set(key, { data: result, expiresAt: Date.now() + GEOCODE_TTL });
            return result;
        } catch (err) {
            console.warn('⚠️ Nominatim Reverse Geocoding Error:', err.message);
            // Fallback object to avoid hard failure
            return {
                state: '',
                district: '',
                city: 'My Farm',
                village: '',
                postalCode: '',
                formattedAddress: '',
                raw: {}
            };
        } finally {
            inFlightGeocode.delete(key);
        }
    })();

    inFlightGeocode.set(key, fetchPromise);
    return await fetchPromise;
}

/**
 * GET /api/farmer/location/reverse-geocode
 * Proxy reverse-geocoding to avoid browser CORS/rate limiting
 */
router.get('/location/reverse-geocode', optionalFarmerAuth, async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (lat === undefined || lon === undefined || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
            return res.status(400).json({ success: false, error: 'Valid latitude and longitude required.' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ success: false, error: 'Coordinates out of geographical bounds.' });
        }

        const geo = await reverseGeocode(latitude, longitude);
        res.json({
            success: true,
            location: {
                latitude,
                longitude,
                ...geo
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/farmer/location
 * Get authenticated farmer's saved location from database
 */
router.get('/location', requireFarmerAuth, async (req, res) => {
    try {
        const farmer = req.farmer;
        const [lng, lat] = farmer.location.coordinates;
        res.json({
            success: true,
            location: {
                latitude: lat,
                longitude: lng,
                accuracy: farmer.accuracy,
                state: farmer.state,
                district: farmer.district,
                city: farmer.city,
                village: farmer.village,
                postalCode: farmer.postalCode,
                formattedAddress: farmer.formattedAddress,
                locationSource: farmer.locationSource,
                locationUpdatedAt: farmer.locationUpdatedAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * PUT /api/farmer/location
 * Update farmer's authoritative location, coordinates, address & PostGIS geom
 */
router.put('/location', requireFarmerAuth, async (req, res) => {
    try {
        const latRaw = req.body.lat !== undefined ? req.body.lat : req.body.latitude;
        const lngRaw = req.body.lng !== undefined ? req.body.lng : (req.body.lon !== undefined ? req.body.lon : req.body.longitude);
        const { accuracy, state, district, city, village, postalCode, formattedAddress, source } = req.body;

        if (latRaw === undefined || lngRaw === undefined || isNaN(parseFloat(latRaw)) || isNaN(parseFloat(lngRaw))) {
            return res.status(400).json({ success: false, error: 'Valid latitude and longitude coordinates are required.' });
        }

        const latitude = parseFloat(latRaw);
        const longitude = parseFloat(lngRaw);

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ success: false, error: 'Coordinates out of bounds (-90 to 90 lat, -180 to 180 lon).' });
        }

        let locState = (state || '').trim();
        let locDistrict = (district || '').trim();
        let locCity = (city || '').trim();
        let locVillage = (village || '').trim();
        let locPostal = (postalCode || '').trim();
        let locFormatted = (formattedAddress || '').trim();

        // If location address metadata is incomplete, reverse geocode on server
        if (!locState || !locDistrict || !locCity) {
            const geo = await reverseGeocode(latitude, longitude);
            if (!locState) locState = geo.state;
            if (!locDistrict) locDistrict = geo.district;
            if (!locCity) locCity = geo.city;
            if (!locVillage) locVillage = geo.village;
            if (!locPostal) locPostal = geo.postalCode;
            if (!locFormatted) locFormatted = geo.formattedAddress;
        }

        const validSource = ['GPS', 'MANUAL', 'IP_FALLBACK'].includes(source) ? source : 'GPS';

        const updatedFarmer = await Farmer.updateLocation(req.farmer.id, {
            lat: latitude,
            lng: longitude,
            accuracy: parseFloat(accuracy) || 0,
            state: locState,
            district: locDistrict,
            city: locCity || 'India',
            village: locVillage,
            postalCode: locPostal,
            formattedAddress: locFormatted,
            source: validSource
        });

        if (!updatedFarmer) {
            return res.status(404).json({ success: false, error: 'Farmer account not found.' });
        }

        res.json({
            success: true,
            message: 'Location saved and synchronized successfully.',
            farmer: {
                id: updatedFarmer.id,
                name: updatedFarmer.name,
                phone: updatedFarmer.phone,
                city: updatedFarmer.city,
                state: updatedFarmer.state,
                district: updatedFarmer.district,
                village: updatedFarmer.village,
                postalCode: updatedFarmer.postalCode,
                formattedAddress: updatedFarmer.formattedAddress,
                location: updatedFarmer.location,
                accuracy: updatedFarmer.accuracy,
                locationSource: updatedFarmer.locationSource,
                locationUpdatedAt: updatedFarmer.locationUpdatedAt
            }
        });
    } catch (err) {
        console.error('Location Update Route Error:', err);
        res.status(500).json({ success: false, error: 'Internal server error updating location: ' + err.message });
    }
});

router.put('/alerts/:id', async (req, res) => {
    try {
        const farmer = await Farmer.updateAlertPreferences(req.params.id, req.body.alertPreferences);
        if(!farmer) return res.status(404).json({error: 'Farmer not found'});

        // -------------------------------------------------------------
        // IMMEDIATE ALERT EXECUTION LOGIC (Added per user request)
        // -------------------------------------------------------------
        if (!process.env.OPENWEATHER_API_KEY) {
            return res.json({ success: true, farmer, triggered: false, msg: 'Saved. OpenWeather API key missing, skipped immediate check.' });
        }

        const [lng, lat] = farmer.location.coordinates;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        const weather = response.data;
        
        let currentTemp = weather.main?.temp || 0;
        let currentHumidity = weather.main?.humidity || 0;
        let currentWind = weather.wind?.speed || 0;
        let isRaining = weather.weather?.some(w => w.main.toLowerCase().includes('rain')) || false;

        const prefs = farmer.alertPreferences;
        let alertMessages = [];
        
        if (currentTemp >= prefs.temperatureThreshold) alertMessages.push(`High Temp: ${currentTemp}°C.`);
        if (currentHumidity >= prefs.humidityThreshold) alertMessages.push(`High Humidity: ${currentHumidity}%.`);
        if (currentWind >= prefs.windSpeedThreshold) alertMessages.push(`High Wind: ${currentWind} m/s.`);
        if (isRaining && prefs.rainAlert) alertMessages.push(`Heavy rain detected.`);

        if (alertMessages.length > 0) {
            const fullMessage = `KRISHI VAANI IMMEDIATE ALERT: ` + alertMessages.join(' ');
            let smsStatus = 'not_attempted';
            let callStatus = 'not_attempted';
            
            // Format phone with +91 if needed
            let alertPhone = farmer.phone;
            if (!alertPhone.startsWith('+')) {
                alertPhone = '+91' + alertPhone;
            }
            
            console.log(`🚨 ALERT TRIGGERED for ${alertPhone}: ${fullMessage}`);
            
            if (twilioClient) {
                // Try SMS via Programmable Messaging
                try {
                    if (process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER !== '+1234567890') {
                        await twilioClient.messages.create({
                            body: fullMessage,
                            from: process.env.TWILIO_PHONE_NUMBER,
                            to: alertPhone
                        });
                        smsStatus = 'sent_via_sms';
                    } else {
                        // No valid from number, try sending via Verify API as notification
                        console.log('⚠️ No valid TWILIO_PHONE_NUMBER. SMS skipped.');
                        smsStatus = 'skipped_no_from_number';
                    }
                } catch(smsErr) {
                    console.log('❌ SMS Error:', smsErr.message);
                    smsStatus = 'failed: ' + smsErr.message;
                }
                
                // Try Voice Call
                try {
                    if (process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER !== '+1234567890') {
                        await twilioClient.calls.create({
                            twiml: `<Response><Say voice="alice">${fullMessage}</Say></Response>`,
                            to: alertPhone,
                            from: process.env.TWILIO_PHONE_NUMBER
                        });
                        callStatus = 'call_initiated';
                    } else {
                        console.log('⚠️ No valid TWILIO_PHONE_NUMBER. Voice call skipped.');
                        callStatus = 'skipped_no_from_number';
                    }
                } catch(callErr) {
                    console.log('❌ Voice Call Error:', callErr.message);
                    callStatus = 'failed: ' + callErr.message;
                }
            } else {
                smsStatus = 'twilio_client_not_configured';
                callStatus = 'twilio_client_not_configured';
            }
            
            console.log(`📊 Alert Result => SMS: ${smsStatus} | Call: ${callStatus}`);
            return res.json({ success: true, farmer, triggered: true, message: fullMessage, smsStatus, callStatus });
        }

        res.json({ success: true, farmer, triggered: false, message: 'Settings saved. Weather is currently within your safe thresholds.' });
    } catch(e) {
        console.error('Farmer Update Error:', e);
        res.status(500).json({error: 'Server error updating alerts'});
    }
});

module.exports = router;
