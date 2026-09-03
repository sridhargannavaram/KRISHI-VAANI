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
 * Helper: Send Weather Alert to a Farmer (Smart & Multi-Language)
 */
async function sendWeatherAlert(farmerId, {
    temp,
    humidity,
    wind,
    isRaining,
    alertText,
    district = '',
    priority = 'HIGH'
}) {
    const templateKey = isRaining ? 'WEATHER_RAIN' : (temp > 35 ? 'WEATHER_HEAT' : (wind > 15 ? 'WEATHER_WIND' : null));
    const title = isRaining ? '🌧️ Heavy Rain Alert — Krishi Vaani' : '⚠️ Weather Alert — Krishi Vaani';

    return await sendSmartNotification(farmerId, {
        templateKey,
        templateVars: {
            district: district || 'your area',
            hours: '3',
            temp: String(temp || 35),
            wind: String(wind || 15)
        },
        title,
        message: alertText,
        type: 'WEATHER',
        priority: priority || (isRaining ? 'CRITICAL' : 'HIGH'),
        source: 'ALERT_GUARD',
        actionUrl: '/dashboard.html#weather',
        metadata: { temp, humidity, wind, isRaining }
    });
}

/**
 * Helper: Send Crop Advisory / Pest Alert to a Farmer (Smart & Multi-Language)
 */
async function sendCropAlert(farmerId, {
    crop,
    riskType,
    alertText,
    priority = 'MEDIUM'
}) {
    const title = `🌾 ${crop || 'Crop'} Alert — ${riskType || 'Field Risk'}`;
    return await sendSmartNotification(farmerId, {
        templateKey: 'CROP_DISEASE_RISK',
        templateVars: {
            crop: crop || 'Crop',
            risk: riskType || 'Field Risk'
        },
        title,
        message: alertText,
        type: 'CROP',
        priority,
        source: 'AGRI_INTEL',
        actionUrl: '/crop-alerts.html',
        metadata: { crop, riskType }
    });
}

const { formatTemplate } = require('./notificationTemplates');

// -------------------------------------------------------------
// 6. Farmer Notification Preferences & Language Management
// -------------------------------------------------------------

const DEFAULT_PREFERENCES = {
    weather_alerts: true,
    crop_alerts: true,
    mandi_alerts: true,
    ai_advisory: true,
    news_alerts: false,
    scheme_alerts: false,
    critical_always: true,
    quiet_hours_enabled: false,
    quiet_start_hour: 22,
    quiet_end_hour: 6
};

/**
 * Fetch a farmer's notification preferences (with safe defaults)
 */
async function getFarmerNotificationPreferences(farmerId) {
    if (!farmerId) return { ...DEFAULT_PREFERENCES };
    try {
        const res = await query(
            `SELECT weather_alerts, crop_alerts, mandi_alerts, ai_advisory, news_alerts, scheme_alerts, critical_always, quiet_hours_enabled, quiet_start_hour, quiet_end_hour
             FROM notification_preferences WHERE farmer_id = $1`,
            [farmerId]
        );
        if (res.rows.length > 0) {
            return { ...DEFAULT_PREFERENCES, ...res.rows[0] };
        }
    } catch (err) {
        console.warn('⚠️ Could not fetch farmer notification preferences:', err.message);
    }
    return { ...DEFAULT_PREFERENCES };
}

/**
 * Update or insert a farmer's notification preferences
 */
async function updateFarmerNotificationPreferences(farmerId, prefs = {}) {
    if (!farmerId) throw new Error('farmerId is required');

    const weatherAlerts = prefs.weather_alerts !== undefined ? !!prefs.weather_alerts : true;
    const cropAlerts = prefs.crop_alerts !== undefined ? !!prefs.crop_alerts : true;
    const mandiAlerts = prefs.mandi_alerts !== undefined ? !!prefs.mandi_alerts : true;
    const aiAdvisory = prefs.ai_advisory !== undefined ? !!prefs.ai_advisory : true;
    const newsAlerts = prefs.news_alerts !== undefined ? !!prefs.news_alerts : false;
    const schemeAlerts = prefs.scheme_alerts !== undefined ? !!prefs.scheme_alerts : false;
    const criticalAlways = prefs.critical_always !== undefined ? !!prefs.critical_always : true;
    const quietHoursEnabled = prefs.quiet_hours_enabled !== undefined ? !!prefs.quiet_hours_enabled : false;
    const quietStartHour = Number.isInteger(prefs.quiet_start_hour) ? prefs.quiet_start_hour : 22;
    const quietEndHour = Number.isInteger(prefs.quiet_end_hour) ? prefs.quiet_end_hour : 6;

    const sql = `
        INSERT INTO notification_preferences (
            farmer_id, weather_alerts, crop_alerts, mandi_alerts, ai_advisory, news_alerts, scheme_alerts,
            critical_always, quiet_hours_enabled, quiet_start_hour, quiet_end_hour, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (farmer_id)
        DO UPDATE SET
            weather_alerts = EXCLUDED.weather_alerts,
            crop_alerts = EXCLUDED.crop_alerts,
            mandi_alerts = EXCLUDED.mandi_alerts,
            ai_advisory = EXCLUDED.ai_advisory,
            news_alerts = EXCLUDED.news_alerts,
            scheme_alerts = EXCLUDED.scheme_alerts,
            critical_always = EXCLUDED.critical_always,
            quiet_hours_enabled = EXCLUDED.quiet_hours_enabled,
            quiet_start_hour = EXCLUDED.quiet_start_hour,
            quiet_end_hour = EXCLUDED.quiet_end_hour,
            updated_at = NOW()
        RETURNING *;
    `;

    const res = await query(sql, [
        farmerId, weatherAlerts, cropAlerts, mandiAlerts, aiAdvisory, newsAlerts, schemeAlerts,
        criticalAlways, quietHoursEnabled, quietStartHour, quietEndHour
    ]);
    return res.rows[0];
}

