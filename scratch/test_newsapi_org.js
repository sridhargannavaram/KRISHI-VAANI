const https = require('https');
const fs = require('fs');
const path = require('path');

let apiKey = 'b27c698f5ab242029019b616b68e772c';
try {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const match = envContent.match(/NEWS_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
} catch(e) {}

function fetchNewsApi(query) {
    return new Promise((resolve, reject) => {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
        https.get(url, { headers: { 'User-Agent': 'KrishiVaaniApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function inspect() {
    console.log('Testing NewsAPI with API key:', apiKey ? (apiKey.substring(0, 6) + '...') : 'MISSING');
    const result = await fetchNewsApi('India AND (agriculture OR farming OR crops OR farmer OR mandi)');
    
    console.log('NewsAPI status:', result.status);
    console.log('Total results:', result.totalResults);
    console.log('Articles returned:', result.articles?.length);

    if (result.articles && result.articles.length > 0) {
        console.log('\n--- First Article Full Object ---');
        console.log(JSON.stringify(result.articles[0], null, 2));

        console.log('\n--- Inspection of all 10 articles: urlToImage presence ---');
        result.articles.forEach((a, i) => {
            console.log(`[Article #${i+1}]`);
            console.log(`  Title: ${a.title}`);
            console.log(`  Source: ${a.source?.name}`);
            console.log(`  Published: ${a.publishedAt}`);
            console.log(`  Article Link: ${a.url}`);
            console.log(`  urlToImage: ${a.urlToImage || 'NULL / EMPTY'}`);
        });
    } else {
        console.log('Error or message:', result.message);
    }
}

inspect();
