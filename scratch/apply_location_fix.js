const fs = require('fs');
const path = require('path');

// 1. Update frontend/dashboard.html
const dashPath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let dashContent = fs.readFileSync(dashPath, 'utf8');

// Replace detectFarmerGpsLocation and syncLocationToDatabase
const detectStart = dashContent.indexOf('async function detectFarmerGpsLocation(');
const detectEnd = dashContent.indexOf('function openManualLocationModal()', detectStart);

if (detectStart !== -1 && detectEnd !== -1) {
    const updatedDetectionCode = `async function detectFarmerGpsLocation(promptUser = false) {
            const refreshBtn = document.getElementById('btnRefreshGpsLocation');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
                refreshBtn.disabled = true;
            }

            if (!navigator.geolocation) {
                if (promptUser) {
                    alert('Geolocation is not supported by your browser. Please select your location manually.');
                } else {
                    console.info('Geolocation not supported, using fallback location.');
                }
                if (refreshBtn) { refreshBtn.innerHTML = '<i class="fas fa-arrows-rotate"></i> Refresh Location'; refreshBtn.disabled = false; }
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const accuracy = pos.coords.accuracy || 0;

                    let geoData = {};
                    try {
                        const geoRes = await fetch(\`\${API_BASE_URL}/farmer/location/reverse-geocode?lat=\${lat}&lon=\${lng}\`);
                        const geoJson = await geoRes.json();
                        if (geoJson.success && geoJson.location) {
                            geoData = geoJson.location;
                        }
                    } catch (e) {
                        console.warn('Geocode proxy note:', e);
                    }

                    pendingDetectedLoc = {
                        lat,
                        lng,
                        accuracy,
                        state: geoData.state || '',
                        district: geoData.district || '',
                        city: geoData.city || 'My Farm',
                        village: geoData.village || '',
                        postalCode: geoData.postalCode || '',
                        formattedAddress: geoData.formattedAddress || \`\${lat.toFixed(4)}, \${lng.toFixed(4)}\`,
                        source: 'GPS'
                    };

                    if (promptUser) {
                        showLocationConfirmModal(pendingDetectedLoc);
                    } else {
                        await syncLocationToDatabase(lat, lng, pendingDetectedLoc);
                    }

                    if (refreshBtn) {
                        refreshBtn.innerHTML = '<i class="fas fa-arrows-rotate"></i> Refresh Location';
                        refreshBtn.disabled = false;
                    }
                },
                (err) => {
                    if (refreshBtn) {
                        refreshBtn.innerHTML = '<i class="fas fa-arrows-rotate"></i> Refresh Location';
                        refreshBtn.disabled = false;
                    }

                    console.info('Geolocation note (using fallback):', err.message);
                    if (promptUser) {
                        let errorMsg = 'Could not access GPS location. Please select manually.';
                        if (err.code === err.PERMISSION_DENIED) {
                            errorMsg = 'Location permission is disabled in browser settings. Please select manually.';
                        }
                        alert(errorMsg);
                        openManualLocationModal();
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0 // Always request fresh physical coordinates
                }
            );
        }

        function showLocationConfirmModal(loc) {
            document.getElementById('modalDetectedPlace').innerText = \`\${loc.city || loc.district || 'Detected Place'}\${loc.state ? ', ' + loc.state : ''}\`;
            document.getElementById('modalDetectedAddress').innerText = loc.formattedAddress || 'Coordinates verified';
            document.getElementById('modalDetectedAccuracy').innerHTML = \`<i class="fas fa-circle-check" style="color: #4ade80;"></i> Location accuracy: approximately \${Math.round(loc.accuracy || 25)} m\`;
            document.getElementById('locationConfirmModal').classList.add('active');
        }

        function closeLocationConfirmModal() {
            document.getElementById('locationConfirmModal').classList.remove('active');
        }

        async function confirmAndSaveDetectedLocation() {
            closeLocationConfirmModal();
            if (pendingDetectedLoc) {
                await syncLocationToDatabase(pendingDetectedLoc.lat, pendingDetectedLoc.lng, pendingDetectedLoc);
            }
        }

        async function syncLocationToDatabase(lat, lng, locMeta = {}) {
            currentLat = lat;
            currentLon = lng;
            currentCity = locMeta.city || currentCity;
            currentState = locMeta.state || currentState;
            currentDistrict = locMeta.district || currentDistrict;
            currentAccuracy = locMeta.accuracy || 0;

            if (currentMarker) map.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lng]).addTo(map);
            map.setView([lat, lng], 12);
            currentMarker.bindPopup(\`<b>\${farmer.name || 'Farmer'}'s Farm</b><br>\${currentCity}, \${currentState}\`).openPopup();

            updateLocationUI(currentCity, currentState, currentDistrict, lat, lng, currentAccuracy, locMeta.source || 'GPS');

            try {
                if (token) {
                    const res = await fetch(\`\${API_BASE_URL}/farmer/location\`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': \`Bearer \${token}\`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            lat,
                            lng,
                            accuracy: locMeta.accuracy || 0,
                            state: locMeta.state || '',
                            district: locMeta.district || '',
                            city: locMeta.city || '',
                            village: locMeta.village || '',
                            postalCode: locMeta.postalCode || '',
                            formattedAddress: locMeta.formattedAddress || '',
                            source: locMeta.source || 'GPS'
                        })
                    });

                    const data = await res.json();
                    if (data.success && data.farmer) {
                        farmer = { ...farmer, ...data.farmer };
                        localStorage.setItem('farmer', JSON.stringify(farmer));
                        
                        currentCity = data.farmer.city || currentCity;
                        currentState = data.farmer.state || currentState;
                        currentDistrict = data.farmer.district || currentDistrict;
                        currentAccuracy = data.farmer.accuracy || currentAccuracy;

                        updateLocationUI(currentCity, currentState, currentDistrict, lat, lng, currentAccuracy, data.farmer.locationSource);
                    }
                }
            } catch (err) {
                console.warn('Sync location API note:', err);
            }

            // Always update localStorage caches with fresh verified coordinates
            farmer = {
                ...farmer,
                city: currentCity,
                state: currentState,
                district: currentDistrict,
                accuracy: currentAccuracy,
                locationSource: locMeta.source || 'GPS',
                location: { type: 'Point', coordinates: [lng, lat] }
            };
            localStorage.setItem('farmer', JSON.stringify(farmer));
            localStorage.setItem('farmer_gps_location', JSON.stringify({
                lat,
                lon: lng,
                city: currentCity,
                state: currentState,
                district: currentDistrict,
                accuracy: currentAccuracy,
                source: locMeta.source || 'GPS',
                timestamp: Date.now()
            }));

            // Refresh all location-dependent telemetry and views
            await fetchWeather(lat, lng);
            await fetchForecast(lat, lng);
            fetchSeasonalCrops();
            if (typeof fetchDashboardMarketPrices === 'function') {
                fetchDashboardMarketPrices();
            }

            // Auto-refresh AI crop advisor if active
            const cropInput = document.getElementById('cropInput');
            if (cropInput && cropInput.value.trim() && lastAdvisedCrop) {
                fetchCropAdvice(lastAdvisedCrop);
            }

            window.dispatchEvent(new CustomEvent('krishi:locationUpdated', {
                detail: { lat, lon: lng, city: currentCity, state: currentState, district: currentDistrict, accuracy: currentAccuracy, source: locMeta.source || 'GPS' }
            }));
        }

        `;
    dashContent = dashContent.substring(0, detectStart) + updatedDetectionCode + dashContent.substring(detectEnd);
}

