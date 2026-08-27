const https = require('https');
const fs = require('fs');
const path = require('path');

const WIKI_MAPPINGS = [
  { file: 'ragi.webp', title: 'Finger_millet' },
  { file: 'soybean.webp', title: 'Soybean' },
  { file: 'paddy.webp', title: 'Paddy_field' },
  { file: 'green-chilli.webp', title: 'Cayenne_pepper' },
  { file: 'dry-chilli.webp', title: 'Chili_pepper' },
  { file: 'cotton.webp', title: 'Cotton' },
  { file: 'wheat.webp', title: 'Wheat' },
  { file: 'maize.webp', title: 'Maize' },
  { file: 'tomato.webp', title: 'Tomato' },
  { file: 'onion.webp', title: 'Onion' },
  { file: 'potato.webp', title: 'Potato' },
  { file: 'groundnut.webp', title: 'Peanut' },
  { file: 'banana.webp', title: 'Banana' },
  { file: 'coconut.webp', title: 'Coconut' },
  { file: 'mustard.webp', title: 'Mustard_seed' },
  { file: 'turmeric.webp', title: 'Turmeric' },
  { file: 'ginger.webp', title: 'Ginger' },
  { file: 'garlic.webp', title: 'Garlic' },
  { file: 'cauliflower.webp', title: 'Cauliflower' },
  { file: 'cabbage.webp', title: 'Cabbage' },
  { file: 'brinjal.webp', title: 'Eggplant' },
  { file: 'carrot.webp', title: 'Carrot' }
];

function getWikiImageUrl(title) {
  return new Promise((resolve, reject) => {
    const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
    https.get(url, { headers: { 'User-Agent': 'KrishiVaaniBot/1.0 (krishivaani@chanakya.edu.in)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const imgUrl = json.originalimage?.source || json.thumbnail?.source;
          resolve(imgUrl);
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'KrishiVaaniBot/1.0 (krishivaani@chanakya.edu.in)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', reject);
  });
}

async function run() {
  const dir = path.join(__dirname, '..', 'frontend', 'assets', 'images', 'commodities');
  for (let item of WIKI_MAPPINGS) {
    try {
      const imgUrl = await getWikiImageUrl(item.title);
      if (!imgUrl) {
        console.log(`No image for ${item.title}`);
        continue;
      }
      const dest = path.join(dir, item.file);
      await download(imgUrl, dest);
      console.log(`[SAVED] ${item.file} from ${item.title} (${fs.statSync(dest).size} bytes)`);
    } catch(e) {
      console.error(`[ERROR] ${item.file}:`, e.message);
    }
  }
}

run();
