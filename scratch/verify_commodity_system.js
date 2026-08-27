const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '..', 'frontend', 'assets', 'images', 'commodities');
const images = fs.readdirSync(imageDir);

console.log('Total local commodity images found:', images.length);
console.log('Sample images:', images.slice(0, 20).join(', '));

const ciJs = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'assets', 'js', 'commodityImages.js'), 'utf8');
const CommodityImageService = require(path.join(__dirname, '..', 'frontend', 'assets', 'js', 'commodityImages.js'));

const testCommodities = [
    'Tomato', 'Tomato (Hybrid)', 'Onion', 'Potato', 'Paddy(Dhan)(Common)',
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Chilli Red', 'Green Chilli',
    'Ragi (Finger Millet)', 'Soyabean', 'Groundnut', 'Banana - Green',
    'Cauliflower', 'Cabbage', 'Brinjal', 'Ginger(Green)', 'Garlic',
    'Mango', 'Apple', 'Water Melon', 'Mustard', 'Turmeric'
];

console.log('\nTesting normalization and mapping for key commodities:');
testCommodities.forEach(c => {
    const url = CommodityImageService.getCommodityImageUrl(c);
    const filename = path.basename(url);
    const exists = fs.existsSync(path.join(__dirname, '..', 'frontend', url));
    console.log(`[${c}] -> ${url} (File Exists: ${exists ? 'YES' : 'NO: ' + filename})`);
});
