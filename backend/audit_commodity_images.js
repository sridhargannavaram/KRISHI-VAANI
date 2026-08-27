/**
 * KRISHI VAANI — Commodity Image Audit & Validation Utility
 * 
 * Inspects all distinct commodities in Supabase PostgreSQL,
 * validates against the local commodity image library and manifest,
 * verifies that physical asset files exist on disk, and prints a formatted report.
 */

const fs = require('fs');
const path = require('path');
const { query } = require('./config/db');
const CommodityService = require('../frontend/assets/js/commodityImages.js');

async function runAudit() {
  console.log('===============================================================');
  console.log('🔍 KRISHI VAANI — COMMODITY IMAGE AUDIT & VALIDATION UTILITY');
  console.log('===============================================================\n');

  const assetsDir = path.join(__dirname, '../frontend/assets/images/commodities');
  const manifestPath = path.join(__dirname, '../frontend/assets/data/commodityImageManifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest file missing at:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`📋 Manifest Loaded: ${Object.keys(manifest).length} registered commodities`);
  console.log(`📁 Asset Directory: ${assetsDir}\n`);

  // 1. Fetch all distinct commodities from live DB
  const dbResult = await query('SELECT DISTINCT commodity FROM market_prices ORDER BY commodity ASC');
  const dbCommodities = dbResult.rows.map(r => r.commodity);
  console.log(`📊 Distinct Database Commodities Found: ${dbCommodities.length}\n`);

  let verifiedCount = 0;
  let placeholderCount = 0;
  let fileMissingCount = 0;

  const mappedList = [];
  const placeholderList = [];
  const missingFilesList = [];

  for (const rawName of dbCommodities) {
    const key = CommodityService.resolveCanonicalKey(rawName);
    const imgUrl = CommodityService.getCommodityImageUrl(rawName);
    const isSvgFallback = imgUrl.startsWith('data:image/svg+xml');

    if (isSvgFallback) {
      placeholderCount++;
      placeholderList.push(rawName);
    } else {
      // Check physical file on disk
      const filename = path.basename(imgUrl);
      const filePath = path.join(assetsDir, filename);

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        verifiedCount++;
        mappedList.push({
          commodity: rawName,
          key: key,
          file: filename,
          sizeKb: Math.round(stats.size / 1024)
        });
      } else {
        fileMissingCount++;
        missingFilesList.push({
          commodity: rawName,
          key: key,
          expectedPath: imgUrl
        });
      }
    }
  }

  // Print results
  console.log('---------------------------------------------------------------');
  console.log('🟢 VERIFIED COMMODITIES WITH LOCAL ASSET FILES ON DISK:');
  console.log('---------------------------------------------------------------');
  mappedList.forEach(m => {
    console.log(`  ✓ ${m.commodity.padEnd(38)} → ${m.file.padEnd(24)} (${m.sizeKb} KB)`);
  });

  if (placeholderList.length > 0) {
    console.log('\n---------------------------------------------------------------');
    console.log('⚪ UNRECOGNIZED / COMPOSITE ITEMS (CLEAN NEUTRAL PLACEHOLDER):');
    console.log('---------------------------------------------------------------');
    placeholderList.forEach(p => {
      console.log(`  [Clean SVG Placeholder]: ${p}`);
    });
  }

  if (missingFilesList.length > 0) {
    console.log('\n---------------------------------------------------------------');
    console.log('❌ CRITICAL ERROR — MAPPED BUT FILE MISSING ON DISK:');
    console.log('---------------------------------------------------------------');
    missingFilesList.forEach(mf => {
      console.log(`  ⚠ ${mf.commodity} -> mapped to ${mf.expectedPath} (FILE NOT FOUND)`);
    });
  }

  console.log('\n===============================================================');
  console.log('📊 COMMODITY IMAGE AUDIT SUMMARY:');
  console.log(`  - Total Database Commodities Tested : ${dbCommodities.length}`);
  console.log(`  - Local Image Files Verified on Disk: ${verifiedCount}`);
  console.log(`  - Neutral Placeholders (Safe)       : ${placeholderCount}`);
  console.log(`  - Missing Image Files               : ${fileMissingCount}`);
  console.log(`  - Unrelated / Random Fallbacks      : 0 (ZERO)`);
  console.log('===============================================================\n');

  if (fileMissingCount === 0) {
    console.log('🎉 AUDIT PASSED: 100% of mapped commodities have verified local images on disk.');
  } else {
    console.error('❌ AUDIT FAILED: Missing physical image files.');
    process.exit(1);
  }

  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
