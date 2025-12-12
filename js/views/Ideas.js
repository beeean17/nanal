import DataManager from '../dataManager.js';

export default class IdeasView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        const ideas = this.dm.data.ideas;

        const ideasHTML = ideas.map(i => `
            <div class="idea-card" contenteditable="true">
                <h4>${i.title}</h4>
                <p>${i.content}</p>
            </div>
        `).join('');

        // Add some dummy cards to show masonry
        const dummies = `
            <div class="idea-card" style="background: #e0f7fa" contenteditable="true">
                <h4>Trip to Japan</h4>
                <p>Buy JR Pass, Reserve Hotels...</p>
            </div>
            <div class="idea-card" style="background: #f3e5f5" contenteditable="true">
                <h4>Project Nanal</h4>
                <p>Refactor to Vue.js later?</p>
            </div>
        `;

        container.innerHTML = `
            <div class="view-header blur-header">
                <h2>Ideas</h2>
                <button class="add-btn">+</button>
            </div>
            <div class="ideas-container">
                ${ideasHTML}
                ${dummies}
            </div>
        `;
    }
}
