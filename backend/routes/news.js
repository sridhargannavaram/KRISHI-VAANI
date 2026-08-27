const express = require('express');
const router = express.Router();
const https = require('https');

// In-memory cache for news: { [cacheKey]: { data: [...], timestamp: number } }
const newsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for rolling freshness

// Targeted NewsAPI queries per category
// General news: 5-day rolling window
// Govt schemes: 30-day rolling window
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
        '("PM Kisan" OR "PM-KISAN" OR "PMFBY" OR "crop insurance" OR "fertilizer subsidy" OR "Kisan Credit Card" OR "MSP" OR "farmer welfare" OR "agri scheme" OR "farmer subsidy" OR "agri infrastructure fund") AND (India OR Cabinet OR Ministry OR Government OR Centre OR Chouhan)',
        'India AND ("agriculture scheme" OR "farmer subsidy" OR "PM Kisan Samman Nidhi" OR "agri infrastructure fund" OR "procurement policy" OR "Kisan welfare" OR "crop loss compensation" OR "FRP sugarcane" OR "MSP hike")',
        '("Ministry of Agriculture" OR "Kisan Samman" OR "crop loan" OR "soil health card" OR "kisan credit") AND India'
    ],
    technology: [
        '("agritech" OR "drone farming" OR "kisan drone" OR "precision agriculture" OR "ICAR" OR "solar pump" OR "smart farming" OR "hybrid seed" OR "hybrid seeds" OR "farm mechanization" OR "artificial intelligence") AND (India OR farmers OR agriculture OR crops)',
        '("agritech startup" OR "digital agriculture" OR "precision farming" OR "micro-irrigation" OR "biotech seeds") AND (India OR Kisan)'
    ]
};

// Indian context indicators
const INDIAN_CONTEXT_WORDS = [
    'india', 'indian', 'icar', 'kisan', 'mandi', 'kharif', 'rabi', 'zaid', 'imd',
    'karnataka', 'maharashtra', 'punjab', 'haryana', 'uttar pradesh', 'bihar',
    'gujarat', 'rajasthan', 'madhya pradesh', 'tamil nadu', 'andhra', 'telangana',
    'kerala', 'odisha', 'west bengal', 'assam', 'delhi', 'pm-kisan', 'pmfby',
    'apmc', 'chouhan', 'krishi', 'tnau', 'fssai', 'nabard', 'agricoop', 'fmcg'
];

// Core agricultural keywords for validation
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

// Scheme and Policy Keywords
const SCHEME_CORE_WORDS = [
    'scheme', 'schemes', 'subsidy', 'subsidies', 'pm-kisan', 'pmfby', 'kcc',
    'kisan credit', 'welfare', 'relief package', 'policy', 'policies',
    'cabinet', 'pradhan mantri', 'shivraj', 'chouhan', 'saturation', 'farmer id',
    'msp', 'minimum support price', 'procurement', 'fertilizer subsidy', 'crop insurance',
    'agri infrastructure fund', 'agriculture ministry', 'kisan samman',
    'loan waiver', 'soil health', 'compensation', 'krishi sinchayee',
    'paramparagat krishi', 'agri loan', 'subvention'
];

// Noise exclusion list (strictly exclude sports, entertainment, overseas local politics, crypto, crime)
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
    'formula 1', 'grand prix', 'olympics', 'medal', 'niva bupa', 'star health'
];

// Word boundary matcher helper
function containsWord(text, word) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    return regex.test(text);
}

// Decode HTML entities
function decodeHtml(html) {
    if (!html) return '';
    return html
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]+>/g, '')
        .trim();
}

// Check if an article is genuinely about Indian agriculture
function isGenuineIndianAgri(title, desc, sourceName) {
    const text = `${title} ${desc} ${sourceName}`.toLowerCase();

    // 1. Noise check
    for (const nw of NOISE_WORDS) {
        if (containsWord(text, nw)) return false;
    }

    // 2. India context check
    const hasIndiaContext = INDIAN_CONTEXT_WORDS.some(w => containsWord(text, w));
    if (!hasIndiaContext) return false;

    // 3. Agriculture context check
    let agriMatches = 0;
    for (const aw of AGRI_CORE_WORDS) {
        if (containsWord(text, aw)) agriMatches++;
    }

    const titleHasAgri = AGRI_CORE_WORDS.some(aw => containsWord(title.toLowerCase(), aw));
    return titleHasAgri || agriMatches >= 2;
}

