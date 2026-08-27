const fs = require('fs');

const dashboardPath = 'frontend/dashboard.html';
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. New CSS
const cssSearch = '/* Today\'s Agricultural Status Styles */';
const cssEndSearch = '</style>';
const cssStartIdx = content.indexOf(cssSearch);
const cssEndIdx = content.indexOf(cssEndSearch, cssStartIdx);

if (cssStartIdx === -1 || cssEndIdx === -1) {
    console.error('Could not find CSS markers!');
    process.exit(1);
}

const newCss = `/* ================= TODAY'S AGRICULTURAL STATUS: EXECUTIVE INTELLIGENCE PANEL ================= */
        .agri-intel-panel {
            background: rgba(22, 36, 43, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 1.15rem 1.35rem;
            margin-top: 1.25rem;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.25);
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        [data-theme='light'] .agri-intel-panel {
            background: #ffffff;
            border-color: #e2e8f0;
            box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.06);
        }

        .agri-intel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.75rem;
            padding-bottom: 0.85rem;
            margin-bottom: 0.95rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        [data-theme='light'] .agri-intel-header {
            border-bottom-color: #edf2f7;
        }

        .agri-intel-title-group {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            flex-wrap: wrap;
            margin-bottom: 0.2rem;
        }
        .agri-intel-title {
            font-size: 0.92rem;
            font-weight: 700;
            letter-spacing: 0.3px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.45rem;
        }
        [data-theme='light'] .agri-intel-title {
            color: #0f172a;
        }

        .agri-intel-live-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.62rem;
            font-weight: 800;
            letter-spacing: 0.6px;
            color: #4ade80;
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 0.15rem 0.5rem;
            border-radius: 9999px;
            text-transform: uppercase;
        }
        .agri-intel-live-dot {
            width: 6px;
            height: 6px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 8px #22c55e;
            animation: intel-pulse 2s infinite;
        }
        @keyframes intel-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.35); opacity: 0.5; }
        }

        .agri-intel-location {
            font-size: 0.8rem;
            font-weight: 500;
            color: var(--text-secondary, #94a3b8);
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .agri-intel-location i {
            color: #22c55e;
            font-size: 0.78rem;
        }

        .agri-intel-telemetry-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.74rem;
            font-weight: 600;
            color: var(--text-secondary, #94a3b8);
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.06);
            padding: 0.25rem 0.65rem;
            border-radius: 6px;
        }
        [data-theme='light'] .agri-intel-telemetry-chip {
            background: #f1f5f9;
            border-color: #e2e8f0;
            color: #475569;
        }

        /* 3-Column Balanced Intelligence Grid */
        .agri-intel-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.9rem;
        }
        @media (max-width: 900px) {
            .agri-intel-grid {
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }
        }

        .agri-intel-col {
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 0.95rem 1.05rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 0.65rem;
            transition: border-color 0.2s, background 0.2s;
        }
        [data-theme='light'] .agri-intel-col {
            background: #f8fafc;
            border-color: #e2e8f0;
        }
        .agri-intel-col:hover {
            border-color: rgba(34, 197, 94, 0.3);
            background: rgba(255, 255, 255, 0.04);
        }
        [data-theme='light'] .agri-intel-col:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
        }

        .agri-intel-col-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            margin-bottom: 0.35rem;
        }
        .agri-intel-category-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: var(--text-secondary, #94a3b8);
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .agri-intel-category-label i {
            font-size: 0.75rem;
            opacity: 0.85;
        }

        .agri-intel-status-pill {
            font-size: 0.68rem;
            font-weight: 700;
            padding: 0.18rem 0.55rem;
            border-radius: 6px;
            letter-spacing: 0.3px;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            white-space: nowrap;
            text-transform: uppercase;
        }
        .status-pill-low {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        [data-theme='light'] .status-pill-low {
            background: #dcfce7;
            color: #15803d;
            border-color: #bbf7d0;
        }
        .status-pill-moderate {
            background: rgba(245, 158, 11, 0.15);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        [data-theme='light'] .status-pill-moderate {
            background: #fef3c7;
            color: #b45309;
            border-color: #fde68a;
        }
        .status-pill-high {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        [data-theme='light'] .status-pill-high {
            background: #fee2e2;
            color: #b91c1c;
            border-color: #fecaca;
        }
        .status-pill-action {
            background: rgba(14, 165, 233, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(14, 165, 233, 0.3);
        }
        [data-theme='light'] .status-pill-action {
            background: #e0f2fe;
            color: #0369a1;
            border-color: #bae6fd;
        }

        .agri-intel-highlight-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary, #ffffff);
            line-height: 1.25;
            margin-bottom: 0.25rem;
        }
        [data-theme='light'] .agri-intel-highlight-title {
            color: #0f172a;
        }

        .agri-intel-desc-text {
            font-size: 0.78rem;
            line-height: 1.45;
            color: var(--text-secondary, #94a3b8);
            margin: 0;
            flex-grow: 1;
        }
        [data-theme='light'] .agri-intel-desc-text {
            color: #475569;
        }

        .agri-intel-action-list {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            font-size: 0.78rem;
            line-height: 1.4;
            color: var(--text-secondary, #94a3b8);
        }
        [data-theme='light'] .agri-intel-action-list {
            color: #475569;
        }
        .agri-intel-action-item {
            display: flex;
            align-items: flex-start;
            gap: 0.45rem;
        }
        .agri-intel-action-num {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            font-size: 0.62rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
        }
        [data-theme='light'] .agri-intel-action-num {
            background: #dcfce7;
            color: #16a34a;
        }
    `;

