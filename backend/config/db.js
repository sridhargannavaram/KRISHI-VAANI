require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL environment variable is not defined.');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
});

// Initialize database schema and tables
async function initDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing Supabase PostgreSQL schema...');

    // Extensions
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    } catch (e) {
      console.warn('⚠️ Could not enable pgcrypto extension:', e.message);
    }

    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('✅ PostGIS extension active.');
    } catch (e) {
      console.warn('ℹ️ PostGIS extension notice:', e.message);
    }

    // Farmers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        district VARCHAR(100) DEFAULT '',
        village VARCHAR(100) DEFAULT '',
        postal_code VARCHAR(20) DEFAULT '',
        formatted_address TEXT DEFAULT '',
        latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
        longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
        accuracy DOUBLE PRECISION DEFAULT 0,
        location_source VARCHAR(30) DEFAULT 'GPS',
        location_updated_at TIMESTAMPTZ DEFAULT NOW(),
        geom GEOMETRY(Point, 4326),
        is_verified BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        alert_preferences JSONB DEFAULT '{"temperatureThreshold": 35, "humidityThreshold": 80, "windSpeedThreshold": 15, "rainAlert": true, "windAlert": true}'::jsonb,
        profile_image TEXT DEFAULT '',
        login_count INTEGER DEFAULT 1,
        last_seen_at TIMESTAMPTZ DEFAULT NOW(),
        last_activity_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure columns exist on existing table installations
    await client.query(`
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT '';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS village VARCHAR(100) DEFAULT '';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) DEFAULT '';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS formatted_address TEXT DEFAULT '';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS accuracy DOUBLE PRECISION DEFAULT 0;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS location_source VARCHAR(30) DEFAULT 'GPS';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 1;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);

    // Indexes on Farmers
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_state ON farmers(state);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_district ON farmers(district);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_last_seen ON farmers(last_seen_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_last_activity ON farmers(last_activity_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_created_at ON farmers(created_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_city ON farmers(city);`);
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_farmers_geom ON farmers USING GIST(geom);`);
    } catch (e) {
      // Spatial index fallback if geom not available
    }

    // User Login Events Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_login_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        ip_address VARCHAR(100),
        user_agent TEXT,
        login_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_login_events_farmer ON user_login_events(farmer_id, login_at DESC);`);

    // User Activity Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_activity_farmer ON user_activity_logs(farmer_id, created_at DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_logs(activity_type);`);

    // Weather Alerts Log Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_alerts_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        phone VARCHAR(50),
        crop VARCHAR(100),
        message TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        channel VARCHAR(20) DEFAULT 'SMS',
        status VARCHAR(50) DEFAULT 'SENT',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Farmer Crops Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS farmer_crops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        crop_name VARCHAR(100) NOT NULL,
        acres DOUBLE PRECISION DEFAULT 0,
        sowing_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Weather Data Table (Persistent Storage with PostGIS & JSONB)
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        geom GEOMETRY(Point, 4326),
        city VARCHAR(255),
        temperature DOUBLE PRECISION,
        feels_like DOUBLE PRECISION,
        humidity INTEGER,
        wind_speed DOUBLE PRECISION,
        condition VARCHAR(100),
        description VARCHAR(255),
        precipitation DOUBLE PRECISION DEFAULT 0,
        raw_data JSONB,
        recorded_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_weather_data_geom ON weather_data USING GIST(geom);`);
    } catch (e) {}
    await client.query(`CREATE INDEX IF NOT EXISTS idx_weather_data_recorded ON weather_data(recorded_at DESC);`);

    // 1. Mandi Prices Table (India-wide)
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_prices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        market VARCHAR(150) NOT NULL,
        commodity VARCHAR(100) NOT NULL,
        variety VARCHAR(100) DEFAULT 'Other',
        grade VARCHAR(50) DEFAULT 'FAQ',
        arrival_date DATE NOT NULL,
        min_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        max_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        modal_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        price_unit VARCHAR(50) DEFAULT '₹/Quintal',
        source VARCHAR(100) DEFAULT 'data.gov.in',
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        geom GEOMETRY(Point, 4326),
        fetched_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_market_price_entry UNIQUE (state, district, market, commodity, variety, grade, arrival_date)
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_market_prices_state_district_commodity ON market_prices(state, district, commodity);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON market_prices(commodity);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_market_prices_market ON market_prices(market);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_market_prices_arrival_date ON market_prices(arrival_date DESC);`);
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_market_prices_geom ON market_prices USING GIST(geom);`);
    } catch (e) {}

    // 2. Mandi Sync Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_sync_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        status VARCHAR(50) DEFAULT 'RUNNING',
        records_received INTEGER DEFAULT 0,
        records_inserted INTEGER DEFAULT 0,
        records_updated INTEGER DEFAULT 0,
        records_failed INTEGER DEFAULT 0,
        error_message TEXT
      );
    `);

    // 3. Community Marketplace Listings Table (Farmer/FPO Sell offers & Buyer requirements)
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL, -- 'SELL' or 'BUY'
        commodity VARCHAR(100) NOT NULL,
        variety VARCHAR(100),
        quantity_qtl NUMERIC(10, 2) NOT NULL,
        price_per_qtl NUMERIC(10, 2) NOT NULL,
        description TEXT,
        contact_phone VARCHAR(50) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        geom GEOMETRY(Point, 4326),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings(type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_listings_commodity ON marketplace_listings(commodity);`);

    // 4. Administrator Accounts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL DEFAULT 'Administrator',
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_admins_mobile ON admins(mobile);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);`);

    console.log('✅ PostgreSQL Tables & Indexes Verified/Created Successfully.');
  } catch (err) {
    console.error('❌ Error during schema initialization:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb
};
