const https = require('https');

const FEEDS = [
    { name: 'The Hindu BusinessLine Agri', url: 'https://www.thehindubusinessline.com/economy/agri-business/feeder/default.rss' },
    { name: 'Krishi Jagran News', url: 'https://krishijagran.com/feeds/rss/' }
];

function fetchFeed(feed) {
    return new Promise((resolve) => {
        https.get(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                let match;
                const articles = [];
                while ((match = itemRegex.exec(data)) !== null) {
                    const item = match[1];
                    let title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
                    let link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
                    let pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
                    let desc = (item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';
                    
                    title = title.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
                    link = link.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
                    desc = desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim();

                    let imgMatch = item.match(/<media:content[^>]+url="([^">]+)"/) ||
                                   item.match(/<media:thumbnail[^>]+url="([^">]+)"/) ||
                                   item.match(/<enclosure[^>]+url="([^">]+)"/) ||
                                   item.match(/src="([^">]+\.(?:jpg|jpeg|png|webp)[^">]*)"/i);

                    let urlToImage = imgMatch ? imgMatch[1] : '';

                    const d = new Date(pubDate);
                    const publishedAt = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();

                    if (title && link) {
                        articles.push({
                            title,
                            description: desc,
                            url: link,
                            urlToImage,
                            source: { name: feed.name },
                            publishedAt
                        });
                    }
                }
                resolve(articles);
            });
        }).on('error', () => resolve([]));
    });
}

async function run() {
    let all = [];
    for (const f of FEEDS) {
        const arts = await fetchFeed(f);
        console.log(`Fetched ${arts.length} articles from ${f.name}`);
        all = all.concat(arts);
    }

    console.log(`\nTotal articles with authentic images: ${all.filter(a => a.urlToImage).length} / ${all.length}`);
    console.log('\nSample Articles with Original Images:');
    all.filter(a => a.urlToImage).slice(0, 5).forEach((a, i) => {
        console.log(`\n[Article #${i+1}]`);
        console.log(`  Title: ${a.title}`);
        console.log(`  Original Article Link: ${a.url}`);
        console.log(`  Original Article Image: ${a.urlToImage}`);
    });
}

run();
