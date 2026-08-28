const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

let firebaseApp = null;
let isFirebaseConfigured = false;

// -------------------------------------------------------------
// 1. Safe, Production-Ready Firebase Admin SDK Initialization
// -------------------------------------------------------------
function initializeFirebaseAdmin() {
    if (firebaseApp) return firebaseApp;

    try {
        // Strategy A: Service Account JSON String in Environment Variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            let serviceAccount;
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            } catch (e) {
                // If base64 encoded
                const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
                serviceAccount = JSON.parse(decoded);
            }
            firebaseApp = admin.initializeApp({
                credential: admin.cert(serviceAccount)
            });
            isFirebaseConfigured = true;
            console.log('✅ Firebase Admin SDK Initialized via FIREBASE_SERVICE_ACCOUNT_KEY env var.');
            return firebaseApp;
        }

        // Strategy B: Dedicated Individual Environment Variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
            firebaseApp = admin.initializeApp({
                credential: admin.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey
                })
            });
            isFirebaseConfigured = true;
            console.log('✅ Firebase Admin SDK Initialized via FIREBASE_* individual env vars.');
            return firebaseApp;
        }

        // Strategy C: Local serviceAccountKey.json file in backend root (gitignored)
        const localKeyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
        const altLocalKeyPath = path.join(__dirname, '..', 'firebase-admin.json');

        if (fs.existsSync(localKeyPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
            firebaseApp = admin.initializeApp({
                credential: admin.cert(serviceAccount)
            });
            isFirebaseConfigured = true;
            console.log('✅ Firebase Admin SDK Initialized via local serviceAccountKey.json.');
            return firebaseApp;
        } else if (fs.existsSync(altLocalKeyPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(altLocalKeyPath, 'utf8'));
            firebaseApp = admin.initializeApp({
                credential: admin.cert(serviceAccount)
            });
            isFirebaseConfigured = true;
            console.log('✅ Firebase Admin SDK Initialized via local firebase-admin.json.');
            return firebaseApp;
        }

        // Strategy D: GOOGLE_APPLICATION_CREDENTIALS default path
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            firebaseApp = admin.initializeApp({
                credential: admin.applicationDefault()
            });
            isFirebaseConfigured = true;
            console.log('✅ Firebase Admin SDK Initialized via GOOGLE_APPLICATION_CREDENTIALS.');
            return firebaseApp;
        }

        // Graceful Unconfigured Mode
        console.log('ℹ️ Firebase Admin SDK: Credentials not yet configured. In-app notifications & database history active; FCM push will activate when credentials are provided.');
        isFirebaseConfigured = false;
        return null;
    } catch (error) {
        console.warn('⚠️ Firebase Admin SDK Initialization Warning:', error.message);
        isFirebaseConfigured = false;
        return null;
    }
}

// Initialize on module load
initializeFirebaseAdmin();

// -------------------------------------------------------------
// 2. Token & Device Management (PostgreSQL)
// -------------------------------------------------------------

/**
 * Register or update an FCM device token for an authenticated farmer
 */
async function registerDeviceToken(farmerId, fcmToken, deviceType = 'web', browserInfo = '') {
    if (!farmerId || !fcmToken) throw new Error('farmerId and fcmToken are required');

    const cleanToken = fcmToken.trim();
    if (cleanToken.length < 10) throw new Error('Invalid FCM token format');

    const sql = `
        INSERT INTO notification_devices (farmer_id, fcm_token, device_type, browser_info, is_active, updated_at, last_used_at)
        VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
        ON CONFLICT (fcm_token)
        DO UPDATE SET
            farmer_id = EXCLUDED.farmer_id,
            device_type = EXCLUDED.device_type,
            browser_info = EXCLUDED.browser_info,
            is_active = TRUE,
            updated_at = NOW(),
            last_used_at = NOW()
        RETURNING id, farmer_id, device_type, is_active, created_at;
    `;
    const res = await query(sql, [farmerId, cleanToken, deviceType, browserInfo || '']);
    return res.rows[0];
}

/**
 * Deactivate an FCM device token (e.g. on logout or permission revoke)
 */
async function unregisterDeviceToken(farmerId, fcmToken) {
    if (!fcmToken) return false;
    const sql = `
        UPDATE notification_devices
        SET is_active = FALSE, updated_at = NOW()
        WHERE fcm_token = $1 AND (farmer_id = $2 OR $2 IS NULL);
    `;
    await query(sql, [fcmToken.trim(), farmerId]);
    return true;
}

/**
 * Mark a token inactive when Firebase reports it invalid/unregistered
 */
async function markTokenInactive(fcmToken) {
    if (!fcmToken) return;
    try {
        await query(
            `UPDATE notification_devices SET is_active = FALSE, updated_at = NOW() WHERE fcm_token = $1`,
            [fcmToken.trim()]
        );
    } catch (e) {
        console.error('Error marking token inactive:', e.message);
    }
}

