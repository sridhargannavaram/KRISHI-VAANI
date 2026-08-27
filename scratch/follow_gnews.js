const https = require('https');

function followLink(url) {
    https.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log('Redirecting to:', res.headers.location);
            return followLink(res.headers.location);
        }
        let html = '';
        res.on('data', chunk => html += chunk);
        res.on('end', () => {
            console.log('Final Status:', res.statusCode);
            console.log('HTML length:', html.length);
            
            // Check for direct article links in the Google redirect landing page
            const matches = html.match(/<a[^>]+href="([^"]+)"[^>]*>/gi) || [];
            console.log('Found ' + matches.length + ' <a> tags:');
            matches.slice(0, 10).forEach(m => console.log('  ', m));

            // Also check for jscontroller / data-n-au
            const au = html.match(/data-n-au="([^"]+)"/);
            if (au) console.log('data-n-au:', au[1]);
        });
    });
}

followLink('https://news.google.com/rss/articles/CBMipwFBVV95cUxORXdBMkR3b2MzeUZFSW5RR3pIbkZjRFllMWNKb2hoWUtvdmo0dGk3U2YtYWJoVXVwb19XTXNVRGVCREhlRjZhcHZZdHdPc2NEVEtTR3g1OHhyaGxVZWlhM05Lcm9HSVVpTy1MN2VmZWx5VDEyZFpNdVNRaGlzQldkU2FJbS1HS0g3elhhRUlmYUNLZ3JzU1BPWEwzbVJWdWhtWml5eVNCZ9IBrAFBVV95cUxOSXFHLW00b1JDRjJQa3g3a0w3eTgtOGk3bkVvNl9kUXBhSWx1cVB3c3p3emxKNDhrc1pfeVN3Q3JrbnZwMmd0M2kxa19vbm1yNXJ4cEN4a053cFN2RUZlTkJqUG56aW03Z0F3akZ4bU04cGRGSm1wNDR3eEZodmlQWWhLNU5GbnJpUmtPZVh2TW1xR2c4bEp6bnhmN091Y2pQZ3hn?oc=5');
