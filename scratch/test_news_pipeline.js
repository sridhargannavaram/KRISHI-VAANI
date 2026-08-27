require('dotenv').config();
const https = require('https');

const apiKey = process.env.NEWS_API_KEY;

// NewsAPI fetcher
function fetchNews(query, lang = 'en', pageSize = 100) {
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

// Improved Agricultural Relevance & Word-Boundary Matching
const AGRI_KEYWORDS = [
    'agriculture', 'agricultural', 'farming', 'farmer', 'farmers', 'crop', 'crops',
    'mandi', 'mandis', 'kharif', 'rabi', 'zaid', 'paddy', 'wheat', 'ragi', 'cotton',
    'pulses', 'sugarcane', 'horticulture', 'fertilizer', 'fertiliser', 'pesticide',
    'seed', 'seeds', 'irrigation', 'icar', 'kisan', 'monsoon', 'harvest', 'harvesting',
    'cultivation', 'yield', 'yields', 'apmc', 'msp', 'pm-kisan', 'pmfby', 'drought',
    'unseasonal rain', 'acreage', 'agritech', 'farm mechanization', 'soil health',
    'crop insurance', 'grain', 'grains', 'oilseed', 'oilseeds', 'onion', 'tomato', 'potato'
];

const NOISE_WORDS = [
    'bollywood', 'box office', 'celebrity', 'cricket', 'ipl', 'horoscope', 'astrology',
    'cinema', 'trailer', 'movie', 'actress', 'actor', 'entertainment', 'gaming',
    'football', 'edtech', 'defense missile', 'ukraine', 'israel', 'gaza', 'crypto',
    'bitcoin', 'smartphone', 'sensex', 'nifty', 'bse', 'nse', 'stock market', 'shoes',
    'boots', 'fashion', 'wedding', 'sea lanes', 'maritime routes', 'navy', 'h1n1',
    'icu hospital', 'hospitalized', 'murder', 'arrested', 'bjp vs congress', 'parliament brawl'
];

function containsWord(text, word) {
    const regex = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
}

function isGenuineAgriArticle(title, desc, sourceName) {
    const fullText = `${title} ${desc}`.toLowerCase();

    // Check noise
    for (const nw of NOISE_WORDS) {
        if (containsWord(fullText, nw)) return false;
    }

    // Must contain at least one specific agri keyword (whole word)
    let agriMatchCount = 0;
    for (const ak of AGRI_KEYWORDS) {
        if (containsWord(fullText, ak)) {
            agriMatchCount++;
        }
    }

    // Title should either mention an agri keyword or fullText has at least 2 agri mentions
    const titleHasAgri = AGRI_KEYWORDS.some(ak => containsWord(title.toLowerCase(), ak));
    return titleHasAgri || agriMatchCount >= 2;
}

// Token-based Jaccard similarity for near-duplicate title detection
function getTitleTokens(title) {
    return new Set(
        title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'were', 'been', 'their', 'india', 'indian'].includes(w))
    );
}

function isDuplicate(title, url, seenTitles, seenUrls, seenTokenSets) {
    // 1. Normalized clean URL check
    const cleanUrl = url.split('?')[0].toLowerCase().trim();
    if (seenUrls.has(cleanUrl)) return true;

    // 2. Normalized alphanumeric title prefix check
    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    if (seenTitles.has(normTitle)) return true;

    // 3. Jaccard word similarity check (>= 75% overlap on key words)
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

async function testPipeline() {
    const query = 'India AND (agriculture OR farming OR farmer OR crops OR "crop price" OR mandi OR "MSP" OR harvest OR "PM-KISAN" OR "ICAR" OR monsoon OR rainfall OR agritech)';
    console.log('Fetching pageSize=100 with query:', query);
    const rawArticles = await fetchNews(query, 'en', 100);
    console.log(`Raw articles received: ${rawArticles.length}`);

    const now = new Date();
    const seenTitles = new Set();
    const seenUrls = new Set();
    const seenTokenSets = [];
    const validArticles = [];

    // Day buckets to track 5-day rolling freshness
    const dayBuckets = {
        'Day 0 (Today)': [],
        'Day 1 (Yesterday)': [],
        'Day 2 (2 days ago)': [],
        'Day 3 (3 days ago)': [],
        'Day 4-5 (4-5 days ago)': [],
        'Older (>5 days)': []
    };

    for (const a of rawArticles) {
        let title = (a.title || '').trim();
        let desc = (a.description || '').trim();
        const link = a.url || '';
        const sourceName = a.source?.name || 'Agri News';

        if (!title || !link || title.includes('[Removed]')) continue;

        // Clean source suffix if present
        if (sourceName && title.endsWith(' - ' + sourceName)) {
            title = title.substring(0, title.length - (sourceName.length + 3)).trim();
        }

        if (!isGenuineAgriArticle(title, desc, sourceName)) continue;

        if (isDuplicate(title, link, seenTitles, seenUrls, seenTokenSets)) continue;

        const pubDate = new Date(a.publishedAt);
        const ageMs = now - pubDate;
        const ageHours = ageMs / (1000 * 60 * 60);
        const ageDays = ageHours / 24;

        if (ageDays > 5.0) {
            dayBuckets['Older (>5 days)'].push({ title, ageDays });
            continue;
        }

        const item = {
            title,
            description: desc,
            url: link,
            urlToImage: a.urlToImage || '',
            source: { name: sourceName },
            publishedAt: a.publishedAt,
            ageDays,
            ageHours
        };

        validArticles.push(item);

        if (ageHours < 24) {
            dayBuckets['Day 0 (Today)'].push(item);
        } else if (ageHours < 48) {
            dayBuckets['Day 1 (Yesterday)'].push(item);
        } else if (ageHours < 72) {
            dayBuckets['Day 2 (2 days ago)'].push(item);
        } else if (ageHours < 96) {
            dayBuckets['Day 3 (3 days ago)'].push(item);
        } else {
            dayBuckets['Day 4-5 (4-5 days ago)'].push(item);
        }
    }

    // Sort strictly newest first
    validArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    console.log(`\n================ VALID 5-DAY AGRICULTURAL ARTICLES (${validArticles.length}) ================`);
    console.log('--- Freshness Distribution by Day ---');
    for (const [bucket, items] of Object.entries(dayBuckets)) {
        console.log(`  ${bucket}: ${items.length} articles`);
    }

    console.log('\n--- Articles in Sorted Order (Newest to Oldest) ---');
    validArticles.forEach((a, i) => {
        console.log(`[${i+1}] [${a.publishedAt}] (${a.ageHours.toFixed(1)}h / ${a.ageDays.toFixed(1)}d ago) [${a.source.name}]`);
        console.log(`    Title: ${a.title}`);
        console.log(`    URL: ${a.url}`);
        console.log(`    Image: ${a.urlToImage ? a.urlToImage.substring(0, 50) + '...' : 'NONE'}\n`);
    });
}

testPipeline();
