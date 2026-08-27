const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function timeEndpoint(name, fn) {
    const start = performance.now();
    try {
        const res = await fn();
        const duration = (performance.now() - start).toFixed(2);
        console.log(`⏱️ [${name}]: ${duration} ms (Status: ${res.status || 'OK'})`);
        return { name, duration: parseFloat(duration), status: 'SUCCESS' };
    } catch (e) {
        const duration = (performance.now() - start).toFixed(2);
        console.log(`❌ [${name}]: ${duration} ms (Error: ${e.response?.status || e.message})`);
        return { name, duration: parseFloat(duration), status: 'FAIL', error: e.message };
    }
}

async function runBenchmark() {
    console.log('================================================================');
    console.log('📊 KRISHI VAANI — BASELINE PERFORMANCE BENCHMARK');
    console.log('================================================================\n');

    const lat = 17.3850;
    const lon = 78.4867;

    // 1. Weather Current
    await timeEndpoint('Weather Current (/api/weather/current)', () => 
        axios.get(`${BASE_URL}/weather/current?lat=${lat}&lon=${lon}`)
    );

    // 2. Weather Forecast
    await timeEndpoint('Weather Forecast (/api/weather/forecast)', () => 
        axios.get(`${BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}`)
    );

    // 3. News (All News - 5-Day)
    await timeEndpoint('Agri News 5-Day (/api/news?category=all)', () => 
        axios.get(`${BASE_URL}/news?category=all&lang=en`)
    );

    // 4. Schemes (30-Day)
    await timeEndpoint('Govt Schemes 30-Day (/api/news?category=schemes)', () => 
        axios.get(`${BASE_URL}/news?category=schemes&lang=en`)
    );

    // 5. Mandi Prices Nearby
    await timeEndpoint('Mandi Prices Nearby (/api/market-prices/nearby)', () => 
        axios.get(`${BASE_URL}/market-prices/nearby?lat=${lat}&lon=${lon}&radius=150`)
    );

    // 6. Reverse Geocoding
    await timeEndpoint('Reverse Geocode Proxy (/api/farmer/location/reverse-geocode)', () => 
        axios.get(`${BASE_URL}/farmer/location/reverse-geocode?lat=${lat}&lon=${lon}`)
    );

    // 7. Parallel Dashboard Simulation (Promise.all vs sequential)
    console.log('\n--- Simulating Dashboard Parallel Load ---');
    const parallelStart = performance.now();
    const results = await Promise.allSettled([
        axios.get(`${BASE_URL}/weather/current?lat=${lat}&lon=${lon}`),
        axios.get(`${BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}`),
        axios.get(`${BASE_URL}/news?category=all&lang=en`),
        axios.get(`${BASE_URL}/market-prices/nearby?lat=${lat}&lon=${lon}&radius=150`)
    ]);
    const parallelDuration = (performance.now() - parallelStart).toFixed(2);
    console.log(`⏱️ Total Parallel Core Dashboard Load Time: ${parallelDuration} ms`);

    console.log('\n================================================================');
}

runBenchmark().catch(console.error);
