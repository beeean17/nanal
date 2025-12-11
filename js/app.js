import { dataManager } from './dataManager.js';

console.log('App Initialized'); // Log to verify loading

// Verify DataManager loading
const data = dataManager.getTasks();
console.log('DataManager loaded tasks:', data);

// Simple date check
const today = new Date().toISOString().split('T')[0];
console.log('Today tasks from DataManager:', dataManager.getTodayData(today));

// Logic to switch views or init router would go here
