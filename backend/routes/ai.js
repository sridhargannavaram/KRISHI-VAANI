const express = require('express');
const router = express.Router();
const axios = require('axios');

// Use OpenRouter API (supports Gemini and other models)
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// In-memory cache for AI responses with 2-hour TTL
const aiCache = new Map();
const AI_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

function getFromAiCache(key) {
    const cached = aiCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < AI_CACHE_TTL) {
        return cached.data;
    }
    if (cached) aiCache.delete(key);
    return null;
}

function setInAiCache(key, data) {
    if (aiCache.size > 200) {
        const oldestKey = aiCache.keys().next().value;
        if (oldestKey) aiCache.delete(oldestKey);
    }
    aiCache.set(key, { data, timestamp: Date.now() });
}

async function callAI(prompt, lang) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const langInstruction = lang && lang !== 'en' 
        ? `IMPORTANT: Respond ENTIRELY in ${lang === 'kn' ? 'Kannada' : lang === 'ta' ? 'Tamil' : lang === 'te' ? 'Telugu' : lang === 'ml' ? 'Malayalam' : lang === 'hi' ? 'Hindi' : 'English'} language using native script.` 
        : '';

    const fullPrompt = langInstruction ? `${langInstruction}\n\n${prompt}` : prompt;

    const modelsToTry = [
        'minimax/minimax-m3:free',
        'nvidia/nemotron-3.5-lightning:free',
        'google/gemma-4-31b-it:free',
        'google/gemma-4-26b-a4b-it:free',
        'google/gemini-3.5-flash-lite'
    ];

    for (const model of modelsToTry) {
        try {
            const response = await axios.post(OPENROUTER_URL, {
                model,
                messages: [{ role: 'user', content: fullPrompt }],
                max_tokens: 1500
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://krishi-vaani-iota.vercel.app',
                    'X-Title': 'Krishi Vaani'
                },
                timeout: 9000 // Fast 9s timeout for responsive model fallback
            });

            const content = response.data?.choices?.[0]?.message?.content;
            if (content) return content;
        } catch (err) {
            console.warn(`AI model ${model} failed:`, err.response?.status || err.message);
            // Try next model
        }
    }
    return null;
}

const Farmer = require('../models/Farmer');
const { query } = require('../config/db');
const { optionalFarmerAuth } = require('../middleware/farmerAuth');

router.use(optionalFarmerAuth);

// Helper 1: Fetch 5-day weather forecast from OpenWeather API
async function fetchWeatherForecast(lat, lon) {
    if (!lat || !lon) return null;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url, { timeout: 7000 });
        const list = response.data?.list || [];

        if (list.length > 0) {
            const next48Hours = list.slice(0, 16);
            let totalRain = 0;
            let minTemp = 999;
            let maxTemp = -999;
            let rainIntervals = 0;
            let avgHumidity = 0;
            const conditions = new Set();

            next48Hours.forEach(item => {
                const t = item.main?.temp;
                if (t != null) {
                    if (t < minTemp) minTemp = t;
                    if (t > maxTemp) maxTemp = t;
                }
                if (item.main?.humidity) {
                    avgHumidity += item.main.humidity;
                }
                const r = item.rain?.['3h'] || 0;
                totalRain += r;
                if (r > 0 || (item.weather?.[0]?.main || '').toLowerCase().includes('rain')) {
                    rainIntervals++;
                }
                if (item.weather?.[0]?.description) {
                    conditions.add(item.weather[0].description);
                }
            });

            avgHumidity = Math.round(avgHumidity / next48Hours.length);

            return {
                available: true,
                tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
                avgHumidityNext48h: `${avgHumidity}%`,
                forecastConditions: Array.from(conditions).slice(0, 3).join(', '),
                expectedRainfallMm: Math.round(totalRain * 10) / 10,
                rainLikelihood: rainIntervals > 0 
                    ? (rainIntervals >= 4 ? 'High probability of significant rainfall in next 24-48 hours' : 'Possibility of scattered/light showers in next 24-48 hours') 
                    : 'Clear to partly cloudy, no significant rain predicted in next 48 hours'
            };
        }
    } catch (err) {
        console.warn('⚠️ Weather forecast fetch in AI advisory:', err.message);
    }
    return null;
}

// Helper 2: Query Mandi API / PostgreSQL Database for crop price information
async function fetchMandiCropContext(cropName, state = '', district = '') {
    try {
        const cleanCrop = (cropName || '').trim();
        if (!cleanCrop) return { available: false, message: 'Crop name not specified' };

        let sql = `
            SELECT market, district, state, commodity, variety, min_price, max_price, modal_price, arrival_date
            FROM market_prices
            WHERE LOWER(commodity) LIKE LOWER($1) OR LOWER(commodity) = LOWER($2)
        `;
        const params = [`%${cleanCrop}%`, cleanCrop];
        let pIdx = 3;

        if (state) {
            sql += ` AND (LOWER(state) = LOWER($${pIdx}) OR LOWER(state) LIKE LOWER($${pIdx + 1}))`;
            params.push(state, `%${state}%`);
            pIdx += 2;
        }

        sql += ` ORDER BY arrival_date DESC, modal_price DESC LIMIT 6`;

        let res = await query(sql, params);

        // If no results in state, query pan-India arrivals
        if ((!res.rows || res.rows.length === 0) && state) {
            res = await query(`
                SELECT market, district, state, commodity, variety, min_price, max_price, modal_price, arrival_date
                FROM market_prices
                WHERE LOWER(commodity) LIKE LOWER($1) OR LOWER(commodity) = LOWER($2)
                ORDER BY arrival_date DESC, modal_price DESC LIMIT 6
            `, [`%${cleanCrop}%`, cleanCrop]);
        }

        if (res.rows && res.rows.length > 0) {
            const validPrices = res.rows.map(r => parseFloat(r.modal_price) || 0).filter(p => p > 0);
            const avgModal = validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : null;
            const minPrices = res.rows.map(r => parseFloat(r.min_price) || 0).filter(p => p > 0);
            const maxPrices = res.rows.map(r => parseFloat(r.max_price) || 0).filter(p => p > 0);
            const minPrice = minPrices.length > 0 ? Math.min(...minPrices) : null;
            const maxPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : null;

            const marketSnippets = res.rows.slice(0, 3).map(r => `${r.market} (${r.district || r.state}): ₹${r.modal_price}/Qtl [${r.variety || 'Standard'}]`).join(' | ');

            return {
                available: true,
                commodityMatched: res.rows[0].commodity,
                avgModalPrice: avgModal ? `₹${avgModal} / Quintal` : 'Price on request',
                priceRange: minPrice && maxPrice ? `₹${minPrice} - ₹${maxPrice} / Quintal` : (avgModal ? `₹${avgModal} / Quintal` : 'Variable'),
                sampleMandiPrices: marketSnippets,
                latestArrivalDate: res.rows[0].arrival_date,
                recordsCount: res.rows.length
            };
        }
    } catch (err) {
        console.warn('⚠️ Mandi context fetch in AI advisory:', err.message);
    }
    return {
        available: false,
        message: 'No specific mandi price record found for this commodity in recent state arrivals. Market rates may vary locally.'
    };
}

// Helper 3: Current Indian Agricultural Season
function getAgriSeasonContext() {
    const monthIndex = new Date().getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[monthIndex];

    if (monthIndex >= 5 && monthIndex <= 9) { // June - Oct
        return {
            seasonName: 'Kharif Season (Monsoon Cropping Period)',
            currentMonth: currentMonth,
            climateType: 'Warm, humid conditions with southwest monsoon rains',
            suitableCropTypes: 'Paddy, Ragi / Finger Millet, Maize, Jowar, Bajra, Soybean, Groundnut, Cotton, Pulses (Tur/Arhar, Urad, Moong), Vegetables',
            managementFocus: 'Drainage management, timely weeding, monsoon pest/fungal disease monitoring, split nitrogen application'
        };
    } else if (monthIndex >= 10 || monthIndex <= 2) { // Nov - March
        return {
            seasonName: 'Rabi Season (Winter Cropping Period)',
            currentMonth: currentMonth,
            climateType: 'Moderate to cool temperatures with low relative humidity',
            suitableCropTypes: 'Wheat, Barley, Bengal Gram / Chana, Mustard, Peas, Sunflower, Winter Vegetables, Potato',
            managementFocus: 'Irrigation scheduling, frost protection if applicable, aphid/powdery mildew management'
        };
    } else { // April - May
        return {
            seasonName: 'Zaid Season (Summer Cropping Period)',
            currentMonth: currentMonth,
            climateType: 'Hot, dry conditions with high evapotranspiration',
            suitableCropTypes: 'Watermelon, Muskmelon, Cucumber, Summer Moong, Okra, Fodder crops',
            managementFocus: 'Mulching, drip/micro-irrigation, heat stress mitigation, pest scouting (whiteflies/mites)'
        };
    }
}

