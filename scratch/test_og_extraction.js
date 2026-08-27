const https = require('https');
const http = require('http');

// Helper to fetch HTML and extract og:image / twitter:image
function fetchOgImage(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 5000
        }, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    const u = new URL(url);
                    redirectUrl = u.origin + redirectUrl;
                }
                return resolve(fetchOgImage(redirectUrl));
            }

            let html = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                html += chunk;
                // Once we have the head section (first 50KB), check for og:image
                if (html.length > 50000) {
                    req.destroy();
                }
            });

            res.on('end', () => {
                const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                                html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
                
                if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
                    resolve(ogMatch[1]);
                } else {
                    resolve('');
                }
            });
        });

        req.on('error', () => resolve(''));
        req.on('timeout', () => { req.destroy(); resolve(''); });
    });
}

// Fetch RSS feed, take 3 items, and extract their real original og:image
async function test() {
    console.log('Testing OpenGraph image extraction from live Google News RSS articles...\n');
    const rssUrl = 'https://news.google.com/rss/search?q=' + encodeURIComponent('India (agriculture OR farming OR crops)') + '&hl=en-IN&gl=IN&ceid=IN:en';
    
    https.get(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let xml = '';
        res.on('data', chunk => xml += chunk);
        res.on('end', async () => {
            const itemRegex = /<item>([\s\S]*?)<\/item>/g;
            let match;
            let count = 0;

            while ((match = itemRegex.exec(xml)) !== null && count < 4) {
                count++;
                const itemXml = match[1];
                const title = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
                const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
                
                console.log(`[Article #${count}]`);
                console.log(`Title: ${title}`);
                console.log(`RSS Link: ${link.substring(0, 60)}...`);

                const ogImage = await fetchOgImage(link);
                console.log(`Extracted Original Image URL: ${ogImage || 'NONE (will use clean unavailable fallback)'}`);
                console.log('-----------------------------------------------------\n');
            }
        });
    });
}

test();
