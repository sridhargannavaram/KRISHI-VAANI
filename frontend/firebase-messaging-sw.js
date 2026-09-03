// =============================================================
// KRISHI VAANI — Firebase Cloud Messaging Service Worker (Background Push)
// =============================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Fetch public Firebase config dynamically or fallback
let firebaseInitialized = false;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Initialize messaging with default or dynamic config
async function initFirebaseMessaging() {
    if (firebaseInitialized) return;
    try {
        const response = await fetch('/api/notifications/firebase-config');
        if (response.ok) {
            const config = await response.json();
            if (config.apiKey && config.apiKey !== 'PLACEHOLDER_FIREBASE_API_KEY') {
                firebase.initializeApp(config);
                const messaging = firebase.messaging();

                // Background message handler
                messaging.onBackgroundMessage((payload) => {
                    const title = payload.notification?.title || payload.data?.title || '🌾 Krishi Vaani Alert';
                    const body = payload.notification?.body || payload.data?.body || payload.data?.message || 'New agricultural advisory update available.';
                    const actionUrl = payload.data?.actionUrl || payload.fcmOptions?.link || '/dashboard.html';
                    const priority = payload.data?.priority || 'MEDIUM';

                    const options = {
                        body: body,
                        icon: '/assets/images/logo.png',
                        badge: '/assets/images/logo.png',
                        tag: payload.data?.notificationId || 'krishi-vaani-alert',
                        data: {
                            actionUrl: actionUrl,
                            notificationId: payload.data?.notificationId
                        },
                        requireInteraction: priority === 'CRITICAL' || priority === 'HIGH',
                        vibrate: [200, 100, 200]
                    };

                    return self.registration.showNotification(title, options);
                });

                firebaseInitialized = true;
            }
        }
    } catch (e) {
        // Fallback standard push handler handles it
    }
}

// Ensure dynamic config initialization is attempted
initFirebaseMessaging();

// Standard Fallback Web Push Listener
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const notification = data.notification || {};
        const customData = data.data || {};

        const title = notification.title || customData.title || '🌾 Krishi Vaani Alert';
        const body = notification.body || customData.body || customData.message || 'New agricultural alert received.';
        const actionUrl = customData.actionUrl || data.fcmOptions?.link || '/dashboard.html';
        const priority = customData.priority || 'MEDIUM';

        const options = {
            body: body,
            icon: '/assets/images/logo.png',
            badge: '/assets/images/logo.png',
            tag: customData.notificationId || 'krishi-push-' + Date.now(),
            data: {
                actionUrl: actionUrl,
                notificationId: customData.notificationId
            },
            requireInteraction: priority === 'CRITICAL' || priority === 'HIGH',
            vibrate: [200, 100, 200]
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        const text = event.data.text();
        event.waitUntil(
            self.registration.showNotification('🌾 Krishi Vaani Alert', {
                body: text,
                icon: '/assets/images/logo.png',
                data: { actionUrl: '/dashboard.html' }
            })
        );
    }
});

// Notification Click Handler: Navigate to relevant section / URL
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.actionUrl || '/dashboard.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If already open, focus it and navigate
            for (let client of windowClients) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
