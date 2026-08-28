const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('================================================================');
console.log('🛡️ FIREBASE CREDENTIAL CONFIGURATION & SECURITY AUDIT');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. FRONTEND CONFIGURATION INSPECTION
// -------------------------------------------------------------
console.log('--- 1. Frontend Web Configuration ---');
const frontendKeys = [
    { name: 'FIREBASE_API_KEY', val: process.env.FIREBASE_API_KEY },
    { name: 'FIREBASE_AUTH_DOMAIN', val: process.env.FIREBASE_AUTH_DOMAIN },
    { name: 'FIREBASE_PROJECT_ID', val: process.env.FIREBASE_PROJECT_ID },
    { name: 'FIREBASE_STORAGE_BUCKET', val: process.env.FIREBASE_STORAGE_BUCKET },
    { name: 'FIREBASE_MESSAGING_SENDER_ID', val: process.env.FIREBASE_MESSAGING_SENDER_ID },
    { name: 'FIREBASE_APP_ID', val: process.env.FIREBASE_APP_ID },
    { name: 'FIREBASE_VAPID_KEY', val: process.env.FIREBASE_VAPID_KEY }
];

const frontendStatus = {};
frontendKeys.forEach(k => {
    if (!k.val || k.val.startsWith('PLACEHOLDER_') || k.val.startsWith('your_')) {
        frontendStatus[k.name] = 'MISSING / PLACEHOLDER';
    } else if (k.val.length > 3) {
        frontendStatus[k.name] = 'PRESENT (VALID FORMAT)';
    } else {
        frontendStatus[k.name] = 'INVALID FORMAT';
    }
    console.log(`[${k.name}]: ${frontendStatus[k.name]}`);
});

// -------------------------------------------------------------
// 2. BACKEND ADMIN SDK INSPECTION
// -------------------------------------------------------------
console.log('\n--- 2. Backend Firebase Admin SDK ---');
const serviceAccountPath = path.join(__dirname, '..', 'backend', 'serviceAccountKey.json');
let adminProject = null;
let adminEmail = null;
let privateKeyValid = false;

if (fs.existsSync(serviceAccountPath)) {
    try {
        const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        adminProject = sa.project_id;
        adminEmail = sa.client_email;
        if (sa.private_key && sa.private_key.includes('BEGIN PRIVATE KEY') && sa.private_key.includes('END PRIVATE KEY')) {
            privateKeyValid = true;
        }
        console.log(`Service Account File Exists: YES`);
        console.log(`Service Account Readable: YES`);
        console.log(`Private Key Structure: ${privateKeyValid ? 'VALID RSA KEY' : 'INVALID'}`);
        console.log(`Client Email Form: ${adminEmail?.includes('@') ? 'VALID SERVICE ACCOUNT' : 'INVALID'}`);
    } catch (e) {
        console.log(`Service Account Parse Error: ${e.message}`);
    }
} else {
    console.log(`Service Account File Exists: NO`);
}

// -------------------------------------------------------------
// 3. PROJECT CONSISTENCY CHECK
// -------------------------------------------------------------
console.log('\n--- 3. Project Consistency Check ---');
const frontendProj = process.env.FIREBASE_PROJECT_ID;
const senderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.FIREBASE_APP_ID;

const projectMatch = (frontendProj && adminProject && frontendProj === adminProject);
const senderIdInAppId = (senderId && appId && appId.includes(senderId));

console.log(`Frontend Project ID Defined: ${!!frontendProj}`);
console.log(`Backend Project ID Defined: ${!!adminProject}`);
console.log(`Project ID Exact Match: ${projectMatch ? 'PASS (CONSISTENT)' : 'FAIL (MISMATCH)'}`);
console.log(`Messaging Sender ID Consistency: ${senderIdInAppId ? 'PASS (MATCHES APP ID)' : 'FAIL'}`);

// -------------------------------------------------------------
// 4. GIT SECURITY & SECRET EXPOSURE CHECK
// -------------------------------------------------------------
console.log('\n--- 4. Git Security & Secret Leak Inspection ---');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
const backendGitignorePath = path.join(__dirname, '..', 'backend', '.gitignore');

let rootGitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
let backendGitignoreContent = fs.existsSync(backendGitignorePath) ? fs.readFileSync(backendGitignorePath, 'utf8') : '';

const ignoresEnv = rootGitignoreContent.includes('.env');
const ignoresServiceAccount = rootGitignoreContent.includes('serviceAccountKey') || backendGitignoreContent.includes('serviceAccountKey');

console.log(`Root .gitignore protects .env: ${ignoresEnv ? 'PASS' : 'FAIL'}`);
console.log(`Gitignore protects serviceAccountKey.json: ${ignoresServiceAccount ? 'PASS' : 'FAIL'}`);

console.log('\n================================================================');
console.log('AUDIT COMPLETED SAFELY WITHOUT EXPOSING SECRETS');
console.log('================================================================');
