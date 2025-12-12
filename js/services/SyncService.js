// services/SyncService.js - Firebase Sync Service
// Centralized cloud backup and restore operations

import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';
import { dataManager } from '../state.js';

/**
 * SyncService - Handles Firebase cloud sync operations
 * 
 * Features:
 * - Backup all data to Firebase
 * - Restore data from Firebase
 * - Track backup timestamps
 * - Auto-sync support (optional)
 */
class SyncServiceClass {
    constructor() {
        this.isSyncing = false;
        this.lastSyncTime = null;
        this.autoSyncInterval = null;
        this.autoSyncEnabled = false;

        console.log('[SyncService] Initialized');
    }

    /**
     * Get current user
     * @returns {Object|null} Current Firebase user
     */
    getCurrentUser() {
        try {
            return FirebaseAuth.getCurrentUser();
        } catch (error) {
            console.error('[SyncService] Auth not available:', error);
            return null;
        }
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
        return !!this.getCurrentUser();
    }

    /**
     * Backup all data to Firebase
     * @returns {Promise<Object>} Result with success status
     */
    async backup() {
        const user = this.getCurrentUser();
        if (!user) {
            console.warn('[SyncService] Cannot backup: not logged in');
            return { success: false, error: 'Not logged in' };
        }

        if (this.isSyncing) {
            console.warn('[SyncService] Backup already in progress');
            return { success: false, error: 'Sync in progress' };
        }

        console.log('[SyncService] Starting backup...');
        this.isSyncing = true;

        try {
            const data = dataManager.exportData();
            const backupData = {
                ...data,
                backupTimestamp: new Date().toISOString(),
                deviceInfo: navigator.userAgent
            };

            const result = await FirebaseDB.set('users', user.uid, backupData);

            if (result) {
                this.lastSyncTime = new Date().toISOString();

                // Update settings with backup time
                dataManager.updateSettings({
                    lastBackup: this.lastSyncTime
                });

                console.log('[SyncService] Backup completed successfully');
                return {
                    success: true,
                    timestamp: this.lastSyncTime
                };
            } else {
                throw new Error('Firebase save failed');
            }
        } catch (error) {
            console.error('[SyncService] Backup failed:', error);
            return { success: false, error: error.message };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Restore data from Firebase
     * @returns {Promise<Object>} Result with success status
     */
    async restore() {
        const user = this.getCurrentUser();
        if (!user) {
            console.warn('[SyncService] Cannot restore: not logged in');
            return { success: false, error: 'Not logged in' };
        }

        if (this.isSyncing) {
            console.warn('[SyncService] Sync already in progress');
            return { success: false, error: 'Sync in progress' };
        }

        console.log('[SyncService] Starting restore...');
        this.isSyncing = true;

        try {
            const cloudData = await FirebaseDB.get('users', user.uid);

            if (!cloudData) {
                console.log('[SyncService] No cloud data found');
                return { success: false, error: 'No backup found' };
            }

            // Remove backup-specific fields before importing
            const { backupTimestamp, deviceInfo, id, ...importData } = cloudData;

            const imported = dataManager.importData(importData);

            if (imported) {
                this.lastSyncTime = new Date().toISOString();
                console.log(`[SyncService] Restore completed from ${backupTimestamp}`);
                return {
                    success: true,
                    timestamp: backupTimestamp,
                    restoredAt: this.lastSyncTime
                };
            } else {
                throw new Error('Import failed');
            }
        } catch (error) {
            console.error('[SyncService] Restore failed:', error);
            return { success: false, error: error.message };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Get last backup timestamp from cloud
     * @returns {Promise<string|null>} Timestamp or null
     */
    async getLastBackupTime() {
        const user = this.getCurrentUser();
        if (!user) return null;

        try {
            const cloudData = await FirebaseDB.get('users', user.uid);
            return cloudData?.backupTimestamp || null;
        } catch (error) {
            console.error('[SyncService] Failed to get backup time:', error);
            return null;
        }
    }

    /**
     * Enable auto-sync at interval
     * @param {number} intervalMs - Sync interval in milliseconds
     */
    enableAutoSync(intervalMs = 5 * 60 * 1000) {
        if (this.autoSyncInterval) {
            this.disableAutoSync();
        }

        console.log(`[SyncService] Auto-sync enabled (every ${intervalMs / 1000}s)`);
        this.autoSyncEnabled = true;
        this.autoSyncInterval = setInterval(() => {
            if (this.isLoggedIn()) {
                this.backup();
            }
        }, intervalMs);
    }

    /**
     * Disable auto-sync
     */
    disableAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }
        this.autoSyncEnabled = false;
        console.log('[SyncService] Auto-sync disabled');
    }

    /**
     * Get sync status
     * @returns {Object} Sync status
     */
    getStatus() {
        return {
            isLoggedIn: this.isLoggedIn(),
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            autoSyncEnabled: this.autoSyncEnabled
        };
    }
}

// Singleton instance
export const syncService = new SyncServiceClass();
export default syncService;
