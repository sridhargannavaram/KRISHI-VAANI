const CommodityImageService = require('../frontend/assets/js/commodityImages.js');

async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/market-prices?limit=100');
    const data = await res.json();
    const records = data.records || [];
    const commodities = [...new Set(records.map(r => r.commodity))];
    console.log('Total distinct commodities in current 100 records:', commodities.length);
    commodities.forEach(c => {
      const img = CommodityImageService.getCommodityImageUrl(c);
      const isPlaceholder = img.startsWith('data:image');
      console.log(`${c} -> ${isPlaceholder ? '[SVG Placeholder: ' + c + ']' : img}`);
    });
  } catch(e) {
    console.error('Error:', e.message);
  }
}

test();
