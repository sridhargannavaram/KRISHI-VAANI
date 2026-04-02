const express = require('express');
const router = express.Router();
const axios = require('axios');
const Farmer = require('../models/Farmer');
const twilio = require('twilio');

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

router.put('/alerts/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        if(!farmer) return res.status(404).json({error: 'Farmer not found'});

        farmer.alertPreferences = req.body.alertPreferences;
        await farmer.save();

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