// Helper 4: Regional Soil, Water & Environmental Context
function getSoilWaterEnvironmentalContext(state, district) {
    const locCombined = `${district || ''} ${state || ''}`.toLowerCase();
    let regionalZone = 'Peninsular Indian Agricultural Agro-Climatic Zone';
    let typicalSoil = 'Red sandy loam, red loamy, medium black, or mixed alluvial soils depending on exact micro-watershed.';

    if (locCombined.includes('karnataka') || locCombined.includes('bengaluru') || locCombined.includes('mysuru') || locCombined.includes('mandya') || locCombined.includes('kolar') || locCombined.includes('tumakuru')) {
        regionalZone = 'Southern Dry / Eastern Transitional Agro-Climatic Zone of Karnataka';
        typicalSoil = 'Red sandy loams to red clay loams (Alfisols/Inceptisols), slightly acidic to neutral pH (6.0 - 7.2), moderate organic carbon, well-drained.';
    } else if (locCombined.includes('tamil nadu') || locCombined.includes('coimbatore') || locCombined.includes('salem') || locCombined.includes('thanjavur') || locCombined.includes('madurai')) {
        regionalZone = 'Southern Plateau and Cauvery Delta / Coastal Agro-Climatic Zone';
        typicalSoil = 'Red soils, black clay loams, and riverine alluvium with neutral to mildly alkaline pH (6.5 - 8.0).';
    } else if (locCombined.includes('andhra') || locCombined.includes('telangana') || locCombined.includes('guntur') || locCombined.includes('kurnool') || locCombined.includes('warangal')) {
        regionalZone = 'Southern Semi-Arid Deccan Plateau Agro-Climatic Zone';
        typicalSoil = 'Red chalka soils, medium to deep black cotton soils (Vertisols), neutral to calcareous.';
    } else if (locCombined.includes('maharashtra') || locCombined.includes('pune') || locCombined.includes('nashik') || locCombined.includes('nagpur') || locCombined.includes('aurangabad')) {
        regionalZone = 'Western Plateau and Hills / Vidarbha Agro-Climatic Zone';
        typicalSoil = 'Deep black cotton soil (Vertisols), high water holding capacity, cracking clay texture.';
    } else if (locCombined.includes('kerala') || locCombined.includes('palakkad') || locCombined.includes('wayanad')) {
        regionalZone = 'Humid Tropical Western Ghats & Coastal Plain';
        typicalSoil = 'Laterite and coastal alluvium, acidic pH (5.0 - 6.5), high organic matter.';
    }

    return {
        regionalZone: regionalZone,
        typicalRegionalSoil: typicalSoil,
        fieldSoilTestAvailability: 'UNAVAILABLE: Specific field-level laboratory Soil Health Card data (exact N-P-K in kg/ha, exact pH, EC, organic carbon %) is not available for this plot. Advise standard crop soil requirements and recommend farmer get a Soil Health Card lab test.',
        waterSourceQualityAvailability: 'UNAVAILABLE: Specific farm-level water test data (borewell TDS, salinity, EC, groundwater depth) is not available. Advise standard irrigation practices based on weather & forecast rain.'
    };
}

