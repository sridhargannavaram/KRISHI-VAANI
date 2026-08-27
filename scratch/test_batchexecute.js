const https = require('https');

// Resolves a Google News token into the real destination article URL via Batchexecute RPC
async function resolveGNewsUrl(gnewsUrl) {
    return new Promise((resolve) => {
        const match = gnewsUrl.match(/articles\/([a-zA-Z0-9_-]+)/);
        if (!match) return resolve(null);
        const articleId = match[1];

        const postData = 'f.req=' + encodeURIComponent(JSON.stringify([
            [['Fbv4je', JSON.stringify(['garturlreq', [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'en-US', 'US', 1, [2], null, 1, 5, null, 1, null, null, null, null, null, 0, 1], articleId]), null, 'generic']]
        ]));

        const req = https.request('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const match = data.match(/https?:\/\/[^"'\s\\]+/);
                    if (match && !match[0].includes('google.com')) {
                        return resolve(match[0]);
                    }
                    // Try parsing JSON array
                    const cleaned = data.replace(/^\)\]\}'\n/, '');
                    const parsed = JSON.parse(cleaned);
                    const innerJson = JSON.parse(parsed[0][2]);
                    if (innerJson && innerJson[1]) {
                        return resolve(innerJson[1]);
                    }
                } catch (e) {
                    // ignore
                }
                resolve(null);
            });
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.write(postData);
        req.end();
    });
}

// Extract OpenGraph image from real destination URL
async function fetchOgImageFromDestination(url) {
    if (!url) return null;
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : require('http');
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 5000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    const u = new URL(url);
                    redirectUrl = u.origin + redirectUrl;
                }
                return resolve(fetchOgImageFromDestination(redirectUrl));
            }

            let html = '';
            res.setEncoding('utf8');
            res.on('data', chunk => {
                html += chunk;
                if (html.length > 60000) req.destroy();
            });
            res.on('end', () => {
                const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                                html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
                
                if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
                    resolve(ogMatch[1]);
                } else {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

async function testFlow() {
    const testGnews = 'https://news.google.com/rss/articles/CBMipwFBVV95cUxORXdBMkR3b2MzeUZFSW5RR3pIbkZjRFllMWNKb2hoWUtvdmo0dGk3U2YtYWJoVXVwb19XTXNVRGVCREhlRjZhcHZZdHdPc2NEVEtTR3g1OHhyaGxVZWlhM05Lcm9HSVVpTy1MN2VmZWx5VDEyZFpNdVNRaGlzQldkU2FJbS1HS0g3elhhRUlmYUNLZ3JzU1BPWEwzbVJWdWhtWml5eVNCZ9IBrAFBVV95cUxOSXFHLW00b1JDRjJQa3g3a0w3eTgtOGk3bkVvNl9kUXBhSWx1cVB3c3p3emxKNDhrc1pfeVN3Q3JrbnZwMmd0M2kxa19vbm1yNXJ4cEN4a053cFN2RUZlTkJqUG56aW03Z0F3akZ4bU04cGRGSm1wNDR3eEZodmlQWWhLNU5GbnJpUmtPZVh2TW1xR2c4bEp6bnhmN091Y2pQZ3hn?oc=5';
    
    console.log('Resolving real publisher URL...');
    const destUrl = await resolveGNewsUrl(testGnews);
    console.log('Real Destination Article URL:', destUrl);

    if (destUrl) {
        console.log('\nFetching real OpenGraph image from destination...');
        const ogImg = await fetchOgImageFromDestination(destUrl);
        console.log('Original Article Image URL:', ogImg);
    }
}

testFlow();
