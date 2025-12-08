import DataManager from '../dataManager.js';

export default class CalendarView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        const date = new Date(); // Current month for now
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based

        // Month Header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        // Grid Logic
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // HTML Generation
        let daysHTML = '';

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            daysHTML += `<div class="day-cell empty"></div>`;
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            // Check for tasks on this day
            const dayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            // Simple check: count tasks
            const taskCount = this.dm.data.tasks.filter(t => t.date === dayStr).length;
            const dots = taskCount > 0 ? '<div class="dot"></div>'.repeat(Math.min(taskCount, 3)) : '';

            const isToday = dayStr === new Date().toISOString().split('T')[0];
            const activeClass = isToday ? 'active' : '';

            daysHTML += `
                <div class="day-cell ${activeClass}">
                    <span class="day-number">${d}</span>
                    <div class="day-dots">${dots}</div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="view-header blur-header">
                <h2>${monthNames[month]} ${year}</h2>
            </div>
            
            <div class="calendar-container">
                <div class="weekdays">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>
                <div class="calendar-grid">
                    ${daysHTML}
                </div>
            </div>
        `;
    }
}