// Main AI advisory endpoint (Crop Advisor)
router.post('/', async (req, res) => {
    try {
        const { weatherData, cropInfo, message, location, language, lat, lon, city, district, state } = req.body;
        const locName = location || [city, district, state].filter(Boolean).join(', ') || 'India';
        const cropName = cropInfo || 'General farming';
        const todayKey = new Date().toISOString().split('T')[0];
        const cacheKey = `advice_${cropName.toLowerCase().trim()}_${locName.toLowerCase().trim()}_${language || 'en'}_${todayKey}`;

        const cachedAdvice = getFromAiCache(cacheKey);
        if (cachedAdvice) {
            return res.json({ advice: cachedAdvice, _cached: true });
        }

        const langMap = { 'en': 'English', 'kn': 'Kannada', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam', 'hi': 'Hindi' };
        const targetLang = langMap[language] || 'English';

        // Extract GPS coordinates
        const latitude = lat || weatherData?.coord?.lat;
        const longitude = lon || weatherData?.coord?.lon;
        const coordsStr = latitude && longitude ? `${parseFloat(latitude).toFixed(4)}°N, ${parseFloat(longitude).toFixed(4)}°E` : 'GPS Verified Location';

        // Current weather metrics
        const temp = weatherData?.main?.temp != null ? Math.round(weatherData.main.temp) : 'unknown';
        const feelsLike = weatherData?.main?.feels_like != null ? Math.round(weatherData.main.feels_like) : temp;
        const humidity = weatherData?.main?.humidity != null ? weatherData.main.humidity : 'unknown';
        const weatherDesc = weatherData?.weather?.[0]?.description || 'unknown';
        const windSpeed = weatherData?.wind?.speed != null ? weatherData.wind.speed : 'unknown';
        const pressure = weatherData?.main?.pressure || 'unknown';

        // Collect all telemetry in parallel: OpenWeather Forecast, Mandi API, Season, Soil/Water context
        const [forecastInfo, mandiInfo] = await Promise.all([
            fetchWeatherForecast(latitude, longitude),
            fetchMandiCropContext(cropName, state, district)
        ]);

        const seasonInfo = getAgriSeasonContext();
        const soilEnv = getSoilWaterEnvironmentalContext(state, district);

        const langReportHeaders = {
            en: {
                crop: 'Crop',
                location: 'Location',
                weather: 'Weather',
                humidity: 'Humidity',
                suitability: 'Crop Suitability',
                soilWater: 'Soil & Water',
                weatherImpact: 'Weather Impact',
                actions: 'What to Do Now',
                risks: 'Risks to Watch',
                market: 'Market Information'
            },
            kn: {
                crop: 'ಬೆಳೆ',
                location: 'ಸ್ಥಳ',
                weather: 'ಹವಾಮಾನ',
                humidity: 'ತೇವಾಂಶ',
                suitability: 'ಬೆಳೆಯ ಸೂಕ್ತತೆ',
                soilWater: 'ಮಣ್ಣು ಮತ್ತು ನೀರು',
                weatherImpact: 'ಹವಾಮಾನ ಪರಿಣಾಮ',
                actions: 'ಈಗ ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು',
                risks: 'ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಪಾಯಗಳು',
                market: 'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ'
            },
            te: {
                crop: 'పంట',
                location: 'ప్రాంతం',
                weather: 'వాతావరణం',
                humidity: 'తేమ',
                suitability: 'పంట అనుకూలత',
                soilWater: 'నేల మరియు నీరు',
                weatherImpact: 'వాతావరణ ప్రభావం',
                actions: 'ఇప్పుడు చేయవలసిన పనులు',
                risks: 'గమనించవలసిన సమస్యలు',
                market: 'మార్కెట్ సమాచారం'
            },
            ta: {
                crop: 'பயிர்',
                location: 'இடம்',
                weather: 'வானிலை',
                humidity: 'ஈரப்பதம்',
                suitability: 'பயிர் பொருத்தம்',
                soilWater: 'மண் மற்றும் நீர்',
                weatherImpact: 'வானிலை தாக்கம்',
                actions: 'இப்போது செய்ய வேண்டியவை',
                risks: 'கவனிக்க வேண்டிய பாதிப்புகள்',
                market: 'சந்தை நிலவரம்'
            },
            ml: {
                crop: 'വിള',
                location: 'സ്ഥലം',
                weather: 'കാലാവസ്ഥ',
                humidity: 'ഈർപ്പം',
                suitability: 'കൃഷി അനുയോജ്യത',
                soilWater: 'മണ്ണും ജലവും',
                weatherImpact: 'കാലാവസ്ഥ സ്വാധീനം',
                actions: 'ഇപ്പോൾ ചെയ്യേണ്ട കാര്യങ്ങൾ',
                risks: 'ശ്രദ്ധിക്കേണ്ട രോഗങ്ങളും കീടങ്ങളും',
                market: 'വിപണി വിവരം'
            },
            hi: {
                crop: 'फसल',
                location: 'स्थान',
                weather: 'मौसम',
                humidity: 'नमी',
                suitability: 'फसल की उपयुक्तता',
                soilWater: 'मिट्टी और जल प्रबंधन',
                weatherImpact: 'मौसम का प्रभाव',
                actions: 'अभी क्या करें',
                risks: 'संभावित खतरे',
                market: 'मंडी और बाजार जानकारी'
            }
        };

        const rh = langReportHeaders[language] || langReportHeaders['en'];

        const prompt = `You are a Senior Agricultural Extension Officer writing a concise, practical, human-like field advisory report for a farmer.

FIELD DATA:
- Crop: ${cropName}
- Location: ${locName} (${coordsStr})
- Agro-Climatic Zone: ${soilEnv.regionalZone}
- Current Weather: ${temp}°C, Humidity ${humidity}%, Wind ${windSpeed} m/s, Sky: ${weatherDesc}
- Forecast (48h): Temperature ${forecastInfo ? forecastInfo.tempRange : 'stable'}, Rainfall: ${forecastInfo ? `${forecastInfo.expectedRainfallMm} mm (${forecastInfo.rainLikelihood})` : 'Data not available'}
- Season: ${seasonInfo.seasonName} (${seasonInfo.currentMonth})
- Mandi API Data: ${mandiInfo.available ? `Modal Price: ${mandiInfo.avgModalPrice}, Range: ${mandiInfo.priceRange}` : 'Data not available from recent state arrivals'}
- Field-level Soil/Water Lab Tests: UNAVAILABLE

ADVISORY FORMAT:
Write a crisp, practical advisory (concise and 20-30% shorter than long articles) following this exact plain-text structure:

${rh.crop}: ${cropName}
${rh.location}: ${locName}
${rh.weather}: ${temp}°C | ${rh.humidity}: ${humidity}%

${rh.suitability}
[1-2 direct sentences assessing suitability based on verified location, weather, season, and crop.]

${rh.soilWater}
[1-2 direct sentences: explain that specific field soil and water laboratory test data is not available, and recommend getting a Soil Health Card test from local KVK. Never guess exact soil pH or nutrient numbers.]

${rh.weatherImpact}
[1-2 direct sentences on how current temperature (${temp}°C), humidity (${humidity}%), and 48h forecast affect the crop.]

${rh.actions}
1. [First concise practical action]
2. [Second concise practical action]
3. [Third concise practical action]
4. [Consult local KVK or Agriculture Officer for exact crop/soil-specific doses if applying chemical treatments]

${rh.risks}
- [Key pest, disease, or weather risk to monitor under current conditions]
- [Secondary risk precaution]

${rh.market}
[If Mandi API data available: Modal price ${mandiInfo.avgModalPrice || 'available rates'} and 1 brief quality tip. If unavailable: "Data not available from recent state mandi arrivals."]

CRITICAL WRITING RULES:
1. CONCISE & PUNCHY: Keep explanations short (1-2 sentences per section). Avoid fluff, repetition, and long paragraphs.
2. NO RAW MARKDOWN SYMBOLS: Do NOT use #, ##, ###, ****, **, *, ---, or markdown tables.
3. NO EMOJIS: Do NOT include any emojis or stickers.
4. NO AI INTRODUCTIONS/OUTROS: Start directly with the metadata header. Do not write generic greetings or farewells.
5. NO DOSAGE GUESSWORK: Do not give specific chemical doses unless verified; advise consulting local KVK.
6. NATURAL REGIONAL SCRIPT: Write entirely in ${targetLang} in natural native script without mixing in English terms.
7. EVIDENCE-BASED: Never guess unverified soil, water, or weather data. State "Data not available" where appropriate.`;

        let adviceText = await callAI(prompt, language);
        
        if (!adviceText) {
            adviceText = generateOfflineFallback(weatherData, cropInfo, language, locName);
        }

        if (adviceText) {
            setInAiCache(cacheKey, adviceText);
        }

        if (req.farmerId) {
            Farmer.logActivity(req.farmerId, 'AI_ADVISORY', { 
                query: (message || '').substring(0, 100), 
                crop: cropInfo 
            }).catch(() => {});
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
        const { weatherData, location, state, district, language } = req.body;
        const lang = language || 'en';
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const temp = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : 28;
        const humidity = weatherData?.main?.humidity || 65;
        const locName = location || (state ? `${district ? district + ', ' : ''}${state}, India` : 'India');
        const todayKey = new Date().toISOString().split('T')[0];
        const seasonalCacheKey = `seasonal_${locName.toLowerCase().trim()}_${lang}_${todayKey}`;

        const cachedSeasonal = getFromAiCache(seasonalCacheKey);
        if (cachedSeasonal) {
            return res.json({ recommendation: cachedSeasonal, _cached: true });
        }

        const monthNum = new Date().getMonth();
        let seasonName = 'Kharif';
        if (monthNum >= 9 || monthNum <= 1) seasonName = 'Rabi';
        else if (monthNum >= 2 && monthNum <= 4) seasonName = 'Summer (Zaid)';

        const prompt = `You are an expert agricultural scientist for Indian farming.
Current Month: ${currentMonth} (Agricultural Season: ${seasonName})
Verified Farmer Location: ${locName}
Current Weather Telemetry: ${temp}°C, Humidity: ${humidity}%

Provide realistic, location-specific seasonal crop recommendations for farmers in ${locName} RIGHT NOW for the active ${seasonName} season.
Format your response exactly as:

🌾 **Top 3 Recommended Crops for ${currentMonth} (${seasonName} Season - ${locName}):**
1. [Crop Name] - Reason why suitable for this state and current weather
2. [Crop Name] - Reason why suitable for this state and current weather
3. [Crop Name] - Reason why suitable for this state and current weather

🌿 **Farming Tip:** Practical advice on soil preparation, seed treatment, or sowing for this region.

⚠️ **Caution:** Weather or pest/disease precaution tailored to ${temp}°C and ${humidity}% humidity.

Keep it concise, actionable, and strictly accurate for ${locName}.`;

        let recommendation = await callAI(prompt, lang);
        
        if (!recommendation) {
            recommendation = generateSeasonalRecommendations(weatherData, locName, state, district, lang);
        }

        if (recommendation) {
            setInAiCache(seasonalCacheKey, recommendation);
        }

        res.json({ recommendation });
    } catch (error) {
        console.error('Seasonal API Error:', error);
        res.status(500).json({ error: 'Failed to generate seasonal recommendation.' });
    }
});

// Dedicated Chatbot Agent endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, language, weatherData, location } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const langMap = { 'en': 'English', 'kn': 'Kannada', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam', 'hi': 'Hindi' };
        const targetLang = langMap[language] || 'English';
        const locName = location || 'India';
        
        const systemPrompt = `You are Krishi AI, a helpful, friendly, and expert Indian agricultural assistant.
Your goal is to help farmers with scientific advice, crop management, and pest control.
Context:
- Farmer Location: ${locName}
- Current Weather: ${JSON.stringify(weatherData || 'Unknown')}
- Tone: Professional yet empathetic, like a knowledgeable local agricultural officer.
- YOUR LANGUAGE INSTRUCTION: The user has selected ${targetLang}. You MUST respond ENTIRELY in ${targetLang} language using native script.
- Knowledge: Deep expertise in Indian crops like Ragi, Paddy, Wheat, Cotton, Mustard, Sugarcane, Coconut, Arecanut, Ginger, and Vegetables.

STRICT INSTRUCTIONS:
1. ALWAYS respond using ${targetLang} and its native script.
2. Be concise but practical. Provide step-by-step guidance when possible.
3. If weather data is provided, incorporate it into your advice.
4. Reference the farmer's location (${locName}) when giving region-specific advice.`;

        let chatResult = null;
        let aiError = null;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (apiKey) {
            const chatModels = [
                'minimax/minimax-m3:free',
                'nvidia/nemotron-3.5-lightning:free',
                'google/gemma-4-31b-it:free',
                'google/gemma-4-26b-a4b-it:free',
                'google/gemini-3.5-flash-lite'
            ];

            for (const model of chatModels) {
                try {
                    const response = await axios.post(OPENROUTER_URL, {
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: message }
                        ],
                        max_tokens: 1000
                    }, {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://krishi-vaani-iota.vercel.app',
                            'X-Title': 'Krishi Vaani Agent'
                        },
                        timeout: 30000
                    });
                    const content = response.data?.choices?.[0]?.message?.content;
                    if (content && content.trim()) {
                        chatResult = content;
                        break;
                    }
                } catch (err) {
                    aiError = err.response?.status || err.message;
                    console.warn(`Chat model ${model} failed:`, aiError);
                    // Try next model
                }
            }
        } else {
            console.warn('OPENROUTER_API_KEY not set. Using offline fallback.');
        }

        if (!chatResult) {
            chatResult = getOfflineChatFallback(message, language);
            if (aiError) {
                console.error('All AI models failed for chat. Last error:', aiError);
            }
        }

        res.json({ advice: chatResult, source: chatResult && !aiError ? 'ai' : 'fallback' });
    } catch (error) {
        console.error('Chat API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'AI service is temporarily unavailable. Please try again shortly.' });
    }
});

