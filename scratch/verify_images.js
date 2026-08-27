const fs = require('fs');
const path = require('path');
const http = require('http');

const commoditiesDir = path.join(__dirname, '..', 'frontend', 'assets', 'images', 'commodities');

http.get('http://localhost:4000/api/news?category=all', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        console.log('Total articles fetched:', json.articles.length);

        function resolveArticleImage(article) {
            const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
            let localFallback = 'assets/images/commodities/paddy.webp';
            if (text.includes('wheat') || text.includes('atta') || text.includes('grain')) localFallback = 'assets/images/commodities/wheat.webp';
            else if (text.includes('paddy') || text.includes('rice') || text.includes('basmati')) localFallback = 'assets/images/commodities/paddy.webp';
            else if (text.includes('ragi') || text.includes('millet') || text.includes('jowar') || text.includes('bajra')) localFallback = 'assets/images/commodities/ragi.webp';
            else if (text.includes('maize') || text.includes('corn') || text.includes('popcorn')) localFallback = 'assets/images/commodities/maize.webp';
            else if (text.includes('mustard') || text.includes('oilseed')) localFallback = 'assets/images/commodities/mustard.webp';
            else if (text.includes('cotton') || text.includes('fiber')) localFallback = 'assets/images/commodities/cotton.webp';
            else if (text.includes('sugar') || text.includes('sugarcane') || text.includes('jaggery') || text.includes('cane')) localFallback = 'assets/images/commodities/jaggery.webp';
            else if (text.includes('tomato')) localFallback = 'assets/images/commodities/tomato.webp';
            else if (text.includes('onion')) localFallback = 'assets/images/commodities/onion.webp';
            else if (text.includes('potato')) localFallback = 'assets/images/commodities/potato.webp';
            else if (text.includes('chilli') || text.includes('chili') || text.includes('pepper')) localFallback = 'assets/images/commodities/green-chilli.webp';
            else if (text.includes('ginger')) localFallback = 'assets/images/commodities/ginger.webp';
            else if (text.includes('turmeric')) localFallback = 'assets/images/commodities/turmeric.webp';
            else if (text.includes('garlic')) localFallback = 'assets/images/commodities/garlic.webp';
            else if (text.includes('groundnut') || text.includes('peanut')) localFallback = 'assets/images/commodities/groundnut.webp';
            else if (text.includes('soybean') || text.includes('soya')) localFallback = 'assets/images/commodities/soybean.webp';
            else if (text.includes('mushroom')) localFallback = 'assets/images/commodities/mushroom.webp';
            else if (text.includes('banana')) localFallback = 'assets/images/commodities/banana.webp';
            else if (text.includes('mango')) localFallback = 'assets/images/commodities/mango.webp';
            else if (text.includes('apple') || text.includes('orchard')) localFallback = 'assets/images/commodities/apple.webp';
            else if (text.includes('coconut')) localFallback = 'assets/images/commodities/coconut.webp';
            else if (text.includes('gram') || text.includes('pulse') || text.includes('dal') || text.includes('lentil') || text.includes('cowpea')) localFallback = 'assets/images/commodities/bengal-gram.webp';
            else {
                const cat = article.category || 'crops';
                if (cat === 'crops') localFallback = 'assets/images/commodities/paddy.webp';
                else if (cat === 'weather') localFallback = 'assets/images/commodities/rice.webp';
                else if (cat === 'schemes') localFallback = 'assets/images/commodities/wheat.webp';
                else if (cat === 'technology') localFallback = 'assets/images/commodities/cotton.webp';
            }
            return localFallback;
        }

        let allFilesExist = true;
        json.articles.forEach((a, i) => {
            const resolvedPath = resolveArticleImage(a);
            const fileName = path.basename(resolvedPath);
            const fullPath = path.join(commoditiesDir, fileName);
            const exists = fs.existsSync(fullPath);
            if (!exists) {
                console.error('File not found on disk:', fullPath);
                allFilesExist = false;
            }
            console.log(`[Card ${i+1}] ${a.title.substring(0, 40)}... -> ${fileName} (Exists: ${exists})`);
        });

        console.log('\nAll Fallback Image Files Exist On Disk:', allFilesExist);
    });
});
