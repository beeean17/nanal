import { initialData } from './initialData.js';

class DataManager {
    constructor() {
        if (DataManager.instance) {
            return DataManager.instance;
        }
        this.STORAGE_KEY = 'nanal_data';
        this.data = this.loadData();
        DataManager.instance = this;
    }

    loadData() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                console.log('Data loaded from localStorage');
                return { ...initialData, ...parsed }; // Merge ensuring structure
            } catch (e) {
                console.error('Failed to parse localStorage data, using initial data', e);
                return initialData;
            }
        }
        console.log('No data in localStorage, using initial data');
        this.saveData(initialData);
        return initialData;
    }

    saveData(newData) {
        this.data = newData;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    getTasks() {
        return this.data.tasks || [];
    }

    // RRULE parsing simplified for the prototype
    // In a real app, use a library like rrule.js
    getTodayData(dateStr) {
        // dateStr format: YYYY-MM-DD
        const searchDate = new Date(dateStr);
        const searchDateString = dateStr; // Assuming input is YYYY-MM-DD

        const tasks = this.getTasks();
        const todayTasks = tasks.filter(task => {
            // 1. Initial Check: If task has specific date match (Simple check)
            if (task.startAt && task.startAt.startsWith(searchDateString)) {
                return true;
            }
            if (task.endAt && task.endAt.startsWith(searchDateString)) {
                return true;
            }

            // 2. Recurrence Check (Simplified for "FREQ=WEEKLY;BYDAY=MO")
            if (task.isRecurring && task.recurrenceRule) {
                if (this.checkRecurrence(task, searchDate)) {
                    return true;
                }
            }

            // 3. Task without startAt (Floating Task) - show if status is TODO?
            // For now, let's include all TODOs without strict dates or if they match today
            if (task.type === 'TASK' && task.status === 'TODO' && !task.startAt) {
                // For simple tasks without time, maybe we want to see them every day until done
                // Or maybe check if endAt matches today?
                // Spec says: endAt is deadline.
                if (task.endAt && task.endAt.startsWith(searchDateString)) return true;
                // If no date, maybe show it? Let's assume yes for prototype if no date set.
                if (!task.startAt && !task.endAt) return true;
            }

            return false;
        });

        return todayTasks;
    }

    checkRecurrence(task, date) {
        // Very basic mock implementation for "FREQ=WEEKLY;BYDAY=MO"
        // In real web app, import 'rrule' library
        const rule = task.recurrenceRule;
        if (!rule) return false;

        const dayMap = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };
        const dayStr = rule.match(/BYDAY=([A-Z]{2})/);

        if (dayStr && dayStr[1]) {
            const dayNum = dayMap[dayStr[1]];
            if (date.getDay() === dayNum) {
                // Also check if date is after startAt
                const startDate = new Date(task.startAt);
                if (date >= startDate) {
                    return true;
                }
            }
        }
        return false;
    }
}

export const dataManager = new DataManager();
