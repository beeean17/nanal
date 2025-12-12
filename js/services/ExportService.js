// services/ExportService.js - Data Export/Import Service
// Handles data export (JSON, CSV) and import operations

import { dataManager } from '../state.js';

/**
 * ExportService - Handles data export and import operations
 * 
 * Features:
 * - Export all data as JSON file
 * - Export individual collections as CSV
 * - Import data from JSON file
 * - Download file utility
 */
class ExportServiceClass {
    constructor() {
        console.log('[ExportService] Initialized');
    }

    /**
     * Export all data as JSON file download
     * @param {string} filename - Optional custom filename
     */
    exportToJSON(filename = null) {
        try {
            const data = dataManager.exportData();
            const json = JSON.stringify(data, null, 2);

            const defaultFilename = `nanal-backup-${this.formatDate(new Date())}.json`;
            const finalFilename = filename || defaultFilename;

            this.downloadFile(json, finalFilename, 'application/json');

            console.log(`[ExportService] Exported JSON: ${finalFilename}`);
            return { success: true, filename: finalFilename };
        } catch (error) {
            console.error('[ExportService] JSON export failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Export a collection as CSV file
     * @param {string} collection - Collection name (tasks, goals, habits, ideas)
     * @param {string} filename - Optional custom filename
     */
    exportToCSV(collection, filename = null) {
        try {
            const data = dataManager.exportData();
            const items = data[collection];

            if (!items || !Array.isArray(items)) {
                throw new Error(`Invalid collection: ${collection}`);
            }

            if (items.length === 0) {
                throw new Error(`No data in collection: ${collection}`);
            }

            const csv = this.arrayToCSV(items);
            const defaultFilename = `nanal-${collection}-${this.formatDate(new Date())}.csv`;
            const finalFilename = filename || defaultFilename;

            this.downloadFile(csv, finalFilename, 'text/csv');

            console.log(`[ExportService] Exported CSV: ${finalFilename}`);
            return { success: true, filename: finalFilename };
        } catch (error) {
            console.error('[ExportService] CSV export failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Import data from JSON file
     * @param {File} file - File object to import
     * @returns {Promise<Object>} Import result
     */
    async importFromJSON(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const json = e.target.result;
                    const data = JSON.parse(json);

                    // Validate basic structure
                    if (!data.version || !data.settings) {
                        throw new Error('Invalid data format: missing version or settings');
                    }

                    const imported = dataManager.importData(data);

                    if (imported) {
                        console.log(`[ExportService] Imported data from ${file.name}`);
                        resolve({ success: true, filename: file.name });
                    } else {
                        throw new Error('Import failed');
                    }
                } catch (error) {
                    console.error('[ExportService] Import failed:', error);
                    resolve({ success: false, error: error.message });
                }
            };

            reader.onerror = () => {
                resolve({ success: false, error: 'Failed to read file' });
            };

            reader.readAsText(file);
        });
    }

    /**
     * Open file picker and import JSON
     * @returns {Promise<Object>} Import result
     */
    async importFromFilePicker() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve({ success: false, error: 'No file selected' });
                    return;
                }

                const result = await this.importFromJSON(file);
                resolve(result);
            };

            input.click();
        });
    }

    /**
     * Convert array to CSV string
     * @param {Array} items - Array of objects
     * @returns {string} CSV string
     */
    arrayToCSV(items) {
        if (items.length === 0) return '';

        // Get all unique keys from all items
        const keys = [...new Set(items.flatMap(item => Object.keys(item)))];

        // Create header row
        const header = keys.map(key => this.escapeCSV(key)).join(',');

        // Create data rows
        const rows = items.map(item => {
            return keys.map(key => {
                const value = item[key];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return this.escapeCSV(JSON.stringify(value));
                return this.escapeCSV(String(value));
            }).join(',');
        });

        return [header, ...rows].join('\n');
    }

    /**
     * Escape value for CSV
     * @param {string} value - Value to escape
     * @returns {string} Escaped value
     */
    escapeCSV(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    /**
     * Download file utility
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * Format date for filename
     * @param {Date} date - Date object
     * @returns {string} YYYY-MM-DD format
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Get export summary
     * @returns {Object} Summary of exportable data
     */
    getExportSummary() {
        const data = dataManager.exportData();
        return {
            tasks: data.tasks?.length || 0,
            goals: data.goals?.length || 0,
            subGoals: data.subGoals?.length || 0,
            habits: data.habits?.length || 0,
            ideas: data.ideas?.length || 0,
            categories: data.categories?.length || 0,
            focusSessions: data.focusSessions?.length || 0,
            lastUpdated: data.lastUpdated
        };
    }
}

// Singleton instance
export const exportService = new ExportServiceClass();
export default exportService;