/**
 * Retrieve all active FCM tokens for a farmer
 */
async function getFarmerActiveTokens(farmerId) {
    if (!farmerId) return [];
    const res = await query(
        `SELECT fcm_token FROM notification_devices WHERE farmer_id = $1 AND is_active = TRUE`,
        [farmerId]
    );
    return res.rows.map(r => r.fcm_token);
}

// -------------------------------------------------------------
// 3. In-App Notification History Management (PostgreSQL Source of Truth)
// -------------------------------------------------------------

/**
 * Record an in-app notification in PostgreSQL
 */
async function recordNotification(farmerId, {
    title,
    message,
    type = 'GENERAL',
    priority = 'MEDIUM',
    source = 'SYSTEM',
    actionUrl = '/dashboard.html',
    metadata = {}
}) {
    if (!farmerId || !title || !message) {
        throw new Error('farmerId, title, and message are required');
    }

    const sql = `
        INSERT INTO in_app_notifications (farmer_id, title, message, type, priority, source, action_url, metadata, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, NOW())
        RETURNING id, farmer_id, title, message, type, priority, source, action_url, metadata, is_read, created_at;
    `;
    const res = await query(sql, [
        farmerId,
        title.substring(0, 255),
        message,
        type.toUpperCase(),
        priority.toUpperCase(),
        source.toUpperCase(),
        actionUrl || '/dashboard.html',
        JSON.stringify(metadata || {})
    ]);
    return res.rows[0];
}

/**
 * Fetch notification history for a farmer
 */
async function getNotificationHistory(farmerId, limit = 50, onlyUnread = false) {
    if (!farmerId) return [];
    let sql = `
        SELECT id, title, message, type, priority, source, action_url, metadata, is_read, created_at
        FROM in_app_notifications
        WHERE farmer_id = $1
    `;
    const params = [farmerId];
    if (onlyUnread) {
        sql += ` AND is_read = FALSE`;
    }
    sql += ` ORDER BY created_at DESC LIMIT $2`;
    params.push(parseInt(limit) || 50);

    const res = await query(sql, params);
    return res.rows;
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(farmerId, notificationId) {
    const res = await query(
        `UPDATE in_app_notifications SET is_read = TRUE WHERE id = $1 AND farmer_id = $2 RETURNING id, is_read`,
        [notificationId, farmerId]
    );
    return res.rows.length > 0;
}

/**
 * Mark all notifications as read for a farmer
 */
async function markAllNotificationsAsRead(farmerId) {
    const res = await query(
        `UPDATE in_app_notifications SET is_read = TRUE WHERE farmer_id = $1 AND is_read = FALSE`,
        [farmerId]
    );
    return res.rowCount;
}

// -------------------------------------------------------------
// 4. Duplicate Notification Spam Prevention
// -------------------------------------------------------------

/**
 * Checks if an identical alert was sent to the farmer within the last N hours
 */
async function isDuplicateRecentAlert(farmerId, title, type, hours = 3) {
    try {
        const sql = `
            SELECT id FROM in_app_notifications
            WHERE farmer_id = $1
              AND title = $2
              AND type = $3
              AND created_at >= NOW() - INTERVAL '${parseInt(hours) || 3} hours'
            LIMIT 1;
        `;
        const res = await query(sql, [farmerId, title, type.toUpperCase()]);
        return res.rows.length > 0;
    } catch (e) {
        return false;
    }
}

// -------------------------------------------------------------
// 5. Push Notification Dispatch Engine (FCM + In-App DB)
// -------------------------------------------------------------

/**
 * Send notification to a single farmer with in-app history + FCM Web Push
 */
async function sendNotificationToUser(farmerId, {
    title,
    message,
    type = 'GENERAL',
    priority = 'MEDIUM',
    source = 'SYSTEM',
    actionUrl = '/dashboard.html',
    metadata = {},
    preventSpamHours = 3,
    icon = '/assets/images/logo.png'
}) {
    if (!farmerId || !title || !message) return null;

    // 1. Anti-Spam Check
    if (preventSpamHours > 0) {
        const duplicate = await isDuplicateRecentAlert(farmerId, title, type, preventSpamHours);
        if (duplicate) {
            console.log(`ℹ️ Suppressed duplicate alert "${title}" for farmer ${farmerId} within ${preventSpamHours}h window.`);
            return null;
        }
    }

    // 2. PostgreSQL In-App Notification (Always Recorded as Source of Truth)
    const record = await recordNotification(farmerId, {
        title,
        message,
        type,
        priority,
        source,
        actionUrl,
        metadata
    });

    // 3. Dispatch FCM Web Push Notification if Firebase is Configured
    let fcmResult = { sent: false, attemptedTokens: 0, successfulTokens: 0, reason: 'Firebase not configured' };

    if (isFirebaseConfigured && firebaseApp) {
        const tokens = await getFarmerActiveTokens(farmerId);
        fcmResult.attemptedTokens = tokens.length;

        if (tokens.length > 0) {
            const fcmPayload = {
                tokens: tokens,
                notification: {
                    title: title,
                    body: message
                },
                data: {
                    type: String(type),
                    priority: String(priority),
                    actionUrl: String(actionUrl || '/dashboard.html'),
                    notificationId: String(record.id),
                    source: String(source)
                },
                webpush: {
                    notification: {
                        title: title,
                        body: message,
                        icon: icon || '/assets/images/logo.png',
                        badge: '/assets/images/logo.png',
                        click_action: actionUrl || '/dashboard.html',
                        requireInteraction: priority === 'CRITICAL' || priority === 'HIGH'
                    },
                    fcmOptions: {
                        link: actionUrl || '/dashboard.html'
                    }
                }
            };

            try {
                const messaging = getMessaging(firebaseApp);
                const response = await messaging.sendEachForMulticast(fcmPayload);
                fcmResult.sent = true;
                fcmResult.successfulTokens = response.successCount;
                fcmResult.reason = null;

                // Inspect failures & clean invalid tokens
                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            const errCode = resp.error?.code;
                            const failedToken = tokens[idx];
                            if (
                                errCode === 'messaging/registration-token-not-registered' ||
                                errCode === 'messaging/invalid-registration-token' ||
                                errCode === 'messaging/mismatched-credential'
                            ) {
                                console.log(`🧹 Deactivating expired/invalid FCM token: ${failedToken?.substring(0, 12)}...`);
                                markTokenInactive(failedToken);
                            }
                        }
                    });
                }
            } catch (fcmErr) {
                console.error('❌ FCM Multicast Dispatch Error:', fcmErr.message);
                fcmResult.reason = fcmErr.message;
            }
        } else {
            fcmResult.reason = 'No active FCM tokens registered for farmer';
        }
    }

    return {
        notification: record,
        fcm: fcmResult
    };
}

