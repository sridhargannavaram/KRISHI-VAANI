require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const { query } = require('../config/db');

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

const { resolveMarketCoordinates } = require('./geocodingService');

// Normalize dates: converts DD/MM/YYYY or timestamp to YYYY-MM-DD
function parseArrivalDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      return `${year}-${month}-${day}`;
    }
  }
  
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
}

async function syncMandiData(limit = 1000) {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ DATA_GOV_API_KEY is not defined. Mandi sync skipped.');
    return { success: false, error: 'DATA_GOV_API_KEY is missing.' };
  }

  console.log(`🌾 Starting Mandi Data Sync from data.gov.in (limit: ${limit})...`);

  // Create sync log entry
  let logId = null;
  try {
    const logRes = await query(`
      INSERT INTO market_sync_logs (status, started_at)
      VALUES ('RUNNING', NOW())
      RETURNING id
    `);
    logId = logRes.rows[0]?.id;
  } catch (e) {
    console.warn('Could not create sync log:', e.message);
  }

  let received = 0;
  let insertedOrUpdated = 0;
  let failed = 0;

  try {
    const url = `${DATA_GOV_URL}?api-key=${apiKey}&format=json&limit=${limit}`;
    const response = await axios.get(url, { timeout: 25000 });
    const records = response.data?.records || [];
    received = records.length;

    console.log(`📦 Received ${received} records from Open Government Data API.`);

    // Batch upsert in chunks of 50
    const CHUNK_SIZE = 50;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const valueTuples = [];
      const params = [];
      let pIdx = 1;

      for (const item of chunk) {
        const state = (item.state || 'Unknown').trim();
        const district = (item.district || 'Unknown').trim();
        const market = (item.market || 'Unknown').trim();
        const commodity = (item.commodity || 'General').trim();
        const variety = (item.variety || 'Other').trim();
        const grade = (item.grade || 'FAQ').trim();
        const arrivalDate = parseArrivalDate(item.arrival_date || item.arrivalDate);
        
        let minPrice = parseFloat(item.min_price || item.minPrice) || 0;
        let maxPrice = parseFloat(item.max_price || item.maxPrice) || 0;
        let modalPrice = parseFloat(item.modal_price || item.modalPrice) || 0;

        if (modalPrice === 0 && (minPrice > 0 || maxPrice > 0)) {
          modalPrice = maxPrice > 0 && minPrice > 0 ? (minPrice + maxPrice) / 2 : (maxPrice || minPrice);
        }
        if (minPrice === 0 && modalPrice > 0) minPrice = modalPrice;
        if (maxPrice === 0 && modalPrice > 0) maxPrice = modalPrice;

        const coords = resolveMarketCoordinates(market, district, state);
        const lon = coords ? coords.lon : null;
        const lat = coords ? coords.lat : null;

        valueTuples.push(`(
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
          $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, '₹/Quintal', 'data.gov.in',
          $${pIdx++}, $${pIdx++},
          CASE WHEN $${pIdx - 2}::float IS NOT NULL AND $${pIdx - 1}::float IS NOT NULL
               THEN ST_SetSRID(ST_MakePoint($${pIdx - 2}, $${pIdx - 1}), 4326)
               ELSE NULL END,
          NOW()
        )`);

        params.push(state, district, market, commodity, variety, grade, arrivalDate, minPrice, maxPrice, modalPrice, lon, lat);
      }

      if (valueTuples.length > 0) {
        try {
          const batchSql = `
            INSERT INTO market_prices (
              state, district, market, commodity, variety, grade,
              arrival_date, min_price, max_price, modal_price, price_unit,
              source, longitude, latitude, geom, fetched_at
            ) VALUES ${valueTuples.join(', ')}
            ON CONFLICT (state, district, market, commodity, variety, grade, arrival_date)
            DO UPDATE SET
              min_price = EXCLUDED.min_price,
              max_price = EXCLUDED.max_price,
              modal_price = EXCLUDED.modal_price,
              longitude = COALESCE(EXCLUDED.longitude, market_prices.longitude),
              latitude = COALESCE(EXCLUDED.latitude, market_prices.latitude),
              geom = COALESCE(EXCLUDED.geom, market_prices.geom),
              updated_at = NOW(),
              fetched_at = NOW();
          `;
          await query(batchSql, params);
          insertedOrUpdated += chunk.length;
        } catch (batchErr) {
          console.warn('Batch insert error, processing individually:', batchErr.message);
          failed += chunk.length;
        }
      }
    }

    // Update sync log
    if (logId) {
      await query(`
        UPDATE market_sync_logs
        SET status = 'SUCCESS', completed_at = NOW(),
            records_received = $1, records_inserted = $2, records_updated = 0, records_failed = $3
        WHERE id = $4
      `, [received, insertedOrUpdated, failed, logId]);
    }

    console.log(`✅ Mandi Sync Completed: Received ${received} | Processed ${insertedOrUpdated} | Failed ${failed}`);
    return {
      success: true,
      received,
      processed: insertedOrUpdated,
      failed
    };
  } catch (apiError) {
    console.error('❌ Mandi Sync API Error:', apiError.message);
    if (logId) {
      await query(`
        UPDATE market_sync_logs
        SET status = 'FAILED', completed_at = NOW(), error_message = $1
        WHERE id = $2
      `, [apiError.message, logId]);
    }
    return { success: false, error: apiError.message };
  }
}

// Scheduled daily sync at 06:00 AM
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Running daily Mandi synchronization cron job...');
  await syncMandiData(1000);
});

module.exports = {
  syncMandiData
};
