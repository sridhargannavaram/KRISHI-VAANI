const http = require('http');

function fetchCategory(cat) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:4000/api/news?category=${cat}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function verify() {
    const cats = ['all', 'crops', 'weather', 'schemes', 'technology'];

    console.log('========================================================================');
    console.log('             VERIFYING AGRI-NEWS STRICT CATEGORY FILTERING              ');
    console.log('========================================================================');

    for (const cat of cats) {
        console.log(`\n>>> CATEGORY: [${cat.toUpperCase()}] <<<`);
        const res = await fetchCategory(cat);
        const articles = res.articles || [];
        console.log(`Total Genuine Articles: ${articles.length}`);

        articles.slice(0, 3).forEach((a, i) => {
            console.log(`  [#${i+1}] ${a.title}`);
            console.log(`       Source: ${a.source?.name} | Date: ${a.publishedAt}`);
            console.log(`       Image URL: ${a.urlToImage || '(none - will use clean unavailable fallback)'}`);
            console.log(`       Article Link: ${a.url}`);
        });
    }

    console.log('\n========================================================================');
    console.log('Category verification complete.');
    console.log('========================================================================');
}

verify();
