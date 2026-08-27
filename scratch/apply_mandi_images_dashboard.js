const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure commodityImages.js is included in the <head>
if (!content.includes('assets/js/commodityImages.js')) {
    content = content.replace('</head>', '    <script src="assets/js/commodityImages.js"></script>\n</head>');
}

// 2. Add styling for .mandi-preview-thumb and horizontal layout
const mandiCssSearch = '.mandi-preview-item {';
const mandiCssIdx = content.indexOf(mandiCssSearch);

if (mandiCssIdx !== -1) {
    const endBrace = content.indexOf('}', mandiCssIdx);
    const newMandiCss = `.mandi-preview-item {
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 0.75rem 0.85rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0.85rem;
            transition: all 0.2s ease;
        }
        .mandi-preview-thumb {
            width: 52px;
            height: 52px;
            border-radius: 8px;
            object-fit: cover;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .mandi-item-content {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }`;
    content = content.substring(0, mandiCssIdx) + newMandiCss + content.substring(endBrace + 1);
}

// 3. Update HTML markup for the 4 default preview cards to use real commodity images
const startHtml = content.indexOf('<!-- Nearby Markets / Mandi Prices');
const endHtml = content.indexOf('<!-- Latest Agricultural News', startHtml);

if (startHtml !== -1 && endHtml !== -1) {
    const updatedHtml = `<!-- Nearby Markets / Mandi Prices (Compact & Production-Level with Real Commodity Images) -->
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
                    <img src="assets/images/commodities/ragi.webp" alt="Ragi" class="mandi-preview-thumb" onerror="if(window.CommodityImageService) CommodityImageService.handleImageError(this, 'Ragi')">
                    <div class="mandi-item-content">
                        <div class="mandi-item-top">
                            <span class="mandi-commodity-name">Ragi (Finger Millet)</span>
                            <span class="mandi-market-tag" id="mandiLoc1">Bengaluru APMC</span>
                        </div>
                        <div class="mandi-price-val">₹3,450 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                        <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-arrow-trend-up"></i> Stable Demand</div>
                    </div>
                </div>

                <div class="mandi-preview-item">
                    <img src="assets/images/commodities/paddy.webp" alt="Paddy" class="mandi-preview-thumb" onerror="if(window.CommodityImageService) CommodityImageService.handleImageError(this, 'Paddy')">
                    <div class="mandi-item-content">
                        <div class="mandi-item-top">
                            <span class="mandi-commodity-name">Paddy (Rice)</span>
                            <span class="mandi-market-tag" id="mandiLoc2">Local Mandi</span>
                        </div>
                        <div class="mandi-price-val">₹2,320 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                        <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-circle-check"></i> Government MSP Active</div>
                    </div>
                </div>

                <div class="mandi-preview-item">
                    <img src="assets/images/commodities/tomato.webp" alt="Tomato" class="mandi-preview-thumb" onerror="if(window.CommodityImageService) CommodityImageService.handleImageError(this, 'Tomato')">
                    <div class="mandi-item-content">
                        <div class="mandi-item-top">
                            <span class="mandi-commodity-name">Tomato (Hybrid)</span>
                            <span class="mandi-market-tag" id="mandiLoc3">Kolar / APMC</span>
                        </div>
                        <div class="mandi-price-val">₹1,850 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                        <div style="font-size: 0.72rem; color: #38bdf8;"><i class="fas fa-arrow-right"></i> High Daily Arrivals</div>
                    </div>
                </div>

                <div class="mandi-preview-item">
                    <img src="assets/images/commodities/soybean.webp" alt="Soybean" class="mandi-preview-thumb" onerror="if(window.CommodityImageService) CommodityImageService.handleImageError(this, 'Soybean')">
                    <div class="mandi-item-content">
                        <div class="mandi-item-top">
                            <span class="mandi-commodity-name">Soybean</span>
                            <span class="mandi-market-tag" id="mandiLoc4">Regional Market</span>
                        </div>
                        <div class="mandi-price-val">₹4,800 <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                        <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-arrow-trend-up"></i> Strong Procurement</div>
                    </div>
                </div>
            </div>
        </div>

        `;
    content = content.substring(0, startHtml) + updatedHtml + content.substring(endHtml);
}

// 4. Add dynamic market loader on dashboard that leverages CommodityImageService
const scriptEndSearch = 'setTimeout(fetchDashboardNews, 1000);';
if (content.includes(scriptEndSearch) && !content.includes('fetchDashboardMarketPrices')) {
    const marketLoaderJs = `
        async function fetchDashboardMarketPrices() {
            const grid = document.getElementById('mandiPreviewGrid');
            if (!grid) return;
            try {
                const queryState = currentState || 'Karnataka';
                const res = await fetch(\`\${API_BASE_URL}/market-prices?state=\${encodeURIComponent(queryState)}&limit=4\`);
                const data = await res.json();
                if (data.success && Array.isArray(data.records) && data.records.length > 0) {
                    grid.innerHTML = data.records.slice(0, 4).map(r => {
                        const imgUrl = (window.CommodityImageService && CommodityImageService.getCommodityImageUrl)
                            ? CommodityImageService.getCommodityImageUrl(r.commodity)
                            : 'assets/images/commodities/paddy.webp';
                        const safeCommodity = escapeHtml(r.commodity || 'Commodity');
                        const safeMarket = escapeHtml(r.market || 'Local Mandi');
                        const price = Number(r.modal_price || r.max_price || 0).toLocaleString('en-IN');
                        
                        return \`
                            <div class="mandi-preview-item">
                                <img src="\${imgUrl}" alt="\${safeCommodity}" class="mandi-preview-thumb" onerror="if(window.CommodityImageService) CommodityImageService.handleImageError(this, '\${safeCommodity}')">
                                <div class="mandi-item-content">
                                    <div class="mandi-item-top">
                                        <span class="mandi-commodity-name">\${safeCommodity}</span>
                                        <span class="mandi-market-tag">\${safeMarket}</span>
                                    </div>
                                    <div class="mandi-price-val">₹\${price} <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary);">/ Qtl</span></div>
                                    <div style="font-size: 0.72rem; color: #4ade80;"><i class="fas fa-circle-check"></i> Live Modal Price</div>
                                </div>
                            </div>
                        \`;
                    }).join('');
                }
            } catch(e) {
                console.log('Using default mandi preview items.');
            }
        }
        setTimeout(fetchDashboardMarketPrices, 800);
        window.addEventListener('krishi:locationUpdated', fetchDashboardMarketPrices);
`;
    content = content.replace(scriptEndSearch, marketLoaderJs + '\n        ' + scriptEndSearch);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Mandi Prices with realistic commodity images in frontend/dashboard.html!');
