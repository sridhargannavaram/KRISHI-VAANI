// =============================================================
// KRISHI VAANI — Firebase Cloud Messaging Service Worker (Background Push)
// =============================================================

// Synchronously import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Parse public config parameters from registration query string if present, or fallback to project credentials
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
    apiKey: urlParams.get('apiKey') || 'AIzaSyCt1uGhRzJVYrm8_byf3-wU6z233LFwmy0',
    authDomain: urlParams.get('authDomain') || 'krishi-vaani-554f2.firebaseapp.com',
    projectId: urlParams.get('projectId') || 'krishi-vaani-554f2',
    storageBucket: urlParams.get('storageBucket') || 'krishi-vaani-554f2.firebasestorage.app',
    messagingSenderId: urlParams.get('messagingSenderId') || '592911715235',
    appId: urlParams.get('appId') || '1:592911715235:web:3c0e3d282ed83591f22816'
};

// Synchronously initialize Firebase during top-level script evaluation
// (Service workers require synchronous initialization so push listeners are bound before push events arrive)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

// Immediate activation
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Background message handler (triggered when app / tab / PWA is closed or in background)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background FCM message received:', payload);

    // If message is data-only (no top-level notification object), manually display the notification
    if (!payload.notification) {
        const title = payload.data?.title || '🌾 Krishi Vaani Alert';
        const body = payload.data?.body || payload.data?.message || 'New agricultural advisory update available.';
        const actionUrl = payload.data?.actionUrl || '/dashboard.html';
        const priority = payload.data?.priority || 'MEDIUM';

        const options = {
            body: body,
            icon: '/assets/images/icon-192.png',
            badge: '/assets/images/icon-192.png',
            tag: payload.data?.notificationId || 'krishi-vaani-' + Date.now(),
            data: {
                actionUrl: actionUrl,
                notificationId: payload.data?.notificationId
            },
            requireInteraction: priority === 'CRITICAL' || priority === 'HIGH',
            vibrate: [200, 100, 200]
        };

        return self.registration.showNotification(title, options);
    }
});

// Fallback native push listener for non-FCM raw web push dispatches
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const rawText = event.data.text();
        let data = {};
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            data = { body: rawText };
        }

        // Avoid double notification if Firebase SDK already handled it
        if (data.from && (data['google.c.a.c_id'] || data['google.c.sender.id'] || data.notification)) {
            return;
        }

        const notification = data.notification || {};
        const customData = data.data || data;

        const title = notification.title || customData.title || '🌾 Krishi Vaani Alert';
        const body = notification.body || customData.body || customData.message || 'New agricultural alert received.';
        const actionUrl = customData.actionUrl || data.fcmOptions?.link || '/dashboard.html';
        const priority = customData.priority || 'MEDIUM';

        const options = {
            body: body,
            icon: '/assets/images/icon-192.png',
            badge: '/assets/images/icon-192.png',
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
        console.error('[SW] Fallback push error:', err);
    }
});

// Notification Click Handler: Navigate to relevant section / URL
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data || {};
    const targetUrl = notificationData.actionUrl || 
                      notificationData.click_action || 
                      event.notification.click_action || 
                      '/dashboard.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If already open, focus it and navigate
            for (let client of windowClients) {
                if ('focus' in client) {
                    if (client.url && client.url.includes(self.location.origin)) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
            }
            // Otherwise open a new window (covers closed app, closed browser tab, closed PWA)
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
