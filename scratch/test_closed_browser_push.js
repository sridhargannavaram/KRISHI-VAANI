/**
 * KRISHI VAANI — Closed Browser FCM Push Test
 * 
 * This script sends a REAL Firebase Cloud Messaging notification
 * to the authenticated farmer's registered FCM tokens.
 * 
 * It must be run ONLY after the user has confirmed the browser is closed.
 */

const { query } = require('../backend/config/db');
const notificationService = require('../backend/services/notificationService');

async function sendClosedBrowserTestNotification() {
    const FARMER_ID = 'a141f042-b84a-4cd8-95ff-6954e5fb899e'; // Sridhar (8688514489)

    console.log('================================================================');
    console.log('🔔 KRISHI VAANI — CLOSED BROWSER FCM PUSH TEST');
    console.log('================================================================');
    console.log('');

    // 1. Verify tokens exist in database
    const tokenRes = await query(
        `SELECT LEFT(fcm_token, 15) as prefix, RIGHT(fcm_token, 8) as suffix, LENGTH(fcm_token) as len, device_type, is_active 
         FROM notification_devices 
         WHERE farmer_id = $1 AND is_active = true AND LENGTH(fcm_token) > 100`,
        [FARMER_ID]
    );

    console.log(`Active real FCM tokens found: ${tokenRes.rows.length}`);
    tokenRes.rows.forEach((t, i) => {
        console.log(`  Token ${i + 1}: ${t.prefix}...${t.suffix} (${t.len} chars, ${t.device_type}, active: ${t.is_active})`);
    });
    console.log('');

    if (tokenRes.rows.length === 0) {
        console.log('❌ No active real FCM tokens found. Cannot send notification.');
        process.exit(1);
    }

    // 2. Send REAL notification through Firebase Admin SDK
    console.log('--- Sending REAL FCM notification through Firebase Admin SDK ---');
    console.log('');

    const result = await notificationService.sendNotificationToUser(FARMER_ID, {
        title: '🌾 KRISHI VAANI - Browser Closed Test',
        message: 'This notification was sent AFTER you closed the browser. If you see this, background push works!',
        type: 'GENERAL',
        priority: 'HIGH',
        source: 'SYSTEM_TEST',
        actionUrl: '/dashboard.html',
        preventSpamHours: 0  // Disable anti-spam for test
    });

    console.log('--- Firebase Admin SDK Response ---');
    console.log('');

    if (result) {
        console.log('In-App Notification ID:', result.notification?.id);
        console.log('FCM Sent:', result.fcm?.sent);
        console.log('FCM Attempted Tokens:', result.fcm?.attemptedTokens);
        console.log('FCM Successful Tokens:', result.fcm?.successfulTokens);
        console.log('FCM Failure Reason:', result.fcm?.reason || 'None');
    } else {
        console.log('❌ sendNotificationToUser returned null (possibly spam-blocked)');
    }

    console.log('');
    console.log('================================================================');
    console.log('MESSAGE DISPATCHED. CHECK YOUR WINDOWS NOTIFICATIONS NOW.');
    console.log('================================================================');

    process.exit(0);
}

sendClosedBrowserTestNotification().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
