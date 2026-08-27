const https = require('https');

function inspectLink(gnewsUrl) {
    return new Promise((resolve) => {
        https.get(gnewsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                console.log('Status code:', res.statusCode);
                console.log('Headers location:', res.headers.location);
                // Look for anchor links in Google News landing page
                const links = html.match(/href="([^"]+)"/g) || [];
                console.log('Sample hrefs in HTML:');
                links.slice(0, 15).forEach(l => console.log('  ', l));
                
                const cWiz = html.match(/data-n-a-id="([^"]+)"/);
                console.log('cWiz match:', cWiz ? cWiz[1] : 'none');
                resolve(html);
            });
        });
    });
}

inspectLink('https://news.google.com/rss/articles/CBMipwFBVV95cUxORXdBMkR3b2MzeUZFSW5RR3pIbkZjRFllMWNKb2hoWUtvdmo0dGk3U2YtYWJoVXVwb19XTXNVRGVCREhlRjZhcHZZdHdPc2NEVEtTR3g1OHhyaGxVZWlhM05Lcm9HSVVpTy1MN2VmZWx5VDEyZFpNdVNRaGlzQldkU2FJbS1HS0g3elhhRUlmYUNLZ3JzU1BPWEwzbVJWdWhtWml5eVNCZ9IBrAFBVV95cUxOSXFHLW00b1JDRjJQa3g3a0w3eTgtOGk3bkVvNl9kUXBhSWx1cVB3c3p3emxKNDhrc1pfeVN3Q3JrbnZwMmd0M2kxa19vbm1yNXJ4cEN4a053cFN2RUZlTkJqUG56aW03Z0F3akZ4bU04cGRGSm1wNDR3eEZodmlQWWhLNU5GbnJpUmtPZVh2TW1xR2c4bEp6bnhmN091Y2pQZ3hn?oc=5');
