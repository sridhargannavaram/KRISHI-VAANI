const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TARGET_DIR = path.join(__dirname, '../frontend/assets/images/commodities');

// Direct Unsplash source with photo IDs:
// Marigold flowers: photo-1568644396922-5c3bfae12521 or photo-1596797882870-8c33deeac224 or photo-1508747703725-719777637510
// Cotton bolls: photo-1599058917212-d750089bc07e or photo-1584905066893-7d5c142ba4e1 or photo-1605000797499-95a51c5269ae
const CANDIDATE_URLS = {
  marigold: [
    'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=85'
  ],
  cotton: [
    'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=85'
  ]
};

async function testAndSave() {
  for (const [key, urls] of Object.entries(CANDIDATE_URLS)) {
    for (const url of urls) {
      try {
        const res = await axios({
          url,
          method: 'GET',
          responseType: 'arraybuffer',
          timeout: 10000
        });
        const filename = `${key}.webp`;
        const filePath = path.join(TARGET_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(res.data));
        console.log(`✅ Success for ${key}: ${url} -> ${filename} (${Math.round(res.data.length / 1024)} KB)`);
        break;
      } catch (e) {
        console.log(`URL failed: ${url} (${e.message})`);
      }
    }
  }
}

testAndSave();
