/**
 * Geocoding & Spatial Location Service for Krishi Vaani Mandis
 * Provides precise coordinates, PostGIS geometry enrichment, and geographic distance calculation.
 */

const { query } = require('../config/db');

// Comprehensive dictionary of Indian APMC Mandis, Markets, and Towns [Longitude, Latitude]
const MARKET_COORDINATES_DB = {
    // --- BENGALURU URBAN & RURAL ---
    'yeshwanthpur': [77.5450, 13.0210],
    'yeshwanthpura': [77.5450, 13.0210],
    'binny mill': [77.5600, 12.9750],
    'binnypet': [77.5600, 12.9750],
    'kalasipalya': [77.5780, 12.9600],
    'kr market': [77.5750, 12.9650],
    'singena agrahara': [77.6850, 12.8350],
    'doddaballapur': [77.5358, 13.2926],
    'doddaballapura': [77.5358, 13.2926],
    'devanahalli': [77.7126, 13.2483],
    'hoskote': [77.7981, 13.0700],
    'nelamangala': [77.3912, 13.0978],
    'yelahanka': [77.5963, 13.1007],
    'bengaluru': [77.5946, 12.9716],
    'bangalore': [77.5946, 12.9716],

    // --- RAMANAGARA & MANDYA ---
    'ramanagara': [77.2811, 12.7214],
    'channapatna': [77.2023, 12.6518],
    'magadi': [77.2274, 12.9575],
    'kanakapura': [77.4167, 12.5467],
    'mandya': [76.8951, 12.5218],
    'maddur': [77.0450, 12.5840],
    'malavalli': [77.0560, 12.3870],
    'pandavapura': [76.6667, 12.4967],
    'kr pet': [76.4917, 12.6633],
    'krishnarajpet': [76.4917, 12.6633],
    'nagamangala': [76.7583, 12.8183],
    'srirangapatna': [76.6947, 12.4214],

    // --- KOLAR & CHIKKABALLAPURA ---
    'kolar': [78.1340, 13.1362],
    'malur': [77.9392, 13.0039],
    'bangarapet': [78.2017, 12.9783],
    'srinivaspur': [78.2144, 13.3364],
    'mulbagal': [78.3967, 13.1633],
    'chikkaballapur': [77.7275, 13.4325],
    'chikkaballapura': [77.7275, 13.4325],
    'sidlaghatta': [77.8633, 13.3917],
    'chintamani': [78.0583, 13.4017],
    'bagepalli': [77.7933, 13.7850],
    'gudibande': [77.7017, 13.6700],
    'gowribidanur': [77.5183, 13.6133],

    // --- TUMAKURU & CHITRADURGA ---
    'tumkur': [77.1010, 13.3379],
    'tumakuru': [77.1010, 13.3379],
    'tiptur': [76.4789, 13.2575],
    'kunigal': [77.0267, 13.0233],
    'madhugiri': [77.2100, 13.6633],
    'sira': [76.9017, 13.7433],
    'gubbi': [76.9400, 13.3117],
    'koratagere': [77.2367, 13.5233],
    'turuvekere': [76.6667, 13.1600],
    'pavagada': [77.2767, 14.1000],
    'chitradurga': [76.4011, 14.2251],
    'challakere': [76.6500, 14.3133],
    'hiriyur': [76.6167, 13.9500],
    'holalkere': [76.1833, 14.0333],
    'hosadurga': [76.2833, 13.7967],
    'molakalmuru': [76.7333, 14.7333],

    // --- MYSURU, HASSAN & KODAGU ---
    'mysuru': [76.6394, 12.2958],
    'mysore': [76.6394, 12.2958],
    'bandipalya': [76.6667, 12.2800],
    'nanjangud': [76.6800, 12.1200],
    't narasipura': [76.9000, 12.2133],
    'hunsur': [76.2900, 12.3100],
    'kr nagar': [76.3833, 12.5833],
    'hassan': [76.0996, 13.0033],
    'arasikere': [76.2578, 13.3150],
    'arsikere': [76.2578, 13.3150],
    'channarayapatna': [76.3900, 12.9033],
    'sakleshpur': [75.7867, 12.9433],
    'belur': [75.8600, 13.1633],
    'holenarasipura': [76.2467, 12.7900],
    'chamarajanagar': [76.9400, 11.9267],
    'gundlupet': [76.6900, 11.8033],
    'kollegal': [77.1167, 12.1567],
    'madikeri': [75.7382, 12.4244],
    'somwarpet': [75.8667, 12.6000],
    'virajpet': [75.8033, 12.2000],

    // --- COASTAL & MALNAD (UDUPI, DAKSHINA KANNADA, SHIVAMOGGA) ---
    'mangaluru': [74.8560, 12.9141],
    'mangalore': [74.8560, 12.9141],
    'bantwal': [75.0333, 12.8900],
    'puttur': [75.2000, 12.7667],
    'belthangady': [75.2933, 13.0000],
    'sullia': [75.3900, 12.5633],
    'udupi': [74.7421, 13.3409],
    'kundapura': [74.6942, 13.6269],
    'karkala': [74.9967, 13.2133],
    'shivamogga': [75.5681, 13.9299],
    'shimoga': [75.5681, 13.9299],
    'bhadravathi': [75.7067, 13.8400],
    'sagar': [75.0300, 14.1667],
    'shikaripura': [75.3533, 14.2700],
    'soraba': [75.0933, 14.3800],
    'thirthahalli': [75.2400, 13.6933],
    'chikkamagaluru': [75.7720, 13.3161],
    'chikmagalur': [75.7720, 13.3161],
    'tarikere': [75.8167, 13.7167],
    'kadur': [76.0133, 13.5533],
    'karwar': [74.1300, 14.8100],
    'sirsi': [74.8433, 14.6194],
    'kumta': [74.4200, 14.4267],
    'yellapur': [74.7100, 14.9633],
    'bhatkal': [74.5633, 13.9800],

    // --- NORTH KARNATAKA (BELAGAVI, BAGALKOT, VIJAYAPURA, DHARWAD, HAVERI) ---
    'belagavi': [74.4977, 15.8497],
    'belgaum': [74.4977, 15.8497],
    'gokak': [74.8233, 16.1667],
    'bailhongal': [74.8567, 15.8167],
    'chikkodi': [74.5967, 16.4333],
    'athani': [75.0633, 16.7333],
    'sankeshwar': [74.4833, 16.2633],
    'ramdurg': [75.2967, 15.9467],
    'saundatti': [75.1167, 15.7667],
    'dharwad': [75.0078, 15.4589],
    'hubballi': [75.1240, 15.3647],
    'hubli': [75.1240, 15.3647],
    'kalghatgi': [74.9733, 15.1767],
    'navalgund': [75.3633, 15.5633],
    'kundgol': [75.2500, 15.2567],
    'bagalkot': [75.6980, 16.1800],
    'bagalkote': [75.6980, 16.1800],
    'badami': [75.6767, 15.9183],
    'hungund': [76.0567, 16.0633],
    'jamkhandi': [75.2933, 16.5067],
    'mudhol': [75.2833, 16.3500],
    'ilkal': [76.1267, 15.9633],
    'guledgudda': [75.7867, 16.0500],
    'bilgi': [75.6200, 16.3400],
    'vijayapura': [75.7139, 16.8302],
    'bijapur': [75.7139, 16.8302],
    'indi': [75.9600, 17.1767],
    'sindgi': [76.2333, 16.9167],
    'muddebihal': [76.1367, 16.3367],
    'basavana bagevadi': [75.9667, 16.5767],
    'gadag': [75.6297, 15.4167],
    'betageri': [75.6500, 15.4333],
    'ron': [75.7333, 15.7000],
    'nargund': [75.3900, 15.7200],
    'mundargi': [75.9000, 15.2100],
    'shirhatti': [75.5800, 15.2300],
    'haveri': [75.3967, 14.7967],
    'ranebennur': [75.6247, 14.6233],
    'byadgi': [75.4867, 14.6800],
    'hirekerur': [75.3900, 14.4567],
    'hangal': [75.1267, 14.7633],
    'shiggaon': [75.2300, 14.9967],
    'savanur': [75.3400, 14.9700],
    'davanagere': [75.9218, 14.4644],
    'harihar': [75.8033, 14.5133],
    'honnali': [75.6433, 14.2467],
    'channagiri': [75.9300, 14.1200],
    'jagalur': [76.3500, 14.5200],

    // --- HYDERABAD-KARNATAKA (KALABURAGI, BALLARI, RAICHUR, KOPPAL, YADGIR, BIDAR) ---
    'kalaburagi': [76.8343, 17.3297],
    'gulbarga': [76.8343, 17.3297],
    'sedam': [77.2967, 17.1800],
    'aland': [76.5700, 17.5667],
    'chincholi': [77.4200, 17.4700],
    'afzalpur': [76.3567, 17.2000],
    'jivargi': [76.7767, 17.0133],
    'j衝突i': [76.7767, 17.0133],
    'ballari': [76.9214, 15.1394],
    'bellary': [76.9214, 15.1394],
    'hosapete': [76.3908, 15.2689],
    'hospet': [76.3908, 15.2689],
    'kudligi': [76.3867, 14.9000],
    'siruguppa': [76.8967, 15.6333],
    'sandur': [76.5500, 15.0833],
    'hagaribommanahalli': [76.2000, 15.0833],
    'raichur': [77.3566, 16.2120],
    'manvi': [77.0500, 15.9900],
    'sindhanur': [76.7633, 15.7767],
    'devadurga': [76.9367, 16.4233],
    'lingasugur': [76.5167, 16.1600],
    'koppal': [76.1558, 15.3456],
    'gangavathi': [76.5300, 15.4300],
    'kushtagi': [76.1967, 15.7567],
    'yelburga': [76.0100, 15.6100],
    'yadgir': [77.1378, 16.7700],
    'shahapur': [76.8400, 16.7000],
    'shorapur': [76.7567, 16.5200],
    'surpur': [76.7567, 16.5200],
    'bidar': [77.5186, 17.9104],
    'humnabad': [77.1333, 17.7667],
    'bhalki': [77.2167, 18.0333],
    'aurad': [77.4333, 18.2500],
    'basavakalyan': [76.9500, 17.8700],

    // --- ANDHRA PRADESH & TELANGANA ---
    'hyderabad': [78.4867, 17.3850],
    'bowenpally': [78.4800, 17.4700],
    'gaddi annaram': [78.5300, 17.3600],
    'warangal': [79.5977, 17.9689],
    'nizamabad': [78.0941, 18.6725],
    'khammam': [80.1514, 17.2473],
    'karimnagar': [79.1288, 18.4386],
    'mahbubnagar': [77.9972, 16.7450],
    'nalgonda': [79.2671, 17.0577],
    'suryapet': [79.6236, 17.1439],
    'guntur': [80.4365, 16.3067],
    'vijayawada': [80.6480, 16.5062],
    'kurnool': [78.0373, 15.8281],
    'anantapur': [77.6006, 14.6819],
    'hindupur': [77.4900, 13.8300],
    'dharmavaram': [77.7200, 14.4100],
    'kadapa': [78.8242, 14.4673],
    'tirupati': [79.4192, 13.6288],
    'chittoor': [79.1003, 13.2172],
    'madanapalle': [78.5033, 13.5500],
    'nellore': [79.9865, 14.4426],
    'ongole': [80.0499, 15.5057],
    'visakhapatnam': [83.2185, 17.6868],
    'vizianagaram': [83.4072, 18.1124],
    'srikakulam': [83.8938, 18.2949],
    'rajahmundry': [81.7963, 17.0005],
    'eluru': [81.1037, 16.7107],

    // --- MAHARASHTRA ---
    'pune': [73.8567, 18.5204],
    'gultekdi': [73.8700, 18.4900],
    'mumbai': [72.8777, 19.0760],
    'vashi': [72.9982, 19.0771],
    'kalyan': [73.1305, 19.2437],
    'nashik': [73.7898, 19.9975],
    'lasalgaon': [74.2274, 20.1477],
    'pimpalgaon': [73.9800, 20.1700],
    'malegaon': [74.5300, 20.5500],
    'yeola': [74.4900, 20.0400],
    'nagpur': [79.0882, 21.1458],
    'kolhapur': [74.2433, 16.7050],
    'solapur': [75.9064, 17.6599],
    'sangli': [74.5815, 16.8524],
    'satara': [73.9996, 17.6805],
    'ahmednagar': [74.7496, 19.0948],
    'jalgaon': [75.5626, 21.0077],
    'aurangabad': [75.3433, 19.8762],
    'chhatrapati sambhajinagar': [75.3433, 19.8762],
    'amravati': [77.7523, 20.9320],
    'akola': [77.0082, 20.7002],
    'latur': [76.5604, 18.4088],
    'nanded': [77.3150, 19.1383],

    // --- TAMIL NADU & KERALA ---
    'chennai': [80.2707, 13.0827],
    'koyambedu': [80.1900, 13.0700],
    'coimbatore': [76.9558, 11.0168],
    'madurai': [78.1198, 9.9252],
    'tiruchirappalli': [78.7047, 10.7905],
    'salem': [78.1460, 11.6643],
    'erode': [77.7172, 11.3410],
    'tirupur': [77.3411, 11.1085],
    'vellore': [79.1325, 12.9165],
    'dindigul': [77.9803, 10.3673],
    'thanjavur': [79.1378, 10.7870],
    'tirunelveli': [77.7567, 8.7139],
    'kochi': [76.2673, 9.9312],
    'ernakulam': [76.2999, 9.9816],
    'thiruvananthapuram': [76.9366, 8.5241],
    'kozhikode': [75.7804, 11.2588],
    'thrissur': [76.2144, 10.5276],
    'palakkad': [76.6548, 10.7867],

    // --- NORTH & WEST INDIA ---
    'delhi': [77.1025, 28.7041],
    'azadpur': [77.1784, 28.7073],
    'ghazipur': [77.3300, 28.6200],
    'okhla': [77.2800, 28.5300],
    'narela': [77.0900, 28.8500],
    'ludhiana': [75.8573, 30.9010],
    'amritsar': [74.8723, 31.6340],
    'jalandhar': [75.5762, 31.3260],
    'karnal': [76.9897, 29.6857],
    'ambala': [76.7767, 30.3782],
    'hisar': [75.7217, 29.1492],
    'agra': [78.0081, 27.1767],
    'kanpur': [80.3319, 26.4499],
    'varanasi': [82.9739, 25.3176],
    'lucknow': [80.9462, 26.8467],
    'ahmedabad': [72.5714, 23.0225],
    'surat': [72.8311, 21.1702],
    'rajkot': [70.8022, 22.3039],
    'unjha': [72.3923, 23.8052],
    'jaipur': [75.7873, 26.9124],
    'jodhpur': [73.0243, 26.2389],
    'kota': [75.8648, 25.2138],
    'indore': [75.8577, 22.7196],
    'bhopal': [77.4126, 23.2599],
    'kolkata': [88.3639, 22.5726],
    'patna': [85.1376, 25.5941]
};

