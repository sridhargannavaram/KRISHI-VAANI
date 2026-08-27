const https = require('https');

function testFeed(name, url) {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
            let xml = '';
            res.on('data', chunk => xml += chunk);
            res.on('end', () => {
                console.log(`\n=== Feed: ${name} (Status: ${res.statusCode}, Length: ${xml.length}) ===`);
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                let match;
                let count = 0;
                while ((match = itemRegex.exec(xml)) !== null && count < 3) {
                    count++;
                    const itemXml = match[1];
                    const title = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
                    const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
                    const media = itemXml.match(/<media:content[^>]+url="([^">]+)"/) ||
                                  itemXml.match(/<media:thumbnail[^>]+url="([^">]+)"/) ||
                                  itemXml.match(/<enclosure[^>]+url="([^">]+)"/) ||
                                  itemXml.match(/src="([^">]+\.(?:jpg|jpeg|png|webp)[^">]*)"/i);

                    console.log(`[Item #${count}]`);
                    console.log(`  Title: ${title.trim().replace(/<!\[CDATA\[|\]\]>/g, '').substring(0, 50)}...`);
                    console.log(`  Direct Link: ${link.trim().replace(/<!\[CDATA\[|\]\]>/g, '')}`);
                    console.log(`  Original Image: ${media ? media[1] : 'none'}`);
                }
                resolve();
            });
        }).on('error', (e) => {
            console.log(`Feed ${name} failed: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    await testFeed('The Hindu Agri-Business', 'https://www.thehindubusinessline.com/economy/agri-business/feeder/default.rss');
    await testFeed('Economic Times Agriculture', 'https://economictimes.indiatimes.com/news/economy/agriculture/rssfeeds/12533790.cms');
    await testFeed('Krishi Jagran', 'https://krishijagran.com/feeds/rss/');
}

run();
