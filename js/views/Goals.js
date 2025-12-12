import DataManager from '../dataManager.js';

export default class GoalsView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        const goals = this.dm.data.goals;

        const goalsHTML = goals.map(g => `
            <div class="goal-card">
                <div class="goal-header">
                    <h4>${g.title}</h4>
                    <span>${g.progress}/${g.target}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(g.progress / g.target) * 100}%"></div>
                </div>
            </div>
        `).join('');

        // Dummy Habits
        const habitsHTML = `
            <div class="card glass">
                <h3>Daily Habits</h3>
                <div class="habits-row">
                    <span>💧 Water</span>
                    <div class="habits-grid">
                        <div class="habit-circle done">M</div>
                        <div class="habit-circle done">T</div>
                        <div class="habit-circle done">W</div>
                        <div class="habit-circle">T</div>
                        <div class="habit-circle">F</div>
                        <div class="habit-circle">S</div>
                        <div class="habit-circle">S</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="view-header blur-header">
                <h2>Goals</h2>
            </div>
            <div class="goals-list">
                ${goalsHTML}
                ${habitsHTML}
            </div>
        `;
    }
}