/**
 * Send notification to multiple farmers
 */
async function sendNotificationToUsers(farmerIds, payload) {
    if (!Array.isArray(farmerIds) || farmerIds.length === 0) return [];
    const results = [];
    for (const farmerId of farmerIds) {
        try {
            const res = await sendNotificationToUser(farmerId, payload);
            if (res) results.push(res);
        } catch (err) {
            console.error(`Failed to send notification to farmer ${farmerId}:`, err.message);
        }
    }
    return results;
}

/**
 * Helper: Send Weather Alert to a Farmer
 */
async function sendWeatherAlert(farmerId, {
    temp,
    humidity,
    wind,
    isRaining,
    alertText,
    priority = 'HIGH'
}) {
    const title = isRaining ? '🌧️ Heavy Rain Alert — Krishi Vaani' : '⚠️ Weather Alert — Krishi Vaani';
    return await sendNotificationToUser(farmerId, {
        title,
        message: alertText,
        type: 'WEATHER',
        priority,
        source: 'ALERT_GUARD',
        actionUrl: '/dashboard.html#weather',
        metadata: { temp, humidity, wind, isRaining }
    });
}

/**
 * Helper: Send Crop Advisory / Pest Alert to a Farmer
 */
async function sendCropAlert(farmerId, {
    crop,
    riskType,
    alertText,
    priority = 'MEDIUM'
}) {
    const title = `🌾 ${crop || 'Crop'} Alert — ${riskType || 'Field Risk'}`;
    return await sendNotificationToUser(farmerId, {
        title,
        message: alertText,
        type: 'CROP',
        priority,
        source: 'AGRI_INTEL',
        actionUrl: '/crop-alerts.html',
        metadata: { crop, riskType }
    });
}

// -------------------------------------------------------------
// 6. Public Firebase Web Configuration (Safe Placeholders & Env Exposure)
// -------------------------------------------------------------
function getPublicFirebaseWebConfig() {
    return {
        apiKey: process.env.FIREBASE_API_KEY || 'PLACEHOLDER_FIREBASE_API_KEY',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'krishi-vaani.firebaseapp.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'krishi-vaani',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'krishi-vaani.appspot.com',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '000000000000',
        appId: process.env.FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
        vapidKey: process.env.FIREBASE_VAPID_KEY || 'PLACEHOLDER_PUBLIC_VAPID_KEY',
        isConfigured: !!(process.env.FIREBASE_API_KEY && process.env.FIREBASE_VAPID_KEY && process.env.FIREBASE_API_KEY !== 'PLACEHOLDER_FIREBASE_API_KEY')
    };
}

module.exports = {
    initializeFirebaseAdmin,
    registerDeviceToken,
    unregisterDeviceToken,
    markTokenInactive,
    getFarmerActiveTokens,
    recordNotification,
    getNotificationHistory,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendNotificationToUser,
    sendNotificationToUsers,
    sendWeatherAlert,
    sendCropAlert,
    getPublicFirebaseWebConfig,
    getIsFirebaseConfigured: () => isFirebaseConfigured
};
