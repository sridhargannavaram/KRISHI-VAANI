const { query } = require('../backend/config/db');
const notificationService = require('../backend/services/notificationService');

async function triggerLanguagePush() {
    const FARMER_ID = 'a141f042-b84a-4cd8-95ff-6954e5fb899e'; // Sridhar (8688514489)

    // 1. Fetch current stored language in PostgreSQL
    const langRes = await query('SELECT name, phone, preferred_language FROM farmers WHERE id = $1', [FARMER_ID]);
    const farmer = langRes.rows[0];

    console.log('================================================================');
    console.log('🌐 TRIGGERING DYNAMIC MULTI-LANGUAGE CLOSED-BROWSER PUSH');
    console.log('================================================================');
    console.log(`Farmer: ${farmer.name} (${farmer.phone})`);
    console.log(`Current Language stored in PostgreSQL: [ ${farmer.preferred_language.toUpperCase()} ]`);
    console.log('');

    // 2. Dispatch Smart Localized Weather Alert
    const res = await notificationService.sendWeatherAlert(FARMER_ID, {
        temp: 37,
        humidity: 82,
        wind: 18,
        isRaining: true,
        alertText: 'Heavy rain detected in your area.',
        district: 'Mysuru',
        priority: 'HIGH'
    });

    console.log('--- Dispatched Notification Content ---');
    console.log('Title:  ', res.notification?.title);
    console.log('Message:', res.notification?.message);
    console.log('FCM Success Count:', res.fcm?.successfulTokens);
    console.log('FCM Failure Count:', res.fcm?.attemptedTokens - res.fcm?.successfulTokens);
    console.log('');
    console.log('================================================================');
    console.log('NOTIFICATION SENT. CHECK YOUR WINDOWS DESKTOP NOTIFICATIONS.');
    console.log('================================================================');
}

triggerLanguagePush().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
