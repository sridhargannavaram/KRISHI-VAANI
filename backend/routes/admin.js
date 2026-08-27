const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { requireAdminAuth } = require('../middleware/adminAuth');
const CommodityService = require('../../frontend/assets/js/commodityImages.js');

// Apply requireAdminAuth to all /api/admin/* routes
router.use(requireAdminAuth);

const ONLINE_THRESHOLD_MINUTES = parseInt(process.env.ONLINE_USER_THRESHOLD_MINUTES, 10) || 5;
const RECENT_THRESHOLD_MINUTES = 30;

function maskPhone(phone) {
  if (!phone) return 'N/A';
  const clean = phone.toString().trim();
  if (clean.length <= 4) return clean;
  const prefix = clean.startsWith('+91') ? '+91 ' : (clean.startsWith('+') ? clean.slice(0, 3) + ' ' : '');
  const core = clean.startsWith('+91') ? clean.slice(3) : (clean.startsWith('+') ? clean.slice(3) : clean);
  if (core.length <= 4) return prefix + core;
  const masked = '*'.repeat(Math.max(core.length - 4, 4));
  const tail = core.slice(-4);
  return `${prefix}${masked}${tail}`;
}

function calculateUserStatus(lastSeenAt) {
  if (!lastSeenAt) return { code: 'OFFLINE', label: 'Offline', color: 'gray' };
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffMins = diffMs / (1000 * 60);

  if (diffMins <= ONLINE_THRESHOLD_MINUTES) {
    return { code: 'ONLINE', label: 'Online', color: 'green' };
  } else if (diffMins <= RECENT_THRESHOLD_MINUTES) {
    return { code: 'RECENT', label: 'Recently Active', color: 'amber' };
  } else {
    return { code: 'OFFLINE', label: 'Offline', color: 'gray' };
  }
}

