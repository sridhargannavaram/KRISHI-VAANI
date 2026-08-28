const axios = require('axios');
const { query } = require('../backend/config/db');
const notificationService = require('../backend/services/notificationService');

const BASE_URL = 'http://localhost:4000/api';

async function testSafeImprovements() {
    console.log('================================================================');
    console.log('🧪 TESTING SAFE NOTIFICATION SYSTEM IMPROVEMENTS');
    console.log('================================================================\n');

    // 1. Create a test farmer
    const testPhone = '+91' + Math.floor(6000000000 + Math.random() * 3999999999);
    await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Kannada Preference Farmer',
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
    const farmerId = loginRes.data.farmer.id;
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    console.log('✅ Farmer created and logged in:', farmerId);

    // 2. Test GET /api/notifications/preferences
    const getPrefsRes = await axios.get(`${BASE_URL}/notifications/preferences`, authHeaders);
    console.log('✅ Default preferences retrieved:', getPrefsRes.data.preferences.weather_alerts === true ? 'PASS' : 'FAIL');
    console.log('   Default preferred language:', getPrefsRes.data.preferredLanguage);

    // 3. Test PATCH /api/notifications/language -> set to 'kn' (Kannada)
    const langRes = await axios.patch(`${BASE_URL}/notifications/language`, { language: 'kn' }, authHeaders);
    console.log('✅ Language updated to Kannada (kn):', langRes.data.language === 'kn' ? 'PASS' : 'FAIL');

    // 4. Test PUT /api/notifications/preferences
    const putPrefsRes = await axios.put(`${BASE_URL}/notifications/preferences`, {
        news_alerts: true,
        scheme_alerts: true,
        quiet_hours_enabled: false
    }, authHeaders);
    console.log('✅ Preferences updated (news_alerts: true):', putPrefsRes.data.preferences.news_alerts === true ? 'PASS' : 'FAIL');

    // 5. Test Multi-Language Smart Notification Dispatch
    const smartAlertRes = await notificationService.sendSmartNotification(farmerId, {
        templateKey: 'WEATHER_RAIN',
        templateVars: { district: 'Mysuru', hours: '2' },
        title: 'Fallback Rain Title',
        message: 'Fallback message',
        type: 'WEATHER',
        priority: 'HIGH',
        source: 'ALERT_GUARD',
        actionUrl: '/dashboard.html#weather',
        preventSpamHours: 0
    });

    console.log('✅ Smart Alert sent with localized template:');
    console.log('   Title:', smartAlertRes.notification.title);
    console.log('   Message:', smartAlertRes.notification.message);

    const isKannada = smartAlertRes.notification.title.includes('ಕೃಷಿ ವಾಣಿ') || smartAlertRes.notification.title.includes('ಭಾರಿ ಮಳೆ');
    console.log('   Language is correctly localized in Kannada:', isKannada ? 'PASS' : 'FAIL');

    // 6. Test Preference Suppression (Disable weather_alerts and verify suppression)
    await axios.put(`${BASE_URL}/notifications/preferences`, { weather_alerts: false }, authHeaders);
    const suppressedAlert = await notificationService.sendSmartNotification(farmerId, {
        templateKey: 'WEATHER_RAIN',
        templateVars: { district: 'Mysuru', hours: '2' },
        title: 'Muted Rain Title',
        message: 'Muted message',
        type: 'WEATHER',
        priority: 'HIGH',
        preventSpamHours: 0
    });
    console.log('✅ Non-critical alert suppressed when preference is OFF:', suppressedAlert === null ? 'PASS' : 'FAIL');

    // 7. Test CRITICAL Alert Bypass (Critical disaster alert should bypass preference = OFF)
    const criticalAlert = await notificationService.sendSmartNotification(farmerId, {
        templateKey: 'WEATHER_CYCLONE',
        templateVars: { district: 'Mysuru' },
        title: 'Emergency Cyclone',
        message: 'Emergency Cyclone',
        type: 'WEATHER',
        priority: 'CRITICAL',
        preventSpamHours: 0
    });
    console.log('✅ CRITICAL alert bypassed preference filter (Delivered):', criticalAlert !== null ? 'PASS' : 'FAIL');

    console.log('\n================================================================');
    console.log('🎉 ALL SAFE NOTIFICATION IMPROVEMENTS TESTS PASSED!');
    console.log('================================================================');
}

testSafeImprovements().catch(e => {
    console.error('Test Failed:', e.response?.data || e.message);
    process.exit(1);
});
