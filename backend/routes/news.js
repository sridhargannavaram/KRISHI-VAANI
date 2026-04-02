const express = require('express');
const router = express.Router();
const axios = require('axios');

// Farmer-focused news categories
const AGRI_QUERIES = [
    'India agriculture farming',
    'India crop prices market mandi',
    'India monsoon weather forecast farming',
    'India government scheme farmers subsidy',
    'India organic farming technology'
];

router.get('/', async (req, res) => {
    try {
        const category = req.query.category || 'all';
        
        if (!process.env.NEWS_API_KEY) {
            return res.json({ articles: getOfflineNews(category) });
        }

        let query;
        switch(category) {
            case 'crops': query = 'India crop prices mandi market agriculture'; break;
            case 'weather': query = 'India monsoon weather forecast farming drought'; break;
            case 'schemes': query = 'India government farmer scheme subsidy PM Kisan'; break;
            case 'technology': query = 'India agriculture technology innovation organic farming'; break;
            default: query = 'India agriculture farming crops rural';
        }

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}&language=en&pageSize=12`;
        
        try {
            const response = await axios.get(url);
            const articles = (response.data.articles || [])
                .filter(a => a.title && a.title !== '[Removed]' && a.description)
                .slice(0, 12);
            
            if (articles.length > 0) {
                return res.json({ articles });
            }
        } catch(apiErr) {
            console.error('NewsAPI Error:', apiErr.message);
        }

        // Fallback to offline curated news
        res.json({ articles: getOfflineNews(category) });
    } catch (error) {
        console.error('News Route Error:', error.message);
        res.json({ articles: getOfflineNews('all') });
    }
});

function getOfflineNews(category) {
    const allNews = [
        { 
            title: 'Kharif Sowing Progresses Well Across South India',
            description: 'Farmers across Karnataka, Tamil Nadu, and Andhra Pradesh report healthy sowing of Ragi, Paddy, and Tur Dal this season with adequate monsoon rainfall.',
            url: '#', urlToImage: '', category: 'crops',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'PM-KISAN 17th Installment Released for 9 Crore Farmers',
            description: 'The 17th installment of PM-KISAN scheme worth ₹2,000 has been directly transferred to eligible farmer bank accounts across India.',
            url: '#', urlToImage: '', category: 'schemes',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'IMD Predicts Above Normal Monsoon for 2026',
            description: 'The India Meteorological Department forecasts above-normal rainfall this monsoon season, bringing relief to drought-affected regions of Karnataka and Maharashtra.',
            url: '#', urlToImage: '', category: 'weather',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Drone Technology Revolutionizes Pesticide Spraying',
            description: 'Agricultural drones are now being used across South India for precision pesticide spraying, reducing chemical usage by 30% and labor costs by 50%.',
            url: '#', urlToImage: '', category: 'technology',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Tomato Prices Rise in South Indian Markets',
            description: 'Tomato prices have spiked to ₹60/kg in Bangalore and Chennai markets due to supply shortages caused by unseasonal rainfall in major growing districts.',
            url: '#', urlToImage: '', category: 'crops',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Government Launches Soil Health Card Scheme 2.0',
            description: 'The revised Soil Health Card scheme provides farmers with detailed soil nutrient analysis and crop-specific fertilizer recommendations through digital cards.',
            url: '#', urlToImage: '', category: 'schemes',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Organic Farming Area Crosses 50 Lakh Hectares in India',
            description: 'India has become the largest organic farming country by number of farmers, with over 50 lakh hectares under certified organic cultivation.',
            url: '#', urlToImage: '', category: 'technology',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Southwest Monsoon to Hit Kerala Coast by June 1',
            description: 'Weather models indicate the southwest monsoon will arrive on the Kerala coast by June 1, slightly ahead of the normal date of June 5.',
            url: '#', urlToImage: '', category: 'weather',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Ragi Export Demand Surges from European Markets',
            description: 'Finger millet (Ragi) from Karnataka is seeing unprecedented export demand from European health food companies, offering premium prices to growers.',
            url: '#', urlToImage: '', category: 'crops',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Free Crop Insurance Under PMFBY Extended to 2027',
            description: 'Pradhan Mantri Fasal Bima Yojana has been extended until 2027 with reduced premium rates. Farmers can enroll through CSC centers or the PMFBY mobile app.',
            url: '#', urlToImage: '', category: 'schemes',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Smart Irrigation Systems Reduce Water Usage by 40%',
            description: 'IoT-based smart irrigation systems deployed in Karnataka have shown 40% reduction in water usage while improving crop yields by 15-20%.',
            url: '#', urlToImage: '', category: 'technology',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        },
        {
            title: 'Heavy Rainfall Warning for Coastal Karnataka',
            description: 'IMD has issued an orange alert for coastal Karnataka districts with heavy to very heavy rainfall expected over the next 48 hours.',
            url: '#', urlToImage: '', category: 'weather',
            source: { name: 'Krishi Vaani' }, publishedAt: new Date().toISOString()
        }
    ];

    if (category === 'all') return allNews;
    return allNews.filter(n => n.category === category);
}

module.exports = router;