content = content.substring(0, cssStartIdx) + newCss + content.substring(cssEndIdx);

// 2. New HTML
const htmlSearch = '<!-- Today\'s Agricultural Status Section -->';
const htmlEndSearch = '<!-- Full-Width Interactive Map with Search -->';
const htmlStartIdx = content.indexOf(htmlSearch);
const htmlEndIdx = content.indexOf(htmlEndSearch);

if (htmlStartIdx === -1 || htmlEndIdx === -1) {
    console.error('Could not find HTML markers!');
    process.exit(1);
}

const newHtml = `<!-- Today's Agricultural Status Section (Executive Agricultural Intelligence Panel) -->
        <div class="agri-intel-panel" id="todayAgriStatusSection">
            <div class="agri-intel-header">
                <div>
                    <div class="agri-intel-title-group">
                        <span class="agri-intel-title" id="agriStatusTitle">
                            <i class="fas fa-satellite-dish" style="color: #22c55e;"></i> Today's Agricultural Status
                        </span>
                        <span class="agri-intel-live-badge" id="agriStatusLivePill"><span class="agri-intel-live-dot"></span>LIVE</span>
                    </div>
                    <div class="agri-intel-location" id="agriStatusLocSummary">
                        <i class="fas fa-location-dot"></i> <span id="agriStatusPlaceName">Local Farm</span>
                    </div>
                </div>
                <div class="agri-intel-telemetry-chip" id="agriStatusTelemetryChip">
                    <i class="fas fa-cloud-sun" style="color: #22c55e;"></i> <span id="intelTelemTemp">--°C</span> • <span id="intelTelemHum">--% Humidity</span>
                </div>
            </div>

            <div class="agri-intel-grid">
                <!-- 1. Crop & Disease Risk -->
                <div class="agri-intel-col" id="cardCropAlerts">
                    <div>
                        <div class="agri-intel-col-head">
                            <span class="agri-intel-category-label" id="lblCropAlerts">
                                <i class="fas fa-shield-virus" style="color: #ea580c;"></i> Crop & Disease Risk
                            </span>
                            <span class="agri-intel-status-pill status-pill-moderate" id="badgeCropAlerts">Moderate</span>
                        </div>
                        <div class="agri-intel-highlight-title" id="subCropAlerts">Pest & Fungal Risk</div>
                    </div>
                    <p class="agri-intel-desc-text" id="descCropAlerts">
                        Analyzing crop susceptibility for current humidity and temperature...
                    </p>
                </div>

                <!-- 2. Weather / Rain Risk -->
                <div class="agri-intel-col" id="cardWeatherRisk">
                    <div>
                        <div class="agri-intel-col-head">
                            <span class="agri-intel-category-label" id="lblWeatherRisk">
                                <i class="fas fa-cloud-sun-rain" style="color: #3b82f6;"></i> Weather / Rain Risk
                            </span>
                            <span class="agri-intel-status-pill status-pill-low" id="badgeWeatherRisk">Low</span>
                        </div>
                        <div class="agri-intel-highlight-title" id="subWeatherRisk">Clear Conditions</div>
                    </div>
                    <p class="agri-intel-desc-text" id="descWeatherRisk">
                        Calculating 24-48 hour rainfall probability and atmospheric trends...
                    </p>
                </div>

                <!-- 3. Recommended Action -->
                <div class="agri-intel-col" id="cardRecAction">
                    <div>
                        <div class="agri-intel-col-head">
                            <span class="agri-intel-category-label" id="lblRecAction">
                                <i class="fas fa-list-check" style="color: #10b981;"></i> Recommended Action
                            </span>
                            <span class="agri-intel-status-pill status-pill-action" id="badgeRecAction">Actionable</span>
                        </div>
                        <div class="agri-intel-highlight-title" id="subRecAction">Field Directives</div>
                    </div>
                    <div class="agri-intel-action-list" id="descRecAction">
                        Preparing field operation advisory based on verified weather conditions...
                    </div>
                </div>
            </div>
        </div>

        `;

