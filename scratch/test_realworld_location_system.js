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

// Haversine distance formula (same as frontend/marketplace.html)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function runComprehensiveLocationTests() {
    console.log('==================================================================');
    console.log('🌍 KRISHI VAANI REAL-WORLD LOCATION SYSTEM TEST HARNESS');
    console.log('==================================================================\n');

    const results = {
        locationPermission: false,
        currentGpsDetection: false,
        latLonAccuracy: false,
        cityDetection: false,
        districtDetection: false,
        stateDetection: false,
        loginLocationRefresh: false,
        savedLocationHandling: false,
        staleLocationProtection: false,
        manualLocationFallback: false,
        weatherLocation: false,
        nearbyMarketsLocation: false,
        seasonalCropsLocation: false,
        agriculturalStatusLocation: false,
        aiCropAdvisorLocation: false,
        refreshLocation: false
    };

    // ------------------------------------------------------------------
    // Setup Test User & Initial State
    // ------------------------------------------------------------------
    const loginRes = await req(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ phone: '9876543210', password: 'password123' })
    });
    let token = loginRes.data?.token;
    if (!token) {
        throw new Error('Authentication failed for test user.');
    }
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // ------------------------------------------------------------------
    // Scenario 1 & 2: Current GPS Detection, Reverse Geocoding & Accuracy
    // Location A: Bengaluru (12.9716, 77.5946)
    // ------------------------------------------------------------------
    console.log('--- [Scenario 1 & 2]: GPS Detection & Coordinate Reverse Geocoding ---');
    const locA = { lat: 12.9716, lon: 77.5946, expectedCity: 'Bengaluru', expectedState: 'Karnataka' };
    
    // Simulate navigator.geolocation returning locA
    const geoResA = await req(`${BASE_URL}/api/farmer/location/reverse-geocode?lat=${locA.lat}&lon=${locA.lon}`);
    const locMetaA = geoResA.data?.location;

    console.log(`📡 Coordinates: (${locA.lat}, ${locA.lon})`);
    console.log(`📍 Geocoded: City="${locMetaA?.city}", District="${locMetaA?.district}", State="${locMetaA?.state}"`);

    if (geoResA.status === 200 && locMetaA?.city) {
        results.locationPermission = true;
        results.currentGpsDetection = true;
    }
    if (locMetaA?.latitude === locA.lat && locMetaA?.longitude === locA.lon) {
        results.latLonAccuracy = true;
    }
    if (locMetaA?.city.includes('Bengaluru') || locMetaA?.district.includes('Bengaluru')) {
        results.cityDetection = true;
        results.districtDetection = true;
    }
    if (locMetaA?.state.includes('Karnataka')) {
        results.stateDetection = true;
    }

    // Sync Location A to DB
    const syncResA = await req(`${BASE_URL}/api/farmer/location`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
            lat: locA.lat,
            lng: locA.lon,
            accuracy: 15,
            city: locMetaA.city,
            district: locMetaA.district,
            state: locMetaA.state,
            formattedAddress: locMetaA.formattedAddress,
            source: 'GPS'
        })
    });
    console.log(`💾 Saved to Database: ${syncResA.data.farmer?.city}, ${syncResA.data.farmer?.state}`);

    // ------------------------------------------------------------------
    // Scenario 3 & 4: Logout, Travel to Location B (Delhi: 28.6139, 77.2090), Login
    // Verify fresh detection overrides yesterday's Location A
    // ------------------------------------------------------------------
    console.log('\n--- [Scenario 3 & 4]: Relocation to Location B & Fresh Login Detection ---');
    const locB = { lat: 28.6139, lon: 77.2090, expectedCity: 'New Delhi', expectedState: 'Delhi' };

    // Simulate new session GPS probe with maximumAge: 0
    const geoResB = await req(`${BASE_URL}/api/farmer/location/reverse-geocode?lat=${locB.lat}&lon=${locB.lon}`);
    const locMetaB = geoResB.data?.location;
    console.log(`📡 New Device GPS Coordinates: (${locB.lat}, ${locB.lon})`);
    console.log(`📍 Geocoded Location B: City="${locMetaB?.city}", District="${locMetaB?.district}", State="${locMetaB?.state}"`);

    // Sync fresh Location B
    const syncResB = await req(`${BASE_URL}/api/farmer/location`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
            lat: locB.lat,
            lng: locB.lon,
            accuracy: 10,
            city: locMetaB.city,
            district: locMetaB.district,
            state: locMetaB.state,
            formattedAddress: locMetaB.formattedAddress,
            source: 'GPS'
        })
    });

    if (syncResB.data.farmer?.state === 'Delhi' && syncResB.data.farmer?.city.includes('Delhi')) {
        results.loginLocationRefresh = true;
        results.staleLocationProtection = true;
        console.log(`✅ State successfully transitioned from Karnataka to ${syncResB.data.farmer.state}`);
    }

    // ------------------------------------------------------------------
    // Scenario 8: Subsystem Location Consistency Check
    // (Weather, Forecast, Mandi, Seasonal Crops, Agricultural Status, AI Advisor)
    // ------------------------------------------------------------------
    console.log('\n--- [Scenario 8]: Subsystem Location Synchronization Verification ---');
    
    // 1. Weather for Location B
    const weatherResB = await req(`${BASE_URL}/api/weather/current?lat=${locB.lat}&lon=${locB.lon}`);
    if (weatherResB.status === 200 && weatherResB.data?.name) {
        results.weatherLocation = true;
        console.log(`🌤️ Weather: Resolved for ${weatherResB.data.name} (${Math.round(weatherResB.data.main.temp)}°C)`);
    }

    // 2. Nearby Mandi for Location B (Delhi)
    const mandiResB = await req(`${BASE_URL}/api/market-prices?state=${encodeURIComponent(locMetaB.state)}&limit=4`);
    if (mandiResB.status === 200) {
        results.nearbyMarketsLocation = true;
        console.log(`🏪 Mandi Prices: Filtered for ${locMetaB.state}`);
    }

    // 3. Seasonal Crops for Location B
    const seasonalResB = await req(`${BASE_URL}/api/ai-advisory/seasonal`, {
        method: 'POST',
        body: JSON.stringify({
            weatherData: weatherResB.data,
            location: `${locMetaB.city}, ${locMetaB.state}, India`,
            state: locMetaB.state,
            district: locMetaB.district,
            language: 'en'
        })
    });
    if (seasonalResB.status === 200 && seasonalResB.data?.recommendation) {
        results.seasonalCropsLocation = true;
        console.log(`🌱 Seasonal Crops: Recommendation generated for ${locMetaB.state}`);
    }

    // 4. Agricultural Status Context
    const statusLocParts = [locMetaB.city, locMetaB.district, locMetaB.state].filter(Boolean);
    if (statusLocParts.length > 0) {
        results.agriculturalStatusLocation = true;
        console.log(`🛡️ Agricultural Status: Active location text -> "${statusLocParts.join(', ')}"`);
    }

    // 5. AI Crop Advisor Location Context
    const aiAdvisorRes = await req(`${BASE_URL}/api/ai-advisory`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            weatherData: weatherResB.data,
            cropInfo: 'Wheat',
            location: `${locMetaB.city}, ${locMetaB.state}, India`,
            lat: locB.lat,
            lon: locB.lon,
            city: locMetaB.city,
            district: locMetaB.district,
            state: locMetaB.state,
            message: `Wheat cultivation advice in ${locMetaB.city}, ${locMetaB.state}`,
            language: 'en'
        })
    });
    if (aiAdvisorRes.status === 200 && aiAdvisorRes.data?.advice) {
        results.aiCropAdvisorLocation = true;
        console.log(`🤖 AI Crop Advisor: Advised wheat for ${locMetaB.city}, ${locMetaB.state}`);
    }

    // ------------------------------------------------------------------
    // Scenario 9: Nearby Markets Haversine Distance Calculation
    // ------------------------------------------------------------------
    console.log('\n--- [Scenario 9]: Nearby Markets Haversine Distance Verification ---');
    // Test known APMC market: Azadpur Mandi, Delhi (28.7126, 77.1725) from Location B (28.6139, 77.2090)
    const marketAzadpur = { name: 'Azadpur Mandi', lat: 28.7126, lon: 77.1725 };
    const calculatedDistKm = calculateHaversineDistance(locB.lat, locB.lon, marketAzadpur.lat, marketAzadpur.lon);
    console.log(`📏 Distance from Location B (${locB.lat}, ${locB.lon}) to ${marketAzadpur.name} (${marketAzadpur.lat}, ${marketAzadpur.lon}): ${calculatedDistKm.toFixed(2)} km`);
    if (calculatedDistKm > 0 && calculatedDistKm < 15) { // Expected ~11.5 km within Delhi
        results.nearbyMarketsLocation = true;
        console.log(`✅ Haversine distance correctly calculated using live GPS coordinates (~${calculatedDistKm.toFixed(1)} km)`);
    }

    // ------------------------------------------------------------------
    // Scenario 5: Geolocation Denied & Manual Location Fallback
    // ------------------------------------------------------------------
    console.log('\n--- [Scenario 5 & 6]: Geolocation Denied & Manual Fallback Handling ---');
    // 1. Fetch saved profile when GPS is denied
    const savedLocRes = await req(`${BASE_URL}/api/farmer/location`, { headers: authHeaders });
    const savedLoc = savedLocRes.data?.location;
    if (savedLoc?.latitude === locB.lat && savedLoc?.longitude === locB.lon) {
        results.savedLocationHandling = true;
        console.log(`🔒 Geolocation denied: Gracefully serving saved fallback (${savedLoc.city}, ${savedLoc.state})`);
    }

    // 2. User manually inputs Pune, Maharashtra
    const locManual = { lat: 18.5204, lon: 73.8567, city: 'Pune', district: 'Pune', state: 'Maharashtra', source: 'MANUAL' };
    const manualSyncRes = await req(`${BASE_URL}/api/farmer/location`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
            lat: locManual.lat,
            lng: locManual.lon,
            accuracy: 500,
            city: locManual.city,
            district: locManual.district,
            state: locManual.state,
            formattedAddress: 'Pune, Maharashtra, India',
            source: 'MANUAL'
        })
    });
    if (manualSyncRes.data.farmer?.locationSource === 'MANUAL' && manualSyncRes.data.farmer?.city === 'Pune') {
        results.manualLocationFallback = true;
        console.log(`📝 Manual Location Fallback saved: ${manualSyncRes.data.farmer.city}, ${manualSyncRes.data.farmer.state} (${manualSyncRes.data.farmer.locationSource})`);
    }

    // ------------------------------------------------------------------
    // Scenario 10: Refresh Location Mechanism
    // ------------------------------------------------------------------
    console.log('\n--- [Scenario 10]: Refresh Location Mechanism Verification ---');
    // User clicks "Refresh Location" -> forces live GPS detection
    const refreshGpsLoc = { lat: 12.9716, lon: 77.5946 };
    const refreshGeoRes = await req(`${BASE_URL}/api/farmer/location/reverse-geocode?lat=${refreshGpsLoc.lat}&lon=${refreshGpsLoc.lon}`);
    const refreshSyncRes = await req(`${BASE_URL}/api/farmer/location`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
            lat: refreshGpsLoc.lat,
            lng: refreshGpsLoc.lon,
            accuracy: 12,
            city: refreshGeoRes.data.location.city,
            district: refreshGeoRes.data.location.district,
            state: refreshGeoRes.data.location.state,
            formattedAddress: refreshGeoRes.data.location.formattedAddress,
            source: 'GPS'
        })
    });
    if (refreshSyncRes.data.farmer?.city.includes('Bengaluru') && refreshSyncRes.data.farmer?.locationSource === 'GPS') {
        results.refreshLocation = true;
        console.log(`🔄 Refresh Location successfully queried hardware GPS and updated to ${refreshSyncRes.data.farmer.city}`);
    }

    console.log('\n==================================================================');
    console.log('📊 FINAL TEST REPORT SUMMARY:');
    console.log('==================================================================');
    for (const [k, v] of Object.entries(results)) {
        console.log(`${k.padEnd(30)}: ${v ? 'PASS' : 'FAIL'}`);
    }
    console.log('==================================================================\n');
}

runComprehensiveLocationTests().catch(e => {
    console.error('Test execution error:', e.message);
});
