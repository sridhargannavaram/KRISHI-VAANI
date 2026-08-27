const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { syncMandiData } = require('../services/mandiSyncService');
const { formatNaturalDistance } = require('../services/geocodingService');
const jwt = require('jsonwebtoken');

// Auth middleware helper for protected marketplace actions
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// 1. GET /api/market-prices (Search, Filter, Paginate)
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const {
      state,
      district,
      market,
      commodity,
      variety,
      grade,
      date,
      search,
      sort = 'recent',
      page = 1,
      limit = 20,
      lat,
      lon
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (state && state.trim()) {
      conditions.push(`LOWER(state) = LOWER($${paramIndex++})`);
      params.push(state.trim());
    }

    if (district && district.trim()) {
      conditions.push(`LOWER(district) = LOWER($${paramIndex++})`);
      params.push(district.trim());
    }

    if (market && market.trim()) {
      conditions.push(`LOWER(market) = LOWER($${paramIndex++})`);
      params.push(market.trim());
    }

    if (commodity && commodity.trim()) {
      conditions.push(`LOWER(commodity) = LOWER($${paramIndex++})`);
      params.push(commodity.trim());
    }

    if (variety && variety.trim()) {
      conditions.push(`LOWER(variety) = LOWER($${paramIndex++})`);
      params.push(variety.trim());
    }

    if (grade && grade.trim()) {
      conditions.push(`LOWER(grade) = LOWER($${paramIndex++})`);
      params.push(grade.trim());
    }

    if (date && date.trim()) {
      conditions.push(`arrival_date = $${paramIndex++}`);
      params.push(date.trim());
    }

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(commodity) LIKE $${paramIndex} OR
        LOWER(market) LIKE $${paramIndex} OR
        LOWER(district) LIKE $${paramIndex} OR
        LOWER(state) LIKE $${paramIndex} OR
        LOWER(variety) LIKE $${paramIndex}
      )`);
      params.push(s);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total Count Query
    const countRes = await query(`SELECT COUNT(*) as total FROM market_prices ${whereClause}`, params);
    const totalRecords = parseInt(countRes.rows[0].total) || 0;

    // Sorting
    let orderByClause = 'ORDER BY arrival_date DESC, modal_price DESC';
    if (sort === 'highest') {
      orderByClause = 'ORDER BY modal_price DESC, arrival_date DESC';
    } else if (sort === 'lowest') {
      orderByClause = 'ORDER BY modal_price ASC, arrival_date DESC';
    } else if (sort === 'commodity') {
      orderByClause = 'ORDER BY commodity ASC, modal_price DESC';
    }

    // Distance calculation if lat/lon provided
    let selectFields = `
      id, state, district, market, commodity, variety, grade,
      arrival_date, min_price, max_price, modal_price, price_unit,
      source, latitude, longitude, fetched_at, created_at
    `;

    if (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      selectFields += `, 
        CASE WHEN geom IS NOT NULL AND latitude != 0 AND longitude != 0
             THEN ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography)
             ELSE NULL END AS distance_meters,
        CASE WHEN geom IS NOT NULL AND latitude != 0 AND longitude != 0
             THEN ROUND((ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography) / 1000)::numeric, 2)
             ELSE NULL END AS distance_km
      `;
      if (sort === 'nearest') {
        orderByClause = 'ORDER BY distance_meters ASC NULLS LAST, modal_price DESC';
      }
    }

    // Fetch paginated records
    const dataRes = await query(`
      SELECT ${selectFields}
      FROM market_prices
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limitNum, offset]);

    // Format arrival_date and natural distance
    const records = dataRes.rows.map(r => {
      const dKm = r.distance_km != null ? parseFloat(r.distance_km) : null;
      const dMeters = r.distance_meters != null ? parseFloat(r.distance_meters) : null;
      return {
        ...r,
        arrival_date: r.arrival_date ? new Date(r.arrival_date).toISOString().split('T')[0] : '',
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0,
        modal_price: parseFloat(r.modal_price) || 0,
        distance_km: dKm,
        distance_meters: dMeters,
        formatted_distance: (dKm != null && dMeters != null) ? formatNaturalDistance(dKm, dMeters) : null
      };
    });

    // Get latest updated timestamp
    const latestRes = await query('SELECT MAX(fetched_at) as last_updated, MAX(arrival_date) as latest_date FROM market_prices');

    res.json({
      success: true,
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      lastUpdated: latestRes.rows[0]?.last_updated || new Date().toISOString(),
      latestDate: latestRes.rows[0]?.latest_date || new Date().toISOString().split('T')[0],
      records
    });
  } catch (error) {
    console.error('Market Prices API Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve market prices.' });
  }
});