// Categorize articles dynamically
function assignCategory(title, desc) {
    const text = `${title} ${desc}`.toLowerCase();
    
    // Check technology
    if (/\b(agritech|drone|drones|precision|sensor|solar pump|automation|robot|ai|artificial intelligence|hybrid|biotech|mechanization|smart farm|digital agriculture)\b/i.test(text)) {
        return 'technology';
    }
    // Check weather
    if (/\b(weather|monsoon|rain|rainfall|rains|drought|heatwave|flood|floods|cyclone|imd|forecast|el nino|la nina|hailstorm|unseasonal)\b/i.test(text)) {
        return 'weather';
    }
    // Check schemes
    if (/\b(scheme|schemes|subsidy|subsidies|pm-kisan|pmfby|kcc|kisan credit|welfare|relief package|policy|policies|cabinet|pradhan mantri|shivraj|chouhan|saturation|farmer id|subvention|loan waiver|msp|procurement)\b/i.test(text)) {
        return 'schemes';
    }
    return 'crops';
}

// Tokenize title for similarity checking
function getTitleTokens(title) {
    return new Set(
        title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'were', 'been', 'their', 'india', 'indian'].includes(w))
    );
}

// Multi-factor deduplication
function isDuplicate(title, url, seenTitles, seenUrls, seenTokenSets) {
    // 1. URL exact & normalized match
    const cleanUrl = url.split('?')[0].toLowerCase().trim().replace(/\/+$/, '');
    if (seenUrls.has(cleanUrl)) return true;

    // 2. Normalized title match
    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    if (seenTitles.has(normTitle)) return true;

    // 3. Jaccard word-overlap similarity (>= 70% overlap on key terms)
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

// Fetch single query from NewsAPI with configurable day window (5 days for general news, 30 days for schemes)
function fetchSingleQuery(query, lang = 'en', fromDays = 5, pageSize = 100) {
    return new Promise((resolve) => {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) return resolve([]);

        const fromDate = new Date(Date.now() - fromDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const apiLang = lang === 'hi' ? 'hi' : 'en';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${apiLang}&from=${fromDate}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;

        const req = https.get(url, {
            headers: { 'User-Agent': 'KrishiVaaniApp/1.0' },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.status === 'ok' && Array.isArray(parsed.articles)) {
                        resolve(parsed.articles);
                    } else {
                        resolve([]);
                    }
                } catch (e) {
                    resolve([]);
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve([]);
        });

        req.on('error', () => resolve([]));
    });
}

// Fetch articles for a category using parallel targeted queries
// Uses 30 days for 'schemes', 5 days for 'crops', 'weather', 'technology', and 'all'
async function fetchCategoryArticles(category, lang = 'en') {
    const queries = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.all;
    const fromDays = (category === 'schemes') ? 30 : 5;
    
    // Fetch NewsAPI in parallel
    const rawArrays = await Promise.all(
        queries.map(q => fetchSingleQuery(q, lang, fromDays, 100))
    );

    let combined = rawArrays.flat();

    // If Hindi was requested but returned low results, supplement with English
    if (lang === 'hi' && combined.length < 5) {
        const enArrays = await Promise.all(
            queries.map(q => fetchSingleQuery(q, 'en', fromDays, 100))
        );
        combined = [...combined, ...enArrays.flat()];
    }

    return combined;
}

