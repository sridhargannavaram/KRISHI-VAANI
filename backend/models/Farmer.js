const { query } = require('../config/db');
const bcrypt = require('bcrypt');

function formatFarmer(row) {
  if (!row) return null;
  
  let alertPrefs = row.alert_preferences;
  if (typeof alertPrefs === 'string') {
    try {
      alertPrefs = JSON.parse(alertPrefs);
    } catch (e) {
      alertPrefs = {};
    }
  }

  const defaultPrefs = {
    temperatureThreshold: 35,
    humidityThreshold: 80,
    windSpeedThreshold: 15,
    rainAlert: true,
    windAlert: true
  };

  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    phone: row.phone,
    password: row.password,
    city: row.city || '',
    state: row.state || '',
    district: row.district || '',
    village: row.village || '',
    postalCode: row.postal_code || '',
    formattedAddress: row.formatted_address || '',
    accuracy: parseFloat(row.accuracy) || 0,
    locationSource: row.location_source || 'GPS',
    locationUpdatedAt: row.location_updated_at || row.updated_at,
    location: {
      type: 'Point',
      coordinates: [parseFloat(row.longitude) || 0, parseFloat(row.latitude) || 0]
    },
    isVerified: !!row.is_verified,
    isActive: row.is_active !== false,
    alertPreferences: { ...defaultPrefs, ...alertPrefs },
    profileImage: row.profile_image || '',
    loginCount: parseInt(row.login_count || 1, 10),
    lastSeenAt: row.last_seen_at || row.last_login_at || row.created_at,
    lastActivityAt: row.last_activity_at || row.last_login_at || row.created_at,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    comparePassword: async function (candidatePassword) {
      return await bcrypt.compare(candidatePassword, row.password);
    }
  };
}

