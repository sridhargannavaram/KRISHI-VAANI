require('dotenv').config();
const https = require('https');
const apiKey = process.env.NEWS_API_KEY;

function assignArticleCategory(title, desc) {
    const text = `${title} ${desc}`.toLowerCase();
    
    // Check technology
    if (/\b(agritech|drone|drones|precision|sensor|solar pump|automation|robot|ai in agriculture|hybrid seed|biotech|mechanization|smart farm)\b/i.test(text)) {
        return 'technology';
    }
    // Check weather
    if (/\b(weather|monsoon|rain|rainfall|rains|drought|heatwave|flood|floods|cyclone|imd|forecast|el nino|la nina|hailstorm|unseasonal)\b/i.test(text)) {
        return 'weather';
    }
    // Check schemes
    if (/\b(scheme|schemes|subsidy|subsidies|pm-kisan|pmfby|kcc|kisan credit|welfare|relief package|policy|policies|cabinet|pradhan mantri|shivraj|chouhan|saturation|farmer id)\b/i.test(text)) {
        return 'schemes';
    }
    // Default to crops & markets
    return 'crops';
}

console.log('Category tests:');
console.log('1. Onion price gap:', assignArticleCategory('Indian Agriculture Minister asks ICAR to tackle onion price gap', ''));
console.log('2. El Nino monsoon:', assignArticleCategory('A super El Nino could make Indias monsoon drier yet more dangerous', ''));
console.log('3. Saturation of farm schemes:', assignArticleCategory('Shivraj Chouhan asks states to ensure full saturation of farm schemes', ''));
console.log('4. Hybrid popcorn maize seeds:', assignArticleCategory('Gourmet Popcornica launches 2 non-GMO hybrid popcorn maize seeds', ''));
