const fs = require('fs');
const path = require('path');
const https = require('https');

let apiKey = 'b27c698f5ab242029019b616b68e772c';
try {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const match = envContent.match(/NEWS_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
} catch(e) {}

const INDIAN_CONTEXT_KEYWORDS = [
    'india', 'indian', 'icar', 'kisan', 'mandi', 'kharif', 'rabi', 'zaid', 'imd',
    'karnataka', 'maharashtra', 'punjab', 'haryana', 'uttar pradesh', 'bihar',
    'gujarat', 'rajasthan', 'madhya pradesh', 'tamil nadu', 'andhra', 'telangana',
    'kerala', 'odisha', 'west bengal', 'assam', 'delhi', 'bengaluru', 'mumbai',
    'pm-kisan', 'pmfby', 'apmc', 'msp', 'centre', 'central government', 'union minister',
    'shivraj', 'krishi'
];

const AGRI_CORE_KEYWORDS = [
    'farmer', 'farmers', 'farming', 'agriculture', 'agricultural', 'agri',
    'crop', 'crops', 'mandi', 'harvest', 'kharif', 'rabi', 'zaid', 'paddy',
    'wheat', 'ragi', 'cotton', 'pulses', 'sugarcane', 'horticulture',
    'fertilizer', 'fertiliser', 'pesticide', 'seed', 'seeds', 'irrigation',
    'icar', 'kisan', 'monsoon', 'cultivation', 'yield', 'produce', 'apmc',
    'msp', 'pm-kisan', 'pmfby', 'drought', 'unseasonal rain'
];

const NOISE_EXCLUSIONS = [
    'bollywood', 'box office', 'celebrity', 'cricket', 'ipl', 'horoscope',
    'astrology', 'cinema', 'trailer', 'movie', 'actress', 'actor', 'entertainment',
    'gaming', 'football', 'edtech', 'defense missile', 'ukraine', 'israel', 'gaza',
    'crypto', 'bitcoin', 'firebase', 'smartphone', 'stock market', 'sensex', 'nifty'
];

function isGenuineIndianAgri(title, desc, sourceName) {
    const text = `${title} ${desc} ${sourceName}`.toLowerCase();
    
    // Check noise
    if (NOISE_EXCLUSIONS.some(k => text.includes(k))) return false;

    // Check India context
    const hasIndiaContext = INDIAN_CONTEXT_KEYWORDS.some(k => text.includes(k));
    if (!hasIndiaContext) return false;

    // Check Agriculture context
    const hasAgriContext = AGRI_CORE_KEYWORDS.some(k => text.includes(k));
    if (!hasAgriContext) return false;

    return true;
}

function matchCategory(category, title, desc, sourceName) {
    if (!isGenuineIndianAgri(title, desc, sourceName)) return false;

    const text = `${title} ${desc}`.toLowerCase();

    if (category === 'all') return true;

    if (category === 'crops') {
        const cropKeys = [
            'crop', 'crops', 'price', 'prices', 'mandi', 'rate', 'rates', 'msp',
            'procurement', 'paddy', 'wheat', 'ragi', 'cotton', 'pulses', 'onion',
            'tomato', 'potato', 'sugar', 'sugarcane', 'jaggery', 'mustard', 'maize',
            'oilseed', 'grain', 'grains', 'harvest', 'yield', 'arrival', 'export',
            'import', 'commodity', 'commodities', 'apmc', 'acreage', 'planting'
        ];
        return cropKeys.some(k => text.includes(k));
    }

    if (category === 'weather') {
        const weatherKeys = [
            'weather', 'monsoon', 'rain', 'rainfall', 'rains', 'drought', 'heatwave',
            'flood', 'floods', 'cyclone', 'imd', 'forecast', 'precipitation',
            'temperature', 'hailstorm', 'cloud', 'unseasonal', 'dry spell', 'moisture',
            'el nino', 'la nina', 'monsoon deficit'
        ];
        return weatherKeys.some(k => text.includes(k));
    }

    if (category === 'schemes') {
        const schemeKeys = [
            'scheme', 'schemes', 'subsidy', 'subsidies', 'pm-kisan', 'pmfby',
            'kcc', 'kisan credit', 'soil health', 'ministry of agriculture',
            'welfare', 'benefit', 'benefits', 'compensation', 'relief package',
            'policy', 'policies', 'government', 'govt', 'cabinet', 'pradhan mantri',
            'msp hike', 'procurement policy', 'chouhan', 'centre'
        ];
        return schemeKeys.some(k => text.includes(k));
    }

    if (category === 'technology') {
        const techKeys = [
            'tech', 'technology', 'agritech', 'drone', 'drones', 'precision',
            'smart farming', 'sensor', 'sensors', 'solar pump', 'irrigation system',
            'satellite', 'ai in agriculture', 'robot', 'automation', 'polyhouse',
            'hydroponics', 'icar', 'innovation', 'startup', 'biotech', 'mechanization',
            'agro-chemical', 'hybrid seed', 'digital agriculture'
        ];
        return techKeys.some(k => text.includes(k));
    }

    return false;
}

function fetchCategoryNews(query) {
    return new Promise((resolve) => {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${apiKey}`;
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

async function run() {
    const queries = {
        all: 'India AND (agriculture OR farming OR crops OR farmer OR mandi OR "Kharif")',
        crops: 'India AND (crop OR crops OR "mandi" OR "crop price" OR "MSP" OR paddy OR wheat OR cotton OR onion OR tomato OR harvest)',
        weather: 'India AND (monsoon OR rainfall OR drought OR "IMD" OR "weather alert" OR flood) AND (farmer OR farming OR agriculture OR crops)',
        schemes: 'India AND ("PM-KISAN" OR "PMFBY" OR "subsidy" OR "Kisan Credit Card" OR "agriculture scheme" OR "farmer welfare" OR "MSP") AND (government OR Ministry OR Cabinet)',
        technology: 'India AND ("agritech" OR "drone farming" OR "precision agriculture" OR "ICAR technology" OR "solar pump" OR "smart farming" OR "hybrid seed")'
    };

    for (const [cat, q] of Object.entries(queries)) {
        console.log(`\n======================================================`);
        console.log(`CATEGORY: [${cat.toUpperCase()}]`);
        console.log(`======================================================`);
        const raw = await fetchCategoryNews(q);
        console.log(`Raw NewsAPI results: ${raw.length}`);

        const filtered = raw.filter(a => matchCategory(cat, a.title || '', a.description || '', a.source?.name || ''));
        console.log(`Genuinely Relevant Articles: ${filtered.length}`);

        filtered.slice(0, 3).forEach((a, i) => {
            console.log(`\n  [#${i+1}] ${a.title}`);
            console.log(`       Source: ${a.source?.name} | Date: ${a.publishedAt}`);
            console.log(`       Image: ${a.urlToImage ? 'YES' : 'NO'}`);
            console.log(`       Link: ${a.url}`);
        });
    }
}

run();
