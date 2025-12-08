import DataManager from '../dataManager.js';
import { getTimePosition, getTimeStringFromPosition, formatTimeDisplay } from '../utils.js';

export default class HomeView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        const today = new Date().toISOString().split('T')[0];
        const data = this.dm.getTodayViewData(today);

        // UI Generation (Same as before)
        let timeLabelsHTML = '';
        let gridLinesHTML = '';
        for (let i = 0; i < 24; i++) {
            const h = (8 + i) % 24;
            const timeStr = `${h.toString().padStart(2, '0')}:00`;
            const top = (i / 24) * 100;
            timeLabelsHTML += `<div class="time-label" style="top: ${top}%">${formatTimeDisplay(timeStr)}</div>`;
            gridLinesHTML += `<div class="grid-line" style="top: ${top}%"></div>`;
        }

        const tasksHTML = data.timeline.map(item => {
            const top = getTimePosition(item.startTime);
            const bottom = getTimePosition(item.endTime);
            const height = bottom - top;
            const isSchedule = item.type === 'schedule';
            const colorClass = isSchedule ? 'bg-blue' : 'bg-orange';
            return `
                <div class="task-block ${colorClass} glass" 
                     style="top: ${top}%; height: ${height}%;"
                     data-id="${item.id}">
                    <div class="task-title">${item.title}</div>
                    <div class="task-time">${item.startTime} - ${item.endTime}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="view-header blur-header">
                <h2>Today</h2>
                <div class="date-display">${today}</div>
                <button class="add-btn" id="add-task-btn">+</button>
            </div>
            
            <div class="home-layout">
                <div class="timeline-container" id="timeline-container">
                    <div class="time-axis">
                        ${timeLabelsHTML}
                    </div>
                    <div class="timeline-content" id="timeline-content">
                        ${gridLinesHTML}
                        ${tasksHTML}
                        <div class="current-time-line" style="top: ${getTimePosition(new Date().toTimeString().slice(0, 5))}%"></div>
                    </div>
                </div>

                <div class="todo-sheet glass">
                    <div class="sheet-handle"></div>
                    <h3>To Do</h3>
                    <ul class="todo-list">
                        ${data.todos.map(t => `
                            <li>
                                <input type="checkbox" ${t.completed ? 'checked' : ''}>
                                <span>${t.title}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Attach Event Listeners
        this.addInteractions(container);
    }

    addInteractions(container) {
        const timelineContent = container.querySelector('#timeline-content');
        if (!timelineContent) return;

        // Simple Tap to Create (Easier to verify than complex gesture for now)
        timelineContent.addEventListener('click', (e) => {
            if (e.target.closest('.task-block')) {
                const id = e.target.closest('.task-block').getAttribute('data-id');
                console.log('Clicked task:', id);
                return;
            }

            // Calculate Grid Box
            const rect = timelineContent.getBoundingClientRect();
            // Need to account for scrollTop of container if it scrolls, but timelineContent is the scrollable inner part?
            // Actually timeline-container scrolls.
            const scrollContainer = container.querySelector('#timeline-container');
            const scrollTop = scrollContainer.scrollTop;

            const clientY = e.clientY;
            // Relative Y in the content (total height)
            // rect.top is relative to viewport.
            // click Y inside element = clientY - rect.top
            // But we need Y relative to the CONTENT top.
            // Since timelineContent is inside scrollContainer, and has relative position.
            // The click is on timelineContent.
            const relativeY = clientY - rect.top;
            const totalHeight = timelineContent.offsetHeight;
            const percent = (relativeY / totalHeight) * 100;

            const timeStr = getTimeStringFromPosition(percent);
            console.log(`Clicked at ${percent.toFixed(2)}% -> ${timeStr}`);

            // In a real app, open modal here
            if (confirm(`Add new task at ${timeStr}?`)) {
                this.dm.addTask({
                    id: Date.now().toString(),
                    title: 'New Task',
                    category: 'Work',
                    date: new Date().toISOString().split('T')[0],
                    startTime: timeStr,
                    endTime: getTimeStringFromPosition(percent + 4.16), // +1 hour (100/24 = 4.16)
                    completed: false
                });
                // Re-render
                this.render(container);
            }
        });
    }
}
