const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove HTML block for Today's Agricultural Status Section
const statusStart = content.indexOf('<!-- Today\'s Agricultural Status Section');
const prioritiesStart = content.indexOf('<!-- Today\'s Priorities Section -->');

if (statusStart === -1 || prioritiesStart === -1) {
    console.error('Markers not found!');
    process.exit(1);
}

content = content.substring(0, statusStart) + content.substring(prioritiesStart);

// 2. Adjust .priorities-panel margin-top to 1.5rem for perfect spacing below the weather stats row
content = content.replace(/\.priorities-panel\s*\{\s*background:\s*rgba\(22,\s*36,\s*43,\s*0\.7\);\s*border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.08\);\s*border-radius:\s*14px;\s*padding:\s*1\.1rem\s*1\.3rem;\s*margin-top:\s*1\.25rem;/g, 
`.priorities-panel {
            background: rgba(22, 36, 43, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 1.15rem 1.35rem;
            margin-top: 1.5rem;`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed Today\'s Agricultural Status section and adjusted spacing!');
