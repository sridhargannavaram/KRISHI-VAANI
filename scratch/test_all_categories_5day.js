require('dotenv').config();
const https = require('https');
const apiKey = process.env.NEWS_API_KEY;

const CATEGORY_QUERIES = {
    all: [
        '("Indian agriculture" OR "Indian farmer" OR "Indian farmers" OR "mandi prices" OR "PM-KISAN" OR "Kharif crop" OR "Rabi harvest" OR "ICAR")',
        '(agriculture OR farmer OR crops OR mandi OR "MSP" OR "monsoon rainfall") AND (India OR Kisan OR "Cabinet" OR "Ministry of Agriculture")'
    ],
    crops: [
        'India AND (crop OR crops OR "mandi price" OR "mandi prices" OR "MSP" OR "paddy procurement" OR "wheat crop" OR "cotton harvest" OR "onion price" OR "tomato prices" OR "sugarcane FRP" OR "pulses production")',
        '("crop price" OR "mandi rate" OR "Kharif sowing" OR "Rabi sowing" OR "crop yield") AND (India OR Kisan)'
    ],
    weather: [
        'India AND (monsoon OR "IMD rainfall" OR drought OR "weather alert" OR "unseasonal rain" OR "flood damages crops") AND (farmer OR farming OR agriculture OR crops OR harvest OR sowing)',
        '("monsoon forecast" OR "rainfall deficit" OR "agricultural drought" OR "hailstorm damage") AND (India OR IMD OR farmers)'
    ],
    schemes: [
        'India AND ("PM-KISAN" OR "PMFBY" OR "fertilizer subsidy" OR "Kisan Credit Card" OR "crop insurance" OR "farmer welfare scheme" OR "MSP hike") AND (government OR Ministry OR Cabinet OR Centre OR Chouhan)',
        '("agriculture scheme" OR "farmer subsidy" OR "PM Kisan Samman Nidhi" OR "agri infrastructure fund") AND India'
    ],
    technology: [
        'India AND ("agritech" OR "drone farming" OR "kisan drone" OR "precision agriculture" OR "ICAR technology" OR "solar pump" OR "smart farming" OR "hybrid seeds" OR "farm mechanization")',
        '("agritech startup" OR "digital agriculture" OR "precision farming" OR "micro-irrigation") AND (India OR farmers)'
    ]
};

// Words that must be matched on word boundaries
const AGRI_KEYWORDS = [
    'agriculture', 'agricultural', 'farming', 'farmer', 'farmers', 'crop', 'crops',
    'mandi', 'mandis', 'kharif', 'rabi', 'zaid', 'paddy', 'wheat', 'ragi', 'cotton',
    'pulses', 'sugarcane', 'horticulture', 'fertilizer', 'fertiliser', 'pesticide',
    'seed', 'seeds', 'irrigation', 'icar', 'kisan', 'monsoon', 'harvest', 'harvesting',
    'cultivation', 'yield', 'yields', 'apmc', 'msp', 'pm-kisan', 'pmfby', 'drought',
    'unseasonal rain', 'acreage', 'agritech', 'farm mechanization', 'soil health',
    'crop insurance', 'grain', 'grains', 'oilseed', 'oilseeds', 'onion', 'tomato', 'potato',
    'agro-chemical', 'fpo', 'fpos', 'krishi'
];

const NOISE_WORDS = [
    'bollywood', 'box office', 'celebrity', 'cricket', 'ipl', 'horoscope', 'astrology',
    'cinema', 'trailer', 'movie', 'actress', 'actor', 'entertainment', 'gaming',
    'football', 'edtech', 'defense missile', 'ukraine', 'israel', 'gaza', 'crypto',
    'bitcoin', 'smartphone', 'sensex', 'nifty', 'bse', 'nse', 'stock market', 'shoes',
    'boots', 'fashion', 'wedding', 'sea lanes', 'maritime routes', 'navy', 'h1n1',
    'icu hospital', 'hospitalized', 'murder', 'arrested', 'bjp vs congress', 'parliament brawl',
    'missile test', 'fighter jet', 'supercar', 'formula 1'
];

function containsWord(text, word) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    return regex.test(text);
}

function isGenuineAgriArticle(title, desc, sourceName) {
    const fullText = `${title} ${desc}`.toLowerCase();

    // Check noise
    for (const nw of NOISE_WORDS) {
        if (containsWord(fullText, nw)) return false;
    }

    // Must contain at least one specific agri keyword
    let agriMatchCount = 0;
    for (const ak of AGRI_KEYWORDS) {
        if (containsWord(fullText, ak)) {
            agriMatchCount++;
        }
    }

    const titleHasAgri = AGRI_KEYWORDS.some(ak => containsWord(title.toLowerCase(), ak));
    return titleHasAgri || agriMatchCount >= 2;
}

