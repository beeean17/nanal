import DataManager from '../dataManager.js';
import { getTimePosition, formatTimeDisplay } from '../utils.js';

export default class HomeView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        // Fetch Data for max range (7 days for Desktop)
        const today = new Date().toISOString().split('T')[0];
        const daysData = this.dm.getDaysViewData(today, 7);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // --- 1. Headers ---
        // Mobile Header
        const mobileHeaderHTML = `
            <div class="mobile-header d-md-none">
                <div>
                    <div class="header-time">${formatTimeDisplay(new Date().toTimeString().slice(0, 5))}</div>
                </div>
                <div class="header-weather">
                    <div class="weather-icon"></div>
                    <span>Seoul 24°C</span>
                </div>
            </div>
        `;

        // Desktop/Tablet Header
        const d = new Date();
        const dateStr = `${dayNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
        const desktopHeaderHTML = `
            <div class="desktop-header d-none d-md-flex">
                <h1>${formatTimeDisplay(new Date().toTimeString().slice(0, 5))}</h1>
                <span>${dateStr} · Seoul, Sunny 26°C</span>
            </div>
        `;

        // --- 2. Mobile Content (< 768px) ---
        // Vertical Timeline + Todo Card
        const todayData = daysData[0];
        const mobileTimelineItems = this.generateVerticalTimelineItems(todayData.timeline, 0); // 0 offset/width logic unused for vertical single

        const mobileContentHTML = `
            ${mobileHeaderHTML}
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-title">Today's Timeline</div>
                <div class="timeline-vertical" style="height: 480px;"> <!-- Fixed height for scroll or auto? -->
                    <div class="timeline-track"></div>
                    <div class="current-time-line" style="top: ${getTimePosition(new Date().toTimeString().slice(0, 5))}%">
                        <span class="current-time-label">${formatTimeDisplay(new Date().toTimeString().slice(0, 5))}</span>
                    </div>
                    ${mobileTimelineItems}
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">To-Do List</div>
                ${this.generateTodoList(todayData.todos)}
            </div>
        `;

        // --- 3. Tablet Content (768px - 1024px) ---
        // Grid: Todo (Left) + 3-Day Timeline (Right)

        // 3-Day Timeline Header
        let tabletTimelineCols = '';
        daysData.slice(0, 3).forEach((day, i) => {
            const label = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : dayNames[new Date(day.date).getDay()]);
            tabletTimelineCols += `
                <div class="day-col">
                    <div class="day-header">${label}</div>
                    <div style="position: relative; height: 400px;">
                        ${this.generateVerticalTimelineItems(day.timeline, 0)} 
                    </div>
                </div>
            `;
        });

        const tabletContentHTML = `
            ${desktopHeaderHTML}
            <div class="tablet-grid">
                <div class="card todo-card">
                    <div class="card-title">Today's To-Do</div>
                    ${this.generateTodoList(todayData.todos)}
                </div>

                <div class="card timeline-card">
                    <div class="card-title">3-Day Timeline</div>
                    <div class="timeline-3day">
                        ${tabletTimelineCols}
                    </div>
                </div>
            </div>
        `;

        // --- 4. Desktop Content (>= 1024px) ---
        // Top: 7-Day Landscape Grid
        // Bottom: Todo + Goal

        // Generate Landscape Grid
        // Header Row
        let gridHeaderCells = '';
        daysData.forEach(day => {
            const dn = dayNames[new Date(day.date).getDay()];
            gridHeaderCells += `<div class="grid-day-label">${dn}</div>`;
        });

        // Time Labels Column
        let timeLabels = '';
        for (let i = 6; i <= 22; i++) { // Show 6AM to 10PM? or 24h?
            // Using simple list for landscape
            timeLabels += `<div class="time-label-slot">${i}:00</div>`;
        }

        // Day Columns (Slots)
        let dayColsHTML = '';
        daysData.forEach(day => {
            let slotsHTML = '';
            day.timeline.forEach(task => {
                // Determine Top/Height based on 6AM-10PM scale or 0-24 scale
                // Landscape timeline usually has fixed height slots. 
                // Let's assume standard full day 0-24 mapped to 100% or pixels
                // Responsive Home CSS showed fixed height 400px container and labels

                // Simplified: Just rendering blocks absolutely in the column
                // Note: time-label-slot height is 60px. 1 hour = 60px.
                // Start 00:00? let's stick to simple map

                // Using 0-24 mapping with same getTimePosition percentage logic? 
                // But container is scrolable.
                // Let's use % top 
                const top = getTimePosition(task.startTime); // 0-100%
                const bottom = getTimePosition(task.endTime);
                const height = bottom - top;

                slotsHTML += `
                    <div class="slot-item" style="top: ${top}%; height: ${height}%;" title="${task.title}">
                        ${task.title}
                    </div>
                `;
            });

            dayColsHTML += `
                <div class="day-slots" style="min-height: 1440px;"> <!-- 1px per minute = 1440px height? -->
                    ${slotsHTML}
                </div>
            `;
        });

        // Since landscape timeline CSS had 400px fixed height and overflow, we need a taller inner body
        // The CSS `time-label-slot` had 60px height. 24 * 60 = 1440px.
        // I will generate full 24h labels
        timeLabels = '';
        for (let i = 0; i < 24; i++) {
            timeLabels += `<div class="time-label-slot">${i.toString().padStart(2, '0')}:00</div>`;
        }

        const desktopContentHTML = `
            ${desktopHeaderHTML}
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-title">Weekly Timeline</div>
                <div class="timeline-landscape">
                    <div class="grid-header">
                        ${gridHeaderCells}
                    </div>
                    <div class="grid-body">
                        <div class="time-labels">
                            ${timeLabels}
                        </div>
                        ${dayColsHTML}
                    </div>
                </div>
             </div>

             <div class="bottom-dashboard">
                 <div class="card">
                     <div class="card-title">All To-Do List</div>
                     ${this.generateTodoList(todayData.todos)}
                 </div>
                 <div class="card">
                     <div class="card-title">Weekly Goal Summary</div>
                     <div class="todo-item"><div class="checkbox"></div><span class="todo-text">Complete Project</span></div>
                     <div class="todo-item"><div class="checkbox"></div><span class="todo-text">Review Design</span></div>
                 </div>
             </div>
        `;

        // --- 5. Inject All ---
        container.innerHTML = `
            <div class="mobile-layout-content" id="mobile-view">${mobileContentHTML}</div>
            <div class="tablet-layout-content" id="tablet-view">${tabletContentHTML}</div>
            <div class="desktop-layout-content" id="desktop-view">${desktopContentHTML}</div>
        `;
    }

    generateVerticalTimelineItems(tasks, dayIndex) {
        if (!tasks || tasks.length === 0) return '';
        return tasks.map(task => {
            const top = getTimePosition(task.startTime);
            const bottom = getTimePosition(task.endTime);
            const height = bottom - top;
            // Mobile/Vertical blocks
            // Use time-block style
            return `
                <div class="time-block" style="position: absolute; top: ${top}%; height: ${height}%; width: 90%; left: 5%;">
                    <div class="time-block-time">${task.startTime} - ${task.endTime}</div>
                    <div class="time-block-title">${task.title}</div>
                </div>
            `;
        }).join('');
    }

    generateTodoList(todos) {
        if (!todos || todos.length === 0) return '<div style="padding:10px; color:#999;">No tasks</div>';
        return todos.map(t => `
            <div class="todo-item">
                <div class="checkbox ${t.completed ? 'checked' : ''}"></div>
                <span class="todo-text">${t.title}</span>
            </div>
        `).join('');
    }
}
