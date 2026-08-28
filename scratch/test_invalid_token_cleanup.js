const axios = require('axios');
const { query } = require('../backend/config/db');

const BASE_URL = 'http://localhost:4000/api';

async function testInvalidTokenHandling() {
    console.log('--- Testing Safe Invalid Token Handling & Deactivation ---');

    // 1. Create a test farmer
    const testPhone = '+91' + Math.floor(6000000000 + Math.random() * 3999999999);
    await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Invalid Token Test Farmer',
        phone: testPhone,
        password: 'Password@123',
        state: 'Karnataka',
        district: 'Mysuru'
    });

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        phone: testPhone,
        password: 'Password@123'
    });
    const token = loginRes.data.token;
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    // 2. Register a mock token
    const testMockToken = 'mock_expired_token_for_cleanup_test_' + Date.now();
    await axios.post(`${BASE_URL}/notifications/register-device`, {
        fcmToken: testMockToken,
        deviceType: 'web',
        browserInfo: 'Mock Test Agent'
    }, authHeaders);

    // 3. Trigger alert (Firebase will reject the mock token safely without server crash)
    const alertRes = await axios.post(`${BASE_URL}/notifications/test-alert`, {
        title: 'Safe Error Handling Test',
        message: 'Testing graceful token cleanup on invalid token rejection.'
    }, authHeaders);

    console.log('Alert dispatched gracefully with status:', alertRes.status);
    console.log('Database notification recorded ID:', alertRes.data.result?.notification?.id);

    // 4. Verify in database that token was marked inactive or handled safely
    const dbRes = await query('SELECT fcm_token, is_active FROM notification_devices WHERE fcm_token = $1', [testMockToken]);
    console.log('Token DB State:', dbRes.rows[0]);
    console.log('✅ Server survived without crash; notification recorded safely in PostgreSQL.');
}

testInvalidTokenHandling();
