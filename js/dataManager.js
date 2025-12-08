export default class DataManager {
    static instance = null;

    constructor() {
        if (DataManager.instance) return DataManager.instance;
        this.data = this._getInitialData();
        DataManager.instance = this;
    }

    static getInstance() {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    /**
     * Load data from LocalStorage
     */
    loadData() {
        const stored = localStorage.getItem('nanal_data');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                // Ensure structure
                if (!this.data.tasks) this.data.tasks = [];
                if (!this.data.timetable) this.data.timetable = [];
                console.log('✅ Data loaded from LocalStorage');
            } catch (e) {
                console.error('Failed to parse data, resetting:', e);
                this.data = this._getInitialData();
                this.saveData();
            }
        } else {
            console.log('✨ No existing data, initializing with defaults');
            this.data = this._getInitialData();
            this.saveData();
        }
    }

    /**
     * Save current state to LocalStorage
     */
    saveData() {
        localStorage.setItem('nanal_data', JSON.stringify(this.data));
    }

    /**
     * Generate Dummy Data
     */
    _getInitialData() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return {
            tasks: [
                { id: 't1', title: 'Morning Jog 🏃', category: 'Health', date: today, startTime: '07:00', endTime: '07:30', completed: true },
                { id: 't2', title: 'Read Book', category: 'Growth', date: today, startTime: '08:00', endTime: '08:40', completed: false },
                { id: 't3', title: 'Grocery Shopping', category: 'Life', date: today, startTime: null, endTime: null, completed: false } // Todo only
            ],
            timetable: [
                { id: 'c1', day: new Date().getDay(), title: 'Deep Work Session', startTime: '10:00', endTime: '12:00', color: '#0071e3' }
            ],
            goals: [
                { id: 'g1', title: 'Run 10km', progress: 50, target: 100 }
            ],
            ideas: [
                { id: 'i1', title: 'App Feature Idea', content: 'Add AI summary...' }
            ],
            settings: {
                theme: 'auto'
            }
        };
    }

    // CRUD - Tasks
    addTask(task) {
        this.data.tasks.push(task);
        this.saveData();
    }

    updateTask(id, updates) {
        const idx = this.data.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
            this.saveData();
        }
    }

    deleteTask(id) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== id);
        this.saveData();
    }

    // Backup & Restore
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nanal_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    importData(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                // Basic validation could go here
                this.data = json;
                this.saveData();
                alert("✅ Data restored successfully! Reloading...");
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("❌ Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    }

    /**
     * Core Logic: Get merged view for a specific date (08:00 - Next 07:59)
     * Combines Timetable (Weekly) and Tasks (Specific Date)
     */
    getTodayViewData(dateStr) {
        const targetDate = new Date(dateStr);
        const dayOfWeek = targetDate.getDay(); // 0-6

        // 1. Get Recurring Timetable for this day
        const schedules = this.data.timetable
            .filter(item => item.day === dayOfWeek)
            .map(item => ({ ...item, type: 'schedule', isFixed: true }));

        // 2. Get Tasks for this date
        const dailyTasks = this.data.tasks
            .filter(task => task.date === dateStr)
            .map(task => ({ ...task, type: 'task', isFixed: false }));

        // 3. Merge
        const allItems = [...schedules, ...dailyTasks];

        // 4. Seperate into Time-based (Timeline) and Todo-based (Checklist)
        const timelineItems = allItems.filter(item => item.startTime !== null && item.startTime !== undefined);
        const todoItems = allItems.filter(item => item.startTime === null || item.startTime === undefined);

        // 5. Sort timeline by start time
        timelineItems.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return {
            date: dateStr,
            timeline: timelineItems,
            todos: todoItems
        };
    }
}
