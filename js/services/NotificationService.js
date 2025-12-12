// services/NotificationService.js - Browser Notification Service
// Centralized browser notification handling

/**
 * NotificationService - Handles browser notifications
 * 
 * Features:
 * - Request notification permission
 * - Show notifications with customizable options
 * - Queue notifications when permission pending
 */
class NotificationServiceClass {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.defaultIcon = '/assets/icons/app-icon-192.png';
        this.defaultOptions = {
            icon: this.defaultIcon,
            badge: this.defaultIcon,
            vibrate: [200, 100, 200]
        };

        // Queue for notifications when permission is pending
        this.pendingNotifications = [];

        console.log(`[NotificationService] Initialized, supported: ${this.isSupported}`);
    }

    /**
     * Check if notifications are supported
     * @returns {boolean} True if supported
     */
    get supported() {
        return this.isSupported;
    }

    /**
     * Check if permission is granted
     * @returns {boolean} True if granted
     */
    hasPermission() {
        if (!this.isSupported) return false;
        return Notification.permission === 'granted';
    }

    /**
     * Get current permission status
     * @returns {string} 'granted', 'denied', or 'default'
     */
    getPermissionStatus() {
        if (!this.isSupported) return 'unsupported';
        return Notification.permission;
    }

    /**
     * Request notification permission
     * @returns {Promise<boolean>} True if granted
     */
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('[NotificationService] Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            console.log('[NotificationService] Permission already granted');
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('[NotificationService] Permission was denied');
            return false;
        }

        try {
            console.log('[NotificationService] Requesting permission...');
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';

            console.log(`[NotificationService] Permission ${granted ? 'granted' : 'denied'}`);

            // Send any pending notifications if granted
            if (granted) {
                this.flushPendingNotifications();
            }

            return granted;
        } catch (error) {
            console.error('[NotificationService] Permission request failed:', error);
            return false;
        }
    }

    /**
     * Show a notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body text
     * @param {Object} options - Additional options
     * @returns {Notification|null} The notification instance or null
     */
    show(title, body, options = {}) {
        if (!this.isSupported) {
            console.warn('[NotificationService] Notifications not supported');
            return null;
        }

        // If permission not granted, queue and request
        if (Notification.permission !== 'granted') {
            if (Notification.permission === 'default') {
                console.log('[NotificationService] Queueing notification, requesting permission');
                this.pendingNotifications.push({ title, body, options });
                this.requestPermission();
            }
            return null;
        }

        try {
            const notification = new Notification(title, {
                body,
                ...this.defaultOptions,
                ...options
            });

            // Handle click
            if (options.onClick) {
                notification.onclick = options.onClick;
            } else {
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            }

            // Auto-close after duration
            if (options.duration) {
                setTimeout(() => notification.close(), options.duration);
            }

            console.log(`[NotificationService] Shown: "${title}"`);
            return notification;
        } catch (error) {
            console.error('[NotificationService] Show failed:', error);
            return null;
        }
    }

    /**
     * Show timer completion notification
     * @param {string} mode - 'work' or 'break'
     * @param {number} sessions - Session count
     */
    showTimerComplete(mode, sessions = 0) {
        if (mode === 'work') {
            this.show('작업 완료! 🎉', `${sessions}번째 세션을 완료했습니다. 휴식하세요!`, {
                tag: 'timer-complete',
                requireInteraction: false
            });
        } else {
            this.show('휴식 완료! 💪', '다시 집중할 시간입니다!', {
                tag: 'timer-complete',
                requireInteraction: false
            });
        }
    }

    /**
     * Show reminder notification
     * @param {string} title - Task/event title
     * @param {string} time - Time string
     */
    showReminder(title, time) {
        this.show('알림 ⏰', `${title} - ${time}`, {
            tag: 'reminder',
            requireInteraction: true
        });
    }

    /**
     * Flush pending notifications queue
     */
    flushPendingNotifications() {
        console.log(`[NotificationService] Flushing ${this.pendingNotifications.length} pending notifications`);

        while (this.pendingNotifications.length > 0) {
            const { title, body, options } = this.pendingNotifications.shift();
            this.show(title, body, options);
        }
    }
}

// Singleton instance
export const notificationService = new NotificationServiceClass();
export default notificationService;
