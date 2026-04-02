const express = require('express');
const router = express.Router();
const axios = require('axios');
const twilio = require('twilio');

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Crop sensitivity profiles
const CROP_PROFILES = {
    rice: {
        name: 'Rice (Paddy)',
        rainTolerance: 'HIGH',
        tempMin: 20, tempMax: 38,
        humidityMax: 95,
        windMax: 12,
        rules: [
            { condition: 'temp_high', threshold: 38, msg: 'Extreme heat can cause spikelet sterility in rice. Increase irrigation depth to 5cm.', priority: 'HIGH' },
            { condition: 'temp_low', threshold: 15, msg: 'Cold stress detected. Delay transplanting if possible.', priority: 'MEDIUM' },
            { condition: 'wind_high', threshold: 12, msg: 'Strong winds may cause lodging in rice. Ensure proper drainage.', priority: 'MEDIUM' },
            { condition: 'humidity_high', threshold: 90, msg: 'High humidity increases blast disease risk in rice. Apply fungicide preventively.', priority: 'MEDIUM' },
            { condition: 'heavy_rain', msg: 'Heavy rain expected. Rice is tolerant but ensure bund maintenance to prevent overflow.', priority: 'LOW' }
        ]
    },
    wheat: {
        name: 'Wheat',
        rainTolerance: 'LOW',
        tempMin: 10, tempMax: 30,
        humidityMax: 70,
        windMax: 10,
        rules: [
            { condition: 'heavy_rain', msg: 'Heavy rain expected! Wheat is highly sensitive during harvest. Delay harvesting if grain is not dry.', priority: 'HIGH' },
            { condition: 'temp_high', threshold: 32, msg: 'Heat stress affecting wheat grain filling. Irrigate immediately during cooler hours.', priority: 'HIGH' },
            { condition: 'humidity_high', threshold: 70, msg: 'High humidity increases rust disease risk in wheat. Scout fields and apply fungicide.', priority: 'HIGH' },
            { condition: 'wind_high', threshold: 10, msg: 'Strong winds may cause lodging. Avoid top-dressing nitrogen.', priority: 'MEDIUM' },
            { condition: 'temp_low', threshold: 5, msg: 'Frost risk detected for wheat. Cover young seedlings if possible.', priority: 'MEDIUM' }
        ]
    },
    tomato: {
        name: 'Tomato',
        rainTolerance: 'VERY_LOW',
        tempMin: 15, tempMax: 35,
        humidityMax: 65,
        windMax: 8,
        rules: [
            { condition: 'heavy_rain', msg: 'Heavy rain expected! Protect tomato crops immediately. Avoid irrigation. Ensure drainage.', priority: 'HIGH' },
            { condition: 'humidity_high', threshold: 65, msg: 'High humidity! Late blight & bacterial wilt risk HIGH. Spray copper fungicide now.', priority: 'HIGH' },
            { condition: 'temp_high', threshold: 35, msg: 'Heat stress on tomatoes. Use shade nets and mulching. Irrigate during early morning.', priority: 'HIGH' },
            { condition: 'temp_low', threshold: 10, msg: 'Cold stress may cause fruit damage. Cover plants with polythene at night.', priority: 'MEDIUM' },
            { condition: 'wind_high', threshold: 8, msg: 'Wind may damage tomato stakes. Reinforce supports and staking.', priority: 'MEDIUM' }
        ]
    },
    ragi: {
        name: 'Ragi (Finger Millet)',
        rainTolerance: 'MEDIUM',
        tempMin: 18, tempMax: 35,
        humidityMax: 80,
        windMax: 10,
        rules: [
            { condition: 'temp_high', threshold: 38, msg: 'Extreme heat may affect ragi grain filling. Light irrigation recommended.', priority: 'MEDIUM' },
            { condition: 'heavy_rain', msg: 'Heavy rain may cause waterlogging in ragi fields. Ensure proper drainage channels.', priority: 'MEDIUM' },
            { condition: 'humidity_high', threshold: 85, msg: 'High humidity increases blast disease risk in ragi. Monitor closely.', priority: 'MEDIUM' },
            { condition: 'wind_high', threshold: 12, msg: 'Strong winds detected. Ragi is generally resistant but check for lodging.', priority: 'LOW' }
        ]
    },
    cotton: {
        name: 'Cotton',
        rainTolerance: 'LOW',
        tempMin: 20, tempMax: 40,
        humidityMax: 70,
        windMax: 10,
        rules: [
            { condition: 'heavy_rain', msg: 'Heavy rain expected! Cotton bolls at risk of rotting. Stop irrigation and ensure drainage.', priority: 'HIGH' },
            { condition: 'humidity_high', threshold: 75, msg: 'High humidity increases bollworm and grey mildew risk. Spray neem-based pesticide.', priority: 'HIGH' },
            { condition: 'temp_high', threshold: 42, msg: 'Extreme heat may cause flower shedding in cotton. Irrigate immediately.', priority: 'MEDIUM' },
            { condition: 'wind_high', threshold: 10, msg: 'Strong winds may damage cotton plants. Check supports.', priority: 'MEDIUM' }
        ]
    },
    sugarcane: {
        name: 'Sugarcane',
        rainTolerance: 'HIGH',
        tempMin: 15, tempMax: 40,
        humidityMax: 85,
        windMax: 8,
        rules: [
            { condition: 'wind_high', threshold: 8, msg: 'Strong winds! Sugarcane lodging risk is HIGH. Ensure earthing up is done.', priority: 'HIGH' },
            { condition: 'temp_low', threshold: 10, msg: 'Cold weather may slow sugarcane growth. Avoid irrigation during cold nights.', priority: 'MEDIUM' },
            { condition: 'temp_high', threshold: 42, msg: 'Extreme heat detected. Increase irrigation frequency for sugarcane.', priority: 'MEDIUM' },
            { condition: 'heavy_rain', msg: 'Heavy rain expected. Sugarcane is tolerant but check for waterlogging.', priority: 'LOW' }
        ]
    },
    groundnut: {
        name: 'Groundnut',
        rainTolerance: 'MEDIUM',
        tempMin: 20, tempMax: 35,
        humidityMax: 70,
        windMax: 10,
        rules: [
            { condition: 'heavy_rain', msg: 'Heavy rain expected! Groundnut pods may rot. Ensure field drainage immediately.', priority: 'HIGH' },
            { condition: 'humidity_high', threshold: 75, msg: 'High humidity increases tikka disease risk in groundnut. Apply fungicide.', priority: 'HIGH' },
            { condition: 'temp_high', threshold: 38, msg: 'Heat stress may affect groundnut pegging. Irrigate during cooler hours.', priority: 'MEDIUM' },
            { condition: 'wind_high', threshold: 10, msg: 'Moderate wind risk for groundnut. Monitor field conditions.', priority: 'LOW' }
        ]
    }
};