// Offline chat fallback
function getOfflineChatFallback(message, lang) {
    const fallbacks = {
        te: 'కృషి AI: మీ పంటకు తగిన నీటిపారుదల మరియు పోషక నిర్వహణను అనుసరించండి. ప్రస్తుత వాతావరణం ఆధారంగా నేలలో తేమను నిరంతరం పర్యవేక్షించండి.',
        kn: 'ಕೃಷಿ AI: ನಿಮ್ಮ ಬೆಳೆಗೆ ಸರಿಯಾದ ನೀರಾವರಿ ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆಯನ್ನು ಅನುಸರಿಸಿ. ಪ್ರಸ್ತುತ ಹವಾಮಾನದ ಪ್ರಕಾರ ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಗಮನಿಸಿ.',
        ta: 'கிருஷி AI: உங்கள் பயிருக்கு சரியான நீர்ப்பாசனம் மற்றும் ஊட்டச்சத்து மேலாண்மையைப் பின்பற்றுங்கள். தற்போதைய வானிலைக்கு ஏற்ப மண் ஈரப்பதத்தை கண்காணிக்கவும்.',
        ml: 'കൃഷി AI: നിങ്ങളുടെ വിളയ്ക്ക് അനുയോജ്യമായ ജലസേചനവും വളപ്രയോഗവും നടത്തുക. നിലവിലെ കാലാവസ്ഥ അനുസരിച്ച് മണ്ണിന്റെ ഈർപ്പം നിരീക്ഷിക്കുക.',
        hi: 'कृषि AI: अपनी फसल के लिए उचित सिंचाई और पोषण प्रबंधन का पालन करें। वर्तमान मौसम के अनुसार मिट्टी की नमी पर नजर रखें।',
        en: 'Krishi AI: Ensure optimal irrigation and nutrient management for your crop. Monitor soil moisture closely according to current weather conditions.'
    };
    return fallbacks[lang] || fallbacks['en'];
}

