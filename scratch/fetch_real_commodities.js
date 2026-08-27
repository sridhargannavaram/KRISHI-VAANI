const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '..', 'frontend', 'assets', 'images', 'commodities');

const sources = [
  {
    name: 'paddy.webp',
    // Golden paddy grains harvest
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'ragi.webp',
    // Finger millet / ragi crop harvest
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'soybean.webp',
    // Real soybean crop / seeds
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'green-chilli.webp',
    // Real fresh green chillies
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'dry-chilli.webp',
    // Real dried red chillies
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (let s of sources) {
    const dest = path.join(dir, s.name);
    console.log(`Downloading real commodity photograph for ${s.name}...`);
    try {
      await download(s.url, dest);
      console.log(`[OK] Saved ${s.name} (${fs.statSync(dest).size} bytes)`);
    } catch(e) {
      console.error(`[FAIL] ${s.name}:`, e.message);
    }
  }
}

run();
