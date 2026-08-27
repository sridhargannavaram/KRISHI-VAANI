const http = require('http');
const https = require('https');

function fetchRSSRaw() {
    return new Promise((resolve, reject) => {
        const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent('India (agriculture OR farming OR crops OR mandi OR ICAR)') + '&hl=en-IN&gl=IN&ceid=IN:en';
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function fetchBackendAPI(category = 'all') {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:4000/api/news?category=${category}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function inspect() {
    console.log('====================================================');
    console.log('1. INSPECTING RAW UPSTREAM RSS XML FOR IMAGE FIELDS');
    console.log('====================================================');
    const rawXml = await fetchRSSRaw();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let index = 0;
    let hasMediaTag = false;
    let hasEnclosureTag = false;
    let hasImgInDesc = false;

    while ((match = itemRegex.exec(rawXml)) !== null && index < 5) {
        index++;
        const itemXml = match[1];
        console.log(`\n--- Raw Item #${index} ---`);
        // List all XML tag names found in this item
        const tags = itemXml.match(/<([a-zA-Z0-9:_]+)[^>]*>/g) || [];
        console.log('Tags present:', tags.map(t => t.replace(/[<>]/g, '').split(' ')[0]));
        
        if (itemXml.includes('<media:')) hasMediaTag = true;
        if (itemXml.includes('<enclosure')) hasEnclosureTag = true;
        if (itemXml.includes('<img') || itemXml.includes('&lt;img')) hasImgInDesc = true;
        
        console.log('Full Item XML Snippet:\n', itemXml.trim().substring(0, 400) + '...\n');
    }

    console.log('Summary of Upstream RSS Image Inspection:');
    console.log('  - <media:content> or <media:thumbnail> present?:', hasMediaTag);
    console.log('  - <enclosure type="image/..."> present?:', hasEnclosureTag);
    console.log('  - <img> in <description> present?:', hasImgInDesc);

    console.log('\n====================================================');
    console.log('2. INSPECTING LOCAL BACKEND /api/news API JSON RESPONSE');
    console.log('====================================================');
    const apiRes = await fetchBackendAPI('all');
    console.log('Top-level API Keys:', Object.keys(apiRes));
    console.log('Total articles returned:', apiRes.articles?.length);
    
    if (apiRes.articles && apiRes.articles.length > 0) {
        console.log('\nKeys present in first article object:');
        const first = apiRes.articles[0];
        console.log(JSON.stringify(first, null, 2));
    }
}

inspect();
