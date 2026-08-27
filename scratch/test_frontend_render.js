const fs = require('fs');

const dashboardHtml = fs.readFileSync('frontend/dashboard.html', 'utf8');

// Extract renderSeasonalCropsUI function from dashboard.html
const fnStart = dashboardHtml.indexOf('function renderSeasonalCropsUI(');
const fnEnd = dashboardHtml.indexOf('function renderCropAdviceUI(', fnStart);
const fnCode = dashboardHtml.substring(fnStart, fnEnd);

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

eval(fnCode);

const testOutputs = [
    `🌾 **Top 3 Recommended Crops for August (Kharif Season - Karnataka):**
1. Ragi (Finger Millet - GPU-28 / ML-365) - Highly drought-tolerant, optimal for current temperatures and soil conditions.
2. Paddy (Rice - Jyothi / Jaya) - Ideal for medium rainfall zones with assured water drainage.
3. Tur Dal (Pigeon Pea - BRG-2) - High-value pulse crop, excellent for intercropping with Ragi or Maize.

🌿 **Farming Tip:** Perform seed treatment with Trichoderma (4g/kg) and Azospirillum bio-fertilizers before sowing to enhance seedling vigor.

⚠️ **Caution:** Current humidity is 75%. Ensure clean drainage channels around fields to avoid root rot and fungal leaf blight.`,

    `🌾 **August ತಿಂಗಳಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಬೆಳೆಗಳು (Karnataka):**
1. ರಾಗಿ (GPU-28 / ML-365) - ಮುಂಗಾರು ಹಂಗಾಮಿಗೆ ಅತ್ಯಂತ ಸೂಕ್ತ, ಕಡಿಮೆ ನೀರು ಸಾಕು ಮತ್ತು ಅಧಿಕ ಇಳುವರಿ ನೀಡುತ್ತದೆ.
2. ಭತ್ತ (ಜ್ಯೋತಿ / ಜಯ) - ಮಧ್ಯಮ ಮಳೆ ಹಾಗೂ ಕಾಲುವೆ ನೀರಾವರಿ ಪ್ರದೇಶಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ.
3. ತೊಗರಿ ಬೇಳೆ (BRG-2) - ರಾಗಿ ಅಥವಾ ಮುಸುಕಿನ ಜೋಳದೊಂದಿಗೆ ಉತ್ತಮ ಮಿಶ್ರ ಬೆಳೆಯಾಗಿದ್ದು ಮಣ್ಣಿನ ಸಾರ ಹೆಚ್ಚಿಸುತ್ತದೆ.

🌿 **ರೈತರ ಸಲಹೆ:** ಬಿತ್ತನೆ ಮಾಡುವ ಮುನ್ನ ಬೀಜಗಳಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ (೪ ಗ್ರಾಂ/ಕೆಜಿ) ಹಾಗೂ ಅಜೋಸ್ಪಿರಿಲಮ್ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.

⚠️ **ಎಚ್ಚರಿಕೆ:** ಪ್ರಸ್ತುತ ತೇವಾಂಶವು 75% ಇದೆ. ಬೇರು ಕೊಳೆ ರೋಗ ಮತ್ತು ಶಿಲೀಂಧ್ರ ಬಾಧೆ ತಡೆಯಲು ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿದು ಹೋಗಲು ಕಾಲುವೆ ಮಾಡಿ.`
];

console.log('Testing Frontend Seasonal Crops UI Rendering...\n');
testOutputs.forEach((sample, i) => {
    console.log(`--- Sample #${i+1} Render HTML Output ---`);
    const renderedHtml = renderSeasonalCropsUI(sample);
    console.log('Contains seasonal-crop-item?', renderedHtml.includes('seasonal-crop-item'));
    console.log('Contains seasonal-tip-card?', renderedHtml.includes('seasonal-tip-card'));
    console.log('Contains seasonal-caution-card?', renderedHtml.includes('seasonal-caution-card'));
    console.log('Rendered length (characters):', renderedHtml.length);
    console.log('');
});
