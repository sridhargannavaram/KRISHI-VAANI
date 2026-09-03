const express = require('express');
const router = express.Router();
const { requireFarmerAuth, optionalFarmerAuth } = require('../middleware/farmerAuth');
const notificationService = require('../services/notificationService');

// -------------------------------------------------------------
// 1. GET /api/notifications/firebase-config (Public Web FCM Config)
// -------------------------------------------------------------
router.get('/firebase-config', (req, res) => {
    try {
        const config = notificationService.getPublicFirebaseWebConfig();
        res.json(config);
    } catch (error) {
        console.error('Error fetching Firebase public config:', error);
        res.status(500).json({ error: 'Failed to retrieve Firebase public configuration' });
    }
});

// -------------------------------------------------------------
// 2. POST /api/notifications/register-device (Authenticated FCM Registration)
// -------------------------------------------------------------
router.post('/register-device', requireFarmerAuth, async (req, res) => {
    try {
        const { fcmToken, deviceType, browserInfo } = req.body;

        if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim().length < 10) {
            return res.status(400).json({ error: 'Valid fcmToken is required.' });
        }

        // Authenticated farmer ID derived STRICTLY from verified JWT
        const farmerId = req.farmerId;

        const device = await notificationService.registerDeviceToken(
            farmerId,
            fcmToken,
            deviceType || 'web',
            browserInfo || req.headers['user-agent'] || ''
        );

        res.status(201).json({
            message: 'Device registered successfully for push notifications.',
            device: {
                id: device.id,
                deviceType: device.device_type,
                isActive: device.is_active,
                registeredAt: device.created_at
            }
        });
    } catch (error) {
        console.error('Device Registration Error:', error);
        res.status(500).json({ error: 'Failed to register notification device.' });
    }
});

// -------------------------------------------------------------
// 3. POST /api/notifications/unregister-device (Deactivate Device Token)
// -------------------------------------------------------------
router.post('/unregister-device', requireFarmerAuth, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({ error: 'fcmToken is required.' });
        }

        await notificationService.unregisterDeviceToken(req.farmerId, fcmToken);
        res.json({ message: 'Device unregistered successfully.' });
    } catch (error) {
        console.error('Device Unregister Error:', error);
        res.status(500).json({ error: 'Failed to unregister notification device.' });
    }
});

// -------------------------------------------------------------
// 4. GET /api/notifications/history (In-App Notification History)
// -------------------------------------------------------------
router.get('/history', requireFarmerAuth, async (req, res) => {
    try {
        const { limit = 50, unreadOnly } = req.query;
        const notifications = await notificationService.getNotificationHistory(
            req.farmerId,
            limit,
            unreadOnly === 'true'
        );

        const unreadCount = notifications.filter(n => !n.is_read).length;

        res.json({
            count: notifications.length,
            unreadCount: unreadCount,
            notifications: notifications.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                priority: n.priority,
                source: n.source,
                actionUrl: n.action_url,
                metadata: n.metadata,
                isRead: n.is_read,
                createdAt: n.created_at
            }))
        });
    } catch (error) {
        console.error('Notification History Error:', error);
        res.status(500).json({ error: 'Failed to fetch notification history.' });
    }
});

// -------------------------------------------------------------
// 5. PATCH /api/notifications/:id/read (Mark Single Notification Read)
// -------------------------------------------------------------
router.patch('/:id/read', requireFarmerAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await notificationService.markNotificationAsRead(req.farmerId, id);
        if (!updated) {
            return res.status(404).json({ error: 'Notification not found or access denied.' });
        }
        res.json({ message: 'Notification marked as read.', id });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ error: 'Failed to update notification.' });
    }
});

// -------------------------------------------------------------
// 6. PATCH /api/notifications/read-all (Mark All Notifications Read)
// -------------------------------------------------------------
router.patch('/read-all', requireFarmerAuth, async (req, res) => {
    try {
        const count = await notificationService.markAllNotificationsAsRead(req.farmerId);
        res.json({ message: 'All notifications marked as read.', updatedCount: count });
    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ error: 'Failed to update notifications.' });
    }
});

// -------------------------------------------------------------
// 7. POST /api/notifications/test-alert (Send a Test Notification to Self)
// -------------------------------------------------------------
router.post('/test-alert', requireFarmerAuth, async (req, res) => {
    try {
        const { title = '🌱 Krishi Vaani Test Notification', message = 'Push notifications are successfully configured on your device!', priority = 'LOW' } = req.body;

        const result = await notificationService.sendNotificationToUser(req.farmerId, {
            title,
            message,
            type: 'GENERAL',
            priority: priority || 'LOW',
            source: 'USER_TEST',
            actionUrl: '/dashboard.html',
            preventSpamHours: 0
        });

        res.json({
            message: 'Test notification processed.',
            result: result
        });
    } catch (error) {
        console.error('Test Alert Error:', error);
        res.status(500).json({ error: 'Failed to send test alert.' });
    }
});

// -------------------------------------------------------------
// 8. GET /api/notifications/preferences (Get Farmer Notification Settings)
// -------------------------------------------------------------
router.get('/preferences', requireFarmerAuth, async (req, res) => {
    try {
        const prefs = await notificationService.getFarmerNotificationPreferences(req.farmerId);
        const lang = await notificationService.getFarmerPreferredLanguage(req.farmerId);
        res.json({ preferences: prefs, preferredLanguage: lang });
    } catch (error) {
        console.error('Fetch Preferences Error:', error);
        res.status(500).json({ error: 'Failed to fetch notification preferences.' });
    }
});

// -------------------------------------------------------------
// 9. PUT /api/notifications/preferences (Update Farmer Notification Settings)
// -------------------------------------------------------------
router.put('/preferences', requireFarmerAuth, async (req, res) => {
    try {
        const updated = await notificationService.updateFarmerNotificationPreferences(req.farmerId, req.body);
        if (req.body.preferred_language) {
            await notificationService.updateFarmerPreferredLanguage(req.farmerId, req.body.preferred_language);
        }
        res.json({
            message: 'Notification preferences updated successfully.',
            preferences: updated
        });
    } catch (error) {
        console.error('Update Preferences Error:', error);
        res.status(500).json({ error: 'Failed to update notification preferences.' });
    }
});

// -------------------------------------------------------------
// 10. PATCH /api/notifications/language (Sync Language Preference)
// -------------------------------------------------------------
router.patch('/language', requireFarmerAuth, async (req, res) => {
    try {
        const { language = 'en' } = req.body;
        await notificationService.updateFarmerPreferredLanguage(req.farmerId, language);
        res.json({ message: 'Preferred language synced successfully.', language });
    } catch (error) {
        console.error('Language Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync preferred language.' });
    }
});

module.exports = router;