// -------------------------------------------------------------
// 2. GET /api/market-prices/states & /api/market-prices/filters/states
// -------------------------------------------------------------
const getStatesHandler = async (req, res) => {
  try {
    const data = await query(`
      SELECT state, COUNT(DISTINCT market) as market_count, COUNT(*) as record_count
      FROM market_prices
      GROUP BY state
      ORDER BY state ASC
    `);
    res.json({ states: data.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states.' });
  }
};
router.get('/states', getStatesHandler);
router.get('/filters/states', getStatesHandler);

// -------------------------------------------------------------
// 3. GET /api/market-prices/districts & /api/market-prices/filters/districts
// -------------------------------------------------------------
const getDistrictsHandler = async (req, res) => {
  try {
    const { state } = req.query;
    let sql = 'SELECT district, state, COUNT(DISTINCT market) as market_count FROM market_prices ';
    const params = [];
    if (state) {
      sql += 'WHERE LOWER(state) = LOWER($1) ';
      params.push(state.trim());
    }
    sql += 'GROUP BY district, state ORDER BY district ASC';

    const data = await query(sql, params);
    res.json({ districts: data.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts.' });
  }
};
router.get('/districts', getDistrictsHandler);
router.get('/filters/districts', getDistrictsHandler);

// -------------------------------------------------------------
// 4. GET /api/market-prices/markets & /api/market-prices/filters/markets
// -------------------------------------------------------------
const getMarketsHandler = async (req, res) => {
  try {
    const { state, district } = req.query;
    const conditions = [];
    const params = [];
    let p = 1;

    if (state) {
      conditions.push(`LOWER(state) = LOWER($${p++})`);
      params.push(state.trim());
    }
    if (district) {
      conditions.push(`LOWER(district) = LOWER($${p++})`);
      params.push(district.trim());
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT market, district, state, COUNT(DISTINCT commodity) as commodity_count
      FROM market_prices
      ${where}
      GROUP BY market, district, state
      ORDER BY market ASC
    `;

    const data = await query(sql, params);
    res.json({ markets: data.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch markets.' });
  }
};
router.get('/markets', getMarketsHandler);
router.get('/filters/markets', getMarketsHandler);

// -------------------------------------------------------------
// 5. GET /api/market-prices/commodities & /api/market-prices/filters/commodities
// -------------------------------------------------------------
const getCommoditiesHandler = async (req, res) => {
  try {
    const { state, district } = req.query;
    const conditions = [];
    const params = [];
    let p = 1;

    if (state) {
      conditions.push(`LOWER(state) = LOWER($${p++})`);
      params.push(state.trim());
    }
    if (district) {
      conditions.push(`LOWER(district) = LOWER($${p++})`);
      params.push(district.trim());
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        commodity,
        COUNT(*) as record_count,
        ROUND(AVG(modal_price)::numeric, 0) as avg_modal_price,
        MIN(min_price) as min_price,
        MAX(max_price) as max_price
      FROM market_prices
      ${where}
      GROUP BY commodity
      ORDER BY record_count DESC, commodity ASC
    `;
    const data = await query(sql, params);
    res.json({ commodities: data.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commodities.' });
  }
};
router.get('/commodities', getCommoditiesHandler);
router.get('/filters/commodities', getCommoditiesHandler);

// -------------------------------------------------------------
// 6. GET /api/market-prices/varieties?commodity=...
// -------------------------------------------------------------
router.get('/varieties', async (req, res) => {
  try {
    const { commodity } = req.query;
    let sql = 'SELECT DISTINCT variety FROM market_prices ';
    const params = [];
    if (commodity) {
      sql += 'WHERE LOWER(commodity) = LOWER($1) ';
      params.push(commodity.trim());
    }
    sql += 'ORDER BY variety ASC';

    const data = await query(sql, params);
    res.json({ varieties: data.rows.map(r => r.variety) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch varieties.' });
  }
});

// -------------------------------------------------------------
// 7. GET /api/market-prices/history (Price Trend)
// -------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const { commodity, market, state, days = 30 } = req.query;
    if (!commodity) return res.status(400).json({ error: 'Commodity is required for price history.' });

    const conditions = ['LOWER(commodity) = LOWER($1)'];
    const params = [commodity.trim()];
    let p = 2;

    if (market) {
      conditions.push(`LOWER(market) = LOWER($${p++})`);
      params.push(market.trim());
    }
    if (state) {
      conditions.push(`LOWER(state) = LOWER($${p++})`);
      params.push(state.trim());
    }

    const daysNum = Math.min(365, parseInt(days) || 30);
    conditions.push(`arrival_date >= CURRENT_DATE - INTERVAL '${daysNum} days'`);

    const sql = `
      SELECT 
        arrival_date,
        ROUND(AVG(modal_price)::numeric, 0) as modal_price,
        ROUND(AVG(min_price)::numeric, 0) as min_price,
        ROUND(AVG(max_price)::numeric, 0) as max_price
      FROM market_prices
      WHERE ${conditions.join(' AND ')}
      GROUP BY arrival_date
      ORDER BY arrival_date ASC
    `;

    const data = await query(sql, params);
    res.json({
      commodity,
      market: market || 'All Regional Markets',
      history: data.rows.map(r => ({
        date: r.arrival_date ? new Date(r.arrival_date).toISOString().split('T')[0] : '',
        modal_price: parseFloat(r.modal_price) || 0,
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price history.' });
  }
});

// -------------------------------------------------------------
// 8. GET /api/market-prices/compare (Compare Prices Across Markets)
// -------------------------------------------------------------
router.get('/compare', async (req, res) => {
  try {
    const { commodity, state } = req.query;
    if (!commodity) return res.status(400).json({ error: 'Commodity is required for comparison.' });

    const conditions = ['LOWER(commodity) = LOWER($1)'];
    const params = [commodity.trim()];
    let p = 2;

    if (state) {
      conditions.push(`LOWER(state) = LOWER($${p++})`);
      params.push(state.trim());
    }

    const sql = `
      SELECT DISTINCT ON (market, district)
        market, district, state, modal_price, min_price, max_price, arrival_date
      FROM market_prices
      WHERE ${conditions.join(' AND ')}
      ORDER BY market, district, arrival_date DESC
    `;

    const data = await query(sql, params);
    res.json({
      commodity,
      markets: data.rows.map(r => ({
        market: r.market,
        district: r.district,
        state: r.state,
        modal_price: parseFloat(r.modal_price) || 0,
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0,
        arrival_date: r.arrival_date ? new Date(r.arrival_date).toISOString().split('T')[0] : ''
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare markets.' });
  }
});

// -------------------------------------------------------------
// 9. GET /api/market-prices/nearby (PostGIS Spatial Nearby Markets)
// -------------------------------------------------------------
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius_km = 300, commodity } = req.query;
    if (!lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Reject 0, 0 as invalid coordinates
    if (latitude === 0 && longitude === 0) {
      return res.status(400).json({ error: 'Invalid location coordinates (0, 0).' });
    }

    const radiusMeters = (parseFloat(radius_km) || 300) * 1000;

    let commodityFilter = '';
    const params = [longitude, latitude, radiusMeters];
    if (commodity && commodity.trim()) {
      commodityFilter = 'AND LOWER(commodity) = LOWER($4)';
      params.push(commodity.trim());
    }

    const sql = `
      SELECT 
        id, state, district, market, commodity, variety, grade,
        arrival_date, min_price, max_price, modal_price, price_unit,
        latitude, longitude,
        ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters,
        ROUND((ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000)::numeric, 2) as distance_km
      FROM market_prices
      WHERE geom IS NOT NULL 
        AND latitude != 0 AND longitude != 0
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        ${commodityFilter}
      ORDER BY distance_meters ASC, arrival_date DESC
      LIMIT 30
    `;

    const data = await query(sql, params);
    res.json({
      location: { lat: latitude, lon: longitude },
      radius_km: parseFloat(radius_km) || 300,
      count: data.rows.length,
      markets: data.rows.map(r => {
        const dKm = parseFloat(r.distance_km) || 0;
        const dMeters = parseFloat(r.distance_meters) || 0;
        return {
          ...r,
          arrival_date: r.arrival_date ? new Date(r.arrival_date).toISOString().split('T')[0] : '',
          min_price: parseFloat(r.min_price) || 0,
          max_price: parseFloat(r.max_price) || 0,
          modal_price: parseFloat(r.modal_price) || 0,
          distance_km: dKm,
          distance_meters: dMeters,
          formatted_distance: formatNaturalDistance(dKm, dMeters)
        };
      })
    });
  } catch (error) {
    console.error('Nearby Mandi API Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve nearby markets.' });
  }
});

// -------------------------------------------------------------
// 10. POST /api/market-prices/sync (Trigger Live Sync)
// -------------------------------------------------------------
router.post('/sync', async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 1000;
    const result = await syncMandiData(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger mandi sync: ' + error.message });
  }
});

// -------------------------------------------------------------
// 11. GET /api/market-prices/summary
// -------------------------------------------------------------
router.get('/summary', async (req, res) => {
  try {
    const counts = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT state) as states_count,
        COUNT(DISTINCT district) as districts_count,
        COUNT(DISTINCT market) as markets_count,
        COUNT(DISTINCT commodity) as commodities_count,
        MAX(arrival_date) as latest_arrival_date,
        MAX(fetched_at) as last_sync
      FROM market_prices
    `);

    res.json({
      summary: {
        totalRecords: parseInt(counts.rows[0].total_records) || 0,
        statesCount: parseInt(counts.rows[0].states_count) || 0,
        districtsCount: parseInt(counts.rows[0].districts_count) || 0,
        marketsCount: parseInt(counts.rows[0].markets_count) || 0,
        commoditiesCount: parseInt(counts.rows[0].commodities_count) || 0,
        latestArrivalDate: counts.rows[0].latest_arrival_date ? new Date(counts.rows[0].latest_arrival_date).toISOString().split('T')[0] : '',
        lastSync: counts.rows[0].last_sync || new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get market summary.' });
  }
});

// -------------------------------------------------------------
// 12. GET /api/marketplace/listings (Farmer Community Listings)
// -------------------------------------------------------------
router.get('/listings', async (req, res) => {
  try {
    const { type, commodity, state, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["status = 'ACTIVE'"];
    const params = [];
    let p = 1;

    if (type && (type === 'SELL' || type === 'BUY')) {
      conditions.push(`type = $${p++}`);
      params.push(type);
    }
    if (commodity && commodity.trim()) {
      conditions.push(`LOWER(commodity) = LOWER($${p++})`);
      params.push(commodity.trim());
    }
    if (state && state.trim()) {
      conditions.push(`LOWER(state) = LOWER($${p++})`);
      params.push(state.trim());
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRes = await query(`SELECT COUNT(*) as total FROM marketplace_listings ${where}`, params);
    const total = parseInt(countRes.rows[0].total) || 0;

    const sql = `
      SELECT 
        l.id, l.farmer_id, l.type, l.commodity, l.variety,
        l.quantity_qtl, l.price_per_qtl, l.description,
        l.contact_phone, l.city, l.state, l.created_at,
        f.name as farmer_name
      FROM marketplace_listings l
      LEFT JOIN farmers f ON l.farmer_id = f.id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT $${p++} OFFSET $${p++}
    `;

    const data = await query(sql, [...params, limitNum, offset]);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      listings: data.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve marketplace listings.' });
  }
});

// -------------------------------------------------------------
// 13. POST /api/marketplace/listings (Create Listing)
// -------------------------------------------------------------
router.post('/listings', async (req, res) => {
  try {
    const {
      farmerId,
      type = 'SELL',
      commodity,
      variety = 'Standard',
      quantityQtl,
      pricePerQtl,
      description = '',
      contactPhone,
      city,
      state
    } = req.body;

    if (!commodity || !quantityQtl || !pricePerQtl || !contactPhone) {
      return res.status(400).json({ error: 'Missing required listing fields.' });
    }

    const listingType = type.toUpperCase() === 'BUY' ? 'BUY' : 'SELL';

    const insertRes = await query(`
      INSERT INTO marketplace_listings (
        farmer_id, type, commodity, variety, quantity_qtl,
        price_per_qtl, description, contact_phone, city, state
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *
    `, [
      farmerId || null,
      listingType,
      commodity.trim(),
      variety.trim(),
      parseFloat(quantityQtl),
      parseFloat(pricePerQtl),
      description.trim(),
      contactPhone.trim(),
      city || 'Bengaluru',
      state || 'Karnataka'
    ]);

    res.status(201).json({
      success: true,
      message: 'Marketplace listing published successfully!',
      listing: insertRes.rows[0]
    });
  } catch (error) {
    console.error('Create Listing Error:', error.message);
    res.status(500).json({ error: 'Failed to create marketplace listing.' });
  }
});

module.exports = router;
