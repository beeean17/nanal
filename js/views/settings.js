import DataManager from '../dataManager.js';

export default class SettingsView {
    constructor() {
        this.dm = DataManager.getInstance();
    }

    async render(container) {
        container.innerHTML = `
            <div class="view-header blur-header">
                <h2>Settings</h2>
            </div>
            
            <div class="settings-list" style="padding: 20px;">
                <div class="card glass">
                    <h3>Data Management</h3>
                    <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 15px;">
                        Save your data locally or restore from a backup file.
                    </p>
                    <div style="display: flex; gap: 10px;">
                        <button id="btn-backup" style="flex: 1;">Backup (JSON)</button>
                        <button id="btn-restore" style="flex: 1; background: var(--card-bg); color: var(--accent-color); border: 1px solid var(--glass-border);">Restore</button>
                    </div>
                </div>

                <div class="card glass">
                    <h3>About</h3>
                    <p>Nanal v1.0.0 (Apple Style)</p>
                </div>
            </div>
        `;

        // Event Listeners
        const btnBackup = container.querySelector('#btn-backup');
        const btnRestore = container.querySelector('#btn-restore');

        if (btnBackup) {
            btnBackup.onclick = () => this.dm.exportData();
        }

        if (btnRestore) {
            btnRestore.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    if (e.target.files.length > 0) {
                        this.dm.importData(e.target.files[0]);
                    }
                };
                input.click();
            };
        }
    }
}
