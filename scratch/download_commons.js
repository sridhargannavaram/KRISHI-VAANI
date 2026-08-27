const https = require('https');
const fs = require('fs');
const path = require('path');

const sources = [
  {
    name: 'green-chilli.webp',
    url: 'https://images.pexels.com/photos/5945899/pexels-photo-5945899.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'dry-chilli.webp',
    url: 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'ragi.webp',
    url: 'https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'paddy.webp',
    url: 'https://images.pexels.com/photos/4187652/pexels-photo-4187652.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'soybean.webp',
    url: 'https://images.pexels.com/photos/3735171/pexels-photo-3735171.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });
    req.on('error', reject);
  });
}

async function run() {
  for (let s of sources) {
    const dest = path.join(__dirname, '..', 'frontend', 'assets', 'images', 'commodities', s.name);
    try {
      await download(s.url, dest);
      console.log('Saved ' + s.name + ' (' + fs.statSync(dest).size + ' bytes)');
    } catch(e) {
      console.error('Error for ' + s.name + ':', e.message);
    }
  }
}

run();
