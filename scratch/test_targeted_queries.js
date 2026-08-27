require('dotenv').config();
const https = require('https');
const apiKey = process.env.NEWS_API_KEY;

function fetchNewsApiRaw(query, lang = 'en', fromDate, pageSize = 100) {
    return new Promise((resolve) => {
        let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
        if (lang) url += `&language=${lang}`;
        if (fromDate) url += `&from=${fromDate}`;

        https.get(url, { headers: { 'User-Agent': 'KrishiVaaniApp/1.0' } }, (res) => {
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

async function testTargetedQueries() {
    const from5DaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log('5 days ago fromDate:', from5DaysAgo);

    // Let's test specific agri queries
    const queries = [
        '("Indian agriculture" OR "Indian farmers" OR "mandi prices" OR "PM-KISAN" OR "Kharif crops" OR "Rabi harvest" OR "ICAR")',
        '(agriculture OR farmer OR crops OR mandi OR "MSP" OR "monsoon rainfall") AND (India OR Kisan OR "Cabinet" OR "Ministry of Agriculture")',
        '("agritech India" OR "crop insurance" OR "fertilizer subsidy" OR "mandi arrival" OR "APMC market" OR "paddy procurement")'
    ];

    for (const q of queries) {
        console.log(`\nTesting query: ${q}`);
        const arts = await fetchNewsApiRaw(q, 'en', from5DaysAgo, 100);
        console.log(`Results count: ${arts.length}`);
        if (arts.length > 0) {
            const oldest = arts[arts.length - 1];
            const newest = arts[0];
            console.log(`  Newest: ${newest.publishedAt} | ${newest.title.substring(0, 60)}`);
            console.log(`  Oldest: ${oldest.publishedAt} | ${oldest.title.substring(0, 60)}`);
            
            // Check day spread
            const daysCount = {};
            arts.forEach(a => {
                const dateKey = a.publishedAt.split('T')[0];
                daysCount[dateKey] = (daysCount[dateKey] || 0) + 1;
            });
            console.log('  Date breakdown:', daysCount);
        }
    }
}

testTargetedQueries();
