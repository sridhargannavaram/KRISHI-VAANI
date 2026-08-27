require('dotenv').config();
const https = require('https');

const apiKey = process.env.NEWS_API_KEY;

function fetchNewsApiRaw(query, lang = 'en', fromDate, pageSize = 50) {
    return new Promise((resolve, reject) => {
        let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
        if (lang) url += `&language=${lang}`;
        if (fromDate) url += `&from=${fromDate}`;

        https.get(url, { headers: { 'User-Agent': 'KrishiVaaniApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function runDiagnostics() {
    console.log('=== NewsAPI Direct Diagnostics ===');
    console.log('API Key present:', !!apiKey);

    const now = new Date();
    const from5DaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log('Today:', now.toISOString().split('T')[0], '5 days ago:', from5DaysAgo);

    // Test 1: Language support investigation
    console.log('\n--- 1. Testing Languages for Indian Agri ---');
    const languages = ['en', 'hi', 'te', 'kn', 'ta', 'ml'];
    for (const lang of languages) {
        try {
            const res = await fetchNewsApiRaw('agriculture OR farming OR किसान', lang, from5DaysAgo, 10);
            console.log(`Lang [${lang}]: Status = ${res.status}, TotalResults = ${res.totalResults}, Error = ${res.message || 'None'}`);
            if (res.articles && res.articles.length > 0) {
                console.log(`   Sample [${lang}]: "${res.articles[0].title}" (${res.articles[0].publishedAt})`);
            }
        } catch (e) {
            console.log(`Lang [${lang}] Error:`, e.message);
        }
    }

    // Test 2: Examine query results for English
    console.log('\n--- 2. Examining English Agricultural Queries ---');
    const testQueries = [
        'India AND (agriculture OR farming OR farmer OR crop OR mandi OR "Kharif" OR "Rabi" OR "PM-KISAN" OR monsoon)',
        'India AND (agriculture OR farmer OR crops OR "crop price" OR mandi OR "MSP" OR harvest OR rainfall OR agritech)'
    ];

    for (const q of testQueries) {
        console.log(`Query: ${q}`);
        const res = await fetchNewsApiRaw(q, 'en', from5DaysAgo, 50);
        console.log(`TotalResults: ${res.totalResults}, Returned: ${res.articles?.length || 0}`);
        if (res.articles) {
            res.articles.slice(0, 10).forEach((a, i) => {
                console.log(`  [${i+1}] ${a.publishedAt} | ${a.source?.name} | ${a.title}`);
            });
        }
    }
}

runDiagnostics();
