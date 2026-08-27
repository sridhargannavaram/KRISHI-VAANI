const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// Target the end of updateTodayAgriStatus
const marker = 'if (descRecAction) {';
const targetIdx = content.indexOf(marker);

if (targetIdx === -1) {
    console.error('Target marker not found!');
    process.exit(1);
}

const closingBraceIdx = content.indexOf('}', content.indexOf('descRecAction.innerHTML', targetIdx));

const priorityCode = `
            // Update Today's Priorities Dynamically
            const p1Label = document.getElementById('priority1Label');
            const p1Desc = document.getElementById('priority1Desc');
            if (p1Label && p1Desc) {
                if (humidity >= 80) {
                    p1Label.innerHTML = \`<i class="fas fa-triangle-exclamation" style="color:#ef4444;"></i> \${lang === 'kn' ? 'ಹೆಚ್ಚಿನ ತೇವಾಂಶ' : lang === 'hi' ? 'उच्च आर्द्रता' : 'High Humidity'} (\${humidity}%)\`;
                    p1Desc.innerText = lang === 'kn' ? 'ಶಿಲೀಂಧ್ರ ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಎಲೆಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.' : 'Monitor lower crop foliage for fungal disease risk.';
                } else if (humidity >= 65) {
                    p1Label.innerHTML = \`<i class="fas fa-triangle-exclamation" style="color:#f59e0b;"></i> \${lang === 'kn' ? 'ಮಧ್ಯಮ ತೇವಾಂಶ' : lang === 'hi' ? 'मध्यम आर्द्रता' : 'Moderate Humidity'} (\${humidity}%)\`;
                    p1Desc.innerText = lang === 'kn' ? 'ಬೆಳೆಗಳಲ್ಲಿ ಕೀಟ ಮತ್ತು ತೇವಾಂಶದ ನಿಗಾ ವಹಿಸಿ.' : 'Inspect crops for early signs of disease.';
                } else {
                    p1Label.innerHTML = \`<i class="fas fa-circle-check" style="color:#22c55e;"></i> \${lang === 'kn' ? 'ಉತ್ತಮ ತೇವಾಂಶ' : lang === 'hi' ? 'अनुकूल आर्द्रता' : 'Optimal Humidity'} (\${humidity}%)\`;
                    p1Desc.innerText = lang === 'kn' ? 'ಬೆಳೆ ಬೆಳವಣಿಗೆಗೆ ಹವಾಮಾನ ಅನುಕೂಲಕರವಾಗಿದೆ.' : 'Current moisture supports healthy crop growth.';
                }
            }

            const p2Label = document.getElementById('priority2Label');
            const p2Desc = document.getElementById('priority2Desc');
            if (p2Label && p2Desc) {
                if (weatherBadgeClass === 'status-pill-high') {
                    p2Label.innerHTML = \`<i class="fas fa-cloud-showers-heavy" style="color:#ef4444;"></i> \${lang === 'kn' ? 'ಮಳೆಯ ಮುನ್ಸೂಚನೆ' : lang === 'hi' ? 'बारिश की संभावना' : 'Rain Expected'}\`;
                    p2Desc.innerText = lang === 'kn' ? 'ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರೆಯಿರಿ.' : 'Check and clear field drainage channels.';
                } else if (weatherBadgeClass === 'status-pill-moderate') {
                    p2Label.innerHTML = \`<i class="fas fa-cloud-sun-rain" style="color:#3b82f6;"></i> \${lang === 'kn' ? 'ಲಘು ಮಳೆ ಸಾಧ್ಯತೆ' : lang === 'hi' ? 'हल्की बारिश' : 'Showers Possible'}\`;
                    p2Desc.innerText = lang === 'kn' ? 'ಸಿಂಪಡಣೆ ಕಾರ್ಯವನ್ನು ಮಳೆ ರಹಿತ ಸಮಯದಲ್ಲಿ ಮಾಡಿ.' : 'Schedule spraying during dry daytime windows.';
                } else {
                    p2Label.innerHTML = \`<i class="fas fa-sun" style="color:#eab308;"></i> \${lang === 'kn' ? 'ಸ್ವಚ್ಛ ಹವಾಮಾನ' : lang === 'hi' ? 'साफ मौसम' : 'Clear Weather'}\`;
                    p2Desc.innerText = lang === 'kn' ? 'ಕಟಾವು ಮತ್ತು ಉಳುಮೆಗೆ ಉತ್ತಮ ದಿನ.' : 'Favorable window for open field operations.';
                }
            }

            const p3Label = document.getElementById('priority3Label');
            const p3Desc = document.getElementById('priority3Desc');
            if (p3Label && p3Desc) {
                p3Label.innerHTML = \`<i class="fas fa-seedling" style="color:#22c55e;"></i> \${lang === 'kn' ? 'ಮುಂಗಾರು ಬೆಳೆ' : lang === 'hi' ? 'मौसमी फसल' : 'Seasonal Crop'}\`;
                p3Desc.innerText = lang === 'kn' ? \`\${currentState || 'ಸ್ಥಳೀಯ'} ಪ್ರದೇಶದ ಮುಂಗಾರು ಬೆಳೆಗೆ ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿದೆ.\` : \`Current conditions suitable for \${currentState || 'local'} Kharif crops.\`;
            }

            const p4Label = document.getElementById('priority4Label');
            const p4Desc = document.getElementById('priority4Desc');
            if (p4Label && p4Desc) {
                p4Label.innerHTML = \`<i class="fas fa-chart-line" style="color:#a855f7;"></i> \${lang === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ದರ' : lang === 'hi' ? 'मंडी भाव' : 'Market Rates'}\`;
                p4Desc.innerText = \`Check live mandi rates for \${currentDistrict || currentCity || 'nearby'} markets.\`;
            }
`;

content = content.substring(0, closingBraceIdx + 1) + priorityCode + content.substring(closingBraceIdx + 1);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected Today\'s Priorities logic into updateTodayAgriStatus!');