/**
 * Resolve high-precision coordinates [longitude, latitude] for any market record.
 * Matches specific market name first, then sub-district/town, then district.
 */
function resolveMarketCoordinates(market, district, state) {
    const cleanStr = (s) => (s || '').toLowerCase().replace(/apmc|mandi|market|sub[- ]?yard|main|bazar|bazaar/gi, '').trim();
    
    const rawM = (market || '').toLowerCase().trim();
    const rawD = (district || '').toLowerCase().trim();
    const rawS = (state || '').toLowerCase().trim();

    const mClean = cleanStr(market);
    const dClean = cleanStr(district);

    // 1. Direct exact match in dictionary
    if (MARKET_COORDINATES_DB[rawM]) return { lon: MARKET_COORDINATES_DB[rawM][0], lat: MARKET_COORDINATES_DB[rawM][1] };
    if (MARKET_COORDINATES_DB[mClean]) return { lon: MARKET_COORDINATES_DB[mClean][0], lat: MARKET_COORDINATES_DB[mClean][1] };

    // 2. Search key in market name
    for (const [key, coords] of Object.entries(MARKET_COORDINATES_DB)) {
        if (rawM.includes(key) || mClean.includes(key) || key.includes(mClean)) {
            return { lon: coords[0], lat: coords[1] };
        }
    }

    // 3. Search key in district name
    if (MARKET_COORDINATES_DB[rawD]) return { lon: MARKET_COORDINATES_DB[rawD][0], lat: MARKET_COORDINATES_DB[rawD][1] };
    if (MARKET_COORDINATES_DB[dClean]) return { lon: MARKET_COORDINATES_DB[dClean][0], lat: MARKET_COORDINATES_DB[dClean][1] };

    for (const [key, coords] of Object.entries(MARKET_COORDINATES_DB)) {
        if (rawD.includes(key) || dClean.includes(key)) {
            return { lon: coords[0], lat: coords[1] };
        }
    }

    return null;
}