content = content.substring(0, htmlStartIdx) + newHtml + content.substring(htmlEndIdx);

// 3. New JS for updateTodayAgriStatus
const jsSearch = 'function updateTodayAgriStatus(';
const jsEndSearch = '// ================= STRUCTURED UI RENDERER FOR SEASONAL CROPS =================';
const jsStartIdx = content.indexOf(jsSearch);
const jsEndIdx = content.indexOf(jsEndSearch);

if (jsStartIdx === -1 || jsEndIdx === -1) {
    console.error('Could not find JS markers!');
    process.exit(1);
}

const newJs = `function updateTodayAgriStatus(weatherData, forecastData) {
            const titleEl = document.getElementById('agriStatusTitle');
            if (titleEl && typeof t === 'function') {
                titleEl.innerHTML = \`<i class="fas fa-satellite-dish" style="color: #22c55e;"></i> \${t('dash_agri_status_title') || "Today's Agricultural Status"}\`;
            }
            const lblCropEl = document.getElementById('lblCropAlerts');
            if (lblCropEl && typeof t === 'function') {
                lblCropEl.innerHTML = \`<i class="fas fa-shield-virus" style="color: #ea580c;"></i> \${t('dash_crop_alerts') || "Crop & Disease Risk"}\`;
            }
            const lblWeatherEl = document.getElementById('lblWeatherRisk');
            if (lblWeatherEl && typeof t === 'function') {
                lblWeatherEl.innerHTML = \`<i class="fas fa-cloud-sun-rain" style="color: #3b82f6;"></i> \${t('dash_weather_risk') || "Weather / Rain Risk"}\`;
            }
            const lblRecEl = document.getElementById('lblRecAction');
            if (lblRecEl && typeof t === 'function') {
                lblRecEl.innerHTML = \`<i class="fas fa-list-check" style="color: #10b981;"></i> \${t('dash_rec_action') || "Recommended Action"}\`;
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
            if (telemTemp) telemTemp.innerText = \`\${temp}°C\`;
            if (telemHum) telemHum.innerText = \`\${humidity}% Humidity\`;

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
                cropDescText = lang === 'kn' ? \`ಹೆಚ್ಚಿನ ತೇವಾಂಶ (\${humidity}%) ನಿಂದ ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಬೂದಿ ರೋಗ ಹರಡುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು. ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಿ.\` :
                               lang === 'te' ? \`అధిక తేమ (\${humidity}%) కారణంగా ఆకుమచ్చ మరియు బూడిద తెగులు వ్యాపించే అవకాశం ఉంది. ఆకుల అడుగు భాగాన్ని గమనించండి.\` :
                               lang === 'ta' ? \`அதிக ஈரப்பதம் (\${humidity}%) காரணமாக இலைப்புள்ளி மற்றும் பூஞ்சை நோய் பரவ வாய்ப்புள்ளது. இலைகளின் அடிப்பகுதியை கண்காணிக்கவும்.\` :
                               lang === 'ml' ? \`കൂടിയ ഈർപ്പം (\${humidity}%) കാരണം ഇലപ്പുള്ളി, കുമിൾ രോഗങ്ങൾ പടരാൻ സാധ്യത. ഇലകളുടെ അടിഭാഗം പരിശോധിക്കുക.\` :
                               lang === 'hi' ? \`अत्यधिक नमी (\${humidity}%) के कारण पत्तियों पर धब्बा व फफूंद जनित रोगों का जोखिम अधिक है। निचली पत्तियों का निरीक्षण करें।\` :
                               \`Elevated humidity (\${humidity}%) creates prime conditions for foliar fungal pathogens and leaf spots. Inspect lower canopy.\`;
            } else if (humidity >= 65 || temp >= 34) {
                cropBadgeText = lang === 'kn' ? 'ಮಧ್ಯಮ' : lang === 'te' ? 'ಮಧ್ಯಸ್ಥಂ' : lang === 'ta' ? 'மிதமான' : lang === 'ml' ? 'മിതമായത്' : lang === 'hi' ? 'मध्यम' : 'Moderate';
                cropBadgeClass = 'status-pill-moderate';
                cropSubText = lang === 'kn' ? 'ತೇವಾಂಶ ಮತ್ತು ಕೀಟ ನಿಗಾ' : lang === 'te' ? 'తేమ మరియు కీటక నిఘా' : lang === 'ta' ? 'ஈரப்பதம் மற்றும் பூச்சி கண்காணிப்பு' : lang === 'ml' ? 'കീട നിരീക്ഷണം' : lang === 'hi' ? 'कीट व नमी निगरानी' : 'Pest & Moisture Risk';
                cropDescText = lang === 'kn' ? \`ಪ್ರಸ್ತುತ \${temp}°C ತಾಪಮಾನ ಮತ್ತು \${humidity}% ತೇವಾಂಶವಿದ್ದು ಕೀಟಗಳ ಬಾಧೆ ಸಾಧಾರಣವಾಗಿದೆ. ಬೆಳೆಗೆ ನಿಯಮಿತ ನೀರೊದಗಿಸಿ.\` :
                               lang === 'te' ? \`ప్రస్తుత \${temp}°C ఉష్ణోగ్రత మరియు \${humidity}% తేమతో రసం పీల్చే పురుగుల ప్రభావం మోస్తరుగా ఉంది. పంటను నిరంతరం గమనించండి.\` :
                               lang === 'ta' ? \`தற்போதைய \${temp}°C வெப்பநிலை மற்றும் \${humidity}% ஈரப்பதத்தில் பூச்சி தாக்குதல் மிதமாக இருக்கும். பயிரை தொடர்ந்து கண்காணிக்கவும்.\` :
                               lang === 'ml' ? \`നിലവിലെ \${temp}°C താപനിലയിലും \${humidity}% ഈർപ്പത്തിലും കീടബാധ മിതമായ തോതിൽ ഉണ്ടാകാം. നിരീക്ഷണം തുടരുക.\` :
                               lang === 'hi' ? \`वर्तमान \${temp}°C तापमान और \${humidity}% नमी में कीट प्रकोप मध्यम स्तर पर है। नियमित खेत निरीक्षण बनाए रखें।\` :
                               \`Current conditions (\${temp}°C, \${humidity}% humidity) show moderate pest activity. Monitor field boundaries regularly.\`;
            } else {
                cropBadgeText = lang === 'kn' ? 'ಕಡಿಮೆ' : lang === 'te' ? 'తక్కువ' : lang === 'ta' ? 'குறைவு' : lang === 'ml' ? 'കുറഞ്ഞത്' : lang === 'hi' ? 'निम्न' : 'Low';
                cropBadgeClass = 'status-pill-low';
                cropSubText = lang === 'kn' ? 'ಸಾಮಾನ್ಯ ಬೆಳೆ ಆರೋಗ್ಯ' : lang === 'te' ? 'సాధారణ పంట ఆరోగ్యం' : lang === 'ta' ? 'சாதாரண பயிர் நிலை' : lang === 'ml' ? 'സാധാരണ വിള ആരോഗ്യം' : lang === 'hi' ? 'सामान्य फसल स्वास्थ्य' : 'Normal Crop Health';
                cropDescText = lang === 'kn' ? \`ತಾಪಮಾನ (\${temp}°C) ಮತ್ತು ತೇವಾಂಶ (\${humidity}%) ಹತೋಟಿಯಲ್ಲಿದ್ದು ಬೆಳೆಗಳ ಬೆಳವಣಿಗೆಗೆ ಅನುಕೂಲಕರ ವಾತಾವರಣವಿದೆ.\` :
                               lang === 'te' ? \`ఉష్ణోగ్రత (\${temp}°C) మరియు తేమ (\${humidity}%) సాధారణంగా ఉండి పంట ఆరోగ్యకరమైన ఎదుగుదలకు అనుకూలంగా ఉంది.\` :
                               lang === 'ta' ? \`வெப்பநிலை (\${temp}°C) மற்றும் ஈரப்பதம் (\${humidity}%) கட்டுக்குள் உள்ளதால் பயிர்கள் ஆரோக்கியமாக வளர உகந்தது.\` :
                               lang === 'ml' ? \`താപനിലയും (\${temp}°C) ഈർപ്പവും (\${humidity}%) അനുകൂലമായതിനാൽ വിളകൾക്ക് കാര്യമായ രോഗസാധ്യതയില്ല.\` :
                               lang === 'hi' ? \`तापमान (\${temp}°C) और नमी (\${humidity}%) अनुकूल स्तर पर हैं। फसलों में किसी गंभीर रोग का खतरा नहीं है।\` :
                               \`Balanced weather conditions (\${temp}°C, \${humidity}% RH) support healthy vegetative development without immediate threat.\`;
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
                weatherDescText = lang === 'kn' ? \`ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಗಮನಾರ್ಹ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರೆಯಿರಿ.\` :
                                  lang === 'te' ? \`రాబోయే 24 గంటల్లో భారీ వర్ష సూచన ఉంది. పొలంలో మురుగునీరు నిల్వ ఉండకుండా తక్షణ చర్యలు తీసుకోండి.\` :
                                  lang === 'ta' ? \`அடுத்த 24 மணி நேரத்தில் கனமழை பெய்ய வாய்ப்புள்ளது. வயலில் நீர் தேங்குவதை தவிர்க்க வடிகால்களை சரிசெய்யவும்.\` :
                                  lang === 'ml' ? \`അടുത്ത 24 മണിക്കൂറിൽ കനത്ത മഴയ്ക്ക് സാധ്യത. പാടങ്ങളിൽ വെള്ളം കയറാതെ ഡ്രെയിനേജ് സുഗമമാക്കുക.\` :
                                  lang === 'hi' ? \`अगले 24 घंटों में भारी बारिश की संभावना है। खेतों से पानी निकासी के लिए तुरंत नालियां साफ रखें।\` :
                                  \`Significant rainfall projected in the next 24-48 hours. Ensure field drainage channels are clear of debris.\`;
            } else if (forecastRainCount > 0 || forecastRainVol > 0 || weatherMain.includes('cloud')) {
                weatherBadgeText = lang === 'kn' ? 'ಮಧ್ಯಮ' : lang === 'te' ? 'ಮಧ್ಯಸ್ಥಂ' : lang === 'ta' ? 'மிதமான' : lang === 'ml' ? 'மிതമായത്' : lang === 'hi' ? 'मध्यम' : 'Moderate';
                weatherBadgeClass = 'status-pill-moderate';
                weatherSubText = lang === 'kn' ? 'ಮಳೆ ಮತ್ತು ಮೋಡ ಕವಿದ ವಾತಾವರಣ' : lang === 'te' ? 'తేలికపాటి జల్లులు' : lang === 'ta' ? 'மிதமான மழை வாய்ப்பு' : lang === 'ml' ? 'ചെറിയ മഴ സാധ്യത' : lang === 'hi' ? 'हल्की बारिश व बादल' : 'Light Showers Expected';
                weatherDescText = lang === 'kn' ? \`ಮೋಡ ಕವಿದ ವಾತಾವರಣ ಮತ್ತು ಅಲ್ಲಲ್ಲಿ ಲಘು ಮಳೆಯ ಸಾಧ್ಯತೆ ಇದೆ. ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಮಳೆಯಿಲ್ಲದ ಸಮಯವನ್ನು ಆರಿಸಿ.\` :
                                  lang === 'te' ? \`మేఘావృత వాతావరణం మరియు తేలికపాటి జల్లులు కురిసే అవకాశం ఉంది. పురుగుమందుల పిచికారీని వాయిదా వేయండి.\` :
                                  lang === 'ta' ? \`மேகமூட்டத்துடன் லேசான மழை பெய்ய வாய்ப்புள்ளது. பூச்சிக்கொல்லி தெளிப்பதை தற்காலிகமாக தள்ளிப்போடவும்.\` :
                                  lang === 'ml' ? \`മേഘാവൃതമായ അന്തരീക്ഷവും ചെറിയ മഴയും ഉണ്ടാകാം. മരുന്ന് തളിക്കുന്നത് മഴ ഒഴിഞ്ഞ സമയത്തേക്ക് മാറ്റുക.\` :
                                  lang === 'hi' ? \`बादल छाए रहने और हल्की बूंदाबांदी की संभावना है। कीटनाशक छिड़काव के लिए वर्षा रहित समय चुनें।\` :
                                  \`Intermittent cloud cover and scattered light showers expected. Plan pesticide spraying during dry intervals.\`;
            } else {
                weatherBadgeText = lang === 'kn' ? 'ಕಡಿಮೆ' : lang === 'te' ? 'తక్కువ' : lang === 'ta' ? 'குறைவு' : lang === 'ml' ? 'കുറഞ്ഞത്' : lang === 'hi' ? 'निम्न' : 'Low';
                weatherBadgeClass = 'status-pill-low';
                weatherSubText = lang === 'kn' ? 'ಸ್ವಚ್ಛ ಹವಾಮಾನ' : lang === 'te' ? 'అనుకూల వాతావరణం' : lang === 'ta' ? 'தெளிவான வானிலை' : lang === 'ml' ? 'തെളിഞ്ഞ കാലാവസ്ഥ' : lang === 'hi' ? 'स्वच्छ मौसम' : 'Clear Conditions';
                weatherDescText = lang === 'kn' ? \`ಹವಾಮಾನ ಸ್ವಚ್ಛವಾಗಿದ್ದು ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇಲ್ಲ. ಕಟಾವು, ಉಳುಮೆ ಹಾಗೂ ರಸಗೊಬ್ಬರ ಹಾಕಲು ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.\` :
                                  lang === 'te' ? \`వాతావరణం స్వచ్ఛంగా ఉంది మరియు వర్ష సూచన లేదు. పంట కోత మరియు ఎరువుల నిర్వహణకు అనువైన రోజు.\` :
                                  lang === 'ta' ? \`வானிலை சீராகவும் தெளிவாகவும் உள்ளது. அறுவடை மற்றும் உரமிடுதல் பணிகளை தடையின்றி செய்யலாம்.\` :
                                  lang === 'ml' ? \`തെളിഞ്ഞ കാലാവസ്ഥയാണ് നിലവിലുള്ളത്. കൊയ്ത്ത്, വളപ്രയോഗം എന്നിവയ്ക്ക് ഏറ്റവും അനുയോജ്യം.\` :
                                  lang === 'hi' ? \`मौसम साफ है और बारिश की संभावना नहीं है। कटाई, जुताई और उर्वरक देने के लिए दिन अनुकूल है।\` :
                                  \`Clear to stable skies with no rain interference. Ideal for harvesting, field preparation, and fertilizing.\`;
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
                badgeCropAlerts.className = \`agri-intel-status-pill \${cropBadgeClass}\`;
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
                badgeWeatherRisk.className = \`agri-intel-status-pill \${weatherBadgeClass}\`;
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
                badgeRecAction.className = \`agri-intel-status-pill \${recBadgeClass}\`;
                badgeRecAction.innerText = recBadgeText;
            }
            if (subRecAction) {
                subRecAction.innerText = recSubText;
            }
            if (descRecAction) {
                descRecAction.innerHTML = recActions.map((act, idx) => \`
                    <div class="agri-intel-action-item">
                        <span class="agri-intel-action-num">\${idx + 1}</span>
                        <span>\${escapeHtml(act)}</span>
                    </div>
                \`).join('');
            }
        }
`;

content = content.substring(0, jsStartIdx) + newJs + content.substring(jsEndIdx);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Successfully updated Today\'s Agricultural Status in frontend/dashboard.html!');
