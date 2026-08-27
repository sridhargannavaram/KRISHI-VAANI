require('dotenv').config();
const axios = require('axios');

async function testNews() {
    try {
        console.log('Testing NewsAPI directly and via backend...');
        console.log('Current System Time:', new Date().toISOString());

        const res = await axios.get('http://localhost:4000/api/news?category=all');
        console.log('Backend response status:', res.status);
        console.log('Articles count:', res.data.articles?.length);
        console.log('Source:', res.data.source);
        
        if (res.data.articles) {
            res.data.articles.forEach((a, idx) => {
                const pub = new Date(a.publishedAt);
                const ageHours = (Date.now() - pub.getTime()) / (1000 * 60 * 60);
                const ageDays = ageHours / 24;
                console.log(`\n#${idx + 1}: [${a.publishedAt}] (${ageDays.toFixed(2)} days ago / ${ageHours.toFixed(1)}h ago)`);
                console.log(`Title: ${a.title}`);
                console.log(`Source: ${a.source?.name} | Category: ${a.category}`);
                console.log(`URL: ${a.url}`);
                console.log(`Image: ${a.urlToImage ? a.urlToImage.substring(0, 60) + '...' : 'NONE'}`);
            });
        }
    } catch (e) {
        console.error('Error fetching news:', e.message, e.response?.data);
    }
}

testNews();
