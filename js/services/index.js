// services/index.js - Service Layer Barrel Export
// Central export point for all services

export { weatherService } from './WeatherService.js';
export { notificationService } from './NotificationService.js';
export { syncService } from './SyncService.js';
export { exportService } from './ExportService.js';

// Default export as object for convenient access
import { weatherService } from './WeatherService.js';
import { notificationService } from './NotificationService.js';
import { syncService } from './SyncService.js';
import { exportService } from './ExportService.js';

export default {
    weather: weatherService,
    notification: notificationService,
    sync: syncService,
    export: exportService
};