// Intelligent offline fallback for AI Advisory
function generateOfflineFallback(weatherData, cropInfo, lang = 'en', locName = '') {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    let temp = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : 28;
    let humidity = weatherData?.main?.humidity || 65;
    const locationDisplay = locName || 'India';
    
    if (cropInfo) {
        if (lang === 'kn') {
            return `ಬೆಳೆ: ${cropInfo}
ಸ್ಥಳ: ${locationDisplay}
ಹವಾಮಾನ: ${temp}°C | ತೇವಾಂಶ: ${humidity}%

ಬೆಳೆಯ ಸೂಕ್ತತೆ
ಪ್ರಸ್ತುತ ${currentMonth} ತಿಂಗಳಲ್ಲಿ ${cropInfo} ಬೆಳೆಗೆ ತಾಪಮಾನ ಮತ್ತು ವಾತಾವರಣ ಅನುಕೂಲಕರವಾಗಿದೆ.

ಮಣ್ಣು ಮತ್ತು ನೀರು
ನಿರ್ದಿಷ್ಟ ಭೂಮಿಯ ಮಣ್ಣು ಮತ್ತು ನೀರಿನ ಪರೀಕ್ಷಾ ವರದಿ ಲಭ್ಯವಿಲ್ಲ. ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆಗಾಗಿ ಕೃಷಿ ಇಲಾಖೆ ಅಥವಾ ಕೆವಿಕೆಯಲ್ಲಿ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.

ಹವಾಮಾನ ಪರಿಣಾಮ
ಪ್ರಸ್ತುತ ${temp}°C ತಾಪಮಾನ ಮತ್ತು ${humidity}% ತೇವಾಂಶವಿದೆ. ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಗಮನಿಸಿ ನೀರಾವರಿ ನಿರ್ವಹಣೆ ಮಾಡಿ.

ಈಗ ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು
1. ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.
2. ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಸಾವಯವ ಗೊಬ್ಬರ ಬಳಸಿ.
3. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಜೈವಿಕ ಬೀಜೋಪಚಾರ ಮಾಡಿ.
4. ನಿರ್ದಿಷ್ಟ ಔಷಧ ಪ್ರಮಾಣಕ್ಕೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.

ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಪಾಯಗಳು
- ಹೆಚ್ಚಿನ ತೇವಾಂಶದಿಂದ ಬರುವ ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಬಗ್ಗೆ ನಿಗಾ ವಹಿಸಿ.
- ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ.

ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ
ಸ್ಥಳೀಯ ಮಂಡಿಗಳಲ್ಲಿ ಗುಣಮಟ್ಟದ ಗ್ರೇಡಿಂಗ್ ಮತ್ತು ತೇವಾಂಶ ನಿಯಂತ್ರಣದಿಂದ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಬಹುದು.`;
        }
        if (lang === 'te') {
            return `పంట: ${cropInfo}
ప్రాంతం: ${locationDisplay}
వాతావరణం: ${temp}°C | తేమ: ${humidity}%

పంట అనుకూలత
ప్రస్తుత ${currentMonth} సీజన్ లో ${cropInfo} పంట సాగుకు వాతావరణ పరిస్థితులు అనుకూలంగా ఉన్నాయి.

నేల మరియు నీరు
క్షేత్ర స్థాయి నేల మరియు నీటి పరీక్ష డేటా అందుబాటులో లేదు. ఎరువుల వాడకానికి ముందు స్థానిక కేవీకే లేదా వ్యవసాయ శాఖ ద్వారా భూసార పరీక్ష చేయించుకోండి.

వాతావరణ ప్రభావం
ప్రస్తుత ${temp}°C ఉష్ణోగ్రత మరియు ${humidity}% తేమ పంట ఎదుగుదలకు సహకరిస్తాయి.

ఇప్పుడు చేయవలసిన పనులు
1. పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాలువలు శుభ్రం చేయండి.
2. తగినంత పశువుల ఎరువు లేదా వర్మీకంపోస్ట్ వాడండి.
3. నాణ్యమైన విత్తన శుద్ధి తప్పనిసరిగా చేయండి.
4. రసాయన మోతాదుల కోసం స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.

గమనించవలసిన సమస్యలు
- అధిక తేమ వల్ల వచ్చే శిలీంధ్ర తెగుళ్లను గమనించండి.
- నీటి నిల్వ సమస్య రాకుండా జాగ్రత్త పడండి.

మార్కెట్ సమాచారం
నాణ్యమైన గ్రేడింగ్ మరియు తేమ శాతం నియంత్రణతో మార్కెట్ లో మంచి ధర లభిస్తుంది.`;
        }
        if (lang === 'ta') {
            return `பயிர்: ${cropInfo}
இடம்: ${locationDisplay}
வானிலை: ${temp}°C | ஈரப்பதம்: ${humidity}%

பயிர் பொருத்தம்
தற்போதைய ${currentMonth} பருவத்தில் ${cropInfo} சாகுபடிக்கு உகந்த சூழல் நிலவுகிறது.

மண் மற்றும் நீர்
நிலத்திற்கான மண் மற்றும் நீர் ஆய்வக பரிசோதனை விவரங்கள் கிடைக்கப்பெறவில்லை. உர நிர்வாகத்திற்கு முன் மண்வள அட்டை பரிசோதனை செய்ய பரிந்துரைக்கப்படுகிறது.

வானிலை தாக்கம்
தற்போதைய ${temp}°C வெப்பநிலை மற்றும் ${humidity}% ஈரப்பதம் வளர்ச்சிக்கு ஏற்றது.

இப்போது செய்ய வேண்டியவை
1. நிலத்தில் தண்ணீர் தேங்காமல் வடிகால் வசதி செய்யவும்.
2. பரிந்துரைக்கப்பட்ட அளவு மக்கிய தொழுவுரம் இடவும்.
3. விதை நேர்த்தி செய்து விதைக்கவும்.
4. குறிப்பிட்ட மருந்து அளவுகளுக்கு உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்.

கவனிக்க வேண்டிய பாதிப்புகள்
- அதிக ஈரப்பதத்தால் ஏற்படும் பூஞ்சை நோய்களை கண்காணிக்கவும்.
- நிலத்தில் தண்ணீர் தேங்க விடாதீர்கள்.

சந்தை நிலவரம்
சரியான தரம் பிரித்தல் மற்றும் ஈரப்பத கட்டுப்பாடு மூலம் சந்தையில் நல்ல விலை பெறலாம்.`;
        }
        if (lang === 'ml') {
            return `വിള: ${cropInfo}
സ്ഥലം: ${locationDisplay}
കാലാവസ്ഥ: ${temp}°C | ഈർപ്പം: ${humidity}%

കൃഷി അനുയോജ്യത
നിലവിലെ ${currentMonth} മാസത്തിൽ ${cropInfo} കൃഷിക്ക് അനുയോജ്യമായ അന്തരീക്ഷമാണ്.

മണ്ണും ജലവും
മണ്ണ്-ജല പരിശോധന റിപ്പോർട്ട് ലഭ്യമല്ല. കൃത്യമായ വളപ്രയോഗത്തിന് മുൻപ് സോയിൽ ഹെൽത്ത് കാർഡ് പരിശോധന നടത്തുക.

കാലാവസ്ഥ സ്വാധീനം
നിലവിലെ ${temp}°C താപനിലയും ${humidity}% ഈർപ്പവും വളർച്ചയ്ക്ക് അനുകൂലമാണ്.

ഇപ്പോൾ ചെയ്യേണ്ട കാര്യങ്ങൾ
1. തടങ്ങളിൽ വെള്ളം കെട്ടിനിൽക്കാതെ ഡ്രെയിനേജ് ചാലുകൾ വൃത്തിയാക്കുക.
2. ജൈവവളങ്ങൾ അല്ലെങ്കിൽ കമ്പോസ്റ്റ് ആവശ്യാനുസരണം ചേർക്കുക.
3. വിത്ത് പാകുന്നതിന് മുൻപ് ട്രൈക്കോഡെർമ ഉപയോഗിച്ച് വിത്ത് സംസ്കരണം നടത്തുക.
4. മരുന്നുകളുടെ അളവിന് കൃഷിഭവനുമായി ബന്ധപ്പെടുക.

ശ്രദ്ധിക്കേണ്ട രോഗങ്ങളും കീടങ്ങളും
- ഈർപ്പം കൂടുമ്പോൾ കുമിൾ രോഗങ്ങൾ ഉണ്ടാകാതെ ശ്രദ്ധിക്കുക.
- വേരുകളിൽ വെള്ളം കെട്ടിക്കിടക്കാൻ അനുവദിക്കരുത്.

വിപണി വിവരം
ഗുണമേന്മ അനുസരിച്ച് തരംതിരിച്ച് വിൽക്കുന്നത് വഴി വിപണിയിൽ ഉയർന്ന വില ലഭിക്കും.`;
        }
        if (lang === 'hi') {
            return `फसल: ${cropInfo}
स्थान: ${locationDisplay}
मौसम: ${temp}°C | नमी: ${humidity}%

फसल की उपयुक्तता
वर्तमान ${currentMonth} माह में ${cropInfo} की खेती के लिए मौसम और तापमान अनुकूल है।

मिट्टी और जल प्रबंधन
सटीक उर्वरक प्रबंधन के लिए मृदा स्वास्थ्य कार्ड जांच अवश्य कराएं।

मौसम का प्रभाव
वर्तमान ${temp}°C तापमान और ${humidity}% नमी फसल की प्रारंभिक वृद्धि के लिए उपयुक्त है।

अभी क्या करें
1. खेत में जलभराव रोकने के लिए उचित जल निकासी नालियां बनाएं।
2. अंतिम जुताई के समय अच्छी तरह सड़ी हुई गोबर की खाद मिलाएं।
3. बुवाई से पहले बीजोपचार अवश्य करें।
4. दवाओं की सही मात्रा के लिए स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।

संभावित खतरे
- अधिक नमी में फफूंद जनित रोगों पर नजर रखें।
- खेत में पानी रुकने न दें।

मंडी और बाजार जानकारी
फसल की उचित ग्रेडिंग और नमी नियंत्रण करने पर नजदीकी मंडियों में बेहतर भाव मिलता है।`;
        }
        return `Crop: ${cropInfo}
Location: ${locationDisplay}
Weather: ${temp}°C | Humidity: ${humidity}%

Crop Suitability
Current conditions in ${currentMonth} are favorable for growing ${cropInfo} with steady vegetative growth potential.

Soil & Water
Obtain a Soil Health Card test from your local KVK before applying major fertilizer doses.

Weather Impact
Current temperature of ${temp}°C and humidity of ${humidity}% support healthy crop development.

What to Do Now
1. Clear drainage channels to prevent water stagnation in the root zone.
2. Apply well-decomposed organic manure or FYM during soil preparation.
3. Complete recommended bio-fertilizer seed treatment before sowing.
4. Consult your local KVK or Agriculture Officer for exact dosage recommendations.

Risks to Watch
- Monitor for fungal leaf spots under high relative humidity.
- Prevent water accumulation around plant roots.

Market Information
Cleaning, grading, and maintaining proper moisture levels will help achieve optimal prices in nearby mandis.`;
    }
    
    // If no cropInfo, fallback to seasonal recommendations
    return generateSeasonalRecommendations(weatherData, locationDisplay, '', '', lang);
}

