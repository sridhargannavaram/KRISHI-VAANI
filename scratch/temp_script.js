
        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        if (!isAuthenticated()) {
            window.location.href = 'login.html';
        }

        let farmer = JSON.parse(localStorage.getItem('farmer') || '{}');
        const token = localStorage.getItem('token');

        document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Location State
        let currentLat = farmer.location?.coordinates?.[1] || 17.3850;
        let currentLon = farmer.location?.coordinates?.[0] || 78.4867;
        let currentCity = farmer.city || 'Hyderabad';
        let currentState = farmer.state || 'Telangana';
        let currentDistrict = farmer.district || '';
        let currentAccuracy = farmer.accuracy || 0;
        let pendingDetectedLoc = null;

        // Display current location
        updateLocationUI(currentCity, currentState, currentDistrict, currentLat, currentLon, currentAccuracy, farmer.locationSource);

        function updateLocationUI(city, state, district, lat, lon, accuracy, source) {
            document.getElementById('userCity').innerText = city || district || 'India';
            
            let subtitle = [];
            if (district && district !== city) subtitle.push(district);
            if (state) subtitle.push(state);
            document.getElementById('userStateDistrict').innerText = subtitle.length > 0 ? `(${subtitle.join(', ')})` : '';

            const badge = document.getElementById('locationAccuracyBadge');
            if (source === 'MANUAL') {
                badge.innerHTML = '<i class="fas fa-pen-to-square"></i> Manual Location';
                badge.style.background = 'rgba(234, 179, 8, 0.15)';
                badge.style.color = '#facc15';
                badge.style.borderColor = 'rgba(234, 179, 8, 0.3)';
            } else if (accuracy && accuracy > 0) {
                badge.innerHTML = `<i class="fas fa-crosshairs"></i> Accuracy: ~${Math.round(accuracy)}m`;
                badge.style.background = 'rgba(34, 197, 94, 0.15)';
                badge.style.color = '#4ade80';
                badge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            } else {
                badge.innerHTML = '<i class="fas fa-crosshairs"></i> GPS Verified';
                badge.style.background = 'rgba(34, 197, 94, 0.15)';
                badge.style.color = '#4ade80';
                badge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            }

            if (document.getElementById('mapBadgeText')) {
                document.getElementById('mapBadgeText').innerText = `${city || 'Farm'} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
            }
        }

        // Profile Avatar Display
        const avatarDisplay = document.getElementById('avatarDisplay');
        function showAvatar(imageUrl) {
            if (!imageUrl) {
                if (avatarDisplay) avatarDisplay.innerText = getInitials(farmer.name || 'Farmer');
                return;
            }
            let src = imageUrl;
            if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
                src = `${API_BASE_URL.replace('/api', '')}/uploads/profiles/${imageUrl}`;
            }
            if (avatarDisplay) {
                avatarDisplay.outerHTML = `<img class="profile-avatar" id="avatarDisplay" src="${src}" alt="Profile" onerror="this.outerHTML='<div class=\\'avatar-initials\\' id=\\'avatarDisplay\\'>${getInitials(farmer.name || 'Farmer')}</div>'">`;
            }
        }

        showAvatar(farmer.profileImage);

        // Upload Profile Photo
        const profileInput = document.getElementById('profileUploadInput');
        if (profileInput) {
            profileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 5 * 1024 * 1024) {
                    alert('Image must be less than 5MB');
                    return;
                }

                const formData = new FormData();
                formData.append('profileImage', file);

                try {
                    const res = await fetch(`${API_BASE_URL}/profile/upload/${farmer.id}`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();

                    if (data.success) {
                        farmer.profileImage = data.profileImage;
                        localStorage.setItem('farmer', JSON.stringify(farmer));
                        showAvatar(data.profileImage);
                    } else {
                        alert(data.error || 'Upload failed');
                    }
                } catch (err) {
                    alert('Failed to upload image.');
                }
            });
        }

        let lastWeatherData = null;
        let currentLang = getAppLanguage();

        function updateUILanguage(lang) {
            currentLang = lang || getAppLanguage();
            
            // 1. Hero greeting & date
            const greetingEl = document.getElementById('greeting');
            if (greetingEl) greetingEl.innerText = `${t('dash_welcome')}, ${(farmer.name || 'Farmer').split(' ')[0]}! 🌱`;
            
            const localeMap = { en: 'en-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', hi: 'hi-IN' };
            const dateEl = document.getElementById('currentDate');
            if (dateEl) {
                try {
                    dateEl.innerText = new Date().toLocaleDateString(localeMap[currentLang] || 'en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                } catch(e) {
                    dateEl.innerText = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                }
            }

            // 2. Section Titles & Descriptions
            const seasonalTitle = document.getElementById('seasonalTitle');
            if (seasonalTitle) seasonalTitle.innerText = t('dash_seasonal_title');
            
            const advisorTitle = document.getElementById('cropAdvisorTitle');
            if (advisorTitle) advisorTitle.innerText = t('dash_advisor_title');
            
            const advisorDesc = document.getElementById('cropAdvisorDesc');
            if (advisorDesc) advisorDesc.innerText = t('dash_advisor_desc');
            
            const cropInput = document.getElementById('cropInput');
            if (cropInput) cropInput.placeholder = t('dash_crop_placeholder');
            
            const getAdviceBtn = document.getElementById('getCropAdviceBtn');
            if (getAdviceBtn) {
                const btnSpan = getAdviceBtn.querySelector('span');
                if (btnSpan) btnSpan.innerText = t('dash_get_advice');
            }

            const mapSearch = document.getElementById('mapSearch');
            if (mapSearch) mapSearch.placeholder = t('dash_map_search');

            // 3. Chatbot Initial Message
            const chatBotFirst = document.querySelector('#chatBody .chat-bubble.bot');
            if (chatBotFirst && (!chatBotFirst.dataset.userMessaged || chatBotFirst.dataset.userMessaged === 'false')) {
                chatBotFirst.innerText = t('dash_chat_greeting');
            }
            const chatInput = document.getElementById('chatInput');
            if (chatInput) chatInput.placeholder = t('dash_chat_placeholder');

            // 4. Weather stats labels
            const statLabels = {
                statHumidity: 'dash_humidity',
                statWind: 'dash_wind',
                statPressure: 'dash_pressure',
                statVisibility: 'dash_visibility',
                statFeelsLike: 'dash_feels_like'
            };
            Object.keys(statLabels).forEach(id => {
                const el = document.getElementById(id);
                if (el && el.nextElementSibling) el.nextElementSibling.innerText = t(statLabels[id]);
            });
        }

        updateUILanguage(currentLang);

        // Global language change listener
        window.addEventListener('krishi:languageChanged', (e) => {
            currentLang = e.detail.language || getAppLanguage();
            updateUILanguage(currentLang);
            fetchSeasonalCrops();
            // Auto-regenerate AI Crop Advisor if an advisory was already generated
            const cropInput = document.getElementById('cropInput');
            const adviceBox = document.getElementById('cropAdviceBox');
            if (cropInput && cropInput.value.trim() && adviceBox && adviceBox.querySelector('.advisor-result-card')) {
                fetchCropAdvice(cropInput.value.trim());
            }
        });

        // ========== INTERACTIVE MAP ==========
        const map = L.map('map').setView([currentLat, currentLon], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        let currentMarker = L.marker([currentLat, currentLon]).addTo(map)
            .bindPopup(`<b>${farmer.name || 'Farmer'}'s Farm</b><br>${currentCity}`).openPopup();

        setTimeout(() => map.invalidateSize(), 400);
        window.addEventListener('resize', () => map.invalidateSize());

        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            await syncLocationToDatabase(lat, lng, { source: 'MANUAL' });
        });

        async function detectFarmerGpsLocation(promptUser = false) {
            const refreshBtn = document.getElementById('btnRefreshGpsLocation');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
                refreshBtn.disabled = true;
            }

            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser. Please select your location manually.');
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
                        const geoRes = await fetch(`${API_BASE_URL}/farmer/location/reverse-geocode?lat=${lat}&lon=${lng}`);
                        const geoJson = await geoRes.json();
                        if (geoJson.success) geoData = geoJson.location;
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
                        formattedAddress: geoData.formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
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

                    let errorMsg = 'Could not access GPS location. Please select manually.';
                    if (err.code === err.PERMISSION_DENIED) {
                        errorMsg = 'Location permission is disabled in browser settings. Please select manually.';
                    }
                    if (promptUser) {
                        alert(errorMsg);
                        openManualLocationModal();
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }

        function showLocationConfirmModal(loc) {
            document.getElementById('modalDetectedPlace').innerText = `${loc.city || loc.district || 'Detected Place'}${loc.state ? ', ' + loc.state : ''}`;
            document.getElementById('modalDetectedAddress').innerText = loc.formattedAddress || 'Coordinates verified';
            document.getElementById('modalDetectedAccuracy').innerHTML = `<i class="fas fa-circle-check" style="color: #4ade80;"></i> Location accuracy: approximately ${Math.round(loc.accuracy || 25)} m`;
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

            if (currentMarker) map.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lng]).addTo(map);
            map.setView([lat, lng], 12);

            try {
                const res = await fetch(`${API_BASE_URL}/farmer/location`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
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
                    
                    currentCity = data.farmer.city || locMeta.city || 'Farm';
                    currentState = data.farmer.state || locMeta.state || '';
                    currentDistrict = data.farmer.district || locMeta.district || '';
                    currentAccuracy = data.farmer.accuracy || locMeta.accuracy || 0;

                    updateLocationUI(currentCity, currentState, currentDistrict, lat, lng, currentAccuracy, data.farmer.locationSource);
                    currentMarker.bindPopup(`<b>${farmer.name || 'Farmer'}'s Farm</b><br>${currentCity}, ${currentState}`).openPopup();
                }
            } catch (err) {
                updateLocationUI(locMeta.city || 'Farm', locMeta.state || '', locMeta.district || '', lat, lng, locMeta.accuracy, locMeta.source);
            }

            await fetchWeather(lat, lng);
            await fetchForecast(lat, lng);
            fetchSeasonalCrops();
        }

        function openManualLocationModal() {
            closeLocationConfirmModal();
            document.getElementById('manualLocationModal').classList.add('active');
            document.getElementById('manualLocationError').style.display = 'none';
        }

        function closeManualLocationModal() {
            document.getElementById('manualLocationModal').classList.remove('active');
        }

        function handleStateSelectChange(stateVal) {}

        async function saveManualLocationForm() {
            const state = document.getElementById('manualStateSelect').value.trim();
            const district = document.getElementById('manualDistrictInput').value.trim();
            const city = document.getElementById('manualCityInput').value.trim();
            const errBox = document.getElementById('manualLocationError');

            if (!state || !district) {
                errBox.innerText = 'Please select a State and enter a District.';
                errBox.style.display = 'block';
                return;
            }

            errBox.style.display = 'none';

            const queryStr = `${city ? city + ', ' : ''}${district}, ${state}, India`;
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1&countrycodes=in&accept-language=en`);
                const results = await geoRes.json();

                if (results.length > 0) {
                    const lat = parseFloat(results[0].lat);
                    const lng = parseFloat(results[0].lon);

                    closeManualLocationModal();
                    await syncLocationToDatabase(lat, lng, {
                        state,
                        district,
                        city: city || district,
                        formattedAddress: results[0].display_name,
                        source: 'MANUAL',
                        accuracy: 500
                    });
                } else {
                    errBox.innerText = 'Could not locate this district. Please check spelling.';
                    errBox.style.display = 'block';
                }
            } catch (e) {
                errBox.innerText = 'Error verifying location. Please try again.';
                errBox.style.display = 'block';
            }
        }

        // Map Search
        const searchInput = document.getElementById('mapSearch');
        const searchResults = document.getElementById('mapSearchResults');

        document.getElementById('mapSearchBtn').addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const q = searchInput.value.trim();
            if (q.length < 3) {
                searchResults.style.display = 'none';
                return;
            }
            searchTimeout = setTimeout(() => performSearch(), 400);
        });

        async function performSearch() {
            const query = searchInput.value.trim();
            if (!query) return;

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&accept-language=en`);
                const results = await res.json();

                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="result-item"><i class="fas fa-exclamation-circle"></i> No results found in India</div>';
                    searchResults.style.display = 'block';
                    return;
                }

                searchResults.innerHTML = results.map(r => `
                    <div class="result-item" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.display_name.split(',')[0]}" data-full="${r.display_name}">
                        <i class="fas fa-map-marker-alt"></i> ${r.display_name}
                    </div>
                `).join('');
                searchResults.style.display = 'block';

                searchResults.querySelectorAll('.result-item').forEach(item => {
                    item.addEventListener('click', async () => {
                        const lat = parseFloat(item.dataset.lat);
                        const lon = parseFloat(item.dataset.lon);
                        const name = item.dataset.name;
                        const full = item.dataset.full;
                        searchResults.style.display = 'none';
                        searchInput.value = name;
                        
                        await syncLocationToDatabase(lat, lon, {
                            city: name,
                            formattedAddress: full,
                            source: 'MANUAL',
                            accuracy: 100
                        });
                    });
                });
            } catch (e) {
                searchResults.innerHTML = '<div class="result-item"><i class="fas fa-exclamation-circle"></i> Search error</div>';
                searchResults.style.display = 'block';
            }
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.map-search-bar') && !e.target.closest('.map-search-results')) {
                searchResults.style.display = 'none';
            }
        });

        // Weather Telemetry
        async function fetchWeather(lat, lon) {
            lat = lat || currentLat;
            lon = lon || currentLon;
            try {
                const res = await fetch(`${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}`);
                const data = await res.json();
                lastWeatherData = data;

                const temp = Math.round(data.main.temp);
                const desc = data.weather[0].description;
                const iconCode = data.weather[0].icon;
                const feelsLike = Math.round(data.main.feels_like);
                const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) : '--';

                document.getElementById('currentWeatherBox').innerHTML = `
                    <img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="weather" width="100" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
                    <div>
                        <h2 style="font-size: 4.5rem; font-weight: 200; line-height: 1;">${temp}°</h2>
                        <p style="font-size: 1.1rem; font-weight: 600; text-transform: capitalize;">${desc}</p>
                    </div>
                `;
                document.getElementById('statHumidity').innerText = `${data.main.humidity}%`;
                document.getElementById('statWind').innerText = `${data.wind?.speed || 0} m/s`;
                document.getElementById('statPressure').innerText = `${data.main.pressure} hPa`;
                document.getElementById('statVisibility').innerText = `${visibility} km`;
                document.getElementById('statFeelsLike').innerText = `${feelsLike}°`;

                updateTodayAgriStatus(lastWeatherData, lastForecastData);
            } catch (e) {
                document.getElementById('currentWeatherBox').innerHTML = `<p>Error loading weather.</p>`;
            }
        }

        let lastForecastData = null;

        async function fetchForecast(lat, lon) {
            lat = lat || currentLat;
            lon = lon || currentLon;
            try {
                const res = await fetch(`${API_BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}`);
                const data = await res.json();
                lastForecastData = data;

                let html = '';
                (data.list || []).slice(0, 8).forEach(item => {
                    const time = new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const temp = Math.round(item.main.temp);
                    const iconCode = item.weather[0].icon;
                    html += `
                        <div class="forecast-item">
                            <div style="font-size: 0.8em; color: var(--text-secondary);">${time}</div>
                            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="icon" width="40">
                            <div style="font-weight: 700; font-size: 1.1rem;">${temp}°</div>
                        </div>
                    `;
                });
                document.getElementById('forecastBox').innerHTML = html;

                updateTodayAgriStatus(lastWeatherData, lastForecastData);
            } catch (e) {
                document.getElementById('forecastBox').innerHTML = `<p>Error loading forecast.</p>`;
            }
        }

        fetchWeather();
        fetchForecast();

        // ================= TODAY'S AGRICULTURAL STATUS ENGINE =================
        function updateTodayAgriStatus(weatherData, forecastData) {
            const titleEl = document.getElementById('agriStatusTitle');
            if (titleEl && typeof t === 'function') {
                titleEl.innerHTML = `<i class="fas fa-satellite-dish" style="color: #22c55e;"></i> ${t('dash_agri_status_title') || "Today's Agricultural Status"}`;
            }
            const lblCropEl = document.getElementById('lblCropAlerts');
            if (lblCropEl && typeof t === 'function') {
                lblCropEl.innerHTML = `<i class="fas fa-shield-virus" style="color: #ea580c;"></i> ${t('dash_crop_alerts') || "Crop & Disease Risk"}`;
            }
            const lblWeatherEl = document.getElementById('lblWeatherRisk');
            if (lblWeatherEl && typeof t === 'function') {
                lblWeatherEl.innerHTML = `<i class="fas fa-cloud-sun-rain" style="color: #3b82f6;"></i> ${t('dash_weather_risk') || "Weather / Rain Risk"}`;
            }
            const lblRecEl = document.getElementById('lblRecAction');
            if (lblRecEl && typeof t === 'function') {
                lblRecEl.innerHTML = `<i class="fas fa-list-check" style="color: #10b981;"></i> ${t('dash_rec_action') || "Recommended Action"}`;
            }

            const locParts = [currentCity, currentDistrict, currentState].filter(Boolean);
            const placeEl = document.getElementById('agriStatusPlaceName');
            if (placeEl) {
                placeEl.innerText = locParts.length > 0 ? locParts.join(', ') : 'Local Farm';
            }

            if (!weatherData || !weatherData.main) return;

            const temp = Math.round(weatherData.main.temp);
            const humidity = weatherData.main.humidity || 0;
            const wind = weatherData.wind?.speed || 0;
            const weatherMain = (weatherData.weather?.[0]?.main || '').toLowerCase();
            const weatherDesc = weatherData.weather?.[0]?.description || 'Clear';

            // Update Telemetry chip
            const telemTemp = document.getElementById('intelTelemTemp');
            const telemHum = document.getElementById('intelTelemHum');
            if (telemTemp) telemTemp.innerText = `${temp}°C`;
            if (telemHum) telemHum.innerText = `${humidity}% Humidity`;

            // Active Language
            const lang = typeof getAppLanguage === 'function' ? getAppLanguage() : (localStorage.getItem('krishiLang') || 'en');

            // 1. Crop Alerts Evaluation
            let cropBadgeText = '';
            let cropBadgeClass = '';
            let cropSubText = '';
            let cropDescText = '';

            if (humidity >= 80) {
                cropBadgeText = lang === 'kn' ? 'ಹೆಚ್ಚು' : lang === 'te' ? 'అధికం' : lang === 'ta' ? 'அதிகம்' : lang === 'ml' ? 'ഉയർന്നത്' : lang === 'hi' ? 'उच्च' : 'High';
                cropBadgeClass = 'status-pill-high';
                cropSubText = lang === 'kn' ? 'ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯ' : lang === 'te' ? 'శిలీంధ్ర వ్యాధి ముప్పు' : lang === 'ta' ? 'பூஞ்சை நோய் ஆபத்து' : lang === 'ml' ? 'കുമിൾ രോഗ സാധ്യത' : lang === 'hi' ? 'फफूंद रोग जोखिम' : 'High Fungal Spore Risk';
                cropDescText = lang === 'kn' ? `ಹೆಚ್ಚಿನ ತೇವಾಂಶ (${humidity}%) ನಿಂದ ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಬೂದಿ ರೋಗ ಹರಡುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು. ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಿ.` :
                               lang === 'te' ? `అధిక తేమ (${humidity}%) కారణంగా ఆకుమచ్చ మరియు బూడిద తెగులు వ్యాపించే అవకాశం ఉంది. ఆకుల అడుగు భాగాన్ని గమనించండి.` :
                               lang === 'ta' ? `அதிக ஈரப்பதம் (${humidity}%) காரணமாக இலைப்புள்ளி மற்றும் பூஞ்சை நோய் பரவ வாய்ப்புள்ளது. இலைகளின் அடிப்பகுதியை கண்காணிக்கவும்.` :
                               lang === 'ml' ? `കൂടിയ ഈർപ്പം (${humidity}%) കാരണം ഇലപ്പുള്ളി, കുമിൾ രോഗങ്ങൾ പടരാൻ സാധ്യത. ഇലകളുടെ അടിഭാഗം പരിശോധിക്കുക.` :
                               lang === 'hi' ? `अत्यधिक नमी (${humidity}%) के कारण पत्तियों पर धब्बा व फफूंद जनित रोगों का जोखिम अधिक है। निचली पत्तियों का निरीक्षण करें।` :
                               `Elevated humidity (${humidity}%) creates prime conditions for foliar fungal pathogens and leaf spots. Inspect lower canopy.`;
            } else if (humidity >= 65 || temp >= 34) {
                cropBadgeText = lang === 'kn' ? 'ಮಧ್ಯಮ' : lang === 'te' ? 'ಮಧ್ಯಸ್ಥಂ' : lang === 'ta' ? 'மிதமான' : lang === 'ml' ? 'മിതമായത്' : lang === 'hi' ? 'मध्यम' : 'Moderate';
                cropBadgeClass = 'status-pill-moderate';
                cropSubText = lang === 'kn' ? 'ತೇವಾಂಶ ಮತ್ತು ಕೀಟ ನಿಗಾ' : lang === 'te' ? 'తేమ మరియు కీటక నిఘా' : lang === 'ta' ? 'ஈரப்பதம் மற்றும் பூச்சி கண்காணிப்பு' : lang === 'ml' ? 'കീട നിരീക്ഷണം' : lang === 'hi' ? 'कीट व नमी निगरानी' : 'Pest & Moisture Risk';
                cropDescText = lang === 'kn' ? `ಪ್ರಸ್ತುತ ${temp}°C ತಾಪಮಾನ ಮತ್ತು ${humidity}% ತೇವಾಂಶವಿದ್ದು ಕೀಟಗಳ ಬಾಧೆ ಸಾಧಾರಣವಾಗಿದೆ. ಬೆಳೆಗೆ ನಿಯಮಿತ ನೀರೊದಗಿಸಿ.` :
                               lang === 'te' ? `ప్రస్తుత ${temp}°C ఉష్ణోగ్రత మరియు ${humidity}% తేమతో రసం పీల్చే పురుగుల ప్రభావం మోస్తరుగా ఉంది. పంటను నిరంతరం గమనించండి.` :
                               lang === 'ta' ? `தற்போதைய ${temp}°C வெப்பநிலை மற்றும் ${humidity}% ஈரப்பதத்தில் பூச்சி தாக்குதல் மிதமாக இருக்கும். பயிரை தொடர்ந்து கண்காணிக்கவும்.` :
                               lang === 'ml' ? `നിലവിലെ ${temp}°C താപനിലയിലും ${humidity}% ഈർപ്പത്തിലും കീടബാധ മിതമായ തോതിൽ ഉണ്ടാകാം. നിരീക്ഷണം തുടരുക.` :
                               lang === 'hi' ? `वर्तमान ${temp}°C तापमान और ${humidity}% नमी में कीट प्रकोप मध्यम स्तर पर है। नियमित खेत निरीक्षण बनाए रखें।` :
                               `Current conditions (${temp}°C, ${humidity}% humidity) show moderate pest activity. Monitor field boundaries regularly.`;
            } else {
                cropBadgeText = lang === 'kn' ? 'ಕಡಿಮೆ' : lang === 'te' ? 'తక్కువ' : lang === 'ta' ? 'குறைவு' : lang === 'ml' ? 'കുറഞ്ഞത്' : lang === 'hi' ? 'निम्न' : 'Low';
                cropBadgeClass = 'status-pill-low';
                cropSubText = lang === 'kn' ? 'ಸಾಮಾನ್ಯ ಬೆಳೆ ಆರೋಗ್ಯ' : lang === 'te' ? 'సాధారణ పంట ఆరోగ్యం' : lang === 'ta' ? 'சாதாரண பயிர் நிலை' : lang === 'ml' ? 'സാധാരണ വിള ആരോഗ്യം' : lang === 'hi' ? 'सामान्य फसल स्वास्थ्य' : 'Normal Crop Health';
                cropDescText = lang === 'kn' ? `ತಾಪಮಾನ (${temp}°C) ಮತ್ತು ತೇವಾಂಶ (${humidity}%) ಹತೋಟಿಯಲ್ಲಿದ್ದು ಬೆಳೆಗಳ ಬೆಳವಣಿಗೆಗೆ ಅನುಕೂಲಕರ ವಾತಾವರಣವಿದೆ.` :
                               lang === 'te' ? `ఉష్ణోగ్రత (${temp}°C) మరియు తేమ (${humidity}%) సాధారణంగా ఉండి పంట ఆరోగ్యకరమైన ఎదుగుదలకు అనుకూలంగా ఉంది.` :
                               lang === 'ta' ? `வெப்பநிலை (${temp}°C) மற்றும் ஈரப்பதம் (${humidity}%) கட்டுக்குள் உள்ளதால் பயிர்கள் ஆரோக்கியமாக வளர உகந்தது.` :
                               lang === 'ml' ? `താപനിലയും (${temp}°C) ഈർപ്പവും (${humidity}%) അനുകൂലമായതിനാൽ വിളകൾക്ക് കാര്യമായ രോഗസാധ്യതയില്ല.` :
                               lang === 'hi' ? `तापमान (${temp}°C) और नमी (${humidity}%) अनुकूल स्तर पर हैं। फसलों में किसी गंभीर रोग का खतरा नहीं है।` :
                               `Balanced weather conditions (${temp}°C, ${humidity}% RH) support healthy vegetative development without immediate threat.`;
            }

            // 2. Weather Risk Evaluation
            let weatherBadgeText = '';
            let weatherBadgeClass = '';
            let weatherSubText = '';
            let weatherDescText = '';

            let forecastRainCount = 0;
            let forecastRainVol = 0;
            if (forecastData && Array.isArray(forecastData.list)) {
                forecastData.list.slice(0, 8).forEach(item => {
                    const r = item.rain?.['3h'] || 0;
                    forecastRainVol += r;
                    if (r > 0 || (item.weather?.[0]?.main || '').toLowerCase().includes('rain')) {
                        forecastRainCount++;
                    }
                });
            }

            const isCurrentlyRaining = weatherMain.includes('rain') || weatherMain.includes('drizzle') || weatherMain.includes('thunderstorm');

            if (isCurrentlyRaining || forecastRainCount >= 4 || forecastRainVol >= 15) {
                weatherBadgeText = lang === 'kn' ? 'ಹೆಚ್ಚು' : lang === 'te' ? 'అధికం' : lang === 'ta' ? 'அதிகம்' : lang === 'ml' ? 'ഉയർന്നത്' : lang === 'hi' ? 'उच्च' : 'High';
                weatherBadgeClass = 'status-pill-high';
                weatherSubText = lang === 'kn' ? 'ಭಾರೀ ಮಳೆಯ ಎಚ್ಚರಿಕೆ' : lang === 'te' ? 'భారీ వర్ష సూచన' : lang === 'ta' ? 'கனமழை எச்சரிக்கை' : lang === 'ml' ? 'ശക്തമായ മഴ മുന്നറിയിപ്പ്' : lang === 'hi' ? 'भारी वर्षा चेतावनी' : 'Heavy Rainfall Alert';
                weatherDescText = lang === 'kn' ? `ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಗಮನಾರ್ಹ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರೆಯಿರಿ.` :
                                  lang === 'te' ? `రాబోయే 24 గంటల్లో భారీ వర్ష సూచన ఉంది. పొలంలో మురుగునీరు నిల్వ ఉండకుండా తక్షణ చర్యలు తీసుకోండి.` :
                                  lang === 'ta' ? `அடுத்த 24 மணி நேரத்தில் கனமழை பெய்ய வாய்ப்புள்ளது. வயலில் நீர் தேங்குவதை தவிர்க்க வடிகால்களை சரிசெய்யவும்.` :
                                  lang === 'ml' ? `അടുത്ത 24 മണിക്കൂറിൽ കനത്ത മഴയ്ക്ക് സാധ്യത. പാടങ്ങളിൽ വെള്ളം കയറാതെ ഡ്രെയിനേജ് സുഗമമാക്കുക.` :
                                  lang === 'hi' ? `अगले 24 घंटों में भारी बारिश की संभावना है। खेतों से पानी निकासी के लिए तुरंत नालियां साफ रखें।` :
                                  `Significant rainfall projected in the next 24-48 hours. Ensure field drainage channels are clear of debris.`;
            } else if (forecastRainCount > 0 || forecastRainVol > 0 || weatherMain.includes('cloud')) {
                weatherBadgeText = lang === 'kn' ? 'ಮಧ್ಯಮ' : lang === 'te' ? 'ಮಧ್ಯಸ್ಥಂ' : lang === 'ta' ? 'மிதமான' : lang === 'ml' ? 'மிതമായത്' : lang === 'hi' ? 'मध्यम' : 'Moderate';
                weatherBadgeClass = 'status-pill-moderate';
                weatherSubText = lang === 'kn' ? 'ಮಳೆ ಮತ್ತು ಮೋಡ ಕವಿದ ವಾತಾವರಣ' : lang === 'te' ? 'తేలికపాటి జల్లులు' : lang === 'ta' ? 'மிதமான மழை வாய்ப்பு' : lang === 'ml' ? 'ചെറിയ മഴ സാധ്യത' : lang === 'hi' ? 'हल्की बारिश व बादल' : 'Light Showers Expected';
                weatherDescText = lang === 'kn' ? `ಮೋಡ ಕವಿದ ವಾತಾವರಣ ಮತ್ತು ಅಲ್ಲಲ್ಲಿ ಲಘು ಮಳೆಯ ಸಾಧ್ಯತೆ ಇದೆ. ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಮಳೆಯಿಲ್ಲದ ಸಮಯವನ್ನು ಆರಿಸಿ.` :
                                  lang === 'te' ? `మేఘావృత వాతావరణం మరియు తేలికపాటి జల్లులు కురిసే అవకాశం ఉంది. పురుగుమందుల పిచికారీని వాయిదా వేయండి.` :
                                  lang === 'ta' ? `மேகமூட்டத்துடன் லேசான மழை பெய்ய வாய்ப்புள்ளது. பூச்சிக்கொல்லி தெளிப்பதை தற்காலிகமாக தள்ளிப்போடவும்.` :
                                  lang === 'ml' ? `മേഘാവൃതമായ അന്തരീക്ഷവും ചെറിയ മഴയും ഉണ്ടാകാം. മരുന്ന് തളിക്കുന്നത് മഴ ഒഴിഞ്ഞ സമയത്തേക്ക് മാറ്റുക.` :
                                  lang === 'hi' ? `बादल छाए रहने और हल्की बूंदाबांदी की संभावना है। कीटनाशक छिड़काव के लिए वर्षा रहित समय चुनें।` :
                                  `Intermittent cloud cover and scattered light showers expected. Plan pesticide spraying during dry intervals.`;
            } else {
                weatherBadgeText = lang === 'kn' ? 'ಕಡಿಮೆ' : lang === 'te' ? 'తక్కువ' : lang === 'ta' ? 'குறைவு' : lang === 'ml' ? 'കുറഞ്ഞത്' : lang === 'hi' ? 'निम्न' : 'Low';
                weatherBadgeClass = 'status-pill-low';
                weatherSubText = lang === 'kn' ? 'ಸ್ವಚ್ಛ ಹವಾಮಾನ' : lang === 'te' ? 'అనుకూల వాతావరణం' : lang === 'ta' ? 'தெளிவான வானிலை' : lang === 'ml' ? 'തെളിഞ്ഞ കാലാവസ്ഥ' : lang === 'hi' ? 'स्वच्छ मौसम' : 'Clear Conditions';
                weatherDescText = lang === 'kn' ? `ಹವಾಮಾನ ಸ್ವಚ್ಛವಾಗಿದ್ದು ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇಲ್ಲ. ಕಟಾವು, ಉಳುಮೆ ಹಾಗೂ ರಸಗೊಬ್ಬರ ಹಾಕಲು ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.` :
                                  lang === 'te' ? `వాతావరణం స్వచ్ఛంగా ఉంది మరియు వర్ష సూచన లేదు. పంట కోత మరియు ఎరువుల నిర్వహణకు అనువైన రోజు.` :
                                  lang === 'ta' ? `வானிலை சீராகவும் தெளிவாகவும் உள்ளது. அறுவடை மற்றும் உரமிடுதல் பணிகளை தடையின்றி செய்யலாம்.` :
                                  lang === 'ml' ? `തെളിഞ്ഞ കാലാവസ്ഥയാണ് നിലവിലുള്ളത്. കൊയ്ത്ത്, വളപ്രയോഗം എന്നിവയ്ക്ക് ഏറ്റവും അനുയോജ്യം.` :
                                  lang === 'hi' ? `मौसम साफ है और बारिश की संभावना नहीं है। कटाई, जुताई और उर्वरक देने के लिए दिन अनुकूल है।` :
                                  `Clear to stable skies with no rain interference. Ideal for harvesting, field preparation, and fertilizing.`;
            }

            // 3. Recommended Action Evaluation
            let recBadgeText = lang === 'kn' ? 'ಶಿಫಾರಸು' : lang === 'te' ? 'సిఫార్సు' : lang === 'ta' ? 'பரிந்துரை' : lang === 'ml' ? 'നിർദ്ദേശം' : lang === 'hi' ? 'अनुशंसित' : 'Recommended';
            let recBadgeClass = 'status-pill-action';
            let recSubText = '';
            let recActions = [];

            if (weatherBadgeClass === 'status-pill-high') {
                recSubText = lang === 'kn' ? 'ನೀರು ಬಸಿದು ಹೋಗುವಿಕೆ' : lang === 'te' ? 'మురుగు నీటి యాజమాన్యం' : lang === 'ta' ? 'வடிகால் மேலாண்மை' : lang === 'ml' ? 'ഡ്രെയിനേജ് ക്രമീകരണം' : lang === 'hi' ? 'जल निकासी प्रबंधन' : 'Drainage & Sheltering';
                recActions = lang === 'kn' ? [
                    'ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.',
                    'ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮತ್ತು ಮೇಲುಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು ನಿಲ್ಲಿಸಿ.',
                    'ಕಟಾವು ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ರಕ್ಷಿಸಿ.'
                ] : lang === 'te' ? [
                    'పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాలువలు శుభ్రం చేయండి.',
                    'పురుగుమందులు మరియు పైపాటు ఎరువుల వాడకాన్ని నిలిపివేయండి.',
                    'కోత కోసిన ధాన్యాన్ని సురక్షితమైన ప్రదేశంలో నిల్వ చేయండి.'
                ] : lang === 'ta' ? [
                    'வயலில் நீர் தேங்காமல் வடிகால் அமைக்கவும்.',
                    'பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும்.',
                    'அறுவடை செய்த பயிர்களை பாதுகாப்பாக வைக்கவும்.'
                ] : lang === 'ml' ? [
                    'വെള്ളക്കെട്ട് ഒഴിവാക്കാൻ ചാലുകൾ വൃത്തിയാക്കുക.',
                    'മരുന്ന് തളിക്കുന്നത് മാറ്റിവെക്കുക.',
                    'വിളവെടുത്ത ധാന്യങ്ങൾ സുരക്ഷിതമായി സൂക്ഷിക്കുക.'
                ] : lang === 'hi' ? [
                    'खेतों से अतिरिक्त पानी निकासी की व्यवस्था करें।',
                    'किसी भी प्रकार का रासायनिक छिड़काव रोकें।',
                    'कटी हुई फसल को सुरक्षित सूखे स्थान पर रखें।'
                ] : [
                    'Ensure clear field drainage to prevent waterlogging.',
                    'Suspend foliar spray and top-dressing fertilizers.',
                    'Secure harvested crops under waterproof shelter.'
                ];
            } else if (humidity >= 75) {
                recSubText = lang === 'kn' ? 'ಕಳೆ ಕೀಳುವಿಕೆ ಮತ್ತು ನಿಗಾ' : lang === 'te' ? 'కలుపు తీత & పర్యవేక్షణ' : lang === 'ta' ? 'களை மேலாண்மை & கவனிப்பு' : lang === 'ml' ? 'കളപറി & നിരീക്ഷണം' : lang === 'hi' ? 'निराई व निगरानी' : 'Weeding & Monitoring';
                recActions = lang === 'kn' ? [
                    'ಸಸ್ಯಗಳ ನಡುವೆ ಉತ್ತಮ ಗಾಳಿ ಬೀಸಲು ಕಳೆ ಕೀಳಿರಿ.',
                    'ಎಲೆಗಳ ತಳಭಾಗದಲ್ಲಿ ಬೂದಿ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ.',
                    'ಅಗತ್ಯವಿದ್ದರೆ ಮಾತ್ರ ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ ಬಳಸಿ.'
                ] : lang === 'te' ? [
                    'గాలి ప్రసరణ మెరుగుపరచడానికి కలుపు మొక్కలను తొలగించండి.',
                    'తెగుళ్ల ఆనవాళ్లను ఎప్పటికప్పుడు గమనించండి.',
                    'అవసరమైతే జీవ శిలీంధ్రనాశిని పిచికారీ చేయండి.'
                ] : lang === 'ta' ? [
                    'காற்றோட்டத்திற்காக களையெடுப்பு செய்யவும்.',
                    'இலைகளில் பூஞ்சை தாக்குதல் உள்ளதா என பார்க்கவும்.',
                    'தேவைப்பட்டால் உயிரியல் பூஞ்சாணக்கொல்லி தெளிக்கவும்.'
                ] : lang === 'ml' ? [
                    'കാറ്റ് കടക്കാൻ കളകൾ നീക്കം ചെയ്യുക.',
                    'കുമിൾ രോഗങ്ങൾ ശ്രദ്ധിക്കുക.',
                    'ആവശ്യമെങ്കിൽ ജൈവ കുമിൾനാശിനി ഉപയോഗിക്കുക.'
                ] : lang === 'hi' ? [
                    'पौधों के बीच हवा के संचार के लिए खरपतवार निकालें।',
                    'पत्तियों पर फफूंद के लक्षणों की जांच करें।',
                    'आवश्यकतानुसार ट्राइकोडर्मा या जैविक फफूंदनाशी का उपयोग करें।'
                ] : [
                    'Perform weeding to improve aeration between crop rows.',
                    'Inspect lower foliage for fungal spots or white powder.',
                    'Consider preventive bio-fungicide if symptoms emerge.'
                ];
            } else {
                recSubText = lang === 'kn' ? 'ನೀರಾವರಿ ಮತ್ತು ಮಲ್ಚಿಂಗ್' : lang === 'te' ? 'నీటితడులు & మల్చింగ్' : lang === 'ta' ? 'பாசனம் & மூடாக்கு' : lang === 'ml' ? 'നന & പുതയിടൽ' : lang === 'hi' ? 'संतुलित सिंचाई' : 'Monitor + Irrigate';
                recActions = lang === 'kn' ? [
                    'ಬೆಳೆಗಳಿಗೆ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಲಘು ನೀರಾವರಿ ಒದಗಿಸಿ.',
                    'ಹೊಲದಲ್ಲಿ ಕಳೆ ತೆಗೆಯುವಿಕೆ ಹಾಗೂ ಮಣ್ಣು ಸಡಿಲಗೊಳಿಸುವ ಕೆಲಸ ಮುಗಿಸಿ.',
                    'ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಾಪಾಡಲು ಸಾವಯವ ಹೊದಿಕೆ ಬಳಸಿ.'
                ] : lang === 'te' ? [
                    'పంట అవసరాన్ని బట్టి సమతుల్య నీటి తడులు అందించండి.',
                    'ಕಲುపు తీత మరియు అంతరకృషి పనులను పూర్తి చేయండి.',
                    'నేలలో తేమ ఆరిపోకుండా రక్షక కవచం (మల్చింగ్) ఏర్పాటు చేయండి.'
                ] : lang === 'ta' ? [
                    'பயிர்களுக்கு தேவையான அளவு பாசனம் செய்யவும்.',
                    'களையெடுத்தல் மற்றும் மண் தளர்த்துதல் பணிகளை மேற்கொள்ளவும்.',
                    'மண்ணின் ஈரப்பதத்தை காக்க மூடாக்கு இடவும்.'
                ] : lang === 'ml' ? [
                    'ആവശ്യാനുസരണം നന നൽകുക.',
                    'കളപറി, ഇടയിളക്കൽ ജോലികൾ പൂർത്തിയാക്കുക.',
                    'ഈർപ്പം നിലനിർത്താൻ പുതയിടുക.'
                ] : lang === 'hi' ? [
                    'आवश्यकतानुसार हल्की एवं संतुलित सिंचाई करें।',
                    'निराई-गुड़ाई और खेत की तैयारी के कार्य निपटाएं।',
                    'मिट्टी में नमी बनाए रखने के लिए पलवार (मल्चिंग) का प्रयोग करें।'
                ] : [
                    'Apply scheduled protective irrigation during early morning.',
                    'Carry out intercultural operations and weed management.',
                    'Maintain soil mulch to conserve root zone moisture.'
                ];
            }

            // Update DOM Elements
            const badgeCropAlerts = document.getElementById('badgeCropAlerts');
            const subCropAlerts = document.getElementById('subCropAlerts');
            const descCropAlerts = document.getElementById('descCropAlerts');
            if (badgeCropAlerts) {
                badgeCropAlerts.className = `agri-intel-status-pill ${cropBadgeClass}`;
                badgeCropAlerts.innerText = cropBadgeText;
            }
            if (subCropAlerts) {
                subCropAlerts.innerText = cropSubText;
            }
            if (descCropAlerts) {
                descCropAlerts.innerText = cropDescText;
            }

            const badgeWeatherRisk = document.getElementById('badgeWeatherRisk');
            const subWeatherRisk = document.getElementById('subWeatherRisk');
            const descWeatherRisk = document.getElementById('descWeatherRisk');
            if (badgeWeatherRisk) {
                badgeWeatherRisk.className = `agri-intel-status-pill ${weatherBadgeClass}`;
                badgeWeatherRisk.innerText = weatherBadgeText;
            }
            if (subWeatherRisk) {
                subWeatherRisk.innerText = weatherSubText;
            }
            if (descWeatherRisk) {
                descWeatherRisk.innerText = weatherDescText;
            }

            const badgeRecAction = document.getElementById('badgeRecAction');
            const subRecAction = document.getElementById('subRecAction');
            const descRecAction = document.getElementById('descRecAction');
            if (badgeRecAction) {
                badgeRecAction.className = `agri-intel-status-pill ${recBadgeClass}`;
                badgeRecAction.innerText = recBadgeText;
            }
            if (subRecAction) {
                subRecAction.innerText = recSubText;
            }
            if (descRecAction) {
                descRecAction.innerHTML = recActions.map((act, idx) => `
                    <div class="agri-intel-action-item">
                        <span class="agri-intel-action-num">${idx + 1}</span>
                        <span>${escapeHtml(act)}</span>
                    </div>
                `).join('');
            }
        }

        // ================= STRUCTURED UI RENDERER FOR SEASONAL CROPS =================
        function renderSeasonalCropsUI(rawText) {
            if (!rawText || !rawText.trim()) {
                return '<p style="color: var(--text-secondary); padding: 0.5rem 0;">No seasonal recommendations available at this time.</p>';
            }

            // Remove decorative emojis
            let cleanText = rawText
                .replace(/🌾|🌿|⚠️|🧑‍🌾|🌱|☀️|💧|🌧️|🚜/g, '')
                .trim();

            const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
            
            let headline = '';
            const crops = [];
            let tip = '';
            let caution = '';

            lines.forEach(line => {
                // Headline match
                if (line.match(/^(\**|#|\s*)*(Top|Recommended|Kharif|Rabi|Summer|Seasonal|ಶಿಫಾರಸು|ಸಿಫಾರ್ಸು|பரிந்துரை|मौसमी)/i) && !line.match(/^\d+[\.\)]/)) {
                    headline = line.replace(/[*#]/g, '').trim();
                    return;
                }

                // Numbered crop items: "1. Ragi - reason"
                const numMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
                if (numMatch) {
                    const fullContent = numMatch[2].trim();
                    let cropName = '';
                    let cropReason = '';

                    const dashSplit = fullContent.split(/\s*[-–—:]\s*(.+)/);
                    if (dashSplit.length > 1) {
                        cropName = dashSplit[0].replace(/[*_]/g, '').trim();
                        cropReason = dashSplit[1].replace(/[*_]/g, '').trim();
                    } else {
                        const boldMatch = fullContent.match(/^\*\*(.*?)\*\*(.*)/);
                        if (boldMatch) {
                            cropName = boldMatch[1].trim();
                            cropReason = boldMatch[2].replace(/^[-\s:]+/, '').trim();
                        } else {
                            cropName = fullContent.replace(/[*_]/g, '').trim();
                        }
                    }

                    crops.push({
                        num: numMatch[1],
                        name: cropName,
                        reason: cropReason
                    });
                    return;
                }

                // Farming Tip match
                if (line.match(/Tip|Farming Tip|ರೈತರ ಸಲಹೆ|రైతు సూచన|விவசாய குறிப்பு|किसान सलाह/i)) {
                    tip = line.replace(/^.*?(Tip|Farming Tip|ರೈತರ ಸಲಹೆ|రైತು సూచన|விவசாய குறிப்பு|किसान सलाह)\s*[:：\*\-]+\s*/i, '').replace(/[*_]/g, '').trim();
                    return;
                }

                // Caution / Alert match
                if (line.match(/Caution|Warning|Alert|ಎಚ್ಚರಿಕೆ|హెచ్చరిక|எச்சரிக்கை|सावधानी/i)) {
                    caution = line.replace(/^.*?(Caution|Warning|Alert|ಎಚ್ಚರಿಕೆ|హెచ్చరిక|எச்சரிக்கை|सावधानी)\s*[:：\*\-]+\s*/i, '').replace(/[*_]/g, '').trim();
                    return;
                }
            });

            // Dynamic Location String for Title
            const locParts = [currentDistrict, currentState].filter(Boolean);
            const dynamicLocTitle = locParts.length > 0 ? locParts.join(', ') : (currentState || 'India');

            // If parsed structured crops successfully
            if (crops.length > 0) {
                let html = '';
                html += `<div class="seasonal-headline"><i class="fas fa-calendar-check"></i> <span>Top Recommended Crops — ${escapeHtml(dynamicLocTitle)}</span></div>`;
                html += '<div class="seasonal-crops-list">';
                crops.forEach((c, idx) => {
                    html += `
                        <div class="seasonal-crop-item">
                            <div class="crop-num-badge">${c.num || (idx + 1)}</div>
                            <div class="crop-info-body">
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                                    <span class="crop-name-title">${escapeHtml(c.name)}</span>
                                    <span class="agri-intel-status-pill status-pill-low" style="font-size: 0.62rem; padding: 0.1rem 0.45rem;">Suitable</span>
                                </div>
                                ${c.reason ? `<div class="crop-reason-text" style="margin-top: 0.2rem;">${escapeHtml(c.reason)}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';

                if (tip) {
                    html += `
                        <div class="seasonal-tip-card">
                            <i class="fas fa-lightbulb"></i>
                            <div class="seasonal-tip-content">
                                <div class="seasonal-tip-title">Farming Tip</div>
                                <div class="seasonal-tip-desc">${escapeHtml(tip)}</div>
                            </div>
                        </div>
                    `;
                }

                if (caution) {
                    html += `
                        <div class="seasonal-caution-card">
                            <i class="fas fa-triangle-exclamation"></i>
                            <div class="seasonal-caution-content">
                                <div class="seasonal-caution-title">Advisory Note</div>
                                <div class="seasonal-caution-desc">${escapeHtml(caution)}</div>
                            </div>
                        </div>
                    `;
                }

                return html;
            }

            // Fallback plain markdown renderer
            return `<div class="seasonal-fallback-box"><p style="line-height: 1.5; font-size: 0.86rem;">${escapeHtml(cleanText).replace(/\n/g, '<br>')}</p></div>`;
        }
function renderCropAdviceUI(rawText, cropName) {
            if (!rawText || !rawText.trim()) {
                return `
                    <div class="advisor-empty-placeholder">
                        <i class="fas fa-seedling"></i>
                        <span>Enter any crop name above to get agronomic & weather-tailored guidance.</span>
                    </div>
                `;
            }

            const temp = lastWeatherData?.main?.temp ? Math.round(lastWeatherData.main.temp) : '--';
            const humidity = lastWeatherData?.main?.humidity || '--';

            // Format clean agricultural report text
            function formatReportText(text) {
                // Strip any remaining markdown symbols
                let clean = text.replace(/^#+\s*/gm, '');
                clean = clean.replace(/^[-\*_]{3,}\s*$/gm, '');
                clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
                clean = clean.replace(/\*([^*]+)\*/g, '$1');
                clean = clean.replace(/^>\s*/gm, '');

                const knownHeadings = [
                    'Crop Suitability', 'Soil & Water', 'Weather Impact', 'Weather Conditions', 'What to Do Now', 'What You Should Do Now', 'Risks to Watch', 'Market Information',
                    'ಬೆಳೆಯ ಸೂಕ್ತತೆ', 'ಮಣ್ಣು ಮತ್ತು ನೀರು', 'ಹವಾಮಾನ ಪರಿಣಾಮ', 'ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳು', 'ಈಗ ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು', 'ನೀವು ಈಗ ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು', 'ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಪಾಯಗಳು', 'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ',
                    'పంట అనుకూలత', 'నేల మరియు నీరు', 'వాతావరణ ప్రభావం', 'వాతావరణ పరిస్థితులు', 'ఇప్పుడు చేయవలసిన పనులు', 'మీరు ఇప్పుడు చేయవలసిన పనులు', 'గమనించవలసిన సమస్యలు', 'గమనించవలసిన సమస్యలు మరియు తెగుళ్లు', 'మార్కెట్ సమాచారం',
                    'பயிர் பொருத்தம்', 'மண் மற்றும் நீர்', 'மண் மற்றும் நீர் மேலாண்மை', 'வானிலை தாக்கம்', 'வானிலை சூழல்', 'இப்போது செய்ய வேண்டியவை', 'தற்போது செய்ய வேண்டிய பணிகள்', 'கவனிக்க வேண்டிய பாதிப்புகள்', 'சந்தை நிலவரம்',
                    'കൃഷി അനുയോജ്യത', 'മണ്ണും ജലവും', 'കാലാവസ്ഥ സ്വാധീനം', 'കാലാവസ്ഥ സ്ഥിതി', 'ഇപ്പോൾ ചെയ്യേണ്ട കാര്യങ്ങൾ', 'ശ്രദ്ധിക്കേണ്ട രോഗങ്ങളും കീടങ്ങളും', 'വിപണി വിവരം',
                    'फसल की उपयुक्तता', 'मिट्टी और जल प्रबंधन', 'मौसम का प्रभाव', 'मौसम की स्थिति', 'अभी क्या करें', 'अभी क्या करना चाहिए', 'संभावित खतरे', 'संभावित खतरे और सावधानियां', 'मंडी और बाजार जानकारी'
                ];

                const lines = clean.split('\n');
                let html = '';

                lines.forEach(rawLine => {
                    const line = rawLine.trim();
                    if (!line) {
                        html += '<div style="height: 0.35rem;"></div>';
                        return;
                    }

                    // Metadata headers (Crop:, Location:, Weather:)
                    if (line.match(/^(Crop|Location|Weather|ಬೆಳೆ|ಸ್ಥಳ|ಹವಾಮಾನ|పంట|ప్రాంతం|వాతావరణం|பயிர்|இடம்|வானிலை|വിള|സ്ഥലം|കാലാവസ്ഥ|फसल|स्थान|मौसम)\s*:/i)) {
                        html += `<div style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.15rem;">${escapeHtml(line)}</div>`;
                        return;
                    }

                    // Section titles
                    const isHeading = knownHeadings.some(h => line.toLowerCase() === h.toLowerCase() || line.toLowerCase().startsWith(h.toLowerCase()));
                    if (isHeading) {
                        html += `<div style="font-size: 0.88rem; font-weight: 700; color: var(--primary-dark, #15803d); margin-top: 0.75rem; margin-bottom: 0.25rem; padding-bottom: 0.15rem; border-bottom: 1px solid var(--border-color, #e2e8f0);">${escapeHtml(line)}</div>`;
                        return;
                    }

                    // Numbered action items
                    const numMatch = line.match(/^(\d+)[\.)\]]\s+(.+)$/);
                    if (numMatch) {
                        html += `<div style="display: flex; gap: 0.45rem; margin: 0.2rem 0; font-size: 0.82rem; line-height: 1.5;"><span style="color: var(--primary, #16a34a); font-weight: 700; flex-shrink: 0;">${numMatch[1]}.</span><span style="color: var(--text-primary);">${escapeHtml(numMatch[2])}</span></div>`;
                        return;
                    }

                    // Bullet risk items
                    const bulletMatch = line.match(/^[-•–—]\s+(.+)$/);
                    if (bulletMatch) {
                        html += `<div style="display: flex; gap: 0.45rem; margin: 0.18rem 0; font-size: 0.82rem; line-height: 1.5;"><span style="color: #ea580c; font-weight: 700; flex-shrink: 0;">•</span><span style="color: var(--text-primary);">${escapeHtml(bulletMatch[1])}</span></div>`;
                        return;
                    }

                    // Standard paragraph
                    html += `<p style="font-size: 0.82rem; line-height: 1.55; color: var(--text-primary); margin: 0.2rem 0;">${escapeHtml(line)}</p>`;
                });

                return html;
            }

            const formattedContent = formatReportText(rawText.trim());

            return `
                <div class="advisor-result-card">
                    <div class="advisor-meta-strip">
                        <span class="advisor-crop-badge"><i class="fas fa-leaf"></i> ${escapeHtml(cropName)}</span>
                        <span class="advisor-weather-badge"><i class="fas fa-cloud-sun"></i> ${temp}°C • ${humidity}% Humidity</span>
                    </div>
                    <div style="font-size: 0.82rem; line-height: 1.55; color: var(--text-primary); padding: 0.3rem 0;">
                        ${formattedContent}
                    </div>
                </div>
            `;
        }

        // Seasonal Crops (supports dynamic language & location)
        async function fetchSeasonalCrops() {
            const box = document.getElementById('seasonalCropBox');
            if (!box) return;
            box.innerHTML = `
                <div style="padding: 1.5rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
                    <i class="fas fa-spinner fa-spin" style="color: var(--primary); font-size: 1.2rem; margin-bottom: 0.4rem;"></i><br>
                    Analyzing seasonal crop recommendations...
                </div>
            `;
            try {
                const locParts = [currentCity, currentDistrict, currentState].filter(Boolean);
                const locString = locParts.length > 0 ? `${locParts.join(', ')}, India` : (currentState ? `${currentState}, India` : 'Karnataka, India');
                const lang = typeof getAppLanguage === 'function' ? getAppLanguage() : (localStorage.getItem('krishiLang') || 'en');

                const res = await fetch(`${API_BASE_URL}/ai-advisory/seasonal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        weatherData: lastWeatherData,
                        location: locString,
                        state: currentState || '',
                        district: currentDistrict || currentCity || '',
                        language: lang
                    })
                });
                const data = await res.json();
                if (data.recommendation) {
                    box.innerHTML = renderSeasonalCropsUI(data.recommendation);
                } else {
                    box.innerHTML = '<p style="color: var(--text-secondary); padding: 0.5rem 0; font-size: 0.84rem;">No seasonal recommendations available at this time.</p>';
                }
            } catch (e) {
                box.innerHTML = '<p style="color: #ea580c; padding: 0.5rem 0; font-size: 0.84rem;"><i class="fas fa-triangle-exclamation"></i> Could not load seasonal recommendations. Please click refresh to retry.</p>';
            }
        }

        setTimeout(fetchSeasonalCrops, 1500);
        document.getElementById('refreshSeasonalBtn').addEventListener('click', fetchSeasonalCrops);

        // Crop Advisor (supports dynamic language)
        document.getElementById('getCropAdviceBtn').addEventListener('click', () => {
            const crop = document.getElementById('cropInput').value.trim();
            if (!crop) return alert('Please enter a crop name first!');
            fetchCropAdvice(crop);
        });

        document.getElementById('cropInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const crop = document.getElementById('cropInput').value.trim();
                if (crop) fetchCropAdvice(crop);
            }
        });

        let lastAdvisedCrop = '';

        async function fetchCropAdvice(cropName) {
            const btn = document.getElementById('getCropAdviceBtn');
            const box = document.getElementById('cropAdviceBox');
            if (btn) btn.disabled = true;
            lastAdvisedCrop = cropName;
            box.innerHTML = `
                <div style="padding: 1.5rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
                    <i class="fas fa-spinner fa-spin" style="color: var(--primary); font-size: 1.2rem; margin-bottom: 0.4rem;"></i><br>
                    Analyzing ${escapeHtml(cropName)} for current local climate...
                </div>
            `;

            try {
                const locParts = [currentCity, currentDistrict, currentState].filter(Boolean);
                const locString = locParts.length > 0 ? `${locParts.join(', ')}, India` : 'India';

                const res = await fetch(`${API_BASE_URL}/ai-advisory`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        weatherData: lastWeatherData,
                        cropInfo: cropName,
                        location: locString,
                        lat: currentLat,
                        lon: currentLon,
                        city: currentCity,
                        district: currentDistrict,
                        state: currentState,
                        message: `I am a farmer in ${locString} planning to grow ${cropName}. What precautions and advice should I follow given current weather?`,
                        language: currentLang
                    })
                });
                const data = await res.json();
                box.innerHTML = renderCropAdviceUI(data.advice || '', cropName);
            } catch (e) {
                box.innerHTML = '<p style="color: #ea580c; padding: 0.5rem 0; font-size: 0.84rem;"><i class="fas fa-triangle-exclamation"></i> Failed to fetch crop advice. Please try again.</p>';
            }
            if (btn) btn.disabled = false;
        }

        // AI Chatbot (supports dynamic language)
        const chatFab = document.getElementById('chatFab');
        const chatbotWidget = document.getElementById('chatbot-widget');
        chatFab.addEventListener('click', () => chatbotWidget.classList.add('active'));
        document.getElementById('closeChat').addEventListener('click', () => chatbotWidget.classList.remove('active'));

        let chatPending = false; // Prevent duplicate sends

        function formatBotMessage(text) {
            if (!text) return '';
            // Convert markdown bold **text** to <strong>
            let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Convert newlines to <br>
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        async function handleChat() {
            if (chatPending) return; // Block duplicate sends while request is in-flight
            const chatInputEl = document.getElementById('chatInput');
            const msg = chatInputEl.value.trim();
            if (!msg) return;

            chatPending = true;
            const sendBtn = document.getElementById('sendChat');
            if (sendBtn) sendBtn.disabled = true;

            const chatBody = document.getElementById('chatBody');
            // Escape user message to prevent XSS
            chatBody.innerHTML += `<div class="chat-bubble user">${escapeHtml(msg)}</div>`;
            chatInputEl.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;

            const typingId = 'typing-' + Date.now();
            chatBody.innerHTML += `<div id="${typingId}" class="chat-bubble bot"><i class="fas fa-ellipsis-h fa-fade"></i></div>`;
            chatBody.scrollTop = chatBody.scrollHeight;

            try {
                // Build location string from verified app state
                const locParts = [currentCity, currentDistrict, currentState].filter(Boolean);
                const locString = locParts.length > 0 ? `${locParts.join(', ')}, India` : 'India';

                const res = await fetch(`${API_BASE_URL}/ai-advisory/chat`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        weatherData: lastWeatherData,
                        message: msg,
                        language: currentLang,
                        location: locString
                    })
                });

                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    const errMsg = errData.error || `Server error (${res.status}). Please try again.`;
                    chatBody.innerHTML += `<div class="chat-bubble bot" style="color: #ef4444;"><i class="fas fa-triangle-exclamation"></i> ${escapeHtml(errMsg)}</div>`;
                } else {
                    const data = await res.json();
                    const advice = data.advice;
                    if (advice && advice.trim()) {
                        chatBody.innerHTML += `<div class="chat-bubble bot">${formatBotMessage(advice)}</div>`;
                    } else {
                        chatBody.innerHTML += `<div class="chat-bubble bot" style="color: #f59e0b;"><i class="fas fa-info-circle"></i> No response received. Please try rephrasing your question.</div>`;
                    }
                }
                chatBody.scrollTop = chatBody.scrollHeight;
            } catch (e) {
                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();
                chatBody.innerHTML += `<div class="chat-bubble bot" style="color: #ef4444;"><i class="fas fa-wifi"></i> Network error. Please check your connection and try again.</div>`;
                chatBody.scrollTop = chatBody.scrollHeight;
            } finally {
                chatPending = false;
                if (sendBtn) sendBtn.disabled = false;
                chatInputEl.focus();
            }
        }

        document.getElementById('sendChat').addEventListener('click', handleChat);
        document.getElementById('chatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });

        // Theme pill UI sync (app.js handles the actual theme logic)
        const savedTheme = localStorage.getItem('theme') || 'light';
        updateThemePills(savedTheme);

        // Modals
        function openFarmerProfileModal(e) {
            if (e) e.preventDefault();
            const _dd = document.getElementById('navProfileDropdown');
            const _btn = document.getElementById('profileDropdownBtn');
            if (_dd) _dd.classList.remove('show');
            if (_btn) _btn.classList.remove('active');
            
            document.getElementById('modalProfileName').innerText = farmer.name || 'Farmer';
            document.getElementById('modalProfilePhone').innerText = farmer.mobile ? `+91 ${farmer.mobile}` : '--';
            document.getElementById('modalProfileLocation').innerText = `${currentCity}, ${currentState}`;
            document.getElementById('modalProfileCoords').innerText = `${currentLat.toFixed(4)}, ${currentLon.toFixed(4)}`;
            
            document.getElementById('farmerProfileModal').classList.add('active');
        }

        function closeFarmerProfileModal() {
            const modal = document.getElementById('farmerProfileModal');
            if (modal) modal.classList.remove('active');
        }

        function openFarmerSettingsModal(e) {
            if (e) e.preventDefault();
            const _dd = document.getElementById('navProfileDropdown');
            const _btn = document.getElementById('profileDropdownBtn');
            if (_dd) _dd.classList.remove('show');
            if (_btn) _btn.classList.remove('active');
            document.getElementById('farmerSettingsModal').classList.add('active');
        }

        function closeFarmerSettingsModal() {
            const modal = document.getElementById('farmerSettingsModal');
            if (modal) modal.classList.remove('active');
        }

        window.addEventListener('krishi:languageChanged', () => {
            fetchSeasonalCrops();
            if (lastAdvisedCrop) {
                fetchCropAdvice(lastAdvisedCrop);
            }
            updateTodayAgriStatus(lastWeatherData, lastForecastData);
        });
    