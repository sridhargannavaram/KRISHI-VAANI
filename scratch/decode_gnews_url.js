function decodeGoogleNewsUrl(gnewsUrl) {
    try {
        const match = gnewsUrl.match(/articles\/(CBM[a-zA-Z0-9_-]+)/);
        if (!match) return null;
        const b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
        const buf = Buffer.from(b64, 'base64');
        
        // Find strings starting with http:// or https:// inside the protobuf binary buffer
        const binaryStr = buf.toString('latin1');
        const httpIndex = binaryStr.indexOf('http');
        if (httpIndex !== -1) {
            // Find length of URL or end delimiter
            const slice = binaryStr.slice(httpIndex);
            const urlMatch = slice.match(/https?:\/\/[^\x00-\x1f\x7f-\xff"'\s<>]+/);
            if (urlMatch) {
                return urlMatch[0];
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

const sample1 = 'https://news.google.com/rss/articles/CBMipwFBVV95cUxORXdBMkR3b2MzeUZFSW5RR3pIbkZjRFllMWNKb2hoWUtvdmo0dGk3U2YtYWJoVXVwb19XTXNVRGVCREhlRjZhcHZZdHdPc2NEVEtTR3g1OHhyaGxVZWlhM05Lcm9HSVVpTy1MN2VmZWx5VDEyZFpNdVNRaGlzQldkU2FJbS1HS0g3elhhRUlmYUNLZ3JzU1BPWEwzbVJWdWhtWml5eVNCZ9IBrAFBVV95cUxOSXFHLW00b1JDRjJQa3g3a0w3eTgtOGk3bkVvNl9kUXBhSWx1cVB3c3p3emxKNDhrc1pfeVN3Q3JrbnZwMmd0M2kxa19vbm1yNXJ4cEN4a053cFN2RUZlTkJqUG56aW03Z0F3akZ4bU04cGRGSm1wNDR3eEZodmlQWWhLNU5GbnJpUmtPZVh2TW1xR2c4bEp6bnhmN091Y2pQZ3hn?oc=5';
console.log('Decoded Original URL 1:', decodeGoogleNewsUrl(sample1));
