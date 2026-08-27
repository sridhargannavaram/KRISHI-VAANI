const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetSearch = '<!-- Today\'s Priorities Section -->';
const targetIdx = content.indexOf(targetSearch);

if (targetIdx === -1) {
    console.error('Target not found!');
    process.exit(1);
}

const statusHtml = `<!-- Today's Agricultural Status Section (Executive Agricultural Intelligence Panel) -->
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

        `;

content = content.substring(0, targetIdx) + statusHtml + content.substring(targetIdx);

// Adjust spacing: priorities panel margin-top: 1.25rem when below Agri Status
content = content.replace(/\.priorities-panel\s*\{\s*background:\s*rgba\(22,\s*36,\s*43,\s*0\.7\);\s*border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.08\);\s*border-radius:\s*14px;\s*padding:\s*1\.15rem\s*1\.35rem;\s*margin-top:\s*1\.5rem;/g,
`.priorities-panel {
            background: rgba(22, 36, 43, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 1.1rem 1.3rem;
            margin-top: 1.25rem;`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully restored Today\'s Agricultural Status section to frontend/dashboard.html!');
