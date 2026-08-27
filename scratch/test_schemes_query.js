require('dotenv').config();
const https = require('https');
const apiKey = process.env.NEWS_API_KEY;

function testQuery(q) {
    return new Promise((resolve) => {
        const fromDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&from=${fromDate}&sortBy=publishedAt&pageSize=100&apiKey=${apiKey}`;
        https.get(url, { headers: { 'User-Agent': 'KrishiVaaniApp/1.0' } }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(d);
                    resolve(parsed.articles || []);
                } catch(e) { resolve([]); }
            });
        }).on('error', () => resolve([]));
    });
}

async function run() {
    const q1 = '("PM Kisan" OR "PM-KISAN" OR "PMFBY" OR "crop insurance" OR "fertilizer subsidy" OR "Kisan Credit Card" OR "MSP" OR "farmer welfare" OR "agri scheme" OR "farmer subsidy") AND (India OR Cabinet OR Ministry OR Government OR Centre)';
    const arts = await testQuery(q1);
    console.log('Schemes raw results:', arts.length);
    arts.slice(0, 8).forEach(a => console.log(`  [${a.publishedAt}] [${a.source?.name}] ${a.title}`));
}

run();