// Process NewsAPI articles into clean, strictly filtered, sorted, deduplicated items
// maxAgeDays = 30.0 for schemes, 5.0 for other categories
function processArticles(rawArticles, reqCategory, searchQuery = '') {
    const items = [];
    const seenTitles = new Set();
    const seenUrls = new Set();
    const seenTokenSets = [];
    const now = new Date();
    const maxAgeDays = (reqCategory === 'schemes') ? 30.0 : 5.0;

    for (const a of rawArticles) {
        let title = decodeHtml(a.title || '');
        let desc = decodeHtml(a.description || '');
        const link = a.url || '';
        const sourceName = a.source?.name || 'Agri News';
        let urlToImage = a.urlToImage || '';

        // Strip removed or placeholder articles
        if (!title || !link || title.includes('[Removed]')) continue;

        // Strip source suffix if duplicated in title
        if (sourceName && title.endsWith(' - ' + sourceName)) {
            title = title.substring(0, title.length - (sourceName.length + 3)).trim();
        }

        // Strict genuine Indian agriculture check
        if (!isGenuineIndianAgri(title, desc, sourceName)) {
            continue;
        }

        // Deduplication (URL, normalized title, syndicated word overlap)
        if (isDuplicate(title, link, seenTitles, seenUrls, seenTokenSets)) {
            continue;
        }

        // Validate and calculate exact age
        const pubDate = new Date(a.publishedAt);
        if (isNaN(pubDate.getTime())) continue;

        const ageMs = now - pubDate;
        const ageHours = ageMs / (1000 * 60 * 60);
        const ageDays = ageHours / 24;

        // Strict Freshness Window: 30 days for schemes, 5 days for general news
        if (ageDays > maxAgeDays || ageHours < -1) {
            continue;
        }

        const assignedCat = assignCategory(title, desc);

        // Category filter if specific category requested
        if (reqCategory !== 'all' && assignedCat !== reqCategory) {
            continue;
        }

        // Search query filter if provided
        if (searchQuery) {
            const matchText = `${title} ${desc} ${sourceName}`.toLowerCase();
            if (!matchText.includes(searchQuery)) {
                continue;
            }
        }

        items.push({
            title,
            description: desc || 'Read the full agricultural report for detailed farmer advisory.',
            url: link,
            urlToImage: (urlToImage && typeof urlToImage === 'string' && urlToImage.startsWith('http')) ? urlToImage : '',
            category: assignedCat,
            source: { name: sourceName },
            publishedAt: pubDate.toISOString(),
            ageDays,
            ageHours
        });
    }

    // Sort strictly newest to oldest (publishedAt descending)
    // Guarantees: Latest updates at top -> older days down naturally -> >30 days excluded
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return items;
}

// Filter cached articles dynamically against the rolling window
function filterActiveRollingWindow(articles, maxAgeDays = 5.0) {
    const now = new Date();
    return articles
        .map(a => {
            const pubDate = new Date(a.publishedAt);
            const ageHours = (now - pubDate) / (1000 * 60 * 60);
            const ageDays = ageHours / 24;
            return { ...a, ageHours, ageDays };
        })
        .filter(a => a.ageDays <= maxAgeDays && a.ageHours >= -1)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// GET /api/news
router.get('/', async (req, res) => {
    try {
        const category = (req.query.category || 'all').toLowerCase();
        const searchQuery = (req.query.search || req.query.q || '').trim().toLowerCase();
        const lang = (req.query.lang || 'en').toLowerCase();
        const maxAgeDays = (category === 'schemes') ? 30.0 : 5.0;

        const cacheKey = `${category}__${searchQuery}__${lang}`;
        const cached = newsCache.get(cacheKey);

        // Check if cache is still valid and has fresh items within active rolling window
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            const rollingArticles = filterActiveRollingWindow(cached.data, maxAgeDays);
            if (rollingArticles.length > 0) {
                return res.json({ articles: rollingArticles, source: 'cache' });
            }
        }

        if (!process.env.NEWS_API_KEY) {
            if (cached && cached.data.length > 0) {
                const rollingArticles = filterActiveRollingWindow(cached.data, maxAgeDays);
                return res.json({ articles: rollingArticles, source: 'cache' });
            }
            return res.status(503).json({ error: 'News service is temporarily unconfigured.', articles: [] });
        }

        const rawArticles = await fetchCategoryArticles(category, lang);
        const articles = processArticles(rawArticles, category, searchQuery);

        // Cache the processed result if not empty
        if (articles.length > 0) {
            newsCache.set(cacheKey, {
                data: articles,
                timestamp: Date.now()
            });
        } else if (cached && cached.data.length > 0) {
            const rollingArticles = filterActiveRollingWindow(cached.data, maxAgeDays);
            return res.json({ articles: rollingArticles, source: 'stale_cache' });
        }

        res.json({
            articles,
            source: 'newsapi.org'
        });
    } catch (error) {
        console.error('Agri-News Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch agricultural news', articles: [] });
    }
});

module.exports = router;
