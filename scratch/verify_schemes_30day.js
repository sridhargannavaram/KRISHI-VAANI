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

async function runSchemesVerification() {
    console.log('================================================================');
    console.log('🧪 KRISHI VAANI — GOVERNMENT SCHEMES 30-DAY WINDOW VERIFICATION');
    console.log('================================================================');

    const now = new Date();
    console.log('Execution Timestamp:', now.toISOString());

    // 1. Fetch Government Schemes
    console.log('\n--- 1. Fetching Government Schemes (/api/news?category=schemes) ---');
    const res = await axios.get(`${BASE_URL}?category=schemes`);
    assert(res.status === 200, 'Endpoint returned HTTP 200');
    assert(Array.isArray(res.data.articles), 'Response has articles array');
    assert(res.data.articles.length > 0, `Returned ${res.data.articles.length} government schemes articles`);

    const schemes = res.data.articles;

    // 2. Strict Newest-to-Oldest Ordering
    console.log('\n--- 2. Verifying Strict Chronological Sorting (Newest to Oldest) ---');
    for (let i = 0; i < schemes.length - 1; i++) {
        const timeCurrent = new Date(schemes[i].publishedAt).getTime();
        const timeNext = new Date(schemes[i + 1].publishedAt).getTime();
        assert(timeCurrent >= timeNext, `Scheme #${i + 1} (${schemes[i].publishedAt}) is newer or equal to Scheme #${i + 2} (${schemes[i + 1].publishedAt})`);
    }

    // 3. 30-Day Freshness Window & Day Distribution
    console.log('\n--- 3. Verifying 30-Day Freshness Window (0 to 30.0 days) ---');
    let maxAgeDays = 0;
    let minAgeDays = Infinity;
    const ageBuckets = { 'Day 0-5': 0, 'Day 6-10': 0, 'Day 11-20': 0, 'Day 21-30': 0 };

    schemes.forEach((s, idx) => {
        const pubDate = new Date(s.publishedAt);
        const ageHours = (now - pubDate) / (1000 * 60 * 60);
        const ageDays = ageHours / 24;

        if (ageDays > maxAgeDays) maxAgeDays = ageDays;
        if (ageDays < minAgeDays) minAgeDays = ageDays;

        assert(ageDays <= 30.0, `Scheme #${idx + 1} (${ageDays.toFixed(2)}d old) is within 30.0 days`);
        assert(ageHours >= -1, `Scheme #${idx + 1} is not in future`);
        assert(s.category === 'schemes', `Scheme #${idx + 1} has category 'schemes'`);

        if (ageDays <= 5) ageBuckets['Day 0-5']++;
        else if (ageDays <= 10) ageBuckets['Day 6-10']++;
        else if (ageDays <= 20) ageBuckets['Day 11-20']++;
        else ageBuckets['Day 21-30']++;
    });

    console.log(`Min age: ${minAgeDays.toFixed(2)} days, Max age: ${maxAgeDays.toFixed(2)} days`);
    console.log('30-Day Age Distribution:', ageBuckets);
    assert(maxAgeDays > 5.0, `30-Day window is active (max age is ${maxAgeDays.toFixed(1)} days > 5.0 days)`);

    // 4. Verify Agricultural News (e.g. crops) remains on 5-Day window
    console.log('\n--- 4. Verifying Agricultural News (crops) Remains on 5-Day Window ---');
    const cropsRes = await axios.get(`${BASE_URL}?category=crops`);
    assert(cropsRes.status === 200, 'Crops endpoint returned 200');
    cropsRes.data.articles.forEach((c, idx) => {
        const pubDate = new Date(c.publishedAt);
        const ageDays = (now - pubDate) / (1000 * 60 * 60 * 24);
        assert(ageDays <= 5.0, `Crops article #${idx + 1} (${ageDays.toFixed(2)}d old) respects 5.0-day limit`);
    });

    // 5. Deduplication Check
    console.log('\n--- 5. Verifying Deduplication in Schemes Feed ---');
    const seenUrls = new Set();
    const seenTitles = new Set();
    schemes.forEach((s, idx) => {
        const cleanUrl = s.url.split('?')[0].toLowerCase().trim().replace(/\/+$/, '');
        const normTitle = s.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 45);

        assert(!seenUrls.has(cleanUrl), `Scheme #${idx + 1} has unique URL: ${cleanUrl}`);
        assert(!seenTitles.has(normTitle), `Scheme #${idx + 1} has unique title: ${s.title.substring(0, 50)}`);

        seenUrls.add(cleanUrl);
        seenTitles.add(normTitle);
    });

    // 6. Print all schemes
    console.log('\n--- 6. Sample Verified Government Schemes Feed ---');
    schemes.forEach((s, i) => {
        const age = ((now - new Date(s.publishedAt)) / (1000 * 60 * 60 * 24)).toFixed(1);
        console.log(`[${i + 1}] [${s.publishedAt}] (${age}d ago) [${s.source.name}]`);
        console.log(`    Title: ${s.title}`);
        console.log(`    URL: ${s.url}\n`);
    });

    console.log('================================================================');
    console.log('🎉 ALL GOVERNMENT SCHEMES 30-DAY TESTS PASSED SUCCESSFULLY');
    console.log('================================================================\n');
}

runSchemesVerification().catch(e => {
    console.error('Verification failed:', e.message);
    process.exit(1);
});
