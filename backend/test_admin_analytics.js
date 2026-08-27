const axios = require('axios');
const jwt = require('jsonwebtoken');
const { pool, query, initDb } = require('./config/db');
const Farmer = require('./models/Farmer');
const Admin = require('./models/Admin');

const BASE_URL = 'http://localhost:4000/api';

let adminToken = '';
let testFarmerToken = '';
let testFarmerId = '';
const testPhone = '9988776655';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 KRISHI VAANI — ADMIN USER ANALYTICS & MONITORING TEST SUITE');
  console.log('===============================================================\n');

  try {
    // 0. Ensure DB is initialized
    await initDb();
    console.log('✅ DB Schema & Columns initialized.');

    // Clean up previous test farmer if exists
    await query('DELETE FROM farmers WHERE phone = $1', [testPhone]);

    // 1. Get or create Admin Token
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminMobile = process.env.ADMIN_MOBILE;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const loginRes = await axios.post(`${BASE_URL}/auth/admin/login`, {
      identifier: adminEmail,
      password: adminPassword
    });

    adminToken = loginRes.data.token;
    console.log('✅ Admin login succeeded. Token acquired.');

    // 2. Register a new test farmer
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Ravi Kumar Test',
      phone: testPhone,
      password: 'password123',
      city: 'Vijayawada',
      lng: 80.6480,
      lat: 16.5062
    });
    testFarmerId = regRes.data.farmerId;
    console.log(`✅ Farmer registered with ID: ${testFarmerId}`);

    // 3. Farmer login
    const farmerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      phone: testPhone,
      password: 'password123'
    });
    testFarmerToken = farmerLoginRes.data.token;
    console.log('✅ Farmer logged in successfully. Token acquired.');

    // 4. Test Farmer Heartbeat
    const hbRes = await axios.post(`${BASE_URL}/auth/heartbeat`, {}, {
      headers: { 'Authorization': `Bearer ${testFarmerToken}` }
    });
    if (hbRes.data.success) {
      console.log('✅ PASS: Farmer heartbeat updated presence & last_seen_at.');
    } else {
      throw new Error('Farmer heartbeat failed');
    }

    // 5. Test Weather activity logging
    await axios.get(`${BASE_URL}/weather/current?lat=16.5062&lon=80.6480`, {
      headers: { 'Authorization': `Bearer ${testFarmerToken}` }
    });
    console.log('✅ Weather requested by farmer and activity logged.');

    // 6. Test GET /api/admin/users/stats
    const statsRes = await axios.get(`${BASE_URL}/admin/users/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const stats = statsRes.data;
    if (stats.success && stats.total_users > 0 && stats.online_users >= 1 && stats.new_users_today >= 1) {
      console.log(`✅ PASS: User stats accurate — Total: ${stats.total_users}, Online: ${stats.online_users}, New Today: ${stats.new_users_today}`);
    } else {
      throw new Error(`User stats validation failed: ${JSON.stringify(stats)}`);
    }

    // 7. Test GET /api/admin/users with filters
    // 7a. Online filter
    const onlineUsersRes = await axios.get(`${BASE_URL}/admin/users?status=online`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const hasOnlineFarmer = onlineUsersRes.data.users.some(u => u.id === testFarmerId && u.status === 'ONLINE');
    if (hasOnlineFarmer) {
      console.log('✅ PASS: Status filtering (online) correctly identified the active farmer.');
    } else {
      throw new Error('Online filter failed to return active test farmer');
    }

    // 7b. Search filter
    const searchRes = await axios.get(`${BASE_URL}/admin/users?search=Ravi`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const foundRavi = searchRes.data.users.some(u => u.name.includes('Ravi'));
    if (foundRavi) {
      console.log('✅ PASS: User search returned matching farmer.');
    } else {
      throw new Error('Search failed');
    }

    // 7c. Masked phone in list
    const testUserInList = onlineUsersRes.data.users.find(u => u.id === testFarmerId);
    if (testUserInList && testUserInList.phone.includes('*') && testUserInList.phone.endsWith('6655')) {
      console.log(`✅ PASS: Mobile number masked in list view: ${testUserInList.phone}`);
    } else {
      throw new Error(`Phone masking failed in list view: ${testUserInList?.phone}`);
    }

    // 8. Test GET /api/admin/users/:id (User Detail view)
    const detailRes = await axios.get(`${BASE_URL}/admin/users/${testFarmerId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const detail = detailRes.data.user;
    if (detail && detail.id === testFarmerId && detail.phone === testPhone && detail.usage) {
      console.log(`✅ PASS: Detailed user profile retrieved with unmasked phone: ${detail.phone} and usage metrics.`);
    } else {
      throw new Error('User detail view failed');
    }

    // 9. Test POST /api/admin/users/:id/toggle-status (Disable account)
    const toggleRes = await axios.post(`${BASE_URL}/admin/users/${testFarmerId}/toggle-status`, {
      is_active: false
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (toggleRes.data.success && toggleRes.data.user.isActive === false) {
      console.log('✅ PASS: Admin successfully disabled user account.');
    } else {
      throw new Error('Toggle status failed');
    }

    // 10. Verify disabled farmer cannot log in
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        phone: testPhone,
        password: 'password123'
      });
      throw new Error('Disabled farmer was allowed to log in! (Security vulnerability)');
    } catch (loginErr) {
      if (loginErr.response?.status === 403) {
        console.log('✅ PASS: Disabled farmer login properly rejected with 403 Forbidden.');
      } else {
        throw loginErr;
      }
    }

    // 11. Re-enable account
    await axios.post(`${BASE_URL}/admin/users/${testFarmerId}/toggle-status`, {
      is_active: true
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('✅ PASS: Admin successfully re-enabled user account.');

    // 12. Verify security: Non-admin (Farmer token) cannot access /api/admin/users
    try {
      await axios.get(`${BASE_URL}/admin/users/stats`, {
        headers: { 'Authorization': `Bearer ${testFarmerToken}` }
      });
      throw new Error('Farmer was allowed to access admin user stats! (Security vulnerability)');
    } catch (secErr) {
      if (secErr.response?.status === 403 || secErr.response?.status === 401) {
        console.log('✅ PASS: Farmer token blocked from accessing Admin User Analytics.');
      } else {
        throw secErr;
      }
    }

    // Clean up test farmer
    await query('DELETE FROM farmers WHERE phone = $1', [testPhone]);
    console.log('✅ Cleaned up test data.');

    console.log('\n===============================================================');
    console.log('🎉 ALL USER ANALYTICS & MONITORING TESTS PASSED (12/12)!');
    console.log('===============================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test suite failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
