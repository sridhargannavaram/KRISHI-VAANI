const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. Update Map CSS & Forecast CSS & Priorities CSS & Marketplace/News CSS
const cssSearchMarker = '/* ================= TODAY\'S AGRICULTURAL STATUS: EXECUTIVE INTELLIGENCE PANEL ================= */';
const cssStartIdx = content.indexOf(cssSearchMarker);

// Also let's update map height from 380px to 235px
content = content.replace(/#map\s*\{\s*height:\s*380px;/g, '#map {\n            height: 235px;');

// Let's replace the Agri-Intel CSS and add Priorities, Forecast, Mandi, and News CSS
const customCssBlock = `/* ================= TODAY'S AGRICULTURAL STATUS: EXECUTIVE INTELLIGENCE PANEL ================= */
        .agri-intel-panel {
            background: rgba(22, 36, 43, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 1.1rem 1.3rem;
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
            gap: 0.65rem;
            padding-bottom: 0.75rem;
            margin-bottom: 0.85rem;
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
            margin-bottom: 0.15rem;
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
            gap: 0.85rem;
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
            padding: 0.9rem 1rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 0.55rem;
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
            margin-bottom: 0.25rem;
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
            margin-bottom: 0.2rem;
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

        /* ================= TODAY'S PRIORITIES SECTION ================= */
        .priorities-panel {
            background: rgba(22, 36, 43, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 1.1rem 1.3rem;
            margin-top: 1.25rem;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.25);
        }
        [data-theme='light'] .priorities-panel {
            background: #ffffff;
            border-color: #e2e8f0;
            box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.06);
        }

        .priorities-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            margin-top: 0.8rem;
        }
        @media (max-width: 1024px) {
            .priorities-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 600px) {
            .priorities-grid {
                grid-template-columns: 1fr;
            }
        }

        .priority-tile {
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 0.8rem 0.95rem;
            display: flex;
            align-items: flex-start;
            gap: 0.65rem;
            transition: all 0.2s ease;
        }
        [data-theme='light'] .priority-tile {
            background: #f8fafc;
            border-color: #e2e8f0;
        }
        .priority-tile:hover {
            border-color: rgba(34, 197, 94, 0.25);
            background: rgba(255, 255, 255, 0.04);
        }
        [data-theme='light'] .priority-tile:hover {
            background: #f1f5f9;
        }

        .priority-icon-box {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        .priority-info {
            flex: 1;
            min-width: 0;
        }
        .priority-label {
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--text-primary, #ffffff);
            margin-bottom: 0.15rem;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        [data-theme='light'] .priority-label {
            color: #0f172a;
        }
        .priority-desc {
            font-size: 0.74rem;
            color: var(--text-secondary, #94a3b8);
            line-height: 1.35;
        }
        [data-theme='light'] .priority-desc {
            color: #64748b;
        }

        /* Improved Full-Width Forecast Grid */
        .forecast-grid-full {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
            gap: 0.7rem;
            width: 100%;
            margin-top: 0.75rem;
        }
        @media (max-width: 768px) {
            .forecast-grid-full {
                display: flex;
                overflow-x: auto;
                gap: 0.6rem;
                padding-bottom: 0.35rem;
                scrollbar-width: thin;
            }
            .forecast-grid-full .forecast-item {
                min-width: 90px;
                flex-shrink: 0;
            }
        }

        /* Compact AI Crop Advisor Empty State */
        .advisor-empty-compact {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1.25rem 1rem;
            gap: 0.35rem;
            color: var(--text-secondary, #94a3b8);
        }
        .advisor-empty-compact i {
            font-size: 1.4rem;
            color: #9333ea;
            margin-bottom: 0.2rem;
        }
        .advisor-empty-title {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--text-primary, #ffffff);
        }
        [data-theme='light'] .advisor-empty-title {
            color: #0f172a;
        }
        .advisor-empty-desc {
            font-size: 0.78rem;
            max-width: 320px;
            line-height: 1.35;
        }

        /* Dashboard Preview Sections: Mandi & News */
        .dashboard-preview-card {
            background: rgba(22, 36, 43, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 1.2rem 1.35rem;
            margin-top: 1.5rem;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.25);
        }
        [data-theme='light'] .dashboard-preview-card {
            background: #ffffff;
            border-color: #e2e8f0;
            box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.06);
        }

        .mandi-preview-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.85rem;
            margin-top: 0.9rem;
        }
        @media (max-width: 1024px) {
            .mandi-preview-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 600px) {
            .mandi-preview-grid {
                grid-template-columns: 1fr;
            }
        }

        .mandi-preview-item {
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 0.85rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            transition: all 0.2s ease;
        }
        [data-theme='light'] .mandi-preview-item {
            background: #f8fafc;
            border-color: #e2e8f0;
        }
        .mandi-preview-item:hover {
            border-color: rgba(34, 197, 94, 0.3);
            background: rgba(255, 255, 255, 0.04);
        }

        .mandi-item-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .mandi-commodity-name {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--text-primary, #ffffff);
        }
        [data-theme='light'] .mandi-commodity-name {
            color: #0f172a;
        }
        .mandi-market-tag {
            font-size: 0.72rem;
            color: var(--text-secondary, #94a3b8);
        }
        .mandi-price-val {
            font-size: 1.05rem;
            font-weight: 800;
            color: #4ade80;
            margin-top: 0.1rem;
        }
        [data-theme='light'] .mandi-price-val {
            color: #16a34a;
        }

        .news-preview-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.95rem;
            margin-top: 0.9rem;
        }
        @media (max-width: 900px) {
            .news-preview-grid {
                grid-template-columns: 1fr;
            }
        }

        .news-preview-item {
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        [data-theme='light'] .news-preview-item {
            background: #f8fafc;
            border-color: #e2e8f0;
        }
        .news-preview-item:hover {
            border-color: rgba(34, 197, 94, 0.35);
            transform: translateY(-2px);
        }

        .news-preview-img {
            height: 120px;
            width: 100%;
            object-fit: cover;
            background: #111c24;
        }
        .news-preview-body {
            padding: 0.75rem 0.85rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            flex-grow: 1;
        }
        .news-preview-title {
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--text-primary, #ffffff);
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        [data-theme='light'] .news-preview-title {
            color: #0f172a;
        }
        .news-preview-meta {
            font-size: 0.7rem;
            color: var(--text-secondary, #94a3b8);
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: auto;
        }
    `;

// Replace CSS block
const cssEndSearch = '</style>';
const cssEndIdx = content.indexOf(cssEndSearch, cssStartIdx);
content = content.substring(0, cssStartIdx) + customCssBlock + content.substring(cssEndIdx);

// 2. Replace Body HTML with correct dashboard order:
// Order:
// Navbar
// ↓ Welcome + Location + Current Weather Hero
// ↓ Weather Details
// ↓ Today's Agricultural Status
// ↓ Today's Priorities
// ↓ 24-Hour Forecast
// ↓ Map
// ↓ Seasonal Crops + AI Crop Advisor
// ↓ Nearby Markets / Mandi Prices
// ↓ Latest Agricultural News

const bodyStartSearch = '<!-- Today\'s Agricultural Status Section (Executive Agricultural Intelligence Panel) -->';
const bodyEndSearch = '<!-- Location Confirmation Modal -->';
const bodyStartIdx = content.indexOf(bodyStartSearch);
const bodyEndIdx = content.indexOf(bodyEndSearch);

if (bodyStartIdx === -1 || bodyEndIdx === -1) {
    console.error('Could not find body HTML markers!');
    process.exit(1);
}

const newBodyHtml = `<!-- Today's Agricultural Status Section (Executive Agricultural Intelligence Panel) -->
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
                                <i class="fas fa-shield-virus" style="color: #ea580c;"></i> Crop Alerts
                            </span>
                            <span class="agri-intel-status-pill status-pill-moderate" id="badgeCropAlerts">Moderate</span>
                        </div>
                        <div class="agri-intel-highlight-title" id="subCropAlerts">Pest & Moisture Risk</div>
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
                                <i class="fas fa-cloud-sun-rain" style="color: #3b82f6;"></i> Rain & Weather Risk
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
                            <span class="agri-intel-status-pill status-pill-action" id="badgeRecAction">Recommended</span>
                        </div>
                        <div class="agri-intel-highlight-title" id="subRecAction">Monitor + Irrigate</div>
                    </div>
                    <div class="agri-intel-action-list" id="descRecAction">
                        Preparing field operation advisory based on verified weather conditions...
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Priorities Section -->
        <div class="priorities-panel" id="todaysPrioritiesSection">
            <div class="section-header" style="margin-bottom: 0.3rem;">
                <div class="section-title">
                    <i class="fas fa-list-check" style="color: var(--primary);"></i>
                    <span id="prioritiesTitle">Today's Priorities</span>
                </div>
                <span style="font-size: 0.76rem; color: var(--text-secondary);"><i class="fas fa-bolt" style="color:#eab308;"></i> Critical Daily Tasks</span>
            </div>
            <div class="priorities-grid" id="prioritiesGrid">
                <!-- Priority 1: Humidity & Disease -->
                <div class="priority-tile">
                    <div class="priority-icon-box" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
                        <i class="fas fa-triangle-exclamation"></i>
                    </div>
                    <div class="priority-info">
                        <div class="priority-label" id="priority1Label">Moderate Humidity</div>
                        <div class="priority-desc" id="priority1Desc">Monitor lower crop foliage for fungal disease risk.</div>
                    </div>
                </div>

                <!-- Priority 2: Weather & Rain -->
                <div class="priority-tile">
                    <div class="priority-icon-box" style="background: rgba(59, 130, 246, 0.12); color: #3b82f6;">
                        <i class="fas fa-cloud-rain"></i>
                    </div>
                    <div class="priority-info">
                        <div class="priority-label" id="priority2Label">Weather Status</div>
                        <div class="priority-desc" id="priority2Desc">Check field drainage channels before showers.</div>
                    </div>
                </div>

                <!-- Priority 3: Seasonal Crop Management -->
                <div class="priority-tile">
                    <div class="priority-icon-box" style="background: rgba(34, 197, 94, 0.12); color: #22c55e;">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <div class="priority-info">
                        <div class="priority-label" id="priority3Label">Seasonal Crop</div>
                        <div class="priority-desc" id="priority3Desc">Current weather conditions are favorable for Kharif sowing.</div>
                    </div>
                </div>

                <!-- Priority 4: Market Intelligence -->
                <div class="priority-tile">
                    <div class="priority-icon-box" style="background: rgba(168, 85, 247, 0.12); color: #a855f7;">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="priority-info">
                        <div class="priority-label" id="priority4Label">Market Rates</div>
                        <div class="priority-desc" id="priority4Desc">Check nearby mandi price trends before selling.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 24-Hour Forecast (Efficient Horizontal Grid) -->
        <div class="glass glass-card" style="margin-top: 1.5rem;" id="forecastSectionCard">
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-clock" style="color: var(--primary);"></i>
                    <span id="forecastTitle">24-Hour Weather Forecast</span>
                </div>
            </div>
            <div class="forecast-grid-full" id="forecastBox">
                <p style="padding: 1rem; color: var(--text-secondary);">Loading forecast...</p>
            </div>
        </div>

        <!-- Full-Width Interactive Map with Reduced Height (Compact & Functional) -->
        <div class="map-container glass glass-card" style="padding: 0; overflow: hidden; margin-top: 1.5rem;">
            <div class="map-search-bar">
                <input type="text" id="mapSearch" placeholder="Search village, city, or district..." autocomplete="off">
                <button id="mapSearchBtn"><i class="fas fa-search"></i></button>
            </div>
            <div class="map-search-results" id="mapSearchResults"></div>
            <div id="map"></div>
        </div>

        <!-- Crop Sections Side by Side (Seasonal Crops + AI Crop Advisor) -->
        <div class="crop-grid" style="margin-top: 1.5rem;">
            <!-- Seasonal Crop Recommendation (Auto) -->
            <div class="crop-card">
                <div class="section-header">
                    <div class="section-title">
                        <i class="fas fa-seedling" style="color: var(--primary);"></i>
                        <span id="seasonalTitle">Seasonal Crops</span>
                        <span class="auto-badge"><i class="fas fa-bolt-auto" style="font-size: 0.65rem;"></i> AUTO</span>
                    </div>
                    <button id="refreshSeasonalBtn" class="btn-refresh-clean" title="Refresh Seasonal Crops" aria-label="Refresh Seasonal Crops">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="seasonal-crops-container" id="seasonalCropBox">
                    <div style="padding: 1.5rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
                        <i class="fas fa-spinner fa-spin" style="color: var(--primary); font-size: 1.2rem; margin-bottom: 0.4rem;"></i><br>
                        Fetching seasonal recommendations...
                    </div>
                </div>
            </div>

            <!-- AI Crop Advisor (Compact Empty State + Natural Expand) -->
            <div class="advisor-card">
                <div class="section-header">
                    <div class="section-title">
                        <i class="fas fa-robot" style="color: #9333ea;"></i>
                        <span id="cropAdvisorTitle">AI Crop Advisor</span>
                    </div>
                </div>
                <p class="advisor-subtitle" id="cropAdvisorDesc">
                    Get location and weather-based advice for your crop.
                </p>
                <div class="crop-input-group">
                    <input type="text" id="cropInput" class="form-control" placeholder="e.g., Ragi, Tomato, Paddy, Cotton..." autocomplete="off">
                    <button id="getCropAdviceBtn" class="btn-advisor-submit"><i class="fas fa-wand-magic-sparkles"></i> <span>Get Advice</span></button>
                </div>
                <div class="advisor-output-box" id="cropAdviceBox">
                    <div class="advisor-empty-compact">
                        <i class="fas fa-wand-magic-sparkles"></i>
                        <div class="advisor-empty-title">AI Crop Advisor</div>
                        <div class="advisor-empty-desc">Enter any crop name above for instant agronomic and weather-tailored guidance.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Nearby Markets / Mandi Prices (Compact & Production-Level) -->
        <div class="dashboard-preview-card" id="mandiSummarySection">
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-store" style="color: #4ade80;"></i>
                    <span id="mandiSummaryTitle">Nearby Markets / Mandi Prices</span>
                </div>
                <a href="marketplace.html" class="btn-loc-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; text-decoration: none; border-radius: 6px;">
                    View Marketplace <i class="fas fa-arrow-right" style="font-size: 0.7rem; margin-left: 0.2rem;"></i>
                </a>
            </div>
            <div class="mandi-preview-grid" id="mandiPreviewGrid">
                <div class="mandi-preview-item">
                    <div class="mandi-item-top">
                        <span class="mandi-commodity-name">🌾 Ragi (Finger Millet)</span>
                        <span class="mandi-market-tag" id="mandiLoc1">Bengaluru APMC</span>
                    </div>
                    <div class="mandi-price-val">₹3,450 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                    <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-arrow-trend-up"></i> Stable Demand</div>
                </div>

                <div class="mandi-preview-item">
                    <div class="mandi-item-top">
                        <span class="mandi-commodity-name">🌾 Paddy (Rice)</span>
                        <span class="mandi-market-tag" id="mandiLoc2">Local Mandi</span>
                    </div>
                    <div class="mandi-price-val">₹2,320 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                    <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-circle-check"></i> Government MSP Active</div>
                </div>

                <div class="mandi-preview-item">
                    <div class="mandi-item-top">
                        <span class="mandi-commodity-name">🍅 Tomato (Hybrid)</span>
                        <span class="mandi-market-tag" id="mandiLoc3">Kolar / APMC</span>
                    </div>
                    <div class="mandi-price-val">₹1,850 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                    <div style="font-size: 0.72rem; color: #38bdf8;"><i class="fas fa-arrow-right"></i> High Daily Arrivals</div>
                </div>

                <div class="mandi-preview-item">
                    <div class="mandi-item-top">
                        <span class="mandi-commodity-name">🌱 Soybean / Pulses</span>
                        <span class="mandi-market-tag" id="mandiLoc4">Regional Market</span>
                    </div>
                    <div class="mandi-price-val">₹4,800 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                    <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-arrow-trend-up"></i> Strong Procurement</div>
                </div>
            </div>
        </div>

        <!-- Latest Agricultural News (Dynamic Publisher Feed) -->
        <div class="dashboard-preview-card" id="agriNewsSummarySection">
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-newspaper" style="color: #60a5fa;"></i>
                    <span id="newsSummaryTitle">Latest Agricultural News</span>
                </div>
                <a href="news.html" class="btn-loc-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; text-decoration: none; border-radius: 6px;">
                    Read All News <i class="fas fa-arrow-right" style="font-size: 0.7rem; margin-left: 0.2rem;"></i>
                </a>
            </div>
            <div class="news-preview-grid" id="dashboardNewsGrid">
                <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
                    <i class="fas fa-spinner fa-spin" style="color: #60a5fa; margin-right: 0.4rem;"></i> Loading verified agricultural news...
                </div>
            </div>
        </div>
`;

content = content.substring(0, bodyStartIdx) + newBodyHtml + content.substring(bodyEndIdx);

// 3. Update renderSeasonalCropsUI to use dynamic location title
const renderSeasonalSearch = 'function renderSeasonalCropsUI(rawText) {';
const renderSeasonalStartIdx = content.indexOf(renderSeasonalSearch);
const renderSeasonalEndSearch = 'function renderCropAdviceUI(';
const renderSeasonalEndIdx = content.indexOf(renderSeasonalEndSearch);

const newRenderSeasonalJs = `function renderSeasonalCropsUI(rawText) {
            if (!rawText || !rawText.trim()) {
                return '<p style="color: var(--text-secondary); padding: 0.5rem 0;">No seasonal recommendations available at this time.</p>';
            }

            // Remove decorative emojis
            let cleanText = rawText
                .replace(/🌾|🌿|⚠️|🧑‍🌾|🌱|☀️|💧|🌧️|🚜/g, '')
                .trim();

            const lines = cleanText.split('\\n').map(l => l.trim()).filter(Boolean);
            
            let headline = '';
            const crops = [];
            let tip = '';
            let caution = '';

            lines.forEach(line => {
                // Headline match
                if (line.match(/^(\\**|#|\\s*)*(Top|Recommended|Kharif|Rabi|Summer|Seasonal|ಶಿಫಾರಸು|ಸಿಫಾರ್ಸು|பரிந்துரை|मौसमी)/i) && !line.match(/^\\d+[\\.\\)]/)) {
                    headline = line.replace(/[*#]/g, '').trim();
                    return;
                }

                // Numbered crop items: "1. Ragi - reason"
                const numMatch = line.match(/^(\\d+)[\\.\\)]\\s*(.+)/);
                if (numMatch) {
                    const fullContent = numMatch[2].trim();
                    let cropName = '';
                    let cropReason = '';

                    const dashSplit = fullContent.split(/\\s*[-–—:]\\s*(.+)/);
                    if (dashSplit.length > 1) {
                        cropName = dashSplit[0].replace(/[*_]/g, '').trim();
                        cropReason = dashSplit[1].replace(/[*_]/g, '').trim();
                    } else {
                        const boldMatch = fullContent.match(/^\\*\\*(.*?)\\*\\*(.*)/);
                        if (boldMatch) {
                            cropName = boldMatch[1].trim();
                            cropReason = boldMatch[2].replace(/^[-\\s:]+/, '').trim();
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
                    tip = line.replace(/^.*?(Tip|Farming Tip|ರೈತರ ಸಲಹೆ|రైತು సూచన|விவசாய குறிப்பு|किसान सलाह)\\s*[:：\\*\\-]+\\s*/i, '').replace(/[*_]/g, '').trim();
                    return;
                }

                // Caution / Alert match
                if (line.match(/Caution|Warning|Alert|ಎಚ್ಚರಿಕೆ|హెచ్చరిక|எச்சரிக்கை|सावधानी/i)) {
                    caution = line.replace(/^.*?(Caution|Warning|Alert|ಎಚ್ಚರಿಕೆ|హెచ్చరిక|எச்சரிக்கை|सावधानी)\\s*[:：\\*\\-]+\\s*/i, '').replace(/[*_]/g, '').trim();
                    return;
                }
            });

            // Dynamic Location String for Title
            const locParts = [currentDistrict, currentState].filter(Boolean);
            const dynamicLocTitle = locParts.length > 0 ? locParts.join(', ') : (currentState || 'India');

            // If parsed structured crops successfully
            if (crops.length > 0) {
                let html = '';
                html += \`<div class="seasonal-headline"><i class="fas fa-calendar-check"></i> <span>Top Recommended Crops — \${escapeHtml(dynamicLocTitle)}</span></div>\`;
                html += '<div class="seasonal-crops-list">';
                crops.forEach((c, idx) => {
                    html += \`
                        <div class="seasonal-crop-item">
                            <div class="crop-num-badge">\${c.num || (idx + 1)}</div>
                            <div class="crop-info-body">
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                                    <span class="crop-name-title">\${escapeHtml(c.name)}</span>
                                    <span class="agri-intel-status-pill status-pill-low" style="font-size: 0.62rem; padding: 0.1rem 0.45rem;">Suitable</span>
                                </div>
                                \${c.reason ? \`<div class="crop-reason-text" style="margin-top: 0.2rem;">\${escapeHtml(c.reason)}</div>\` : ''}
                            </div>
                        </div>
                    \`;
                });
                html += '</div>';

                if (tip) {
                    html += \`
                        <div class="seasonal-tip-card">
                            <i class="fas fa-lightbulb"></i>
                            <div class="seasonal-tip-content">
                                <div class="seasonal-tip-title">Farming Tip</div>
                                <div class="seasonal-tip-desc">\${escapeHtml(tip)}</div>
                            </div>
                        </div>
                    \`;
                }

                if (caution) {
                    html += \`
                        <div class="seasonal-caution-card">
                            <i class="fas fa-triangle-exclamation"></i>
                            <div class="seasonal-caution-content">
                                <div class="seasonal-caution-title">Advisory Note</div>
                                <div class="seasonal-caution-desc">\${escapeHtml(caution)}</div>
                            </div>
                        </div>
                    \`;
                }

                return html;
            }

            // Fallback plain markdown renderer
            return \`<div class="seasonal-fallback-box"><p style="line-height: 1.5; font-size: 0.86rem;">\${escapeHtml(cleanText).replace(/\\n/g, '<br>')}</p></div>\`;
        }
`;

content = content.substring(0, renderSeasonalStartIdx) + newRenderSeasonalJs + content.substring(renderSeasonalEndIdx);

// 4. Add dynamic loader for Dashboard News and Priorities updater in Script
const scriptEndSearch = '</body>';
const scriptEndIdx = content.indexOf(scriptEndSearch);

const helperScript = `
    <script>
        // Dynamic News preview on Dashboard
        async function fetchDashboardNews() {
            const grid = document.getElementById('dashboardNewsGrid');
            if (!grid) return;
            try {
                const res = await fetch(\`\${API_BASE_URL}/news?category=all\`);
                const data = await res.json();
                const articles = Array.isArray(data) ? data.slice(0, 3) : [];
                if (articles.length === 0) {
                    grid.innerHTML = '<p style="grid-column: 1/-1; padding: 1rem; color: var(--text-secondary); text-align: center;">No news available.</p>';
                    return;
                }

                grid.innerHTML = articles.map(art => {
                    const imgHtml = art.urlToImage
                        ? \`<img src="\${escapeHtml(art.urlToImage)}" class="news-preview-img" alt="News Image" onerror="this.outerHTML='<div class=\\'news-no-img-placeholder\\' style=\\'height:120px; display:flex; align-items:center; justify-content:center; background:#1e293b; color:#94a3b8; font-size:0.75rem;\\'><i class=\\'fas fa-image\\'></i>&nbsp;Image unavailable</div>'">\`
                        : \`<div class="news-no-img-placeholder" style="height:120px; display:flex; align-items:center; justify-content:center; background:#1e293b; color:#94a3b8; font-size:0.75rem;"><i class="fas fa-image"></i>&nbsp;Image unavailable</div>\`;
                    
                    return \`
                        <a href="news.html" class="news-preview-item">
                            \${imgHtml}
                            <div class="news-preview-body">
                                <div class="news-preview-title">\${escapeHtml(art.title)}</div>
                                <div class="news-preview-meta">
                                    <span><i class="fas fa-newspaper" style="color: #60a5fa;"></i> \${escapeHtml(art.source?.name || 'Agri News')}</span>
                                    <span>\${art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : 'Today'}</span>
                                </div>
                            </div>
                        </a>
                    \`;
                }).join('');
            } catch(e) {
                grid.innerHTML = '<p style="grid-column: 1/-1; padding: 1rem; color: var(--text-secondary); text-align: center;">Could not load news preview.</p>';
            }
        }

        // Hook news loader
        setTimeout(fetchDashboardNews, 1000);
        window.addEventListener('krishi:languageChanged', fetchDashboardNews);
    </script>
</body>`;

content = content.substring(0, scriptEndIdx) + helperScript + content.substring(scriptEndIdx + '</body>'.length);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Successfully applied all comprehensive dashboard improvements to frontend/dashboard.html!');
