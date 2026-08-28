const { query } = require('../backend/config/db');
const notificationService = require('../backend/services/notificationService');

async function sendPhaseTestAlert(testPhaseTitle, testPhaseBody) {
    const FARMER_ID = 'a141f042-b84a-4cd8-95ff-6954e5fb899e'; // Sridhar (8688514489)

    console.log(`================================================================`);
    console.log(`🔔 DISPATCHING REAL FCM: ${testPhaseTitle}`);
    console.log(`================================================================`);

    const result = await notificationService.sendNotificationToUser(FARMER_ID, {
        title: testPhaseTitle,
        message: testPhaseBody,
        type: 'GENERAL',
        priority: 'HIGH',
        source: 'FINAL_AUDIT_TEST',
        actionUrl: '/dashboard.html',
        preventSpamHours: 0
    });

    console.log('FCM Sent:', result?.fcm?.sent);
    console.log('FCM Attempted Tokens:', result?.fcm?.attemptedTokens);
    console.log('FCM Successful Tokens:', result?.fcm?.successfulTokens);
    console.log('FCM Failure Reason:', result?.fcm?.reason || 'None');
    console.log('In-App Notification ID:', result?.notification?.id);

    return result;
}

const action = process.argv[2] || 'tab_closed';

if (action === 'tab_closed') {
    sendPhaseTestAlert(
        'KRISHI VAANI — Tab Closed Test',
        'Testing push notification after the KRISHI VAANI tab is closed.'
    ).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else if (action === 'browser_closed') {
    sendPhaseTestAlert(
        'KRISHI VAANI — Closed Browser Test',
        'Testing whether KRISHI VAANI can deliver a real notification after closing the browser.'
    ).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else if (action === 'language_kannada') {
    const FARMER_ID = 'a141f042-b84a-4cd8-95ff-6954e5fb899e';
    (async () => {
        await notificationService.updateFarmerPreferredLanguage(FARMER_ID, 'kn');
        const res = await notificationService.sendWeatherAlert(FARMER_ID, {
            temp: 36,
            humidity: 78,
            wind: 12,
            isRaining: true,
            alertText: 'Heavy rain in Mysuru',
            district: 'Mysuru',
            priority: 'HIGH'
        });
        console.log('Kannada Alert Dispatched:', res.notification.title, '|', res.notification.message);
        console.log('FCM Success Count:', res.fcm?.successfulTokens);
        process.exit(0);
    })().catch(e => { console.error(e); process.exit(1); });
}