function getTitleTokens(title) {
    return new Set(
        title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'were', 'been', 'their', 'india', 'indian'].includes(w))
    );
}

function isDuplicate(title, url, seenTitles, seenUrls, seenTokenSets) {
    const cleanUrl = url.split('?')[0].toLowerCase().trim().replace(/\/+$/, '');
    if (seenUrls.has(cleanUrl)) return true;

    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    if (seenTitles.has(normTitle)) return true;

    const tokens = getTitleTokens(title);
    if (tokens.size >= 4) {
        for (const prevTokens of seenTokenSets) {
            let intersection = 0;
            for (const t of tokens) {
                if (prevTokens.has(t)) intersection++;
            }
            const union = new Set([...tokens, ...prevTokens]).size;
            if (union > 0 && (intersection / union) >= 0.70) {
                return true;
            }
        }
    }

    seenUrls.add(cleanUrl);
    seenTitles.add(normTitle);
    if (tokens.size >= 4) seenTokenSets.push(tokens);
    return false;
}

function fetchSingleQuery(query, lang = 'en', pageSize = 100) {
    return new Promise((resolve) => {
        const fromDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const apiLang = lang === 'hi' ? 'hi' : 'en';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${apiLang}&from=${fromDate}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;

        https.get(url, { headers: { 'User-Agent': 'KrishiVaaniApp/1.0' }, timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.articles || []);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', () => resolve([]));
    });
}

async function testAllCategories() {
    const categories = ['all', 'crops', 'weather', 'schemes', 'technology'];
    const now = new Date();

    for (const cat of categories) {
        console.log(`\n================ Testing Category: [${cat.toUpperCase()}] ================`);
        const queryList = CATEGORY_QUERIES[cat] || CATEGORY_QUERIES.all;

        const rawResults = await Promise.all(
            queryList.map(q => fetchSingleQuery(q, 'en', 100))
        );
        const combinedRaw = rawResults.flat();
        console.log(`Total raw articles fetched across queries: ${combinedRaw.length}`);

        const seenTitles = new Set();
        const seenUrls = new Set();
        const seenTokenSets = [];
        const validArticles = [];
        const dayBreakdown = { 'Day 0': 0, 'Day 1': 0, 'Day 2': 0, 'Day 3': 0, 'Day 4-5': 0 };

        for (const a of combinedRaw) {
            let title = (a.title || '').trim();
            let desc = (a.description || '').trim();
            const link = a.url || '';
            const sourceName = a.source?.name || 'Agri News';

            if (!title || !link || title.includes('[Removed]')) continue;

            if (sourceName && title.endsWith(' - ' + sourceName)) {
                title = title.substring(0, title.length - (sourceName.length + 3)).trim();
            }

            if (!isGenuineAgriArticle(title, desc, sourceName)) continue;
            if (isDuplicate(title, link, seenTitles, seenUrls, seenTokenSets)) continue;

            const pubDate = new Date(a.publishedAt);
            if (isNaN(pubDate.getTime())) continue;

            const ageHours = (now - pubDate) / (1000 * 60 * 60);
            const ageDays = ageHours / 24;

            // Rolling 5-day freshness window check
            if (ageDays > 5.0 || ageHours < 0) continue;

            const item = {
                title,
                description: desc,
                url: link,
                urlToImage: (a.urlToImage && typeof a.urlToImage === 'string' && a.urlToImage.startsWith('http')) ? a.urlToImage : '',
                category: cat === 'all' ? 'crops' : cat,
                source: { name: sourceName },
                publishedAt: pubDate.toISOString(),
                ageDays,
                ageHours
            };

            validArticles.push(item);

            if (ageHours < 24) dayBreakdown['Day 0']++;
            else if (ageHours < 48) dayBreakdown['Day 1']++;
            else if (ageHours < 72) dayBreakdown['Day 2']++;
            else if (ageHours < 96) dayBreakdown['Day 3']++;
            else dayBreakdown['Day 4-5']++;
        }

        // Sort strictly newest first
        validArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        console.log(`Clean 5-Day Articles: ${validArticles.length}`);
        console.log('Day Breakdown:', dayBreakdown);
        console.log('Top 3 Articles:');
        validArticles.slice(0, 3).forEach((a, idx) => {
            console.log(`  [${idx+1}] [${a.publishedAt}] (${a.ageDays.toFixed(1)}d ago) ${a.title.substring(0, 75)}... [${a.source.name}]`);
        });
        if (validArticles.length > 3) {
            const oldest = validArticles[validArticles.length - 1];
            console.log(`  ... [Oldest: #${validArticles.length}] [${oldest.publishedAt}] (${oldest.ageDays.toFixed(1)}d ago) ${oldest.title.substring(0, 75)}...`);
        }
    }
}

testAllCategories();
