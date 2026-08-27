const fs = require('fs');
const path = require('path');
const https = require('https');

let apiKey = 'b27c698f5ab242029019b616b68e772c';
try {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const match = envContent.match(/NEWS_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
} catch(e) {}

// Strict Agriculture Core Validation Keywords
const AGRI_CORE_KEYWORDS = [
    'farmer', 'farmers', 'farming', 'agriculture', 'agricultural', 'agri',
    'crop', 'crops', 'mandi', 'harvest', 'kharif', 'rabi', 'zaid', 'paddy',
    'wheat', 'ragi', 'cotton', 'pulses', 'sugarcane', 'horticulture',
    'fertilizer', 'fertiliser', 'pesticide', 'seed', 'seeds', 'irrigation',
    'icar', 'kisan', 'monsoon', 'cultivation', 'yield', 'produce', 'apmc',
    'msp', 'pm-kisan', 'pmfby', 'drought', 'unseasonal rain'
];

// Noise exclusion list (strictly exclude tech/politics/cricket/general news without farming context)
const EXCLUDE_KEYWORDS = [
    'bollywood', 'box office', 'celebrity', 'cricket', 'ipl', 'horoscope',
    'astrology', 'cinema', 'trailer', 'movie', 'actress', 'actor', 'entertainment',
    'gaming', 'football', 'edtech', 'defense missile', 'ukraine', 'israel', 'gaza',
    'crypto', 'bitcoin', 'firebase', 'cybersecurity', 'smartphones', 'bollywood',
    'stock market', 'sensex', 'nifty', 'real estate', 'car launch', 'automobile'
];

function isAgricultureRelated(text) {
    const lower = text.toLowerCase();
    // Exclude noise first
    if (EXCLUDE_KEYWORDS.some(k => lower.includes(k))) {
        // Only allow if strong agriculture context is present
        const agriMatches = AGRI_CORE_KEYWORDS.filter(k => lower.includes(k));
        if (agriMatches.length < 2) return false;
    }
    return AGRI_CORE_KEYWORDS.some(k => lower.includes(k));
}

// Category Specific Matchers
function matchCategory(category, text) {
    const lower = text.toLowerCase();
    if (!isAgricultureRelated(lower)) return false;

    if (category === 'all') return true;

    if (category === 'crops') {
        const cropKeywords = [
            'crop', 'crops', 'price', 'prices', 'mandi', 'rate', 'rates', 'msp',
            'procurement', 'paddy', 'wheat', 'ragi', 'cotton', 'pulses', 'onion',
            'tomato', 'potato', 'sugar', 'sugarcane', 'jaggery', 'mustard', 'maize',
            'oilseed', 'grain', 'grains', 'harvest', 'yield', 'arrival', 'export',
            'import', 'commodity', 'commodities', 'apmc', 'production'
        ];
        return cropKeywords.some(k => lower.includes(k));
    }

    if (category === 'weather') {
        const weatherKeywords = [
            'weather', 'monsoon', 'rain', 'rainfall', 'rains', 'drought', 'heatwave',
            'flood', 'floods', 'cyclone', 'imd', 'forecast', 'precipitation',
            'temperature', 'hailstorm', 'cloud', 'unseasonal', 'dry spell', 'moisture'
        ];
        return weatherKeywords.some(k => lower.includes(k));
    }

    if (category === 'schemes') {
        const schemeKeywords = [
            'scheme', 'schemes', 'subsidy', 'subsidies', 'pm-kisan', 'pmfby',
            'kcc', 'kisan credit', 'soil health', 'ministry of agriculture',
            'welfare', 'benefit', 'benefits', 'compensation', 'relief package',
            'policy', 'policies', 'government', 'govt', 'cabinet', 'pradhan mantri'
        ];
        return schemeKeywords.some(k => lower.includes(k));
    }

    if (category === 'technology') {
        const techKeywords = [
            'tech', 'technology', 'agritech', 'drone', 'drones', 'precision',
            'smart farming', 'sensor', 'sensors', 'solar pump', 'irrigation system',
            'satellite', 'ai in agriculture', 'robot', 'automation', 'polyhouse',
            'hydroponics', 'icar', 'innovation', 'startup', 'biotech', 'mechanization'
        ];
        return techKeywords.some(k => lower.includes(k));
    }

    return false;
}

function fetchCategoryNews(query) {
    return new Promise((resolve) => {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${apiKey}`;
        https.get(url, { headers: { 'User-Agent': 'KrishiVaaniApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.articles || []);
                } catch(e) {
                    resolve([]);
                }
            });
        }).on('error', () => resolve([]));
    });
}

async function testAllCategories() {
    console.log('Testing category queries and strict filtering...\n');

    const testQueries = {
        all: '(farmer OR farming OR agriculture OR crops OR mandi OR "Kharif" OR "Rabi" OR "PM-KISAN") AND India',
        crops: '(crop OR crops OR "crop prices" OR "mandi rate" OR "MSP" OR paddy OR wheat OR cotton OR onion OR tomato OR harvest) AND (farmer OR farming OR agriculture OR India)',
        weather: '(monsoon OR rainfall OR drought OR heatwave OR "IMD" OR "weather alert" OR flood) AND (farmer OR farming OR agriculture OR crops OR India)',
        schemes: '("PM-KISAN" OR "PMFBY" OR "farmer subsidy" OR "Kisan Credit Card" OR "agriculture scheme" OR "farmer welfare" OR "MSP") AND (government OR India OR Ministry)',
        technology: '("agritech" OR "drone farming" OR "precision agriculture" OR "ICAR technology" OR "solar pump" OR "smart farming" OR "agricultural innovation") AND India'
    };

    for (const [cat, query] of Object.entries(testQueries)) {
        console.log(`==================== CATEGORY: [${cat.toUpperCase()}] ====================`);
        const raw = await fetchCategoryNews(query);
        console.log(`Raw articles returned from NewsAPI: ${raw.length}`);

        const filtered = raw.filter(a => {
            const text = (a.title || '') + ' ' + (a.description || '');
            return matchCategory(cat, text);
        });

        console.log(`Articles strictly matching category '${cat}': ${filtered.length}\n`);
        filtered.slice(0, 3).forEach((a, idx) => {
            console.log(`  [#${idx+1}] ${a.title}`);
            console.log(`       Source: ${a.source?.name} | Image: ${a.urlToImage ? 'YES' : 'NO'}`);
            console.log(`       Link: ${a.url}\n`);
        });
    }
}

testAllCategories();