// Analyze crop alerts based on weather
router.post('/analyze', async (req, res) => {
    try {
        const { crop, lat, lon, location } = req.body;
        
        if (!crop || !CROP_PROFILES[crop.toLowerCase()]) {
            return res.status(400).json({ 
                error: 'Invalid crop. Supported: ' + Object.keys(CROP_PROFILES).join(', ')
            });
        }

        const profile = CROP_PROFILES[crop.toLowerCase()];
        
        // Fetch current + forecast weather
        let currentWeather, forecastData;
        try {
            const currentRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
            currentWeather = currentRes.data;

            const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
            forecastData = forecastRes.data;
        } catch(err) {
            return res.status(500).json({ error: 'Failed to fetch weather data: ' + err.message });
        }

        const temp = currentWeather.main?.temp || 0;
        const humidity = currentWeather.main?.humidity || 0;
        const windSpeed = currentWeather.wind?.speed || 0;
        const isRaining = currentWeather.weather?.some(w => w.main.toLowerCase().includes('rain')) || false;
        
        // Check next 24h forecast for rain
        const next24h = forecastData.list?.slice(0, 8) || [];
        const rainForecast = next24h.some(item => 
            item.weather?.some(w => w.main.toLowerCase().includes('rain'))
        );
        const heavyRainExpected = isRaining || rainForecast;

        // Generate alerts
        let alerts = [];
        
        for (const rule of profile.rules) {
            let triggered = false;
            
            switch(rule.condition) {
                case 'temp_high':
                    triggered = temp >= rule.threshold;
                    break;
                case 'temp_low':
                    triggered = temp <= rule.threshold;
                    break;
                case 'humidity_high':
                    triggered = humidity >= rule.threshold;
                    break;
                case 'wind_high':
                    triggered = windSpeed >= rule.threshold;
                    break;
                case 'heavy_rain':
                    triggered = heavyRainExpected;
                    break;
            }

            if (triggered) {
                alerts.push({
                    message: rule.msg,
                    priority: rule.priority,
                    condition: rule.condition,
                    actions: getActions(rule.priority)
                });
            }
        }

        // General waterlogging alert
        if (heavyRainExpected && profile.rainTolerance !== 'HIGH') {
            const exists = alerts.some(a => a.condition === 'heavy_rain');
            if (!exists) {
                alerts.push({
                    message: `Waterlogging risk! ${profile.name} has ${profile.rainTolerance} rain tolerance. Check field drainage.`,
                    priority: profile.rainTolerance === 'VERY_LOW' ? 'HIGH' : 'MEDIUM',
                    condition: 'waterlogging',
                    actions: getActions(profile.rainTolerance === 'VERY_LOW' ? 'HIGH' : 'MEDIUM')
                });
            }
        }

        // Sort by priority
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        res.json({
            crop: profile.name,
            location: location || 'Custom Location',
            weather: {
                temp, humidity, windSpeed,
                isRaining,
                rainForecast,
                description: currentWeather.weather?.[0]?.description || ''
            },
            alerts,
            alertCount: alerts.length,
            highestPriority: alerts.length > 0 ? alerts[0].priority : 'NONE',
            timestamp: new Date().toISOString()
        });

    } catch(error) {
        console.error('Crop Alert Engine Error:', error);
        res.status(500).json({ error: 'Crop alert analysis failed.' });
    }
});

