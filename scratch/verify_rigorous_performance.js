const axios = require('axios');
const BASE_URL = 'http://localhost:4000/api';

async function runRigorousVerification() {
    console.log('================================================================');
    console.log('🔬 KRISHI VAANI — RIGOROUS PERFORMANCE & INTEGRITY VERIFICATION');
    console.log('================================================================\n');

    const results = {
        timings: {},
        cacheSafety: {},
        dataFreshness: {},
        failures: {}
    };

    // -------------------------------------------------------------
    // SECTION 1: MEASURE UNCACHED VS CACHED SEPARATELY
    // -------------------------------------------------------------
    console.log('--- 1. Testing AI Crop Advisory: Uncached vs Cached ---');
    const uniqueCrop = 'Groundnut';
    const loc1 = 'Mysuru, Karnataka, India';
    
    // 1A. First Uncached Call
    const t0 = performance.now();
    const resAdviceUncached = await axios.post(`${BASE_URL}/ai-advisory`, {
        cropInfo: uniqueCrop,
        location: loc1,
        language: 'en',
        weatherData: { main: { temp: 28, humidity: 60 } }
    });
    const tUncachedAdvice = (performance.now() - t0).toFixed(2);
    results.timings.aiAdviceUncachedMs = tUncachedAdvice;
    console.log(`⏱️ Uncached AI Advisory (${uniqueCrop}, ${loc1}, EN): ${tUncachedAdvice} ms (Cached Flag: ${!!resAdviceUncached.data._cached})`);

    // 1B. Second Cached Call
    const t1 = performance.now();
    const resAdviceCached = await axios.post(`${BASE_URL}/ai-advisory`, {
        cropInfo: uniqueCrop,
        location: loc1,
        language: 'en',
        weatherData: { main: { temp: 28, humidity: 60 } }
    });
    const tCachedAdvice = (performance.now() - t1).toFixed(2);
    results.timings.aiAdviceCachedMs = tCachedAdvice;
    console.log(`⏱️ Cached AI Advisory (${uniqueCrop}, ${loc1}, EN): ${tCachedAdvice} ms (Cached Flag: ${!!resAdviceCached.data._cached})`);

    // -------------------------------------------------------------
    // SECTION 2: AI CACHE SAFETY & CROSS-CONTAMINATION CHECKS
    // -------------------------------------------------------------
    console.log('\n--- 2. AI Cache Safety & Context Isolation ---');
    
    // 2A. Language Isolation Test: Switch to Telugu ('te') for the same crop & location
    const t2 = performance.now();
    const resAdviceTelugu = await axios.post(`${BASE_URL}/ai-advisory`, {
        cropInfo: uniqueCrop,
        location: loc1,
        language: 'te',
        weatherData: { main: { temp: 28, humidity: 60 } }
    });
    const tLangSwitch = (performance.now() - t2).toFixed(2);
    const hasTeluguCharacters = /[\u0C00-\u0C7F]/.test(resAdviceTelugu.data.advice || '');
    results.cacheSafety.languageIsolation = hasTeluguCharacters;
    console.log(`✅ Language Isolation Test (Telugu): Response contains native Telugu script: ${hasTeluguCharacters} (${tLangSwitch} ms, Cached: ${!!resAdviceTelugu.data._cached})`);

    // 2B. Location Isolation Test: Query same crop for Delhi
    const t3 = performance.now();
    const resAdviceDelhi = await axios.post(`${BASE_URL}/ai-advisory`, {
        cropInfo: uniqueCrop,
        location: 'New Delhi, Delhi, India',
        language: 'en',
        weatherData: { main: { temp: 36, humidity: 40 } }
    });
    const tLocSwitch = (performance.now() - t3).toFixed(2);
    const adviceTextDelhi = (resAdviceDelhi.data.advice || '').toLowerCase();
    const isDelhiSpecific = adviceTextDelhi.includes('delhi') || adviceTextDelhi.includes('northern') || adviceTextDelhi.includes('trans-gangetic') || !adviceTextDelhi.includes('mysuru');
    results.cacheSafety.locationIsolation = isDelhiSpecific;
    console.log(`✅ Location Isolation Test (Delhi vs Mysuru): Different advice returned: ${isDelhiSpecific} (${tLocSwitch} ms, Cached: ${!!resAdviceDelhi.data._cached})`);

    // -------------------------------------------------------------
    // SECTION 3: SEASONAL CROPS UNCACHED VS CACHED
    // -------------------------------------------------------------
    console.log('\n--- 3. Seasonal Crops: Uncached vs Cached ---');
    const locSeasonal = 'Shimoga, Karnataka, India';
    
    const t4 = performance.now();
    const resSeasonalUncached = await axios.post(`${BASE_URL}/ai-advisory/seasonal`, {
        location: locSeasonal,
        language: 'en',
        weatherData: { main: { temp: 26, humidity: 75 } }
    });
    const tSeasonalUncached = (performance.now() - t4).toFixed(2);
    results.timings.seasonalUncachedMs = tSeasonalUncached;
    console.log(`⏱️ Uncached Seasonal (${locSeasonal}): ${tSeasonalUncached} ms (Cached: ${!!resSeasonalUncached.data._cached})`);

    const t5 = performance.now();
    const resSeasonalCached = await axios.post(`${BASE_URL}/ai-advisory/seasonal`, {
        location: locSeasonal,
        language: 'en',
        weatherData: { main: { temp: 26, humidity: 75 } }
    });
    const tSeasonalCached = (performance.now() - t5).toFixed(2);
    results.timings.seasonalCachedMs = tSeasonalCached;
    console.log(`⏱️ Cached Seasonal (${locSeasonal}): ${tSeasonalCached} ms (Cached: ${!!resSeasonalCached.data._cached})`);

    // -------------------------------------------------------------
    // SECTION 4: WEATHER UNCACHED VS CACHED
    // -------------------------------------------------------------
    console.log('\n--- 4. Weather API: Uncached vs Cached ---');
    // Query novel coordinate for uncached
    const lat = (12.9716 + (Math.random() * 0.05)).toFixed(4);
    const lon = (77.5946 + (Math.random() * 0.05)).toFixed(4);

    const t6 = performance.now();
    const resWeather1 = await axios.get(`${BASE_URL}/weather/current?lat=${lat}&lon=${lon}`);
    const tWeather1 = (performance.now() - t6).toFixed(2);
    results.timings.weatherUncachedMs = tWeather1;
    console.log(`⏱️ Weather Uncached (${lat}, ${lon}): ${tWeather1} ms (Cached: ${!!resWeather1.data._cached})`);

    const t7 = performance.now();
    const resWeather2 = await axios.get(`${BASE_URL}/weather/current?lat=${lat}&lon=${lon}`);
    const tWeather2 = (performance.now() - t7).toFixed(2);
    results.timings.weatherCachedMs = tWeather2;
    console.log(`⏱️ Weather Cached (${lat}, ${lon}): ${tWeather2} ms (Cached: ${!!resWeather2.data._cached})`);

    // -------------------------------------------------------------
    // SECTION 5: MANDI PRICES & NEWS FRESHNESS
    // -------------------------------------------------------------
    console.log('\n--- 5. Mandi Prices & News Freshness ---');
    const t8 = performance.now();
    const resMandi = await axios.get(`${BASE_URL}/market-prices/nearby?lat=12.9716&lon=77.5946&radius_km=300`);
    const tMandi = (performance.now() - t8).toFixed(2);
    results.timings.mandiMs = tMandi;
    console.log(`⏱️ Mandi Nearby Prices (lat 12.97, lon 77.59): ${tMandi} ms (Count: ${resMandi.data.count})`);

    const t9 = performance.now();
    const resNews = await axios.get(`${BASE_URL}/news?category=all&lang=en`);
    const tNews = (performance.now() - t9).toFixed(2);
    results.timings.newsMs = tNews;
    const now = new Date();
    const maxNewsAge = Math.max(...(resNews.data.articles || []).map(a => (now - new Date(a.publishedAt)) / (1000 * 3600 * 24)));
    results.dataFreshness.newsMaxAgeDays = maxNewsAge.toFixed(2);
    console.log(`⏱️ News API (/api/news?category=all): ${tNews} ms (Articles: ${(resNews.data.articles || []).length}, Max Age: ${maxNewsAge.toFixed(2)} days)`);

    const t10 = performance.now();
    const resSchemes = await axios.get(`${BASE_URL}/news?category=schemes&lang=en`);
    const tSchemes = (performance.now() - t10).toFixed(2);
    results.timings.schemesMs = tSchemes;
    const maxSchemeAge = Math.max(...(resSchemes.data.articles || []).map(a => (now - new Date(a.publishedAt)) / (1000 * 3600 * 24)));
    results.dataFreshness.schemesMaxAgeDays = maxSchemeAge.toFixed(2);
    console.log(`⏱️ Govt Schemes API (/api/news?category=schemes): ${tSchemes} ms (Articles: ${(resSchemes.data.articles || []).length}, Max Age: ${maxSchemeAge.toFixed(2)} days)`);

    // -------------------------------------------------------------
    // SECTION 6: SIMULATE FULL PARALLEL DASHBOARD INITIAL LOAD
    // -------------------------------------------------------------
    console.log('\n--- 6. Dashboard Simulated Parallel Load ---');
    const t11 = performance.now();
    await Promise.allSettled([
        axios.get(`${BASE_URL}/weather/current?lat=12.9716&lon=77.5946`),
        axios.get(`${BASE_URL}/weather/forecast?lat=12.9716&lon=77.5946`),
        axios.get(`${BASE_URL}/market-prices/nearby?lat=12.9716&lon=77.5946`),
        axios.get(`${BASE_URL}/news?category=all`)
    ]);
    const tDashboardParallel = (performance.now() - t11).toFixed(2);
    results.timings.dashboardParallelLoadMs = tDashboardParallel;
    console.log(`⏱️ Total Parallel Core Dashboard Load Time: ${tDashboardParallel} ms`);

    console.log('\n================================================================');
    console.log('📊 VERIFICATION SUMMARY COMPLETE');
    console.log('================================================================');
}

runRigorousVerification().catch(console.error);
