require('dotenv').config();
const https = require('https');
const apiKey = process.env.NEWS_API_KEY;

function fetchNewsRaw(query, lang = 'en', fromDays = 30, pageSize = 100) {
    return new Promise((resolve) => {
        const fromDate = new Date(Date.now() - fromDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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

async function testSchemes30Day() {
    console.log('=== Testing Government Schemes 30-Day Window ===');
    const now = new Date();
    const from30DaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log('Today:', now.toISOString().split('T')[0], '30 Days Ago:', from30DaysAgo);

    const schemeQueries = [
        '("PM Kisan" OR "PM-KISAN" OR "PMFBY" OR "crop insurance" OR "fertilizer subsidy" OR "Kisan Credit Card" OR "MSP" OR "farmer welfare" OR "agri scheme" OR "farmer subsidy" OR "agri infrastructure fund" OR "Pradhan Mantri") AND (India OR Cabinet OR Ministry OR Government OR Centre OR Chouhan)',
        'India AND ("agriculture scheme" OR "farmer subsidy" OR "PM Kisan Samman Nidhi" OR "agri infrastructure fund" OR "procurement policy" OR "Kisan welfare" OR "crop loss compensation")'
    ];

    const rawArrays = await Promise.all(schemeQueries.map(q => fetchNewsRaw(q, 'en', 30, 100)));
    const allRaw = rawArrays.flat();
    console.log('Raw schemes articles found (30-day window):', allRaw.length);

    if (allRaw.length > 0) {
        // Group by day age
        const ageBreakdown = {
            '0-5 days': 0,
            '6-10 days': 0,
            '11-15 days': 0,
            '16-20 days': 0,
            '21-25 days': 0,
            '26-30 days': 0,
            'Older than 30 days': 0
        };

        allRaw.forEach(a => {
            const pub = new Date(a.publishedAt);
            const ageDays = (now - pub) / (1000 * 60 * 60 * 24);
            if (ageDays < 0) return;
            if (ageDays <= 5) ageBreakdown['0-5 days']++;
            else if (ageDays <= 10) ageBreakdown['6-10 days']++;
            else if (ageDays <= 15) ageBreakdown['11-15 days']++;
            else if (ageDays <= 20) ageBreakdown['16-20 days']++;
            else if (ageDays <= 25) ageBreakdown['21-25 days']++;
            else if (ageDays <= 30) ageBreakdown['26-30 days']++;
            else ageBreakdown['Older than 30 days']++;
        });

        console.log('30-Day Distribution breakdown:', ageBreakdown);
        console.log('\nSample Articles:');
        allRaw.slice(0, 10).forEach((a, i) => {
            const age = ((now - new Date(a.publishedAt)) / (1000 * 60 * 60 * 24)).toFixed(1);
            console.log(`[${i+1}] [${a.publishedAt}] (${age}d ago) [${a.source?.name}] ${a.title}`);
        });
    }
}

testSchemes30Day();
