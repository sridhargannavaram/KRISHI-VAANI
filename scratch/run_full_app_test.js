const BASE_URL = 'http://localhost:4000';

async function req(url, opts = {}) {
    const { headers: customHeaders, ...restOpts } = opts;
    const res = await fetch(url, {
        ...restOpts,
        headers: {
            'Content-Type': 'application/json',
            ...(customHeaders || {})
        }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function testAll() {
    console.log('==============================================');
    console.log('🚀 KRISHI VAANI FULL APPLICATION VERIFICATION');
    console.log('==============================================\n');

    let passCount = 0;
    let totalTests = 7;

    // 1. Pages Availability
    console.log('1️⃣ Testing Frontend Web Pages...');
    const pages = ['/index.html', '/dashboard.html', '/marketplace.html', '/login.html', '/news.html'];
    let pagesOk = true;
    for (let p of pages) {
        const res = await fetch(`${BASE_URL}${p}`);
        if (res.status !== 200) {
            console.error(`❌ Page ${p} returned ${res.status}`);
            pagesOk = false;
        }
    }
    if (pagesOk) {
        console.log('   ✅ All core HTML pages accessible (HTTP 200)');
        passCount++;
    }

    // 2. Authentication API
    console.log('\n2️⃣ Testing Authentication API...');
    const authRes = await req(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ phone: '9876543210', password: 'password123' })
    });
    let token = authRes.data.token;
    if (authRes.status === 200 && token) {
        console.log(`   ✅ Farmer login successful. Token acquired for ${authRes.data.farmer.name}`);
        passCount++;
    } else {
        console.error('   ❌ Login test failed:', authRes.data);
    }

    // 3. Geolocation & Reverse-Geocoding
    console.log('\n3️⃣ Testing Geolocation & Reverse-Geocoding...');
    const geoRes = await req(`${BASE_URL}/api/farmer/location/reverse-geocode?lat=12.9716&lon=77.5946`);
    if (geoRes.status === 200 && geoRes.data.location?.city) {
        console.log(`   ✅ Reverse geocode: (${geoRes.data.location.latitude}, ${geoRes.data.location.longitude}) -> ${geoRes.data.location.city}, ${geoRes.data.location.state}`);
        passCount++;
    } else {
        console.error('   ❌ Reverse geocoding failed:', geoRes.data);
    }

    // 4. Weather & Forecast Telemetry
    console.log('\n4️⃣ Testing Weather & 24h Forecast APIs...');
    const weatherRes = await req(`${BASE_URL}/api/weather/current?lat=12.9716&lon=77.5946`);
    const forecastRes = await req(`${BASE_URL}/api/weather/forecast?lat=12.9716&lon=77.5946`);
    if (weatherRes.status === 200 && forecastRes.status === 200) {
        console.log(`   ✅ Weather: ${Math.round(weatherRes.data.main.temp)}°C, ${weatherRes.data.weather[0].description}, ${weatherRes.data.main.humidity}% humidity`);
        console.log(`   ✅ 24h Forecast: ${forecastRes.data.list?.length || 0} time intervals loaded`);
        passCount++;
    } else {
        console.error('   ❌ Weather API failed:', weatherRes.data);
    }

    // 5. Mandi Market Prices & Commodity Image Mapping
    console.log('\n5️⃣ Testing Mandi Prices API & Commodity Images...');
    const mandiRes = await req(`${BASE_URL}/api/market-prices?state=Karnataka&limit=4`);
    if (mandiRes.status === 200 && mandiRes.data.records?.length > 0) {
        const sample = mandiRes.data.records[0];
        console.log(`   ✅ Live Mandi records: ${mandiRes.data.records.length} records returned. (e.g. ${sample.commodity} @ ₹${sample.modal_price || sample.max_price}/Qtl in ${sample.market})`);
        passCount++;
    } else {
        console.error('   ❌ Mandi API failed:', mandiRes.data);
    }

    // 6. Agricultural News API
    console.log('\n6️⃣ Testing Agricultural News API...');
    const newsRes = await req(`${BASE_URL}/api/news?category=all`);
    const articles = Array.isArray(newsRes.data) ? newsRes.data : (newsRes.data.articles || []);
    if (newsRes.status === 200 && articles.length > 0) {
        console.log(`   ✅ Agricultural News: ${articles.length} news articles loaded. Top headline: "${articles[0].title.substring(0, 50)}..."`);
        passCount++;
    } else {
        console.error('   ❌ News API failed:', newsRes.data);
    }

    // 7. Location Update Sync Route
    console.log('\n7️⃣ Testing Farmer Location Database Sync...');
    const syncRes = await req(`${BASE_URL}/api/farmer/location`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            lat: 12.9716,
            lng: 77.5946,
            accuracy: 10,
            city: 'Bengaluru',
            state: 'Karnataka',
            district: 'Bengaluru Urban',
            formattedAddress: 'Bengaluru, Karnataka, India',
            source: 'GPS'
        })
    });
    if (syncRes.status === 200 && syncRes.data.farmer?.city) {
        console.log(`   ✅ Database location sync confirmed: ${syncRes.data.farmer.city}, ${syncRes.data.farmer.state} (${syncRes.data.farmer.locationSource})`);
        passCount++;
    } else {
        console.error('   ❌ Location sync failed:', syncRes.data);
    }

    console.log('\n==============================================');
    console.log(`🏁 TEST RESULTS: ${passCount}/${totalTests} TESTS PASSED`);
    console.log('==============================================\n');
}

testAll().catch(e => console.error('Error during execution:', e.message));