// Ensure automatic invocation of detectFarmerGpsLocation on startup
if (!dashContent.includes('detectFarmerGpsLocation(false);')) {
    const fetchWeatherCall = 'fetchWeather();\n        fetchForecast();';
    const updatedFetchWeatherCall = `fetchWeather();
        fetchForecast();

        // Immediately attempt fresh browser/device location detection on every new session/page load
        setTimeout(() => {
            detectFarmerGpsLocation(false);
        }, 150);`;
    dashContent = dashContent.replace(fetchWeatherCall, updatedFetchWeatherCall);
}

fs.writeFileSync(dashPath, dashContent, 'utf8');
console.log('Successfully updated frontend/dashboard.html with fresh location persistence logic!');

// 2. Update frontend/marketplace.html
const mktPath = path.join(__dirname, '..', 'frontend', 'marketplace.html');
let mktContent = fs.readFileSync(mktPath, 'utf8');

const mktInitStart = mktContent.indexOf('function initFarmerGpsCoordinates() {');
const mktInitEnd = mktContent.indexOf('// Initialize Page', mktInitStart);

if (mktInitStart !== -1 && mktInitEnd !== -1) {
    const updatedMktInitCode = `function initFarmerGpsCoordinates() {
            // 1. Check logged-in farmer profile in localStorage as fallback
            const farmer = JSON.parse(localStorage.getItem('farmer') || 'null');
            if (farmer) {
                const authBtn = document.getElementById('navAuthBtn') || document.getElementById('profileDropdownBtn');
                if (authBtn && farmer.name) {
                    const firstName = (farmer.name || 'Farmer').split(' ')[0];
                    authBtn.innerHTML = \`<i class="fas fa-user"></i> <span>\${firstName}</span>\`;
                }
                if (farmer.city && farmer.state) {
                    farmerLocation.city = \`\${farmer.city}, \${farmer.state}\`;
                    const locHdr = document.getElementById('userLocationHeader');
                    if (locHdr) locHdr.innerText = farmerLocation.city;
                }
                if (farmer.location?.coordinates && Array.isArray(farmer.location.coordinates)) {
                    farmerLocation.lon = farmer.location.coordinates[0];
                    farmerLocation.lat = farmer.location.coordinates[1];
                } else if (farmer.latitude && farmer.longitude) {
                    farmerLocation.lat = parseFloat(farmer.latitude);
                    farmerLocation.lon = parseFloat(farmer.longitude);
                }
            }

            // 2. Check saved session GPS as secondary fallback
            const savedGps = JSON.parse(localStorage.getItem('farmer_gps_location') || 'null');
            if (savedGps && savedGps.lat && savedGps.lon) {
                farmerLocation.lat = parseFloat(savedGps.lat);
                farmerLocation.lon = parseFloat(savedGps.lon);
                if (savedGps.city || savedGps.formattedAddress) {
                    farmerLocation.city = savedGps.city || savedGps.formattedAddress;
                    const locHdr = document.getElementById('userLocationHeader');
                    if (locHdr) locHdr.innerText = farmerLocation.city;
                }
            }

            // 3. ALWAYS attempt fresh GPS detection on startup with maximumAge: 0
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        farmerLocation.lat = pos.coords.latitude;
                        farmerLocation.lon = pos.coords.longitude;
                        farmerLocation.accuracy = pos.coords.accuracy || 0;
                        farmerLocation.isGpsVerified = true;

                        try {
                            const geoRes = await fetch(\`\${API_BASE_URL}/farmer/location/reverse-geocode?lat=\${farmerLocation.lat}&lon=\${farmerLocation.lon}\`);
                            const geoJson = await geoRes.json();
                            if (geoJson.success && geoJson.location) {
                                const l = geoJson.location;
                                farmerLocation.city = l.formattedAddress || \`\${l.city || l.district || 'Current Location'}, \${l.state || ''}\`;
                            }
                        } catch(e) {
                            console.warn('Geocode proxy note:', e);
                        }

                        const locHdr = document.getElementById('userLocationHeader');
                        if (locHdr) locHdr.innerText = farmerLocation.city;

                        localStorage.setItem('farmer_gps_location', JSON.stringify({
                            lat: farmerLocation.lat,
                            lon: farmerLocation.lon,
                            city: farmerLocation.city,
                            timestamp: Date.now()
                        }));

                        // Recalculate distance and re-render nearby markets and mandi listings
                        loadNearbyMarkets();
                        loadMandiPrices(1);
                    },
                    (err) => {
                        console.info('Marketplace GPS note: Using saved fallback location.', err.message);
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                );
            }
        }

        `;
    mktContent = mktContent.substring(0, mktInitStart) + updatedMktInitCode + mktContent.substring(mktInitEnd);
}

