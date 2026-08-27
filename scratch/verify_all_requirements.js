require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/news';

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        throw new Error(message);
    }
    console.log(`✅ PASS: ${message}`);
}

async function runComprehensiveVerification() {
    console.log('================================================================');
    console.log('🧪 KRISHI VAANI — AGRICULTURAL NEWS FRESHNESS & 5-DAY WINDOW TEST');
    console.log('================================================================');

    const now = new Date();
    console.log('Test Execution Time (Now):', now.toISOString());

    // 1. Test GET /api/news?category=all
    console.log('\n--- 1. Testing Default Agricultural News Feed (/api/news?category=all) ---');
    const res = await axios.get(`${BASE_URL}?category=all`);
    assert(res.status === 200, 'Server responded with 200 OK');
    assert(Array.isArray(res.data.articles), 'Response contains articles array');
    assert(res.data.articles.length > 0, `Received ${res.data.articles.length} agricultural articles`);

    const articles = res.data.articles;

    // 2. Test Sorting: strictly newest to oldest (publishedAt descending)
    console.log('\n--- 2. Verifying Strict Newest-to-Oldest Ordering ---');
    for (let i = 0; i < articles.length - 1; i++) {
        const timeCurrent = new Date(articles[i].publishedAt).getTime();
        const timeNext = new Date(articles[i + 1].publishedAt).getTime();
        assert(timeCurrent >= timeNext, `Article #${i + 1} (${articles[i].publishedAt}) is newer or equal to Article #${i + 2} (${articles[i + 1].publishedAt})`);
    }

    // 3. Test Rolling 5-Day Freshness Window
    console.log('\n--- 3. Verifying Rolling 5-Day Freshness Window (0 to 5.0 days) ---');
    let maxAgeDays = 0;
    let minAgeDays = Infinity;
    const dayBuckets = { 'Day 0 (Today)': 0, 'Day 1 (Yesterday)': 0, 'Day 2': 0, 'Day 3': 0, 'Day 4-5': 0 };

    articles.forEach((a, idx) => {
        const pubDate = new Date(a.publishedAt);
        const ageHours = (now - pubDate) / (1000 * 60 * 60);
        const ageDays = ageHours / 24;

        if (ageDays > maxAgeDays) maxAgeDays = ageDays;
        if (ageDays < minAgeDays) minAgeDays = ageDays;

        assert(ageDays <= 5.0, `Article #${idx + 1} age (${ageDays.toFixed(2)} days) is within 5.0-day limit`);
        assert(ageHours >= -1, `Article #${idx + 1} publication time is not in the future`);

        if (ageHours < 24) dayBuckets['Day 0 (Today)']++;
        else if (ageHours < 48) dayBuckets['Day 1 (Yesterday)']++;
        else if (ageHours < 72) dayBuckets['Day 2']++;
        else if (ageHours < 96) dayBuckets['Day 3']++;
        else dayBuckets['Day 4-5']++;
    });
    console.log(`Min age: ${minAgeDays.toFixed(2)} days, Max age: ${maxAgeDays.toFixed(2)} days`);
    console.log('Day Distribution:', dayBuckets);

    // 4. Test Deduplication
    console.log('\n--- 4. Verifying Deduplication (No duplicate URLs or Titles) ---');
    const seenUrls = new Set();
    const seenTitles = new Set();
    articles.forEach((a, idx) => {
        const cleanUrl = a.url.split('?')[0].toLowerCase().trim().replace(/\/+$/, '');
        const normTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 45);

        assert(!seenUrls.has(cleanUrl), `No duplicate URL found: ${cleanUrl}`);
        assert(!seenTitles.has(normTitle), `No duplicate title found: ${a.title.substring(0, 50)}`);

        seenUrls.add(cleanUrl);
        seenTitles.add(normTitle);
    });

    // 5. Test Article Image and URL integrity
    console.log('\n--- 5. Verifying Article URL & Image Fields ---');
    articles.forEach((a, idx) => {
        assert(typeof a.url === 'string' && a.url.startsWith('http'), `Article #${idx + 1} has valid URL: ${a.url}`);
        if (a.urlToImage) {
            assert(typeof a.urlToImage === 'string' && a.urlToImage.startsWith('http'), `Article #${idx + 1} has valid urlToImage URL: ${a.urlToImage.substring(0, 45)}...`);
        }
    });

    // 6. Test Specific Categories
    console.log('\n--- 6. Verifying Individual Categories (crops, weather, schemes, technology) ---');
    const categories = ['crops', 'weather', 'schemes', 'technology'];
    for (const cat of categories) {
        const catRes = await axios.get(`${BASE_URL}?category=${cat}`);
        assert(catRes.status === 200, `Category '${cat}' returned 200 OK`);
        console.log(`  Category [${cat.toUpperCase()}]: ${catRes.data.articles?.length || 0} articles returned`);
        if (catRes.data.articles?.length > 0) {
            catRes.data.articles.forEach(a => {
                assert(a.category === cat, `Article in ${cat} has assigned category '${a.category}'`);
            });
        }
    }

    // 7. Test Language behavior
    console.log('\n--- 7. Verifying Multilingual Handling (en, hi, te, kn, ta, ml) ---');
    const langs = ['en', 'hi', 'te', 'kn', 'ta', 'ml'];
    for (const lang of langs) {
        const langRes = await axios.get(`${BASE_URL}?category=all&lang=${lang}`);
        assert(langRes.status === 200, `Language '${lang}' responded with 200 OK`);
        assert(langRes.data.articles?.length > 0, `Language '${lang}' returned ${langRes.data.articles.length} genuine articles`);
        // Check that titles are authentic non-empty strings
        assert(langRes.data.articles[0].title.length > 5, `Language '${lang}' top article has valid authentic title: "${langRes.data.articles[0].title.substring(0, 50)}..."`);
    }

    // 8. Test Search Query Filtering
    console.log('\n--- 8. Verifying In-Memory Search Filtering ---');
    const searchRes = await axios.get(`${BASE_URL}?category=all&search=onion`);
    assert(searchRes.status === 200, 'Search query returned 200 OK');
    console.log(`  Search for "onion" returned ${searchRes.data.articles.length} articles`);
    searchRes.data.articles.forEach(a => {
        const text = `${a.title} ${a.description}`.toLowerCase();
        assert(text.includes('onion'), `Search result matches 'onion': ${a.title}`);
    });

    console.log('\n================================================================');
    console.log('🎉 ALL 8 TEST SUITES COMPLETED SUCCESSFULLY WITH 100% PASS RATE');
    console.log('================================================================\n');
}

runComprehensiveVerification().catch(e => {
    console.error('Test execution error:', e.message);
    process.exit(1);
});