/**
 * Fetch a farmer's preferred language
 */
async function getFarmerPreferredLanguage(farmerId) {
    if (!farmerId) return 'en';
    try {
        const res = await query(`SELECT preferred_language FROM farmers WHERE id = $1`, [farmerId]);
        if (res.rows.length > 0 && res.rows[0].preferred_language) {
            return res.rows[0].preferred_language;
        }
    } catch (err) {
        console.warn('⚠️ Could not fetch farmer preferred language:', err.message);
    }
    return 'en';
}

/**
 * Update a farmer's preferred language in PostgreSQL
 */
async function updateFarmerPreferredLanguage(farmerId, lang = 'en') {
    if (!farmerId) return false;
    const validLang = ['en', 'kn', 'ta', 'te', 'ml', 'hi'].includes(lang) ? lang : 'en';
    try {
        await query(`UPDATE farmers SET preferred_language = $1, updated_at = NOW() WHERE id = $2`, [validLang, farmerId]);
        return true;
    } catch (err) {
        console.error('Failed to update farmer preferred language:', err.message);
        return false;
    }
}

/**
 * Check if a notification type & priority is allowed by farmer's preferences
 */
function isNotificationAllowed(prefs, type = 'GENERAL', priority = 'MEDIUM') {
    const p = (priority || 'MEDIUM').toUpperCase();
    if (p === 'CRITICAL' && prefs.critical_always !== false) {
        return true; // Critical disaster & safety alerts always bypass filters
    }

    const t = (type || 'GENERAL').toUpperCase();
    switch (t) {
        case 'WEATHER':
            return prefs.weather_alerts !== false;
        case 'CROP':
            return prefs.crop_alerts !== false;
        case 'MANDI':
            return prefs.mandi_alerts !== false;
        case 'AI':
        case 'IRRIGATION':
            return prefs.ai_advisory !== false;
        case 'NEWS':
            return prefs.news_alerts === true;
        case 'SCHEME':
            return prefs.scheme_alerts === true;
        default:
            return true;
    }
}

/**
 * Check if current time falls in farmer's Quiet Hours (computed in IST UTC+5:30)
 */
function isInQuietHours(prefs) {
    if (!prefs || !prefs.quiet_hours_enabled) return false;

    // Convert to Indian Standard Time (IST = UTC + 5h 30m)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const istHour = (utcHours + 5 + Math.floor((utcMinutes + 30) / 60)) % 24;

    const start = prefs.quiet_start_hour !== undefined ? prefs.quiet_start_hour : 22; // 10 PM
    const end = prefs.quiet_end_hour !== undefined ? prefs.quiet_end_hour : 6;      // 6 AM

    if (start > end) {
        // Overnight quiet hours (e.g. 22 to 6)
        return istHour >= start || istHour < end;
    } else {
        return istHour >= start && istHour < end;
    }
}

/**
 * Smart Notification Wrapper:
 * Applies farmer preferences, quiet hours filter, and multi-language template resolution
 * before delegating to the existing, verified sendNotificationToUser() core.
 */
async function sendSmartNotification(farmerId, {
    templateKey = null,
    templateVars = {},
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
    if (!farmerId) return null;

    try {
        // 1. Check Farmer Preferences
        const prefs = await getFarmerNotificationPreferences(farmerId);
        if (!isNotificationAllowed(prefs, type, priority)) {
            console.log(`ℹ️ Suppressed notification (${type}/${priority}) for farmer ${farmerId} based on preferences.`);
            return null;
        }

        // 2. Check Quiet Hours (CRITICAL always bypasses)
        if (priority !== 'CRITICAL' && isInQuietHours(prefs)) {
            console.log(`🌙 Suppressed notification (${type}/${priority}) for farmer ${farmerId} during quiet hours.`);
            return null;
        }

        // 3. Resolve Farmer Language & Template
        let finalTitle = title;
        let finalMessage = message;

        if (templateKey) {
            const lang = await getFarmerPreferredLanguage(farmerId);
            const localized = formatTemplate(templateKey, lang, templateVars);
            finalTitle = localized.title || title;
            finalMessage = localized.body || message;
        }

        // 4. Delegate to EXISTING, UNTOUCHED sendNotificationToUser Core
        return await sendNotificationToUser(farmerId, {
            title: finalTitle,
            message: finalMessage,
            type,
            priority,
            source,
            actionUrl,
            metadata,
            preventSpamHours,
            icon
        });
    } catch (err) {
        console.error('⚠️ Smart notification fallback to direct send:', err.message);
        // Fail-safe fallback to ensure no critical notification is ever lost
        return await sendNotificationToUser(farmerId, {
            title,
            message,
            type,
            priority,
            source,
            actionUrl,
            metadata,
            preventSpamHours,
            icon
        });
    }
}

// -------------------------------------------------------------
// 7. Public Firebase Web Configuration (Safe Placeholders & Env Exposure)
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
    sendSmartNotification,
    getFarmerNotificationPreferences,
    updateFarmerNotificationPreferences,
    getFarmerPreferredLanguage,
    updateFarmerPreferredLanguage,
    isNotificationAllowed,
    isInQuietHours,
    getPublicFirebaseWebConfig,
    getIsFirebaseConfigured: () => isFirebaseConfigured
};

