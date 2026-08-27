const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testAiPerformance() {
    console.log('================================================================');
    console.log('🤖 AI ADVISORY & SEASONAL PERFORMANCE BENCHMARK');
    console.log('================================================================\n');

    const payload = {
        weatherData: { main: { temp: 30, humidity: 65 } },
        cropInfo: 'Tomato',
        location: 'Bengaluru, Karnataka, India',
        language: 'en'
    };

    // 1. Seasonal Crop Recommendation (First Call vs Cached Call)
    console.log('--- 1. Seasonal Crop Recommendation ---');
    const startSeasonal1 = performance.now();
    const resS1 = await axios.post(`${BASE_URL}/ai-advisory/seasonal`, {
        location: 'Bengaluru, Karnataka, India',
        language: 'en',
        weatherData: { main: { temp: 29, humidity: 70 } }
    });
    const durationS1 = (performance.now() - startSeasonal1).toFixed(2);
    console.log(`⏱️ First Seasonal Fetch: ${durationS1} ms (Cached: ${!!resS1.data._cached})`);

    const startSeasonal2 = performance.now();
    const resS2 = await axios.post(`${BASE_URL}/ai-advisory/seasonal`, {
        location: 'Bengaluru, Karnataka, India',
        language: 'en',
        weatherData: { main: { temp: 29, humidity: 70 } }
    });
    const durationS2 = (performance.now() - startSeasonal2).toFixed(2);
    console.log(`⏱️ Second Seasonal Fetch (Cached): ${durationS2} ms (Cached: ${!!resS2.data._cached})`);

    // 2. Crop Advisory (First Call vs Cached Call)
    console.log('\n--- 2. AI Crop Advisor (Tomato) ---');
    const startAdvice1 = performance.now();
    const resA1 = await axios.post(`${BASE_URL}/ai-advisory`, payload);
    const durationA1 = (performance.now() - startAdvice1).toFixed(2);
    console.log(`⏱️ First Advisory Fetch: ${durationA1} ms (Cached: ${!!resA1.data._cached})`);

    const startAdvice2 = performance.now();
    const resA2 = await axios.post(`${BASE_URL}/ai-advisory`, payload);
    const durationA2 = (performance.now() - startAdvice2).toFixed(2);
    console.log(`⏱️ Second Advisory Fetch (Cached): ${durationA2} ms (Cached: ${!!resA2.data._cached})`);

    console.log('\n================================================================');
}

testAiPerformance().catch(console.error);