function formatRelativeTime(date) {
  if (!date) return 'Never';
  const diffSecs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * GET /api/admin/dashboard
 * Aggregated administrative overview stats
 */
router.get('/dashboard', async (req, res) => {
  try {
    const farmersCountRes = await query('SELECT COUNT(*) AS total FROM farmers');
    const activeFarmersRes = await query(`SELECT COUNT(*) AS total FROM farmers WHERE last_activity_at >= NOW() - INTERVAL '30 days'`);
    const onlineFarmersRes = await query(`SELECT COUNT(*) AS total FROM farmers WHERE last_seen_at >= NOW() - ($1 * INTERVAL '1 minute')`, [ONLINE_THRESHOLD_MINUTES]);
    const newFarmersTodayRes = await query(`SELECT COUNT(*) AS total FROM farmers WHERE created_at >= CURRENT_DATE`);

    const mandisCountRes = await query('SELECT COUNT(*) AS total, COUNT(DISTINCT state) AS states, COUNT(DISTINCT commodity) AS commodities FROM market_prices');
    const listingsCountRes = await query('SELECT COUNT(*) AS total FROM marketplace_listings WHERE status = \'ACTIVE\'');
    const alertsCountRes = await query('SELECT COUNT(*) AS total FROM weather_alerts_log');
    const lastSyncRes = await query('SELECT * FROM market_sync_logs ORDER BY started_at DESC LIMIT 1');

    const manifestPath = path.join(__dirname, '../../frontend/assets/data/commodityImageManifest.json');
    let imageCount = 0;
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      imageCount = Object.keys(manifest).length;
    }

    res.json({
      success: true,
      stats: {
        totalFarmers: parseInt(farmersCountRes.rows[0]?.total || 0, 10),
        activeUsers: parseInt(activeFarmersRes.rows[0]?.total || 0, 10),
        onlineUsers: parseInt(onlineFarmersRes.rows[0]?.total || 0, 10),
        newUsersToday: parseInt(newFarmersTodayRes.rows[0]?.total || 0, 10),
        totalMandiRecords: parseInt(mandisCountRes.rows[0]?.total || 0, 10),
        statesCovered: parseInt(mandisCountRes.rows[0]?.states || 0, 10),
        commoditiesTracked: parseInt(mandisCountRes.rows[0]?.commodities || 0, 10),
        activeMarketplaceListings: parseInt(listingsCountRes.rows[0]?.total || 0, 10),
        weatherAlertsDispatched: parseInt(alertsCountRes.rows[0]?.total || 0, 10),
        localCommodityImages: imageCount,
        lastSync: lastSyncRes.rows[0] || null
      }
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/users/stats
 * Real-time User Activity & KPI Metrics with Growth History
 */
router.get('/users/stats', async (req, res) => {
  try {
    const totalRes = await query('SELECT COUNT(*) AS count FROM farmers');
    const activeRes = await query(`SELECT COUNT(*) AS count FROM farmers WHERE last_activity_at >= NOW() - INTERVAL '30 days'`);
    const onlineRes = await query(`SELECT COUNT(*) AS count FROM farmers WHERE last_seen_at >= NOW() - ($1 * INTERVAL '1 minute')`, [ONLINE_THRESHOLD_MINUTES]);
    const recentRes = await query(`
      SELECT COUNT(*) AS count FROM farmers 
      WHERE last_seen_at < NOW() - ($1 * INTERVAL '1 minute') 
        AND last_seen_at >= NOW() - ($2 * INTERVAL '1 minute')
    `, [ONLINE_THRESHOLD_MINUTES, RECENT_THRESHOLD_MINUTES]);
    const newTodayRes = await query(`SELECT COUNT(*) AS count FROM farmers WHERE created_at >= CURRENT_DATE`);

    // 7-day registration history for user growth chart
    const growth7DaysRes = await query(`
      SELECT TO_CHAR(d.day, 'Dy DD') AS label, 
             TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
             COUNT(f.id) AS count
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(day)
      LEFT JOIN farmers f ON DATE(f.created_at) = DATE(d.day)
      GROUP BY d.day
      ORDER BY d.day ASC
    `);

    // 30-day registration history
    const growth30DaysRes = await query(`
      SELECT TO_CHAR(d.day, 'DD Mon') AS label, 
             TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
             COUNT(f.id) AS count
      FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day'::interval) d(day)
      LEFT JOIN farmers f ON DATE(f.created_at) = DATE(d.day)
      GROUP BY d.day
      ORDER BY d.day ASC
    `);

    res.json({
      success: true,
      total_users: parseInt(totalRes.rows[0]?.count || 0, 10),
      active_users: parseInt(activeRes.rows[0]?.count || 0, 10),
      online_users: parseInt(onlineRes.rows[0]?.count || 0, 10),
      recent_users: parseInt(recentRes.rows[0]?.count || 0, 10),
      new_users_today: parseInt(newTodayRes.rows[0]?.count || 0, 10),
      threshold_minutes: {
        online: ONLINE_THRESHOLD_MINUTES,
        recent: RECENT_THRESHOLD_MINUTES
      },
      growth: {
        last7Days: growth7DaysRes.rows.map(r => ({ label: r.label, date: r.date, count: parseInt(r.count, 10) })),
        last30Days: growth30DaysRes.rows.map(r => ({ label: r.label, date: r.date, count: parseInt(r.count, 10) }))
      }
    });
  } catch (err) {
    console.error('Admin User Stats Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/users
 * Paginated list of users with server-side search, filtering, and status calculations
 */
router.get(['/users', '/farmers'], async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status ? req.query.status.toLowerCase().trim() : 'all';
    const period = req.query.period ? req.query.period.toLowerCase().trim() : 'all';
    const state = req.query.state ? req.query.state.trim() : '';

    const conditions = ['1=1'];
    const params = [];

    // Search filter
    if (search) {
      params.push(`%${search}%`);
      const pIdx = params.length;
      conditions.push(`(name ILIKE $${pIdx} OR phone ILIKE $${pIdx} OR city ILIKE $${pIdx} OR id::text ILIKE $${pIdx})`);
    }

    // Location / State filter
    if (state && state !== 'all') {
      params.push(`%${state}%`);
      conditions.push(`city ILIKE $${params.length}`);
    }

    // Status filter
    if (status === 'online') {
      params.push(ONLINE_THRESHOLD_MINUTES);
      conditions.push(`last_seen_at >= NOW() - ($${params.length} * INTERVAL '1 minute')`);
    } else if (status === 'recent' || status === 'recently_active') {
      params.push(ONLINE_THRESHOLD_MINUTES);
      const onlineIdx = params.length;
      params.push(RECENT_THRESHOLD_MINUTES);
      const recentIdx = params.length;
      conditions.push(`last_seen_at < NOW() - ($${onlineIdx} * INTERVAL '1 minute') AND last_seen_at >= NOW() - ($${recentIdx} * INTERVAL '1 minute')`);
    } else if (status === 'offline') {
      params.push(RECENT_THRESHOLD_MINUTES);
      conditions.push(`(last_seen_at < NOW() - ($${params.length} * INTERVAL '1 minute') OR last_seen_at IS NULL)`);
    } else if (status === 'active') {
      conditions.push(`last_activity_at >= NOW() - INTERVAL '30 days'`);
    }

    // Period filter
    if (period === 'today') {
      conditions.push(`created_at >= CURRENT_DATE`);
    } else if (period === 'week' || period === '7days') {
      conditions.push(`created_at >= NOW() - INTERVAL '7 days'`);
    } else if (period === 'month' || period === '30days') {
      conditions.push(`created_at >= NOW() - INTERVAL '30 days'`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Total filtered count
    const countRes = await query(`SELECT COUNT(*) AS total FROM farmers ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    // List query
    const listParams = [...params, limit, offset];
    const listRes = await query(`
      SELECT id, name, phone, city, latitude, longitude, is_verified, is_active, login_count, 
             last_seen_at, last_activity_at, last_login_at, created_at
      FROM farmers
      ${whereClause}
      ORDER BY 
        CASE WHEN last_seen_at >= NOW() - (${ONLINE_THRESHOLD_MINUTES} * INTERVAL '1 minute') THEN 1 ELSE 2 END,
        last_seen_at DESC NULLS LAST,
        created_at DESC
      LIMIT $${listParams.length - 1} OFFSET $${listParams.length}
    `, listParams);

    const formattedUsers = listRes.rows.map(user => {
      const statusMeta = calculateUserStatus(user.last_seen_at);
      return {
        id: user.id,
        name: user.name,
        phone: maskPhone(user.phone),
        rawPhoneAvailable: false,
        city: user.city || 'Karnataka',
        isVerified: !!user.is_verified,
        isActive: user.is_active !== false,
        loginCount: parseInt(user.login_count || 1, 10),
        status: statusMeta.code,
        statusLabel: statusMeta.label,
        statusColor: statusMeta.color,
        lastSeenAt: user.last_seen_at,
        lastSeenRelative: formatRelativeTime(user.last_seen_at),
        lastLoginAt: user.last_login_at,
        lastLoginRelative: formatRelativeTime(user.last_login_at),
        createdAt: user.created_at,
        createdAtFormatted: new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    });

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      users: formattedUsers,
      farmers: formattedUsers // backwards compatibility
    });
  } catch (err) {
    console.error('Admin Users List Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Detailed profile, usage telemetry, login events & activity logs for a specific farmer
 */
router.get(['/users/:id', '/farmers/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const farmerRes = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [id]);
    if (farmerRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const row = farmerRes.rows[0];
    const statusMeta = calculateUserStatus(row.last_seen_at);

    // Fetch real usage telemetry
    const [alertsCountRes, listingsCountRes, weatherLogsRes, aiLogsRes, loginEventsRes, activityLogsRes] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM weather_alerts_log WHERE farmer_id = $1', [id]),
      query('SELECT COUNT(*) AS count FROM marketplace_listings WHERE farmer_id = $1', [id]),
      query(`SELECT COUNT(*) AS count FROM user_activity_logs WHERE farmer_id = $1 AND activity_type IN ('WEATHER_VIEW', 'WEATHER_QUERY')`, [id]),
      query(`SELECT COUNT(*) AS count FROM user_activity_logs WHERE farmer_id = $1 AND activity_type = 'AI_ADVISORY'`, [id]),
      query('SELECT * FROM user_login_events WHERE farmer_id = $1 ORDER BY login_at DESC LIMIT 10', [id]),
      query('SELECT * FROM user_activity_logs WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT 15', [id])
    ]);

    let alertPrefs = row.alert_preferences;
    if (typeof alertPrefs === 'string') {
      try { alertPrefs = JSON.parse(alertPrefs); } catch (e) { alertPrefs = {}; }
    }

    res.json({
      success: true,
      user: {
        id: row.id,
        name: row.name,
        phone: row.phone, // Shown in full detail view only to authorized admin
        maskedPhone: maskPhone(row.phone),
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
        isVerified: !!row.is_verified,
        isActive: row.is_active !== false,
        profileImage: row.profile_image || '',
        alertPreferences: alertPrefs,
        loginCount: parseInt(row.login_count || 1, 10),
        status: statusMeta.code,
        statusLabel: statusMeta.label,
        statusColor: statusMeta.color,
        lastSeenAt: row.last_seen_at,
        lastSeenRelative: formatRelativeTime(row.last_seen_at),
        lastActivityAt: row.last_activity_at,
        lastLoginAt: row.last_login_at,
        lastLoginRelative: formatRelativeTime(row.last_login_at),
        createdAt: row.created_at,
        createdAtFormatted: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        usage: {
          weatherRequests: parseInt(weatherLogsRes.rows[0]?.count || 0, 10),
          alertsReceived: parseInt(alertsCountRes.rows[0]?.count || 0, 10),
          marketplaceListings: parseInt(listingsCountRes.rows[0]?.count || 0, 10),
          aiAssistantUsage: parseInt(aiLogsRes.rows[0]?.count || 0, 10)
        },
        loginHistory: loginEventsRes.rows.map(ev => ({
          id: ev.id,
          ip: ev.ip_address || '127.0.0.1',
          userAgent: ev.user_agent || 'Web Browser',
          loginAt: ev.login_at,
          loginAtFormatted: new Date(ev.login_at).toLocaleString('en-GB')
        })),
        recentActivity: activityLogsRes.rows.map(act => ({
          id: act.id,
          type: act.activity_type,
          details: act.details,
          createdAt: act.created_at,
          createdAtFormatted: formatRelativeTime(act.created_at)
        }))
      }
    });
  } catch (err) {
    console.error('Admin User Detail Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/users/:id/toggle-status
 * Enable or Disable a farmer account
 */
router.post(['/users/:id/toggle-status', '/farmers/:id/toggle-status'], async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const updatedRes = await query(`
      UPDATE farmers 
      SET is_active = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, name, phone, is_active
    `, [is_active !== false, id]);

    if (updatedRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = updatedRes.rows[0];
    res.json({
      success: true,
      message: `Account for ${updated.name} has been ${updated.is_active ? 'enabled' : 'disabled'}.`,
      user: {
        id: updated.id,
        name: updated.name,
        isActive: updated.is_active
      }
    });
  } catch (err) {
    console.error('Admin Toggle Status Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/market-prices
 * Mandi prices and sync status
 */
router.get('/market-prices', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const records = await query('SELECT * FROM market_prices ORDER BY arrival_date DESC, modal_price DESC LIMIT $1', [limit]);
    const syncLogs = await query('SELECT * FROM market_sync_logs ORDER BY started_at DESC LIMIT 10');

    res.json({
      success: true,
      recentPrices: records.rows,
      syncLogs: syncLogs.rows
    });
  } catch (err) {
    console.error('Admin Market Prices Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/commodity-images
 * Image audit and manifest coverage for Admin
 */
router.get('/commodity-images', async (req, res) => {
  try {
    const dbResult = await query('SELECT DISTINCT commodity FROM market_prices ORDER BY commodity ASC');
    const dbCommodities = dbResult.rows.map(r => r.commodity);

    const manifestPath = path.join(__dirname, '../../frontend/assets/data/commodityImageManifest.json');
    const assetsDir = path.join(__dirname, '../../frontend/assets/images/commodities');
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }

    const auditList = dbCommodities.map(rawName => {
      const key = CommodityService.resolveCanonicalKey(rawName);
      const imgUrl = CommodityService.getCommodityImageUrl(rawName);
      const isFallback = imgUrl.startsWith('data:image/svg+xml');
      const filename = path.basename(imgUrl);
      const fileExists = !isFallback && fs.existsSync(path.join(assetsDir, filename));

      return {
        commodity: rawName,
        canonicalKey: key,
        imagePath: imgUrl,
        filename: isFallback ? null : filename,
        status: fileExists ? 'available' : (isFallback ? 'placeholder' : 'missing'),
        hasLocalFile: fileExists
      };
    });

    res.json({
      success: true,
      totalCommodities: dbCommodities.length,
      verifiedCount: auditList.filter(a => a.status === 'available').length,
      placeholderCount: auditList.filter(a => a.status === 'placeholder').length,
      missingCount: auditList.filter(a => a.status === 'missing').length,
      audit: auditList
    });
  } catch (err) {
    console.error('Admin Commodity Images Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/alerts
 * Recent weather and crop alert dispatches
 */
router.get('/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const alerts = await query(`
      SELECT l.*, f.name AS farmer_name, f.city AS farmer_city 
      FROM weather_alerts_log l
      LEFT JOIN farmers f ON l.farmer_id = f.id
      ORDER BY l.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      alerts: alerts.rows
    });
  } catch (err) {
    console.error('Admin Alerts Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/seller-listings
 * Active marketplace seller listings
 */
router.get('/seller-listings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const listings = await query(`
      SELECT l.*, f.name AS farmer_name 
      FROM marketplace_listings l
      LEFT JOIN farmers f ON l.farmer_id = f.id
      WHERE l.type = 'SELL'
      ORDER BY l.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      listings: listings.rows
    });
  } catch (err) {
    console.error('Admin Seller Listings Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/buyer-requirements
 * Buyer requirements
 */
router.get('/buyer-requirements', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const listings = await query(`
      SELECT l.*, f.name AS requester_name 
      FROM marketplace_listings l
      LEFT JOIN farmers f ON l.farmer_id = f.id
      WHERE l.type = 'BUY'
      ORDER BY l.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      requirements: listings.rows
    });
  } catch (err) {
    console.error('Admin Buyer Requirements Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/settings
 * Safe system configuration status
 */
router.get('/settings', async (req, res) => {
  res.json({
    success: true,
    system: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 4000,
      databaseConfigured: !!process.env.DATABASE_URL,
      openWeatherConfigured: !!process.env.OPENWEATHER_API_KEY,
      mandiApiConfigured: !!process.env.DATA_GOV_API_KEY,
      twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      aiConfigured: !!process.env.OPENROUTER_API_KEY,
      jwtSecretConfigured: !!process.env.JWT_SECRET,
      serverTime: new Date().toISOString()
    }
  });
});

module.exports = router;
