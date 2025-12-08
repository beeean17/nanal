export default class SettingsView {
    async render(container) {
        container.innerHTML = `
            <div class="view-header fade-in">
                <h2>Settings</h2>
            </div>
            <button id="btn-backup">Backup Data</button>
            <button id="btn-restore">Restore Data</button>
        `;
    }
}
