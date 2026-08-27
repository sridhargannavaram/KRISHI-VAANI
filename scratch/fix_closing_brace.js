const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

const marker = 'descRecAction.innerHTML = recActions.map((act, idx) => `';
const markerIdx = content.indexOf(marker);

if (markerIdx === -1) {
    console.error('Marker not found!');
    process.exit(1);
}

const closingBraceIdx = content.indexOf('}', content.indexOf('`).join(\'\');', markerIdx));
const targetBeforeRenderer = content.indexOf('// ================= STRUCTURED UI RENDERER FOR SEASONAL CROPS', closingBraceIdx);

const currentBetween = content.substring(closingBraceIdx, targetBeforeRenderer);
console.log('Current code between end of descRecAction and renderer:', JSON.stringify(currentBetween));

content = content.substring(0, closingBraceIdx + 1) + '\n        }\n\n        ' + content.substring(targetBeforeRenderer);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed closing brace in frontend/dashboard.html!');

// Now extract Script #2 and test syntax with node -c
const s2Start = content.indexOf('<script', content.indexOf('<script', content.indexOf('<script') + 1) + 1);
const s2Body = content.substring(content.indexOf('>', s2Start) + 1, content.indexOf('</script>', s2Start));
fs.writeFileSync('scratch/temp_script.js', s2Body, 'utf8');
