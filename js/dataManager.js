export default class DataManager {
    static instance = null;

    constructor() {
        if (DataManager.instance) return DataManager.instance;
        this.data = {
            tasks: [],
            goals: [],
            ideas: [],
            settings: {}
        };
        DataManager.instance = this;
    }

    static getInstance() {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    loadData() {
        const stored = localStorage.getItem('nanal_data');
        if (stored) {
            this.data = JSON.parse(stored);
            console.log('Data loaded from LocalStorage');
        } else {
            console.log('No data found, using defaults');
            // TODO: Load dummy data
        }
    }

    saveData() {
        localStorage.setItem('nanal_data', JSON.stringify(this.data));
        console.log('Data saved to LocalStorage');
    }
}
