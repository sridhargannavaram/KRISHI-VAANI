require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { query } = require('./config/db');
const Admin = require('./models/Admin');
const Farmer = require('./models/Farmer');

const BASE_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 KRISHI VAANI — SECURE ADMIN AUTHENTICATION TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminMobile = process.env.ADMIN_MOBILE;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Test 1: Admin Login with Email + Password
    let emailLoginRes;
    try {
      emailLoginRes = await axios.post(`${BASE_URL}/auth/admin/login`, {
        identifier: adminEmail,
        password: adminPassword
      });
      assert(
        emailLoginRes.data.success === true && 
        !!emailLoginRes.data.token && 
        emailLoginRes.data.admin.email.toLowerCase() === adminEmail.toLowerCase() &&
        emailLoginRes.data.admin.role === 'ADMIN',
        '1. Admin can log in with Email + Password'
      );
    } catch (e) {
      assert(false, `1. Admin Email login failed: ${e.response?.data?.error || e.message}`);
    }

    const adminToken = emailLoginRes?.data?.token;

    // Test 2: Admin Login with Mobile + Password
    try {
      const mobileLoginRes = await axios.post(`${BASE_URL}/auth/admin/login`, {
        identifier: adminMobile,
        password: adminPassword
      });
      assert(
        mobileLoginRes.data.success === true && 
        !!mobileLoginRes.data.token &&
        mobileLoginRes.data.admin.mobile === adminMobile &&
        mobileLoginRes.data.admin.role === 'ADMIN',
        '2. Admin can log in with Mobile Number + Password'
      );
    } catch (e) {
      assert(false, `2. Admin Mobile login failed: ${e.response?.data?.error || e.message}`);
    }

    // Test 3: Wrong password rejected
    try {
      await axios.post(`${BASE_URL}/auth/admin/login`, {
        identifier: adminEmail,
        password: 'WrongPassword@123'
      });
      assert(false, '3. Wrong password was accepted (SHOULD BE REJECTED)');
    } catch (e) {
      assert(
        e.response?.status === 401 && 
        e.response?.data?.error === 'Invalid email/mobile number or password.',
        '3. Wrong password is rejected with 401 and generic safe error message'
      );
    }

    // Test 4: Unknown email rejected
    try {
      await axios.post(`${BASE_URL}/auth/admin/login`, {
        identifier: 'unknown_admin_999@example.com',
        password: adminPassword
      });
      assert(false, '4. Unknown email was accepted (SHOULD BE REJECTED)');
    } catch (e) {
      assert(
        e.response?.status === 401 && 
        e.response?.data?.error === 'Invalid email/mobile number or password.',
        '4. Unknown email is rejected with 401 and safe error message'
      );
    }

    // Test 5: Unknown mobile rejected
    try {
      await axios.post(`${BASE_URL}/auth/admin/login`, {
        identifier: '9999999999',
        password: adminPassword
      });
      assert(false, '5. Unknown mobile was accepted (SHOULD BE REJECTED)');
    } catch (e) {
      assert(
        e.response?.status === 401 && 
        e.response?.data?.error === 'Invalid email/mobile number or password.',
        '5. Unknown mobile is rejected with 401 and safe error message'
      );
    }

    // Test 6: Database password_hash verification (Plaintext NEVER stored or returned)
    const dbAdmin = await query('SELECT * FROM admins WHERE email = $1', [adminEmail.toLowerCase().trim()]);
    const row = dbAdmin.rows[0];
    assert(
      !!row && 
      row.password_hash.startsWith('$2b$') && 
      row.password_hash !== adminPassword && 
      !row.password,
      '6. Password is stored only as secure bcrypt hash in database, plaintext never stored'
    );

    // Test 7: API response does not expose password or password_hash
    assert(
      emailLoginRes?.data?.admin?.password === undefined &&
      emailLoginRes?.data?.admin?.passwordHash === undefined &&
      emailLoginRes?.data?.admin?.password_hash === undefined,
      '7. API response never returns password or password_hash'
    );

    // Test 8: Admin JWT can access protected Admin APIs
    try {
      const dashRes = await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(
        dashRes.data.success === true && dashRes.data.stats !== undefined,
        '8. Admin JWT successfully accesses protected /api/admin/dashboard'
      );
    } catch (e) {
      assert(false, `8. Admin Dashboard request failed: ${e.response?.data?.error || e.message}`);
    }

    // Test 9: Admin JWT can access /api/admin/farmers
    try {
      const farmersRes = await axios.get(`${BASE_URL}/admin/farmers`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(
        farmersRes.data.success === true && Array.isArray(farmersRes.data.farmers),
        '9. Admin JWT successfully accesses protected /api/admin/farmers'
      );
    } catch (e) {
      assert(false, `9. Admin Farmers request failed: ${e.response?.data?.error || e.message}`);
    }

    // Test 10: Farmer JWT cannot access Admin APIs (403 Forbidden)
    const farmerToken = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', phone: '9876543210' }, // Notice: no role: 'ADMIN'
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      assert(false, '10. Farmer token accessed admin API (SHOULD BE 403 FORBIDDEN)');
    } catch (e) {
      assert(
        e.response?.status === 403,
        '10. Farmer JWT is strictly rejected with 403 Forbidden on Admin endpoints'
      );
    }

    // Test 11: Invalid/Expired JWT is rejected
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: 'Bearer invalid.bogus.jwt' }
      });
      assert(false, '11. Invalid JWT accessed admin API (SHOULD BE 401 UNAUTHORIZED)');
    } catch (e) {
      assert(
        e.response?.status === 401,
        '11. Invalid/Forged JWT is rejected with 401 Unauthorized'
      );
    }

    // Test 12: No Auth Header is rejected
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`);
      assert(false, '12. Unauthenticated request accessed admin API (SHOULD BE 401)');
    } catch (e) {
      assert(
        e.response?.status === 401,
        '12. Unauthenticated request without Bearer token is rejected with 401'
      );
    }

    // Test 13: Idempotent Seeder does not create duplicate accounts
    const initialCountRes = await query('SELECT COUNT(*) AS total FROM admins WHERE email = $1', [adminEmail.toLowerCase().trim()]);
    await Admin.seedAdmin({
      name: 'System Administrator',
      email: adminEmail,
      mobile: adminMobile,
      password: adminPassword
    });
    const afterCountRes = await query('SELECT COUNT(*) AS total FROM admins WHERE email = $1', [adminEmail.toLowerCase().trim()]);
    assert(
      parseInt(initialCountRes.rows[0].total) === 1 && 
      parseInt(afterCountRes.rows[0].total) === 1,
      '13. Seeder is idempotent: re-seeding updates existing record without duplicates'
    );

    // Test 14: Farmer OTP flow still intact
    try {
      const otpSendRes = await axios.post(`${BASE_URL}/auth/send-otp`, {
        phone: '9876543210'
      });
      assert(
        otpSendRes.data.success === true,
        '14. Existing Farmer Mobile OTP request flow remains fully operational'
      );
    } catch (e) {
      assert(false, `14. Farmer OTP flow failed: ${e.response?.data?.error || e.message}`);
    }

    // Test 15: Farmer login endpoint unchanged
    try {
      const farmerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
        phone: '0000000000',
        password: 'wrong'
      });
    } catch (e) {
      assert(
        e.response?.status === 401,
        '15. Existing Farmer Phone + Password login endpoint is unchanged and active'
      );
    }

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('===============================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL 15 ADMIN AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!');
    } else {
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error('Test execution exception:', err);
    process.exit(1);
  }
}

runTests();