// Update requestGpsLocationManual in marketplace.html
const reqManualStart = mktContent.indexOf('function requestGpsLocationManual() {');
const reqManualEnd = mktContent.indexOf('function filterBySelectedMarket(', reqManualStart);

if (reqManualStart !== -1 && reqManualEnd !== -1) {
    const updatedReqManual = `function requestGpsLocationManual() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        farmerLocation.lat = pos.coords.latitude;
                        farmerLocation.lon = pos.coords.longitude;
                        farmerLocation.accuracy = pos.coords.accuracy || 0;
                        farmerLocation.isGpsVerified = true;

                        try {
                            const geoRes = await fetch(\`\${API_BASE_URL}/farmer/location/reverse-geocode?lat=\${farmerLocation.lat}&lon=\${farmerLocation.lon}\`);
                            const geoJson = await geoRes.json();
                            if (geoJson.success && geoJson.location) {
                                const l = geoJson.location;
                                farmerLocation.city = l.formattedAddress || \`\${l.city || l.district || 'Current Location'}, \${l.state || ''}\`;
                            }
                        } catch(e) {
                            console.warn('Geocode proxy note:', e);
                        }

                        const locHdr = document.getElementById('userLocationHeader');
                        if (locHdr) locHdr.innerText = farmerLocation.city;

                        localStorage.setItem('farmer_gps_location', JSON.stringify({
                            lat: farmerLocation.lat,
                            lon: farmerLocation.lon,
                            city: farmerLocation.city,
                            timestamp: Date.now()
                        }));

                        loadNearbyMarkets();
                        loadMandiPrices(1);
                    },
                    (err) => {
                        alert('Could not access GPS coordinates. Please enable location permissions in your browser.');
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        }

        `;
    mktContent = mktContent.substring(0, reqManualStart) + updatedReqManual + mktContent.substring(reqManualEnd);
}

fs.writeFileSync(mktPath, mktContent, 'utf8');
console.log('Successfully updated frontend/marketplace.html with fresh location persistence logic!');
