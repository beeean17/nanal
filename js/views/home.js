import DataManager from '../dataManager.js';
import { formatDate } from '../utils.js';

export default class HomeView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        const today = new Date().toISOString().split('T')[0];
        const data = this.dm.getTodayViewData(today);

        container.innerHTML = `
            <div class="view-header fade-in">
                <h2>Today</h2>
                <span class="date-badge">${today}</span>
            </div>
            <div class="timeline-container">
                <!-- Timeline will be implemented in Phase 3 -->
                <div class="empty-state">
                    <p>Timeline visualization coming soon.</p>
                </div>
            </div>
            <div class="todo-list glass-card">
                <h3>To Do</h3>
                <ul>
                    ${data.todos.map(t => `<li>${t.title}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}
