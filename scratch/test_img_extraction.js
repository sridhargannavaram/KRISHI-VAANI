const https = require('https');

function fetchRSS(query) {
    return new Promise((resolve, reject) => {
        const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=en-IN&gl=IN&ceid=IN:en';
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    const xml = await fetchRSS('India (agriculture OR farming OR farmer OR ICAR OR mandi)');
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let imgCount = 0;
    let total = 0;

    while ((match = itemRegex.exec(xml)) !== null && total < 10) {
        total++;
        const itemXml = match[1];
        const title = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
        
        // Check for images in itemXml
        const mediaMatch = itemXml.match(/<media:content[^>]+url="([^">]+)"/) ||
                           itemXml.match(/<media:thumbnail[^>]+url="([^">]+)"/) ||
                           itemXml.match(/<enclosure[^>]+url="([^">]+)"/) ||
                           itemXml.match(/src="([^">]+\.(?:jpg|jpeg|png|webp)[^">]*)"/i) ||
                           itemXml.match(/src="([^">]+)"/i);
        
        console.log(`[Item ${total}] ${title.substring(0, 50)}...`);
        if (mediaMatch) {
            console.log('   Image found:', mediaMatch[1]);
            imgCount++;
        } else {
            console.log('   No raw image in RSS XML');
        }
    }
    console.log(`Found images in ${imgCount} of ${total} items.`);
}
run();