/**
 * Haversine formula calculation for geographic distance between two points in km and meters
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(rLat1) * Math.cos(rLat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceMeters = R * c;
    const distanceKm = distanceMeters / 1000;

    return {
        distanceMeters: Math.round(distanceMeters),
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        formattedDistance: formatNaturalDistance(distanceKm, distanceMeters)
    };
}

/**
 * Format natural distance:
 * - < 1 km: "850 m"
 * - 1 - 10 km: "4.7 km"
 * - > 10 km: "18 km"
 */
function formatNaturalDistance(distanceKm, distanceMeters) {
    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m`;
    } else if (distanceKm < 10) {
        return `${distanceKm.toFixed(1)} km`;
    } else {
        return `${Math.round(distanceKm)} km`;
    }
}

/**
 * Backfill and enrich all market_prices in PostgreSQL with accurate coordinates and PostGIS geometries.
 */
async function backfillMarketCoordinates() {
    try {
        console.log('🔄 Checking & backfilling market coordinates in PostgreSQL...');
        const distinctMarketsRes = await query(`
            SELECT DISTINCT state, district, market 
            FROM market_prices
        `);

        let updatedCount = 0;
        for (const row of distinctMarketsRes.rows) {
            const coords = resolveMarketCoordinates(row.market, row.district, row.state);
            if (coords && coords.lat && coords.lon) {
                const updateRes = await query(`
                    UPDATE market_prices
                    SET latitude = $1,
                        longitude = $2,
                        geom = ST_SetSRID(ST_MakePoint($2, $1), 4326),
                        updated_at = NOW()
                    WHERE LOWER(market) = LOWER($3)
                      AND LOWER(district) = LOWER($4)
                      AND LOWER(state) = LOWER($5)
                `, [coords.lat, coords.lon, row.market, row.district, row.state]);
                updatedCount += updateRes.rowCount;
            }
        }
        console.log(`✅ Market coordinates backfilled successfully. Updated ${updatedCount} market price records.`);
        return { success: true, updatedCount };
    } catch (err) {
        console.error('❌ Error backfilling market coordinates:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    MARKET_COORDINATES_DB,
    resolveMarketCoordinates,
    calculateHaversineDistance,
    formatNaturalDistance,
    backfillMarketCoordinates
};
