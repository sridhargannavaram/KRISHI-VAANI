// =============================================================
// KRISHI VAANI — Client-Side Firebase Cloud Messaging (FCM) Manager
// =============================================================

class KrishiNotificationClient {
    constructor() {
        this.messaging = null;
        this.firebaseApp = null;
        this.config = null;
        this.swRegistration = null;
        this.isInitialized = false;
        this.currentFCMToken = null;
    }

    /**
     * Initialize FCM Client non-blockingly
     */
    async init() {
        if (this.isInitialized) return;
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.log('ℹ️ Push notifications are not supported in this browser.');
            return;
        }

        try {
            // 1. Fetch public Firebase configuration from backend
            const res = await fetch('/api/notifications/firebase-config');
            if (!res.ok) return;
            this.config = await res.json();

            // 2. Register Service Worker
            this.swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            // 3. Load Firebase SDK dynamically if not already present on window
            if (!window.firebase) {
                await this.loadFirebaseScripts();
            }

            // 4. Initialize Firebase App if valid config exists
            if (window.firebase && this.config.apiKey && this.config.apiKey !== 'PLACEHOLDER_FIREBASE_API_KEY') {
                if (!firebase.apps.length) {
                    this.firebaseApp = firebase.initializeApp(this.config);
                } else {
                    this.firebaseApp = firebase.app();
                }

                this.messaging = firebase.messaging();

                // 5. Setup Foreground Message Listener
                this.messaging.onMessage((payload) => {
                    this.handleForegroundMessage(payload);
                });

                // 6. If permission was previously granted and user is logged in, sync token silently
                if (Notification.permission === 'granted' && localStorage.getItem('token')) {
                    this.syncTokenSilently();
                }
            }

            this.isInitialized = true;
            this.updateUIBellState();
        } catch (error) {
            console.warn('ℹ️ FCM Client Init Notice:', error.message);
        }
    }

    /**
     * Dynamically load Firebase SDK scripts asynchronously
     */
    loadFirebaseScripts() {
        return new Promise((resolve) => {
            const script1 = document.createElement('script');
            script1.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
            script1.async = true;
            script1.onload = () => {
                const script2 = document.createElement('script');
                script2.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js';
                script2.async = true;
                script2.onload = () => resolve();
                document.head.appendChild(script2);
            };
            document.head.appendChild(script1);
        });
    }

    /**
     * Request Notification Permission from User (Respectful, User-Initiated)
     */
    async requestPermissionAndRegister() {
        if (!('Notification' in window)) {
            if (typeof showNotification === 'function') {
                showNotification('Push notifications are not supported in this browser.', 'warning');
            }
            return { success: false, reason: 'unsupported' };
        }

        const currentPermission = Notification.permission;
        if (currentPermission === 'denied') {
            if (typeof showNotification === 'function') {
                showNotification('Notification permission is blocked. Please enable notifications in your browser site settings.', 'warning');
            }
            this.updateUIBellState();
            return { success: false, reason: 'denied' };
        }

        try {
            const permission = await Notification.requestPermission();
            this.updateUIBellState();

            if (permission === 'granted') {
                const tokenResult = await this.obtainAndRegisterToken();
                if (tokenResult.success) {
                    if (typeof showNotification === 'function') {
                        showNotification('✅ Push alerts enabled! You will receive live weather & crop alerts.', 'success');
                    }
                }
                return tokenResult;
            } else {
                if (typeof showNotification === 'function') {
                    showNotification('Push notifications permission was not granted.', 'info');
                }
                return { success: false, reason: permission };
            }
        } catch (error) {
            console.error('Permission Request Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtain FCM Token and Register to Backend
     */
    async obtainAndRegisterToken() {
        if (!this.messaging || !this.config?.vapidKey || this.config.vapidKey === 'PLACEHOLDER_PUBLIC_VAPID_KEY') {
            return { success: false, reason: 'Firebase credentials placeholder mode' };
        }

        const authToken = localStorage.getItem('token');
        if (!authToken) {
            return { success: false, reason: 'unauthenticated' };
        }

        try {
            const token = await this.messaging.getToken({
                vapidKey: this.config.vapidKey,
                serviceWorkerRegistration: this.swRegistration
            });

            if (!token) {
                return { success: false, reason: 'No token returned by FCM' };
            }

            this.currentFCMToken = token;

            // Send to Backend
            const response = await fetch('/api/notifications/register-device', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    fcmToken: token,
                    deviceType: 'web',
                    browserInfo: navigator.userAgent
                })
            });

            if (response.ok) {
                sessionStorage.setItem('krishi_fcm_registered', 'true');
                return { success: true, token: token };
            } else {
                return { success: false, reason: 'Backend registration failed' };
            }
        } catch (error) {
            console.warn('FCM Token Generation Notice:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Silently sync token on revisit if not synced this session
     */
    async syncTokenSilently() {
        if (sessionStorage.getItem('krishi_fcm_registered')) return;
        await this.obtainAndRegisterToken();
    }

    /**
     * Handle Foreground Messages when User is actively viewing KRISHI VAANI
     */
    handleForegroundMessage(payload) {
        const title = payload.notification?.title || payload.data?.title || '🌾 Krishi Vaani Alert';
        const body = payload.notification?.body || payload.data?.body || payload.data?.message || 'New advisory update.';
        const priority = payload.data?.priority || 'MEDIUM';
        const actionUrl = payload.data?.actionUrl || '/dashboard.html';

        // 1. Show In-App Toast
        if (typeof showNotification === 'function') {
            const toastType = (priority === 'CRITICAL' || priority === 'HIGH') ? 'error' : 'info';
            showNotification(`🔔 ${title}: ${body}`, toastType);
        }

        // 2. Play subtle alert chime if critical
        if (priority === 'CRITICAL') {
            try {
                const audio = new Audio('/assets/audio/alert.mp3');
                audio.play().catch(() => {});
            } catch(e) {}
        }

        // 3. Refresh Notification Center Badge
        this.fetchUnreadCount();
    }

    /**
     * Update Notification Bell Icon in Dashboard UI
     */
    updateUIBellState() {
        const bellIcon = document.getElementById('notificationBellBtn');
        if (!bellIcon) return;

        if (!('Notification' in window)) {
            bellIcon.style.opacity = '0.5';
            bellIcon.title = 'Push notifications not supported in this browser';
            return;
        }

        if (Notification.permission === 'granted') {
            bellIcon.classList.add('notifications-enabled');
            bellIcon.title = 'Push alerts active (Click to view alert history)';
        } else if (Notification.permission === 'denied') {
            bellIcon.classList.add('notifications-blocked');
            bellIcon.title = 'Notifications blocked in browser settings';
        } else {
            bellIcon.classList.remove('notifications-enabled', 'notifications-blocked');
            bellIcon.title = 'Click to enable live weather & crop alerts';
        }

        this.fetchUnreadCount();
    }

    /**
     * Fetch Unread Notification Count & Update Badge
     */
    async fetchUnreadCount() {
        const authToken = localStorage.getItem('token');
        if (!authToken) return;

        try {
            const res = await fetch('/api/notifications/history?limit=10', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!res.ok) return;
            const data = await res.json();

            document.querySelectorAll('#notificationBadge, #mobileDrawerNotificationBadge, .notification-counter-badge').forEach(badge => {
                if (data.unreadCount > 0) {
                    badge.textContent = data.unreadCount > 9 ? '9+' : data.unreadCount;
                    badge.style.display = 'inline-flex';
                } else {
                    badge.style.display = 'none';
                }
            });
        } catch (e) {}
    }

    /**
     * Open In-App Notification Center Modal / Drawer
     */
    async openNotificationCenter() {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            if (typeof showNotification === 'function') {
                showNotification('Please sign in to view your notification history.', 'warning');
            }
            return;
        }

        // If permission is default, suggest enabling push
        if (Notification.permission === 'default') {
            this.requestPermissionAndRegister();
        }

        const modal = document.getElementById('notificationCenterModal');
        if (!modal) return;

        const listContainer = document.getElementById('notificationHistoryList');
        if (listContainer) {
            listContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading alert history...</div>';
        }

        modal.style.display = 'flex';

        try {
            const res = await fetch('/api/notifications/history?limit=30', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();

            if (!listContainer) return;

            if (!data.notifications || data.notifications.length === 0) {
                listContainer.innerHTML = `
                    <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-secondary);">
                        <i class="fas fa-bell-slash" style="font-size: 2rem; opacity: 0.5; margin-bottom: 0.5rem;"></i>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">No notifications yet.</p>
                        <p style="font-size: 0.75rem; color: var(--text-secondary);">Important weather, crop, and mandi alerts will appear here.</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = data.notifications.map(n => {
                const priorityClass = n.priority === 'CRITICAL' ? 'priority-critical' : (n.priority === 'HIGH' ? 'priority-high' : 'priority-medium');
                const timeAgo = new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const icon = n.type === 'WEATHER' ? 'fa-cloud-bolt' : (n.type === 'CROP' ? 'fa-seedling' : (n.type === 'MANDI' ? 'fa-store' : 'fa-bell'));

                return `
                    <div class="notification-item ${n.isRead ? 'read' : 'unread'} ${priorityClass}" onclick="krishiFCM.handleNotificationItemClick('${n.id}', '${n.actionUrl}')">
                        <div class="notification-item-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="notification-item-content">
                            <div class="notification-item-header">
                                <span class="notification-item-title">${escapeHtml(n.title)}</span>
                                <span class="notification-item-time">${escapeHtml(timeAgo)}</span>
                            </div>
                            <div class="notification-item-msg">${escapeHtml(n.message)}</div>
                            <div class="notification-item-footer">
                                <span class="notification-pill pill-${n.priority?.toLowerCase()}">${escapeHtml(n.priority)}</span>
                                <span class="notification-pill pill-type">${escapeHtml(n.type)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Mark all read
            fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).then(() => this.fetchUnreadCount());

        } catch (err) {
            if (listContainer) {
                listContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary);">Could not load notifications.</div>';
            }
        }
    }

    async handleNotificationItemClick(id, actionUrl) {
        const authToken = localStorage.getItem('token');
        if (authToken && id) {
            fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).catch(() => {});
        }
        if (actionUrl && actionUrl !== '#') {
            window.location.href = actionUrl;
        }
    }
}

// Global Singleton
const krishiFCM = new KrishiNotificationClient();

// Auto-init on page load without blocking rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => krishiFCM.init(), 600));
} else {
    setTimeout(() => krishiFCM.init(), 600);
}
