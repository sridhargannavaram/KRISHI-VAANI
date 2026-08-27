const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove HTML for Today's Priorities Section
const pStart = content.indexOf('<!-- Today\'s Priorities Section -->');
const fStart = content.indexOf('<!-- 24-Hour Forecast');

if (pStart === -1 || fStart === -1) {
    console.error('HTML markers not found!');
    process.exit(1);
}

content = content.substring(0, pStart) + content.substring(fStart);

// 2. Clean up updateTodayAgriStatus in JS
const jsTargetMarker = '// Update Today\'s Priorities Dynamically';
const jsTargetIdx = content.indexOf(jsTargetMarker);

if (jsTargetIdx !== -1) {
    const jsEndMarker = '// ================= STRUCTURED UI RENDERER FOR SEASONAL CROPS =================';
    const jsEndIdx = content.indexOf(jsEndMarker, jsTargetIdx);
    if (jsEndIdx !== -1) {
        content = content.substring(0, jsTargetIdx) + content.substring(jsEndIdx);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed Today\'s Priorities section and cleaned up JS in frontend/dashboard.html!');
