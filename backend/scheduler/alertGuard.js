const cron = require('node-cron');
const axios = require('axios');
const twilio = require('twilio');
const Farmer = require('../models/Farmer');

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Run every hour
cron.schedule('0 * * * *', async () => {
    console.log('🕒 Running AlertGuard Cron Job...');

    try {
        const farmers = await Farmer.find({ isVerified: true });

        for (const farmer of farmers) {
            if (!farmer.location || !farmer.location.coordinates) continue;

            const [lng, lat] = farmer.location.coordinates;
            
            let currentTemp = 0;
            let currentHumidity = 0;
            let currentWind = 0;
            let isRaining = false;

            if (process.env.OPENWEATHER_API_KEY) {
                try {
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
                    const response = await axios.get(url);
                    const weather = response.data;
                    
                    currentTemp = weather.main?.temp || 0;
                    currentHumidity = weather.main?.humidity || 0;
                    currentWind = weather.wind?.speed || 0;
                    isRaining = weather.weather?.some(w => w.main.toLowerCase().includes('rain')) || false;
                } catch (err) {
                    console.error(`Failed to fetch weather for farmer ${farmer.name}:`, err.message);
                    continue;
                }
            } else {
                // Mock conditions if no key
                currentTemp = 36;
            }

            const prefs = farmer.alertPreferences || { temperatureThreshold: 35, humidityThreshold: 80, windSpeedThreshold: 15, rainAlert: true };
            
            let alertMessages = [];
            if (currentTemp > prefs.temperatureThreshold) {
                alertMessages.push(`Temperature ${currentTemp}°C exceeds your ${prefs.temperatureThreshold}°C threshold.`);
            }
            if (currentHumidity >= (prefs.humidityThreshold || 80)) {
                alertMessages.push(`Humidity ${currentHumidity}% exceeds your ${prefs.humidityThreshold || 80}% threshold.`);
            }
            if (currentWind >= (prefs.windSpeedThreshold || 15)) {
                alertMessages.push(`Wind ${currentWind} m/s exceeds your ${prefs.windSpeedThreshold || 15} m/s threshold.`);
            }
            if (isRaining && prefs.rainAlert) {
                alertMessages.push(`Heavy rain is detected in your area.`);
            }

            if (alertMessages.length > 0) {
                const fullMessage = `KRISHI VAANI ALERT for ${farmer.name}: ` + alertMessages.join(' ');
                
                // Format phone with +91 if needed
                let alertPhone = farmer.phone;
                if (!alertPhone.startsWith('+')) {
                    alertPhone = '+91' + alertPhone;
                }
                
                console.log(`🚨 Triggering Alert for ${alertPhone}: ${fullMessage}`);

                if (twilioClient && process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER !== '+1234567890') {
                    try {
                        await twilioClient.messages.create({
                            body: fullMessage,
                            from: process.env.TWILIO_PHONE_NUMBER,
                            to: alertPhone
                        });
                        console.log(`✅ SMS sent to ${alertPhone}`);
                    } catch(smsErr) {
                        console.log(`❌ SMS Error for ${alertPhone}:`, smsErr.message);
                    }

                    try {
                        await twilioClient.calls.create({
                            twiml: `<Response><Say voice="alice">${fullMessage}</Say></Response>`,
                            to: alertPhone,
                            from: process.env.TWILIO_PHONE_NUMBER
                        });
                        console.log(`✅ Voice call initiated to ${alertPhone}`);
                    } catch(callErr) {
                        console.log(`❌ Voice Call Error for ${alertPhone}:`, callErr.message);
                    }
                } else {
                    console.log(`⚠️ Twilio not configured properly for ${alertPhone}.`);
                }
            }
        }
    } catch (error) {
        console.error('AlertGuard Error:', error);
    }
});

console.log('✅ AlertGuard Scheduler Initialized');
