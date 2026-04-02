const express = require('express');
const router = express.Router();
const axios = require('axios');

// Use OpenRouter API (supports Gemini and other models)
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callAI(prompt, lang) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const langInstruction = lang && lang !== 'en' 
        ? `IMPORTANT: Respond ENTIRELY in ${lang === 'kn' ? 'Kannada' : lang === 'ta' ? 'Tamil' : lang === 'te' ? 'Telugu' : lang === 'ml' ? 'Malayalam' : lang === 'hi' ? 'Hindi' : 'English'} language using native script.` 
        : '';

    const fullPrompt = langInstruction ? `${langInstruction}\n\n${prompt}` : prompt;

    try {
        const response = await axios.post(OPENROUTER_URL, {
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'user', content: fullPrompt }],
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:8080',
                'X-Title': 'Krishi Vaani'
            }
        });

        return response.data?.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error('OpenRouter API Error:', err.response?.data || err.message);
        return null;
    }
}

// Main AI advisory endpoint
router.post('/', async (req, res) => {
    try {
        const { weatherData, cropInfo, message, language } = req.body;

        const prompt = `You are an expert agricultural advisor specializing in South Indian farming (Karnataka, Tamil Nadu, Andhra Pradesh, Telangana, Kerala).
Context:
Current Weather: ${JSON.stringify(weatherData)}
Crop Information: ${cropInfo || 'General farming'}
Farmer's Question/Situation: ${message || 'Give me general advice based on the weather.'}

Provide a concise, helpful, and actionable piece of advice (max 4 sentences) for this South Indian farmer regarding their crops and the weather conditions. Reference local crop varieties and practices when possible.`;

        let adviceText = await callAI(prompt, language);
        
        if (!adviceText) {
            adviceText = generateOfflineFallback(weatherData, cropInfo);
        }

        res.json({ advice: adviceText });
    } catch (error) {
        console.error('AI Advisory Error:', error);
        res.status(500).json({ error: 'Failed to generate AI advice.' });
    }
});

// Automatic seasonal crop recommendation endpoint
router.post('/seasonal', async (req, res) => {
    try {
        const { weatherData, location, language } = req.body;
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const temp = weatherData?.main?.temp || 30;
        const humidity = weatherData?.main?.humidity || 50;

        const prompt = `You are an expert South Indian agricultural advisor.

Current Month: ${currentMonth}
Temperature: ${temp}°C, Humidity: ${humidity}%
Location: ${location || 'South India (Karnataka/Tamil Nadu region)'}

Provide a seasonal crop recommendation for South Indian farmers RIGHT NOW. Format your response as:

🌾 **Top 3 Recommended Crops for ${currentMonth}:**
1. [Crop Name] - Brief reason why it's ideal now
2. [Crop Name] - Brief reason why it's ideal now  
3. [Crop Name] - Brief reason why it's ideal now

🌿 **Farming Tip:** One practical tip for this season

⚠️ **Caution:** One weather-related warning

Keep it concise. Use local South Indian crop names (Ragi, Jowar, Urad Dal, etc.) alongside English names.`;

        let recommendation = await callAI(prompt, language);
        
        if (!recommendation) {
            recommendation = generateOfflineFallback(weatherData);
        }

        res.json({ recommendation });
    } catch (error) {
        console.error('Seasonal API Error:', error);
        res.status(500).json({ error: 'Failed to generate seasonal recommendation.' });
    }
});

// Intelligent offline fallback for South India
function generateOfflineFallback(weatherData, cropInfo) {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const monthNum = new Date().getMonth();
    let temp = weatherData?.main?.temp || 30;
    
    if (cropInfo) {
        return `Since you are planning for **${cropInfo}** in ${currentMonth}, ensure you monitor soil moisture closely. At ${temp}°C, optimal irrigation scheduling is critical. Consult your local KVK for region-specific seed varieties.`;
    }
    
    if (monthNum >= 5 && monthNum <= 8) {
        return `🌾 **Kharif Season Picks for ${currentMonth} (South India):**\n1. **Ragi (Finger Millet)** - Drought-resistant, ideal at ${temp}°C\n2. **Paddy (Rice)** - Perfect for monsoon planting\n3. **Tur Dal (Pigeon Pea)** - Great intercrop option\n\n🌿 **Tip:** Begin land preparation and seed treatment now.\n\n*(Offline mode - AI will respond when connected)*`;
    } else if (monthNum >= 9 || monthNum <= 1) {
        return `🌾 **Rabi Season Picks for ${currentMonth} (South India):**\n1. **Jowar (Sorghum)** - Thrives in cooler temperatures\n2. **Bengal Gram (Chana)** - Low water requirement\n3. **Sunflower** - Good market price this season\n\n🌿 **Tip:** Ensure proper soil moisture before sowing.\n\n*(Offline mode - AI will respond when connected)*`;
    } else {
        return `🌾 **Summer Crop Picks for ${currentMonth} (South India):**\n1. **Watermelon** - High demand, heat-loving\n2. **Groundnut** - Excellent for red soil regions\n3. **Sesame (Til)** - Low water, high returns\n\n🌿 **Tip:** Mulching is essential to retain soil moisture.\n\n*(Offline mode - AI will respond when connected)*`;
    }
}

module.exports = router;