// Comprehensive State-aware, Season-aware, Weather-adaptive Seasonal Recommendations
function generateSeasonalRecommendations(weatherData, locName = '', state = '', district = '', lang = 'en') {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const monthNum = new Date().getMonth();
    const temp = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : 28;
    const humidity = weatherData?.main?.humidity || 65;

    // Detect Season
    let seasonKey = 'kharif';
    let seasonNameEn = 'Kharif';
    if (monthNum >= 9 || monthNum <= 1) {
        seasonKey = 'rabi';
        seasonNameEn = 'Rabi';
    } else if (monthNum >= 2 && monthNum <= 4) {
        seasonKey = 'summer';
        seasonNameEn = 'Summer';
    }

    // Detect State/Region
    const combinedLoc = `${district} ${state} ${locName}`.toLowerCase();
    let regionKey = 'karnataka';
    let displayLoc = state || 'Karnataka';

    if (combinedLoc.includes('maharashtra') || combinedLoc.includes('pune') || combinedLoc.includes('nagpur') || combinedLoc.includes('nashik') || combinedLoc.includes('kolhapur')) {
        regionKey = 'maharashtra';
        displayLoc = 'Maharashtra';
    } else if (combinedLoc.includes('andhra') || combinedLoc.includes('telangana') || combinedLoc.includes('hyderabad') || combinedLoc.includes('guntur') || combinedLoc.includes('vijayawada') || combinedLoc.includes('kurnool')) {
        regionKey = 'andhra_telangana';
        displayLoc = state || 'Andhra Pradesh / Telangana';
    } else if (combinedLoc.includes('tamil') || combinedLoc.includes('chennai') || combinedLoc.includes('coimbatore') || combinedLoc.includes('madurai') || combinedLoc.includes('thanjavur')) {
        regionKey = 'tamil_nadu';
        displayLoc = 'Tamil Nadu';
    } else if (combinedLoc.includes('kerala') || combinedLoc.includes('kochi') || combinedLoc.includes('thiruvananthapuram') || combinedLoc.includes('palakkad') || combinedLoc.includes('wayanad')) {
        regionKey = 'kerala';
        displayLoc = 'Kerala';
    } else if (combinedLoc.includes('punjab') || combinedLoc.includes('haryana') || combinedLoc.includes('uttar pradesh') || combinedLoc.includes('bihar') || combinedLoc.includes('rajasthan') || combinedLoc.includes('madhya pradesh') || combinedLoc.includes('delhi')) {
        regionKey = 'north_india';
        displayLoc = state || 'North India';
    } else if (combinedLoc.includes('karnataka') || combinedLoc.includes('bengaluru') || combinedLoc.includes('mysuru') || combinedLoc.includes('belagavi') || combinedLoc.includes('dharwad') || combinedLoc.includes('mandya') || combinedLoc.includes('tumakuru')) {
        regionKey = 'karnataka';
        displayLoc = 'Karnataka';
    }

    // Curated Agronomic Data Matrix per Region & Season
    const CROPS_DB = {
        karnataka: {
            kharif: {
                en: [
                    'Ragi (Finger Millet - GPU-28 / ML-365) - Highly drought-tolerant, optimal for current temperatures and soil conditions.',
                    'Paddy (Rice - Jyothi / Jaya) - Ideal for medium rainfall zones with assured water drainage.',
                    'Tur Dal (Pigeon Pea - BRG-2) - High-value pulse crop, excellent for intercropping with Ragi or Maize.'
                ],
                kn: [
                    'ರಾಗಿ (GPU-28 / ML-365) - ಮುಂಗಾರು ಹಂಗಾಮಿಗೆ ಅತ್ಯಂತ ಸೂಕ್ತ, ಕಡಿಮೆ ನೀರು ಸಾಕು ಮತ್ತು ಅಧಿಕ ಇಳುವರಿ ನೀಡುತ್ತದೆ.',
                    'ಭತ್ತ (ಜ್ಯೋತಿ / ಜಯ) - ಮಧ್ಯಮ ಮಳೆ ಹಾಗೂ ಕಾಲುವೆ ನೀರಾವರಿ ಪ್ರದೇಶಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ.',
                    'ತೊಗರಿ ಬೇಳೆ (BRG-2) - ರಾಗಿ ಅಥವಾ ಮುಸುಕಿನ ಜೋಳದೊಂದಿಗೆ ಉತ್ತಮ ಮಿಶ್ರ ಬೆಳೆಯಾಗಿದ್ದು ಮಣ್ಣಿನ ಸಾರ ಹೆಚ್ಚಿಸುತ್ತದೆ.'
                ],
                ta: [
                    'கேழ்வரகு (GPU-28 / ML-365) - குறைந்த நீர்தேவை, தற்போதைய வெப்பநிலைக்கு ஏற்ற அதிக சத்துமிக்க பயிர்.',
                    'நெல் (ஜோதி / ஜெயா) - பாசன வசதி கொண்ட நிலங்களுக்கு ஏற்ற சிறந்த தேர்வு.',
                    'துவரம் பருப்பு (BRG-2) - ஊடுபயிராக பயிரிட ஏற்றது, மண்ணின் நைட்ரஜன் சத்தை கூட்டும்.'
                ],
                te: [
                    'రాగులు (GPU-28 / ML-365) - తక్కువ నీటితో అధిక దిగుబడి, ప్రస్తుత ఉష్ణోగ్రతలకు అనుకూలం.',
                    'వరి (జ్యోతి / జయ) - నీటి పారుదల గల భూములకు అత్యంత అనువైన రకం.',
                    'కంది (BRG-2) - అంతర పంటగా సాగు చేయడానికి అనువైన అధిక ఆదాయం ఇచ్చే పప్పుధాన్యం.'
                ],
                ml: [
                    'റാഗി (GPU-28) - കുറഞ്ഞ വെള്ളത്തിൽ മികച്ച വിളവ്, കാലാവസ്ഥയ്ക്ക് ഏറ്റവും അനുയോജ്യം.',
                    'നെല്ല് (ജ്യോതി / ജയ) - നല്ല നീർവാർച്ചയുള്ള നിലങ്ങൾക്ക് അനുയോജ്യമായ വിള.',
                    'തുവരപ്പയർ (BRG-2) - ഇടവിളയായി കൃഷി ചെയ്യാൻ മികച്ച പയറുവർഗ്ഗം.'
                ],
                hi: [
                    'रागी (GPU-28 / ML-365) - सूखा प्रतिरोधी, वर्तमान तापमान में कम पानी में भरपूर पैदावार।',
                    'धान (ज्योति / जया) - वर्षा आधारित व सिंचित क्षेत्रों के लिए सर्वोत्तम फसल।',
                    'अरहर / तुअर (BRG-2) - रागी या मक्का के साथ अंतःफसल के लिए उत्तम दलहन फसल।'
                ],
                tip: {
                    en: 'Perform seed treatment with Trichoderma (4g/kg) and Azospirillum bio-fertilizers before sowing to enhance seedling vigor.',
                    kn: 'ಬಿತ್ತನೆ ಮಾಡುವ ಮುನ್ನ ಬೀಜಗಳಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ (೪ ಗ್ರಾಂ/ಕೆಜಿ) ಹಾಗೂ ಅಜೋಸ್ಪಿರಿಲಮ್ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
                    ta: 'விதைப்பதற்கு முன் ட்ரைக்கோடெர்மா (4 கிராம்/கிலோ) கொண்டு விதை நேர்த்தி செய்து விதைக்கவும்.',
                    te: 'విత్తన శుద్ధి కోసం ట్రైకోడెర్మా (4 గ్రా/కిలో) లేదా జీవ ఎరువులను విత్తనాలకు పట్టించి నాటండి.',
                    ml: 'വിത്ത് പാകുന്നതിന് മുൻപ് ട്രൈക്കോഡെർമ ഉപയോഗിച്ച് വിത്ത് സംസ്കരണം നടത്തുക.',
                    hi: 'बुवाई से पहले ट्राइकोडर्मा (4 ग्राम/किग्रा) और जैव उर्वरकों से बीजोपचार अवश्य करें।'
                },
                caution: {
                    en: `Current humidity is ${humidity}%. Ensure clean drainage channels around fields to avoid root rot and fungal leaf blight.`,
                    kn: `ಪ್ರಸ್ತುತ ತೇವಾಂಶವು ${humidity}% ಇದೆ. ಬೇರು ಕೊಳೆ ರೋಗ ಮತ್ತು ಶಿಲೀಂಧ್ರ ಬಾಧೆ ತಡೆಯಲು ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿದು ಹೋಗಲು ಕಾಲುವೆ ಮಾಡಿ.`,
                    ta: `தற்போதைய ஈரப்பதம் ${humidity}%. வேரழுகல் மற்றும் பூஞ்சை நோய்களைத் தவிர்க்க வயலில் தண்ணீர் தேங்காமல் வடிகால் அமைக்கவும்.`,
                    te: `ప్రస్తుత తేమ ${humidity}%. వేరుకుళ్ళు మరియు బూజు తెగుళ్ళను నివారించడానికి పొలంలో నీరు నిల్వ ఉండకుండా డ్రైనేజీ కాలువలు తీయండి.`,
                    ml: `നിലവിലെ ഈർപ്പം ${humidity}%. വേരുചീയൽ ഒഴിവാക്കാൻ പാടങ്ങളിൽ വെള്ളം കെട്ടിക്കിടക്കാതെ ശ്രദ്ധിക്കുക.`,
                    hi: `वर्तमान आर्द्रता ${humidity}% है। जड़ गलन व फफूंद जनित रोगों से बचाव के लिए खेत में जल निकासी की उचित व्यवस्था करें।`
                }
            },
            rabi: {
                en: [
                    'Rabi Jowar (Sorghum - M-35-1 / Maldandi) - Highly adapted to post-monsoon residual soil moisture.',
                    'Bengal Gram (Chickpea - JG-11 / Annigeri-1) - Requires minimal irrigation, fixes atmospheric nitrogen.',
                    'Sunflower (KBHS-44) - Strong market demand with excellent oil recovery.'
                ],
                kn: [
                    'ಹಿಂಗಾರು ಜೋಳ (ಮಾಲ್ದಂಡಿ M-35-1) - ಮಣ್ಣಿನಲ್ಲಿರುವ ತೇವಾಂಶದಲ್ಲಿಯೇ ಸಮೃದ್ಧವಾಗಿ ಬೆಳೆಯುತ್ತದೆ.',
                    'ಕಡಲೆ (JG-11 / ಅಣ್ಣಿಗೇರಿ-1) - ಕಡಿಮೆ ನೀರಾವರಿ ಸಾಕು, ಮಣ್ಣಿನ ಸಾರಜನಕ ಹೆಚ್ಚಿಸುತ್ತದೆ.',
                    'ಸೂರ್ಯಕಾಂತಿ (KBHS-44) - ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉತ್ತಮ ಧಾರಣೆ ಮತ್ತು ಎಣ್ಣೆ ಇಳುವರಿ ನೀಡುತ್ತದೆ.'
                ],
                tip: {
                    en: 'Sow in conserved soil moisture and maintain proper spacing for optimal canopy development.',
                    kn: 'ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿರುವಾಗಲೇ ಬಿತ್ತನೆ ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಸರಿಯಾದ ಸಾಲಿನ ಅಂತರ ಕಾಪಾಡಿಕೊಳ್ಳಿ.'
                },
                caution: {
                    en: 'Monitor early mornings for pod borer (Helicoverpa) on Bengal Gram and aphid buildup.',
                    kn: 'ಕಡಲೆ ಬೆಳೆಯಲ್ಲಿ ಕಾಯಿಕೊರೆಯುವ ಹುಳು (ಹೆಲಿಕೋವರ್ಪಾ) ಬಾಧೆಯ ಬಗ್ಗೆ ಮುಂಜಾನೆ ಪರಿಶೀಲಿಸಿ.'
                }
            },
            summer: {
                en: [
                    'Groundnut (KCG-2 / TMV-2) - High yield potential under assured summer micro-irrigation.',
                    'Watermelon (Sugar Baby / Kiran) - 75-80 day duration with peak summer market profitability.',
                    'Green Gram (Moong) - Short duration summer pulse that restores soil vitality.'
                ],
                kn: [
                    'ಬೇಸಿಗೆ ಕಡಲೆಕಾಯಿ (KCG-2) - ಹನಿ ನೀರಾವರಿ ಸೌಲಭ್ಯವಿರುವ ಜಮೀನುಗಳಿಗೆ ಅಧಿಕ ಇಳುವರಿ ನೀಡುವ ಬೆಳೆ.',
                    'ಕಲ್ಲಂಗಡಿ (ಶುಗರ್ ಬೇಬಿ) - 75-80 ದಿನಗಳಲ್ಲಿ ಕಟಾವಿಗೆ ಬರುವ ಲಾಭದಾಯಕ ಬೇಸಿಗೆ ಹಣ್ಣಿನ ಬೆಳೆ.',
                    'ಹೆಸರು ಕಾಳು - ಅಲ್ಪಾವಧಿಯ ಬೆಳೆಯಾಗಿದ್ದು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಸುಧಾರಿಸುತ್ತದೆ.'
                ],
                tip: {
                    en: 'Adopt drip irrigation and organic mulching to conserve root zone moisture.',
                    kn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂರಕ್ಷಿಸಲು ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಸಾವಯವ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಪದ್ಧತಿ ಅನುಸರಿಸಿ.'
                },
                caution: {
                    en: 'Schedule irrigations during early morning or evening hours to avoid thermal stress.',
                    kn: 'ಬೇಸಿಗೆ ಬಿಸಿಲಿನಿಂದ ಗಿಡಗಳು ಬಾಡದಂತೆ ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ನೀರು ಹಾಯಿಸಿ.'
                }
            }
        },
        maharashtra: {
            kharif: {
                en: [
                    'Soybean (JS-335 / JS-9305) - Core Kharif crop with excellent oil recovery and stable mandi prices.',
                    'Cotton (Bt Hybrid) - Suitable for medium to deep black soils with good water retention.',
                    'Tur / Arhar (BDN-711) - High-yielding wilt resistant pigeon pea variety.'
                ],
                hi: [
                    'सोयाबीन (JS-335 / JS-9305) - प्रमुख खरीफ फसल, मंडियों में निरंतर मांग और अच्छा भाव।',
                    'कपास (Bt हाइब्रिड) - काली मिट्टी के लिए उपयुक्त, बेहतर पैदावार।',
                    'तुअर / अरहर (BDN-711) - उकठा प्रतिरोधी एवं अधिक उत्पादन देने वाली किस्म।'
                ],
                tip: {
                    en: 'Ensure broad bed furrow (BBF) planting for soybean to handle excess rain and moisture stress.',
                    hi: 'सोयाबीन में जलभराव व सूखे से बचाव के लिए बीबीएफ (BBF) विधि से बुवाई करें।'
                },
                caution: {
                    en: `Current humidity is ${humidity}%. Watch for stem fly and girdle beetle infestation in young crops.`,
                    hi: `वर्तमान आर्द्रता ${humidity}% है। गर्डल बीटल और तना मक्खी के प्रकोप पर सतर्क नजर रखें।`
                }
            }
        },
        andhra_telangana: {
            kharif: {
                en: [
                    'Paddy (BPT-5204 Samba Mahsuri / MTU-1010) - High market premium rice varieties for current season.',
                    'Cotton - Suitable for black and red soils under current monsoon pattern.',
                    'Red Gram (LRG-41 / ICPL-87119) - Ideal sole crop or intercrop with Maize/Cotton.'
                ],
                te: [
                    'వరి (సాంబ మసూరి BPT-5204 / MTU-1010) - మార్కెట్లో మంచి ధర పలికే ఖరీఫ్ వరి రకాలు.',
                    'పత్తి - ప్రస్తుత వర్షపాత పరిస్థితులకు నల్లరేగడి నేలలకు అనుకూలమైన రకం.',
                    'కంది (LRG-41 / ఆశా) - పత్తి లేదా మక్కజొన్నతో అంతర పంటగా సాగుకు అనుకూలం.'
                ],
                tip: {
                    en: 'Ensure seed treatment with Imidacloprid and Carbendazim to protect against early sucking pests.',
                    te: 'మొలక దశలో రసం పీల్చే పురుగుల నివారణకు విత్తన శుద్ధి తప్పనిసరిగా చేయండి.'
                },
                caution: {
                    en: 'Avoid stagnant water in cotton and red gram fields during heavy rainfall spells.',
                    te: 'భారీ వర్షాలు పడినప్పుడు పత్తి, కంది చేలల్లో నీరు నిల్వ ఉండకుండా వెంటనే తీసివేయండి.'
                }
            }
        },
        tamil_nadu: {
            kharif: {
                en: [
                    'Paddy (ADT-43 / CO-51 / CR-1009) - High-yielding varieties suited for current Kuruvai / Samba planting.',
                    'Groundnut (VRI-2 / TMV-13) - Well-suited for sandy loams with short duration.',
                    'Black Gram (VBN-8) - Rapid maturity pulse crop ideal for rice-fallows.'
                ],
                ta: [
                    'நெல் (ADT-43 / CO-51) - நடப்பு குருவை / சம்பா பருவத்திற்கு ஏற்ற அதிக விளைச்சல் தரும் ரகங்கள்.',
                    'நிலக்கடலை (VRI-2 / TMV-13) - செம்மண் மற்றும் மணற்பாங்கான நிலங்களுக்கு சிறந்த தேர்வு.',
                    'உளுந்து (VBN-8) - குறுகிய காலத்தில் அறுவடைக்கு வரும் தரமான பயறு வகை.'
                ],
                tip: {
                    en: 'Incorporate green manure (Daincha/Sunnhemp) into paddy fields during puddled soil preparation.',
                    ta: 'நெல் நடவுக்கு முன் தக்கைப்பூண்டு அல்லது சணப்பை போன்ற பசுந்தாள் உரங்களை மடக்கி உழவும்.'
                },
                caution: {
                    en: 'Monitor paddy nurseries for blast and leaf folder activity under humid weather.',
                    ta: 'ஈரப்பதமான வானிலையில் நெல் நாற்றங்காலில் குலைநோய் மற்றும் இலைசுருட்டு புழுவை கண்காணிக்கவும்.'
                }
            }
        },
        kerala: {
            kharif: {
                en: [
                    'Paddy (Uma / Jyothi) - High-performing Virippu season varieties resilient to waterlogging.',
                    'Banana (Nendran / Robusta) - Profitable plantation crop suited for fertile alluvial soils.',
                    'Ginger (Rio-de-Janeiro / Maran) - High value spice crop flourishing in humid tropical warmth.'
                ],
                ml: [
                    'നെല്ല് (ഉമ / ജ്യോതി) - വിരിപ്പ് കൃഷിക്ക് ഏറ്റവും അനുയോജ്യമായ കൂടുതൽ വിളവ് തരുന്ന ഇനങ്ങൾ.',
                    'വാഴ (നേന്ത്രൻ / റോബസ്റ്റ) - നല്ല നീർവാർച്ചയുള്ള മണ്ണിൽ മികച്ച ആദായം തരുന്ന വിള.',
                    'ഇഞ്ചി (മാരൻ / റിയോ ഡി ജനീറോ) - ഉയർന്ന വിപണി മൂല്യമുള്ള സുഗന്ധവ്യഞ്ജന വിള.'
                ],
                tip: {
                    en: 'Ensure earthing up and adequate drainage trenches around banana and ginger beds.',
                    ml: 'വാഴയ്ക്കും ഇഞ്ചിക്കും തടങ്ങളിൽ വെള്ളം കെട്ടിക്കിടക്കാതെ ചാലുകൾ കീറി നീർവാർച്ച ഉറപ്പാക്കുക.'
                },
                caution: {
                    en: 'Apply Trichoderma-enriched manure to prevent rhizome rot in ginger during monsoons.',
                    ml: 'ഇഞ്ചിയിൽ മൂടുചീയൽ രോഗം തടയാൻ ട്രൈക്കോഡെർമ ചേർത്ത ചാണകപ്പൊടി ഉപയോഗിക്കുക.'
                }
            }
        },
        north_india: {
            kharif: {
                en: [
                    'Paddy (Basmati Pusa 1509 / PR-126) - Premium grain quality suited for current monsoon window.',
                    'Maize (PMH-1 / HQPM-1) - Resilient Kharif crop with steady industrial feed demand.',
                    'Bajra / Pearl Millet - Highly drought-hardy with low irrigation inputs.'
                ],
                hi: [
                    'धान (बासमती पूसा 1509 / PR-126) - उत्कृष्ट गुणवत्ता व मंडियों में बेहतरीन भाव देने वाली किस्म।',
                    'मक्का (PMH-1 / HQPM-1) - खरीफ मौसम की मजबूत फसल, औद्योगिक मांग और अच्छा मुनाफा।',
                    'बाजरा (पूसा 1201) - कम पानी और कम लागत में भरपूर पैदावार देने वाली पौष्टिक फसल।'
                ],
                tip: {
                    en: 'Use laser land leveling and direct seeded rice (DSR) techniques to save up to 25% irrigation water.',
                    hi: 'लेजर लैंड लेवलर और सीधी बिजाई (DSR) तकनीक अपनाकर 25% तक पानी की बचत करें।'
                },
                caution: {
                    en: 'Watch for sheath blight in dense paddy stands during humid, warm periods.',
                    hi: 'अधिक नमी और उमस भरे मौसम में धान में शीथ ब्लाइट (झुलसा) रोग पर सतर्क नजर रखें।'
                }
            }
        }
    };

    // Retrieve region data, fallback to Karnataka if specific region season missing
    const regionData = CROPS_DB[regionKey] || CROPS_DB.karnataka;
    const seasonData = regionData[seasonKey] || regionData.kharif || CROPS_DB.karnataka.kharif;

    // Resolve language text
    const cropsList = seasonData[lang] || seasonData['en'] || CROPS_DB.karnataka.kharif['en'];
    const farmingTip = seasonData.tip?.[lang] || seasonData.tip?.['en'] || CROPS_DB.karnataka.kharif.tip['en'];
    const cautionText = seasonData.caution?.[lang] || seasonData.caution?.['en'] || CROPS_DB.karnataka.kharif.caution['en'];

    // Multilingual Headings
    if (lang === 'kn') {
        return `🌾 **${currentMonth} ತಿಂಗಳಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಬೆಳೆಗಳು (${displayLoc}):**
1. ${cropsList[0]}
2. ${cropsList[1]}
3. ${cropsList[2]}

🌿 **ರೈತರ ಸಲಹೆ:** ${farmingTip}

⚠️ **ಎಚ್ಚರಿಕೆ:** ${cautionText}`;
    }

    if (lang === 'te') {
        return `🌾 **${currentMonth} నెల కొరకు సిఫార్సు చేయబడిన పంటలు (${displayLoc}):**
1. ${cropsList[0]}
2. ${cropsList[1]}
3. ${cropsList[2]}

🌿 **రైతు సూచన:** ${farmingTip}

⚠️ **హెచ్చరిక:** ${cautionText}`;
    }

    if (lang === 'ta') {
        return `🌾 **${currentMonth} மாதத்திற்கான பரிந்துரைக்கப்பட்ட பயிர்கள் (${displayLoc}):**
1. ${cropsList[0]}
2. ${cropsList[1]}
3. ${cropsList[2]}

🌿 **விவசாய குறிப்பு:** ${farmingTip}

⚠️ **எச்சரிக்கை:** ${cautionText}`;
    }

    if (lang === 'ml') {
        return `🌾 **${currentMonth} മാസത്തിൽ ശുപാർശ ചെയ്യുന്ന സീസണൽ വിളകൾ (${displayLoc}):**
1. ${cropsList[0]}
2. ${cropsList[1]}
3. ${cropsList[2]}

🌿 **കർഷക നിർദ്ദേശം:** ${farmingTip}

⚠️ **മുന്നറിയിപ്പ്:** ${cautionText}`;
    }

    if (lang === 'hi') {
        return `🌾 **${currentMonth} के लिए अनुशंसित मौसमी फसलें (${displayLoc}):**
1. ${cropsList[0]}
2. ${cropsList[1]}
3. ${cropsList[2]}

🌿 **किसान सलाह:** ${farmingTip}

⚠️ **सावधानी:** ${cautionText}`;
    }

    return `🌾 **Top 3 Recommended Crops for ${currentMonth} (${seasonNameEn} Season - ${displayLoc}):**
1. ${cropsList[0]}
2. ${cropsList[1]}
3. ${cropsList[2]}

🌿 **Farming Tip:** ${farmingTip}

⚠️ **Caution:** ${cautionText}`;
}

module.exports = router;
