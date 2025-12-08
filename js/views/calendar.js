export default class CalendarView {
    async render(container) {
        container.innerHTML = `
            <div class="view-header fade-in">
                <h2>Calendar</h2>
            </div>
            <div class="calendar-grid">
                <p>Calendar Grid Placeholder</p>
            </div>
        `;
    }
}