const Farmer = {
  // Find a farmer by phone number
  findByPhone: async (phone) => {
    const res = await query('SELECT * FROM farmers WHERE phone = $1 LIMIT 1', [phone]);
    return res.rows.length > 0 ? formatFarmer(res.rows[0]) : null;
  },

  // Find a farmer by UUID ID
  findById: async (id) => {
    const res = await query('SELECT * FROM farmers WHERE id = $1 LIMIT 1', [id]);
    return res.rows.length > 0 ? formatFarmer(res.rows[0]) : null;
  },

  // Find all verified farmers (used by AlertGuard scheduler)
  findVerified: async () => {
    const res = await query('SELECT * FROM farmers WHERE is_verified = TRUE AND is_active = TRUE');
    return res.rows.map(formatFarmer);
  },

  // Create a new farmer record
  create: async ({ 
    name, 
    phone, 
    password, 
    city = '', 
    state = '', 
    district = '', 
    village = '', 
    postalCode = '', 
    formattedAddress = '', 
    lng = 0, 
    lat = 0, 
    accuracy = 0, 
    source = 'GPS', 
    isVerified = true 
  }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const longitude = parseFloat(lng) || 0;
    const latitude = parseFloat(lat) || 0;
    const locAccuracy = parseFloat(accuracy) || 0;

    const res = await query(`
      INSERT INTO farmers (
        name, phone, password, city, state, district, village, postal_code, formatted_address,
        longitude, latitude, accuracy, location_source, geom, is_verified, is_active, 
        login_count, last_seen_at, last_activity_at, last_login_at, location_updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($10, $11), 4326), $14, TRUE,
        1, NOW(), NOW(), NOW(), NOW()
      )
      RETURNING *
    `, [
      name, phone, hashedPassword, city, state, district, village, postalCode, formattedAddress,
      longitude, latitude, locAccuracy, source, isVerified
    ]);

    const createdFarmer = formatFarmer(res.rows[0]);
    if (createdFarmer) {
      await Farmer.recordLoginEvent(createdFarmer.id, 'Registration');
      await Farmer.logActivity(createdFarmer.id, 'REGISTRATION', { message: 'Account created' });
    }

    return createdFarmer;
  },

  // Update farmer location with PostGIS sync
  updateLocation: async (id, { 
    lat, 
    lng, 
    accuracy = 0, 
    state = '', 
    district = '', 
    city = '', 
    village = '', 
    postalCode = '', 
    formattedAddress = '', 
    source = 'GPS' 
  }) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const locAccuracy = parseFloat(accuracy) || 0;

    const res = await query(`
      UPDATE farmers
      SET latitude = $1,
          longitude = $2,
          geom = ST_SetSRID(ST_MakePoint($2, $1), 4326),
          accuracy = $3,
          state = COALESCE(NULLIF($4, ''), state),
          district = COALESCE(NULLIF($5, ''), district),
          city = COALESCE(NULLIF($6, ''), city),
          village = COALESCE(NULLIF($7, ''), village),
          postal_code = COALESCE(NULLIF($8, ''), postal_code),
          formatted_address = COALESCE(NULLIF($9, ''), formatted_address),
          location_source = $10,
          location_updated_at = NOW(),
          last_activity_at = NOW(),
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [
      latitude, longitude, locAccuracy, 
      state, district, city, village, postalCode, formattedAddress, 
      source, id
    ]);

    if (res.rows.length === 0) return null;

    const updated = formatFarmer(res.rows[0]);
    await Farmer.logActivity(id, 'LOCATION_UPDATE', {
      lat: latitude,
      lng: longitude,
      accuracy: locAccuracy,
      city: updated.city,
      district: updated.district,
      state: updated.state,
      source: source
    });

    return updated;
  },

  // Update alert preferences
  updateAlertPreferences: async (id, alertPreferences) => {
    const res = await query(`
      UPDATE farmers
      SET alert_preferences = $1, last_activity_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify(alertPreferences), id]);

    return res.rows.length > 0 ? formatFarmer(res.rows[0]) : null;
  },

  // Update profile image
  updateProfileImage: async (id, profileImage) => {
    const res = await query(`
      UPDATE farmers
      SET profile_image = $1, last_activity_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [profileImage, id]);

    return res.rows.length > 0 ? formatFarmer(res.rows[0]) : null;
  },

  // Update last login timestamp and increment login count
  updateLastLogin: async (id, req = null) => {
    await query(`
      UPDATE farmers 
      SET last_login_at = NOW(), 
          last_seen_at = NOW(), 
          last_activity_at = NOW(), 
          login_count = COALESCE(login_count, 0) + 1, 
          updated_at = NOW() 
      WHERE id = $1
    `, [id]);

    if (req) {
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Browser';
      await Farmer.recordLoginEvent(id, ip, userAgent);
      await Farmer.logActivity(id, 'LOGIN', { ip, userAgent });
    }
  },

  // Heartbeat / last seen ping
  updateHeartbeat: async (id) => {
    await query(`
      UPDATE farmers 
      SET last_seen_at = NOW(), 
          last_activity_at = NOW() 
      WHERE id = $1
    `, [id]);
  },

  // Record login event in user_login_events
  recordLoginEvent: async (farmerId, ipAddress = '127.0.0.1', userAgent = '') => {
    try {
      await query(`
        INSERT INTO user_login_events (farmer_id, ip_address, user_agent, login_at)
        VALUES ($1, $2, $3, NOW())
      `, [farmerId, ipAddress, userAgent]);
    } catch (e) {
      console.warn('⚠️ Could not record login event:', e.message);
    }
  },

  // Log user activity
  logActivity: async (farmerId, activityType, details = {}) => {
    try {
      if (!farmerId) return;
      await query(`
        INSERT INTO user_activity_logs (farmer_id, activity_type, details, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [farmerId, activityType, JSON.stringify(details)]);

      await query(`
        UPDATE farmers 
        SET last_activity_at = NOW(), last_seen_at = NOW() 
        WHERE id = $1
      `, [farmerId]);
    } catch (e) {
      console.warn('⚠️ Could not log farmer activity:', e.message);
    }
  },

  // Toggle farmer active/disabled status
  toggleStatus: async (id, isActive) => {
    const res = await query(`
      UPDATE farmers 
      SET is_active = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `, [isActive, id]);
    return res.rows.length > 0 ? formatFarmer(res.rows[0]) : null;
  },

  // Password comparison helper
  comparePassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  // Format helper
  formatFarmer
};

module.exports = Farmer;
