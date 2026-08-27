require('dotenv').config();
const https = require('https');
const apiKey = process.env.NEWS_API_KEY;

const NOISE_WORDS = [
    'bollywood', 'box office', 'celebrity', 'cricket', 'cricketer', 'bcci', 'ipl',
    'century', 'batsman', 'bowler', 'wicket', 'horoscope', 'astrology',
    'cinema', 'trailer', 'movie', 'actress', 'actor', 'entertainment', 'gaming',
    'football', 'edtech', 'defense missile', 'ukraine', 'israel', 'gaza', 'crypto',
    'bitcoin', 'smartphone', 'shoes', 'boots', 'fashion', 'wedding', 'sea lanes',
    'maritime routes', 'navy', 'h1n1', 'icu hospital', 'hospitalized', 'murder',
    'arrested', 'bjp vs congress', 'parliament brawl', 'ontario', 'scotland', 'scottish',
    'holyrood', 'snp', 'us election', 'donald trump', 'kamala harris', 'supercar',
    'missile', 'wisconsin', 'ireland', 'archaeologists', 'archaeology', 'ancient bones',
    'fossil', 'prehistoric', 'tattoo', 'hollywood', 'netflix', 'dating', 'zodiac',
    'formula 1', 'grand prix', 'olympics', 'medal'
];

const INDIAN_CONTEXT_WORDS = [
    'india', 'indian', 'icar', 'kisan', 'mandi', 'kharif', 'rabi', 'zaid', 'imd',
    'karnataka', 'maharashtra', 'punjab', 'haryana', 'uttar pradesh', 'bihar',
    'gujarat', 'rajasthan', 'madhya pradesh', 'tamil nadu', 'andhra', 'telangana',
    'kerala', 'odisha', 'west bengal', 'assam', 'delhi', 'pm-kisan', 'pmfby',
    'apmc', 'chouhan', 'krishi', 'tnau', 'fssai', 'nabard', 'agricoop', 'fmcg'
];

const AGRI_CORE_WORDS = [
    'agriculture', 'agricultural', 'farming', 'farmer', 'farmers', 'crop', 'crops',
    'mandi', 'mandis', 'kharif', 'rabi', 'zaid', 'paddy', 'wheat', 'ragi', 'cotton',
    'pulses', 'sugarcane', 'horticulture', 'fertilizer', 'fertiliser', 'pesticide',
    'seed', 'seeds', 'irrigation', 'icar', 'kisan', 'monsoon', 'harvest', 'harvesting',
    'cultivation', 'yield', 'yields', 'apmc', 'msp', 'pm-kisan', 'pmfby', 'drought',
    'unseasonal rain', 'acreage', 'agritech', 'farm mechanization', 'soil health',
    'crop insurance', 'grain', 'grains', 'oilseed', 'oilseeds', 'onion', 'tomato', 'potato',
    'fpo', 'fpos', 'krishi', 'sowing', 'foodgrain', 'foodgrains'
];

function containsWord(text, word) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    return regex.test(text);
}

function isGenuineIndianAgri(title, desc, sourceName) {
    const text = `${title} ${desc} ${sourceName}`.toLowerCase();

    // Check noise exclusions
    for (const nw of NOISE_WORDS) {
        if (containsWord(text, nw)) return false;
    }

    // Must have Indian context
    const hasIndiaContext = INDIAN_CONTEXT_WORDS.some(w => containsWord(text, w));
    if (!hasIndiaContext) return false;

    // Must have Agriculture context
    let agriMatches = 0;
    for (const aw of AGRI_CORE_WORDS) {
        if (containsWord(text, aw)) agriMatches++;
    }

    const titleHasAgri = AGRI_CORE_WORDS.some(aw => containsWord(title.toLowerCase(), aw));
    return titleHasAgri || agriMatches >= 2;
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

async function run() {
    const queries = [
        '("Indian agriculture" OR "Indian farmer" OR "Indian farmers" OR "mandi prices" OR "PM-KISAN" OR "Kharif crop" OR "Rabi harvest" OR "ICAR")',
        '(agriculture OR farmer OR crops OR mandi OR "MSP" OR "monsoon rainfall") AND (India OR Kisan OR "Cabinet" OR "Ministry of Agriculture")'
    ];

    const rawArrays = await Promise.all(queries.map(q => fetchSingleQuery(q, 'en', 100)));
    const allRaw = rawArrays.flat();

    const seenTitles = new Set();
    const seenUrls = new Set();
    const seenTokenSets = [];
    const valid = [];
    const now = new Date();

    const dayBreakdown = { 'Day 0 (Today)': [], 'Day 1 (Yesterday)': [], 'Day 2 (2d ago)': [], 'Day 3 (3d ago)': [], 'Day 4-5 (4-5d ago)': [] };

    for (const a of allRaw) {
        let title = (a.title || '').trim();
        let desc = (a.description || '').trim();
        const link = a.url || '';
        const sourceName = a.source?.name || 'Agri News';

        if (!title || !link || title.includes('[Removed]')) continue;

        if (sourceName && title.endsWith(' - ' + sourceName)) {
            title = title.substring(0, title.length - (sourceName.length + 3)).trim();
        }

        if (!isGenuineIndianAgri(title, desc, sourceName)) continue;
        if (isDuplicate(title, link, seenTitles, seenUrls, seenTokenSets)) continue;

        const pubDate = new Date(a.publishedAt);
        if (isNaN(pubDate.getTime())) continue;

        const ageHours = (now - pubDate) / (1000 * 60 * 60);
        const ageDays = ageHours / 24;

        if (ageDays > 5.0 || ageHours < 0) continue;

        const item = {
            title,
            description: desc,
            url: link,
            urlToImage: (a.urlToImage && typeof a.urlToImage === 'string' && a.urlToImage.startsWith('http')) ? a.urlToImage : '',
            category: 'crops',
            source: { name: sourceName },
            publishedAt: pubDate.toISOString(),
            ageDays,
            ageHours
        };

        valid.push(item);

        if (ageHours < 24) dayBreakdown['Day 0 (Today)'].push(item);
        else if (ageHours < 48) dayBreakdown['Day 1 (Yesterday)'].push(item);
        else if (ageHours < 72) dayBreakdown['Day 2 (2d ago)'].push(item);
        else if (ageHours < 96) dayBreakdown['Day 3 (3d ago)'].push(item);
        else dayBreakdown['Day 4-5 (4-5d ago)'].push(item);
    }

    // Sort strictly newest to oldest
    valid.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    console.log(`Total Genuine Indian Agri Articles: ${valid.length}`);
    for (const [day, list] of Object.entries(dayBreakdown)) {
        console.log(`  ${day}: ${list.length} articles`);
    }

    console.log('\nAll Articles in Newest-to-Oldest Order:');
    valid.forEach((a, i) => {
        console.log(`[${i+1}] [${a.publishedAt}] (${a.ageDays.toFixed(1)}d ago) | ${a.source.name} | ${a.title}`);
    });
}

run();