// Send alert via SMS/Voice
router.post('/send-alert', async (req, res) => {
    try {
        const { phone, message, priority } = req.body;
        
        let alertPhone = phone;
        if (!alertPhone.startsWith('+')) {
            alertPhone = '+91' + alertPhone;
        }

        let smsStatus = 'not_attempted';
        let callStatus = 'not_attempted';

        if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER === '+1234567890') {
            return res.json({ success: false, smsStatus: 'twilio_not_configured', callStatus: 'twilio_not_configured' });
        }

        // Always send SMS
        try {
            await twilioClient.messages.create({
                body: `🌾 KRISHI VAANI CROP ALERT: ${message}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: alertPhone
            });
            smsStatus = 'sent';
        } catch(e) {
            smsStatus = 'failed: ' + e.message;
        }

        // Voice call only for HIGH priority
        if (priority === 'HIGH') {
            try {
                await twilioClient.calls.create({
                    twiml: `<Response><Say voice="alice">Krishi Vaani Urgent Crop Alert: ${message}</Say></Response>`,
                    to: alertPhone,
                    from: process.env.TWILIO_PHONE_NUMBER
                });
                callStatus = 'call_initiated';
            } catch(e) {
                callStatus = 'failed: ' + e.message;
            }
        } else {
            callStatus = 'skipped_not_high_priority';
        }

        res.json({ success: true, smsStatus, callStatus });
    } catch(error) {
        console.error('Send Alert Error:', error);
        res.status(500).json({ error: 'Failed to send alert.' });
    }
});

// Get supported crops list
router.get('/crops', (req, res) => {
    const crops = Object.entries(CROP_PROFILES).map(([key, val]) => ({
        id: key,
        name: val.name,
        rainTolerance: val.rainTolerance
    }));
    res.json({ crops });
});

function getActions(priority) {
    switch(priority) {
        case 'HIGH': return ['SMS', 'Voice Call', 'App Notification'];
        case 'MEDIUM': return ['SMS', 'App Notification'];
        case 'LOW': return ['App Notification'];
        default: return ['App Notification'];
    }
}

module.exports = router;
