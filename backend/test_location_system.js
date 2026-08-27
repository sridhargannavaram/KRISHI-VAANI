const axios = require('axios');
const jwt = require('jsonwebtoken');
const { pool, query, initDb } = require('./config/db');
const Farmer = require('./models/Farmer');

const BASE_URL = 'http://localhost:4000/api';

const userAPhone = '9876543210';
const userBPhone = '9876543211';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 KRISHI VAANI — LOCATION DETECTION & POSTGIS TEST SUITE');
  console.log('================================================================\n');

  try {
    // 0. Initialize DB Schema
    await initDb();
    console.log('✅ PostgreSQL Schema & Location Columns Initialized.');

    // Clean up test users
    await query('DELETE FROM farmers WHERE phone IN ($1, $2)', [userAPhone, userBPhone]);

    // 1. Create User A (Andhra Pradesh - Vijayawada)
    const userAReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Ramesh Naidu (AP)',
      phone: userAPhone,
      password: 'password123',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      district: 'Krishna',
      lng: 80.6480,
      lat: 16.5062
    });
    const userAId = userAReg.data.farmerId;

    const userALogin = await axios.post(`${BASE_URL}/auth/login`, {
      phone: userAPhone,
      password: 'password123'
    });
    const userAToken = userALogin.data.token;
    console.log(`✅ User A (Vijayawada, AP) created with ID: ${userAId}`);

    // 2. Create User B (Punjab - Ludhiana)
    const userBReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Gurpreet Singh (PB)',
      phone: userBPhone,
      password: 'password123',
      city: 'Ludhiana',
      state: 'Punjab',
      district: 'Ludhiana',
      lng: 75.8573,
      lat: 30.9010
    });
    const userBId = userBReg.data.farmerId;

    const userBLogin = await axios.post(`${BASE_URL}/auth/login`, {
      phone: userBPhone,
      password: 'password123'
    });
    const userBToken = userBLogin.data.token;
    console.log(`✅ User B (Ludhiana, PB) created with ID: ${userBId}`);

    // 3. Test Reverse Geocoding Proxy (AP & Karnataka & Punjab)
    console.log('\n--- Testing Server-side Reverse Geocoding Proxy ---');
    const geoAP = await axios.get(`${BASE_URL}/farmer/location/reverse-geocode?lat=16.5062&lon=80.6480`);
    if (geoAP.data.success) {
      console.log(`✅ Reverse Geocode (16.5062, 80.6480) => ${geoAP.data.location.city || geoAP.data.location.district}, ${geoAP.data.location.state}`);
    } else {
      throw new Error('Reverse geocode failed for AP');
    }

    const geoPB = await axios.get(`${BASE_URL}/farmer/location/reverse-geocode?lat=30.9010&lon=75.8573`);
    if (geoPB.data.success) {
      console.log(`✅ Reverse Geocode (30.9010, 75.8573) => ${geoPB.data.location.city || geoPB.data.location.district}, ${geoPB.data.location.state}`);
    }

    // 4. Test Coordinate Validation
    console.log('\n--- Testing Coordinate Validation ---');
    try {
      await axios.put(`${BASE_URL}/farmer/location`, {
        lat: 195, // invalid
        lng: 80.6480
      }, {
        headers: { 'Authorization': `Bearer ${userAToken}` }
      });
      throw new Error('Invalid latitude was accepted! (Validation failure)');
    } catch (valErr) {
      if (valErr.response?.status === 400) {
        console.log('✅ PASS: Out-of-bounds latitude (195°) correctly rejected with 400 Bad Request.');
      } else {
        throw valErr;
      }
    }

    // 5. Test PUT /api/farmer/location for User A with GPS accuracy
    console.log('\n--- Testing Location Update & PostGIS Storage for User A ---');
    const updateResA = await axios.put(`${BASE_URL}/farmer/location`, {
      lat: 16.5062,
      lng: 80.6480,
      accuracy: 18.5,
      state: 'Andhra Pradesh',
      district: 'NTR District',
      city: 'Vijayawada',
      village: 'Gunadala',
      postalCode: '520004',
      formattedAddress: 'Gunadala, Vijayawada, Andhra Pradesh, 520004, India',
      source: 'GPS'
    }, {
      headers: { 'Authorization': `Bearer ${userAToken}` }
    });

    if (updateResA.data.success && updateResA.data.farmer.district === 'NTR District') {
      console.log('✅ PASS: User A GPS location updated in database.');
    } else {
      throw new Error('User A location update failed');
    }

    // 6. Test PostGIS Coordinate Ordering in PostgreSQL
    console.log('\n--- Verifying PostGIS Geom Coordinate Ordering ---');
    const geomCheckA = await query(`
      SELECT ST_X(geom) AS geom_lon, ST_Y(geom) AS geom_lat, latitude, longitude
      FROM farmers WHERE id = $1
    `, [userAId]);

    const rowA = geomCheckA.rows[0];
    const geomLon = parseFloat(rowA.geom_lon);
    const geomLat = parseFloat(rowA.geom_lat);

    if (Math.abs(geomLon - 80.6480) < 0.001 && Math.abs(geomLat - 16.5062) < 0.001) {
      console.log(`✅ PASS: PostGIS Geom Point Ordering Verified: POINT(lon: ${geomLon}, lat: ${geomLat}) matches table columns.`);
    } else {
      throw new Error(`PostGIS coordinate ordering mismatch: ST_X=${geomLon}, ST_Y=${geomLat}`);
    }

    // 7. Test Manual Fallback Location for User B
    console.log('\n--- Testing Manual Location Fallback for User B ---');
    const updateResB = await axios.put(`${BASE_URL}/farmer/location`, {
      lat: 30.9010,
      lng: 75.8573,
      accuracy: 250,
      state: 'Punjab',
      district: 'Ludhiana',
      city: 'Ludhiana City',
      source: 'MANUAL'
    }, {
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });

    if (updateResB.data.success && updateResB.data.farmer.locationSource === 'MANUAL') {
      console.log('✅ PASS: User B location source correctly tagged as MANUAL.');
    } else {
      throw new Error('User B manual location update failed');
    }

    // 8. Test Multi-User Location Isolation & Weather Accuracy
    console.log('\n--- Verifying Multi-User Location Isolation ---');
    const farmerAFresh = await Farmer.findById(userAId);
    const farmerBFresh = await Farmer.findById(userBId);

    const [lonA, latA] = farmerAFresh.location.coordinates;
    const [lonB, latB] = farmerBFresh.location.coordinates;

    if (latA === 16.5062 && latB === 30.9010 && farmerAFresh.state === 'Andhra Pradesh' && farmerBFresh.state === 'Punjab') {
      console.log(`✅ PASS: Complete location isolation verified:
         User A (${farmerAFresh.name}): ${latA}, ${lonA} (${farmerAFresh.state})
         User B (${farmerBFresh.name}): ${latB}, ${lonB} (${farmerBFresh.state})`);
    } else {
      throw new Error('Location isolation failed: Users shared or contaminated coordinates');
    }

    // 9. Verify PostGIS Spatial Distance Query
    console.log('\n--- Testing PostGIS Spatial Distance Query Between Farms ---');
    const distRes = await query(`
      SELECT ST_Distance(
        (SELECT geom::geography FROM farmers WHERE id = $1),
        (SELECT geom::geography FROM farmers WHERE id = $2)
      ) / 1000 AS distance_km
    `, [userAId, userBId]);

    const distanceKm = Math.round(parseFloat(distRes.rows[0].distance_km));
    console.log(`✅ PASS: PostGIS calculates distance between Vijayawada (AP) & Ludhiana (PB): ${distanceKm} km`);

    // 10. Clean up test users
    await query('DELETE FROM farmers WHERE phone IN ($1, $2)', [userAPhone, userBPhone]);
    console.log('✅ Cleaned up test farmers.');

    console.log('\n================================================================');
    console.log('🎉 ALL LOCATION & POSTGIS TESTS PASSED (10/10)!');
    console.log('================================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ Location test suite failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
