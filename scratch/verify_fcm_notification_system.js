const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function runFcmVerification() {
    console.log('================================================================');
    console.log('🔔 KRISHI VAANI — FIREBASE CLOUD MESSAGING (FCM) VERIFICATION SUITE');
    console.log('================================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function assertTest(name, condition, details = '') {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`✅ PASS: [${name}] ${details ? '— ' + details : ''}`);
        } else {
            console.error(`❌ FAIL: [${name}] ${details ? '— ' + details : ''}`);
        }
    }

    try {
        // -------------------------------------------------------------
        // TEST 1: Public Firebase Web Config Endpoint
        // -------------------------------------------------------------
        console.log('--- 1. Public Firebase Web Configuration ---');
        const configRes = await axios.get(`${BASE_URL}/notifications/firebase-config`);
        assertTest(
            'Public Config Endpoint',
            configRes.status === 200 && configRes.data.authDomain && configRes.data.projectId,
            `Project: ${configRes.data.projectId}, Configured Flag: ${configRes.data.isConfigured}`
        );

        // -------------------------------------------------------------
        // TEST 2: Security & Unauthenticated Barrier
        // -------------------------------------------------------------
        console.log('\n--- 2. Security & Authentication Barriers ---');
        try {
            await axios.post(`${BASE_URL}/notifications/register-device`, {
                fcmToken: 'mock_unauthenticated_token_123456789'
            });
            assertTest('Unauthenticated Register Block', false, 'Should have rejected with HTTP 401');
        } catch (err) {
            assertTest('Unauthenticated Register Block', err.response?.status === 401, 'Blocked with HTTP 401');
        }

        try {
            await axios.get(`${BASE_URL}/notifications/history`);
            assertTest('Unauthenticated History Block', false, 'Should have rejected with HTTP 401');
        } catch (err) {
            assertTest('Unauthenticated History Block', err.response?.status === 401, 'Blocked with HTTP 401');
        }

        // -------------------------------------------------------------
        // TEST 3: User Registration & Authentication for Token Setup
        // -------------------------------------------------------------
        console.log('\n--- 3. Farmer Authentication & Token Registration ---');
        const testPhone = '+91' + Math.floor(6000000000 + Math.random() * 3999999999);
        await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Ramesh Gowda',
            phone: testPhone,
            password: 'FarmerPassword@123',
            state: 'Karnataka',
            district: 'Mandya'
        });

        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            phone: testPhone,
            password: 'FarmerPassword@123'
        });

        const farmerToken = loginRes.data.token;
        const farmerId = loginRes.data.farmer.id;
        assertTest('Farmer Auth Setup', !!farmerToken && !!farmerId, `Farmer ID: ${farmerId}`);

        const authHeaders = { headers: { 'Authorization': `Bearer ${farmerToken}` } };

        // -------------------------------------------------------------
        // TEST 4: FCM Device Registration (First Device - Web)
        // -------------------------------------------------------------
        console.log('\n--- 4. FCM Device Registration (PostgreSQL Persistence) ---');
        const mockFcmTokenWeb = 'fcm_web_token_' + Date.now() + '_abcdef1234567890';
        const regDeviceRes = await axios.post(
            `${BASE_URL}/notifications/register-device`,
            {
                fcmToken: mockFcmTokenWeb,
                deviceType: 'web',
                browserInfo: 'Mozilla/5.0 Chrome/120.0.0.0'
            },
            authHeaders
        );
        assertTest(
            'Web Device Token Registration',
            regDeviceRes.status === 201 && regDeviceRes.data.device?.isActive === true,
            `Registered Device ID: ${regDeviceRes.data.device?.id}`
        );

        // -------------------------------------------------------------
        // TEST 5: FCM Device Registration (Second Device - Mobile/PWA)
        // -------------------------------------------------------------
        const mockFcmTokenMobile = 'fcm_mobile_token_' + Date.now() + '_xyz9876543210';
        const regDeviceMobileRes = await axios.post(
            `${BASE_URL}/notifications/register-device`,
            {
                fcmToken: mockFcmTokenMobile,
                deviceType: 'mobile',
                browserInfo: 'Android Webview / Chrome Mobile'
            },
            authHeaders
        );
        assertTest(
            'Multi-Device Token Registration',
            regDeviceMobileRes.status === 201 && regDeviceMobileRes.data.device?.deviceType === 'mobile',
            `Device Type: ${regDeviceMobileRes.data.device?.deviceType}`
        );

        // -------------------------------------------------------------
        // TEST 6: Duplicate Token Upsert / Refresh
        // -------------------------------------------------------------
        const duplicateRes = await axios.post(
            `${BASE_URL}/notifications/register-device`,
            {
                fcmToken: mockFcmTokenWeb,
                deviceType: 'web',
                browserInfo: 'Updated Browser Version'
            },
            authHeaders
        );
        assertTest(
            'Duplicate Token Upsert Prevention',
            duplicateRes.status === 201,
            'Token refreshed without unique constraint violation'
        );

        // -------------------------------------------------------------
        // TEST 7: In-App Notification Dispatch & History
        // -------------------------------------------------------------
        console.log('\n--- 5. In-App Notification System & History ---');
        const testAlertRes = await axios.post(
            `${BASE_URL}/notifications/test-alert`,
            {
                title: '🌧️ Heavy Rainfall Warning',
                message: 'Heavy rain expected in Mandya over next 24 hours. Ensure drainage channels are clear.',
                priority: 'HIGH'
            },
            authHeaders
        );
        assertTest(
            'Alert Creation (PostgreSQL)',
            testAlertRes.status === 200 && testAlertRes.data.result?.notification?.id,
            `Notification ID: ${testAlertRes.data.result?.notification?.id}`
        );

        const historyRes = await axios.get(`${BASE_URL}/notifications/history`, authHeaders);
        assertTest(
            'Notification History Retrieval',
            historyRes.status === 200 && historyRes.data.count >= 1 && historyRes.data.unreadCount >= 1,
            `Count: ${historyRes.data.count}, Unread: ${historyRes.data.unreadCount}`
        );

        // -------------------------------------------------------------
        // TEST 8: Mark Notification as Read
        // -------------------------------------------------------------
        const notifId = historyRes.data.notifications[0].id;
        const markReadRes = await axios.patch(
            `${BASE_URL}/notifications/${notifId}/read`,
            {},
            authHeaders
        );
        assertTest('Mark Single Notification Read', markReadRes.status === 200, `Notification ${notifId} marked read`);

        const markAllRes = await axios.patch(
            `${BASE_URL}/notifications/read-all`,
            {},
            authHeaders
        );
        assertTest('Mark All Notifications Read', markAllRes.status === 200, `Updated count: ${markAllRes.data.updatedCount}`);

        // -------------------------------------------------------------
        // TEST 9: Multi-User Isolation (Farmer B Cannot Access Farmer A Data)
        // -------------------------------------------------------------
        console.log('\n--- 6. Multi-User Privacy & Data Isolation ---');
        const farmerBPhone = '+91' + Math.floor(6000000000 + Math.random() * 3999999999);
        await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Suresh Patil',
            phone: farmerBPhone,
            password: 'FarmerPassword@123',
            state: 'Maharashtra',
            district: 'Nashik'
        });
        const loginB = await axios.post(`${BASE_URL}/auth/login`, {
            phone: farmerBPhone,
            password: 'FarmerPassword@123'
        });
        const farmerBHeaders = { headers: { 'Authorization': `Bearer ${loginB.data.token}` } };

        const historyB = await axios.get(`${BASE_URL}/notifications/history`, farmerBHeaders);
        assertTest(
            'Cross-User History Isolation',
            historyB.data.count === 0,
            `Farmer B sees 0 notifications (Isolated from Farmer A's notifications)`
        );

        try {
            await axios.patch(`${BASE_URL}/notifications/${notifId}/read`, {}, farmerBHeaders);
            assertTest('Cross-User Edit Block', false, 'Should have rejected access to Farmer A notification');
        } catch (err) {
            assertTest('Cross-User Edit Block', err.response?.status === 404, 'Rejected with HTTP 404 Access Denied');
        }

        // -------------------------------------------------------------
        // TEST 10: Unregister Device Token
        // -------------------------------------------------------------
        console.log('\n--- 7. Device Token Unregistration (Logout/Revoke) ---');
        const unregRes = await axios.post(
            `${BASE_URL}/notifications/unregister-device`,
            { fcmToken: mockFcmTokenWeb },
            authHeaders
        );
        assertTest('Token Unregistration', unregRes.status === 200, 'Token marked inactive');

        console.log('\n================================================================');
        console.log(`FCM VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        console.log('================================================================\n');

    } catch (error) {
        console.error('Test Suite Fatal Error:', error.response?.data || error.message);
    }
}

runFcmVerification();
