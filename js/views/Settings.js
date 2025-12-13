// views/Settings.js - Settings and configuration view
// Categories management, data export/import, theme, statistics

import { dataManager } from '../state.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';
import { DateUtils, ValidationUtils } from '../utils.js';
import { toggleTheme } from '../app.js';

export default class SettingsView {
  constructor() {
    this.currentUser = null;
    this.boundRefreshView = this.refreshView.bind(this);
  }

  render() {
    return `
      <div class="home-layout fade-in">
        <!-- Left Panel: Sidebar Nav (Desktop Only) -->
        <aside class="left-panel desktop-only">
           <nav class="sidebar-nav">
               <a href="#home" class="nav-item" data-screen="home">
                    <span class="icon">🏠</span><span class="label">홈</span>
               </a>
               <a href="#calendar" class="nav-item" data-screen="calendar">
                    <span class="icon">📅</span><span class="label">캘린더</span>
               </a>
               <a href="#goals" class="nav-item" data-screen="goals">
                    <span class="icon">🎯</span><span class="label">목표</span>
               </a>
               <a href="#ideas" class="nav-item" data-screen="ideas">
                    <span class="icon">💡</span><span class="label">아이디어</span>
               </a>
               <a href="#settings" class="nav-item active" data-screen="settings">
                    <span class="icon">⚙️</span><span class="label">설정</span>
               </a>
           </nav>
        </aside>

        <!-- Main Panel: Settings Content -->
        <main class="timeline-panel glass-card" style="display: flex; flex-direction: column; padding: 20px;">
            
            <div class="settings-header" style="margin-bottom: 20px;">
              <h1>⚙️ 설정</h1>
            </div>

            <!-- Scrollable Settings -->
            <div class="settings-container" style="flex: 1; overflow-y: auto;">
              
              <!-- Theme Settings -->
              <section class="settings-section">
                <h2>테마</h2>
                <div class="settings-group">
                  <div class="theme-buttons" style="display: flex; gap: 10px;">
                    <button class="theme-btn" data-theme="light" id="theme-light-btn" style="padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border);">
                      ☀️ 라이트
                    </button>
                    <button class="theme-btn" data-theme="dark" id="theme-dark-btn" style="padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border);">
                      🌙 다크
                    </button>
                  </div>
                </div>
              </section>

              <!-- Statistics -->
              <section class="settings-section">
                <h2>📊 통계</h2>
                <div class="stats-grid" id="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;"></div>
              </section>

              <!-- Categories -->
              <section class="settings-section">
                <h2>🏷️ 카테고리</h2>
                <div class="settings-group">
                  <div id="categories-list" style="display: grid; gap: 8px; margin-bottom: 10px;"></div>
                  <button class="btn-primary" id="add-category-btn">+ 카테고리 추가</button>
                </div>
              </section>

              <!-- Data Management -->
              <section class="settings-section">
                <h2>💾 데이터</h2>
                <div class="settings-group" style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button class="btn-secondary" id="export-data-btn">📥 내보내기</button>
                  <button class="btn-secondary" id="import-data-btn">📤 가져오기</button>
                  <input type="file" id="import-file-input" accept=".json" style="display: none;" />
                </div>
              </section>

              <!-- Cloud Sync -->
              <section class="settings-section">
                <h2>☁️ 동기화</h2>
                <div id="cloud-sync-status" style="margin-bottom: 10px;"></div>
                <div id="cloud-sync-actions" style="display: flex; gap: 10px; flex-wrap: wrap;"></div>
              </section>

              <!-- App Info -->
              <section class="settings-section" style="margin-top: 20px; text-align: center; color: var(--text-secondary);">
                <div class="app-version">Nanal v1.0.0</div>
                <div><a href="https://github.com/beeean17/nanal" target="_blank" style="text-decoration: underline;">GitHub</a></div>
              </section>

            </div>
        </main>

        <!-- Mobile Bottom Nav -->
        <nav class="bottom-nav mobile-only">
           <a href="#home" class="nav-item" data-screen="home">
                <span class="icon">🏠</span><span class="label">홈</span>
           </a>
           <a href="#calendar" class="nav-item" data-screen="calendar">
                <span class="icon">📅</span><span class="label">캘린더</span>
           </a>
           <a href="#goals" class="nav-item" data-screen="goals">
                <span class="icon">🎯</span><span class="label">목표</span>
           </a>
           <a href="#ideas" class="nav-item" data-screen="ideas">
                <span class="icon">💡</span><span class="label">아이디어</span>
           </a>
           <a href="#settings" class="nav-item active" data-screen="settings">
                <span class="icon">⚙️</span><span class="label">설정</span>
           </a>
        </nav>

        <!-- Category Edit Modal -->
        <div id="category-modal" class="modal" style="display:none;">
             <div class="modal-overlay" id="category-modal-overlay"></div>
             <div class="modal-content">
                  <h3>카테고리 편집</h3>
                  <input type="text" id="category-name-input" placeholder="이름" class="form-input">
                  <div style="display: flex; gap: 5px; margin: 10px 0;">
                      <input type="color" id="category-color-input">
                      <input type="text" id="category-icon-input" placeholder="Icon" style="width: 50px;">
                  </div>
                  <div class="modal-footer">
                      <button id="save-category-btn" class="btn-primary">저장</button>
                      <button id="cancel-category-btn" class="btn-secondary">취소</button>
                  </div>
                  <button id="category-modal-close-btn" class="modal-close-btn">×</button>
             </div>
        </div>

      </div>
    `;
  }

  async init() {
    this.loadSettings();
    this.subscribeToData();
    this.attachEventListeners();
    this.renderStatistics();
    this.renderCategories();
    this.renderCloudSyncStatus();
    this.updateThemeButtons();
  }

  subscribeToData() {
    dataManager.subscribe('categories', () => this.renderCategories());
    dataManager.subscribe('settings', () => this.loadSettings());
    dataManager.subscribe('focusSessions', () => this.renderStatistics());
  }

  refreshView() {
    this.renderStatistics();
    this.renderCategories();
    this.renderCloudSyncStatus();
  }

  loadSettings() {
    // Load logic if any specific settings need UI update beyond themes
  }

  renderStatistics() {
    const container = document.getElementById('stats-grid');
    if (!container) return;

    const totalTasks = dataManager.tasks.length;
    const completedTasks = dataManager.tasks.filter(t => t.isCompleted).length;

    container.innerHTML = `
      <div class="stat-card glass-card" style="padding: 10px; background: rgba(255,255,255,0.1);">
         <div style="font-size: 1.5rem;">✅ ${completedTasks}</div>
         <div style="font-size: 0.8rem;">완료한 할 일</div>
      </div>
      <div class="stat-card glass-card" style="padding: 10px; background: rgba(255,255,255,0.1);">
         <div style="font-size: 1.5rem;">📋 ${totalTasks}</div>
         <div style="font-size: 0.8rem;">총 할 일</div>
      </div>
      <!-- Additional stats skipped for brevity but layout is responsive -->
    `;
  }

  renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    container.innerHTML = dataManager.categories.map(cat => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="display:inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${cat.color};"></span>
                  <span>${cat.icon} ${ValidationUtils.escapeHtml(cat.name)}</span>
              </div>
              <div>
                  <button class="edit-category-btn btn-icon" data-id="${cat.id}">✏️</button>
                  <button class="delete-category-btn btn-icon" data-id="${cat.id}">🗑️</button>
              </div>
          </div>
      `).join('');

    document.querySelectorAll('.edit-category-btn').forEach(b => b.addEventListener('click', () => this.handleEditCategory(b.dataset.id)));
    document.querySelectorAll('.delete-category-btn').forEach(b => b.addEventListener('click', () => this.handleDeleteCategory(b.dataset.id)));
  }

  async renderCloudSyncStatus() {
    const statusEl = document.getElementById('cloud-sync-status');
    const actionsEl = document.getElementById('cloud-sync-actions');
    if (!statusEl || !actionsEl) return;

    this.currentUser = FirebaseAuth.getCurrentUser();

    if (this.currentUser) {
      statusEl.innerHTML = `✅ 로그인됨: ${this.currentUser.email}`;
      actionsEl.innerHTML = `
             <button id="manual-backup-btn" class="btn-primary">☁️ 백업</button>
             <button id="restore-backup-btn" class="btn-secondary">⬇️ 복원</button>
             <button id="firebase-logout-btn" class="btn-secondary">🚪 로그아웃</button>
          `;
      document.getElementById('manual-backup-btn').addEventListener('click', () => alert('백업 기능 준비 중'));
      document.getElementById('restore-backup-btn').addEventListener('click', () => alert('복원 기능 준비 중'));
      document.getElementById('firebase-logout-btn').addEventListener('click', () => this.handleFirebaseLogout());
    } else {
      statusEl.innerHTML = `❌ 로그인하지 않음`;
      actionsEl.innerHTML = `<button id="firebase-login-btn" class="btn-primary">🔐 로그인</button>`;
      document.getElementById('firebase-login-btn').addEventListener('click', () => this.handleFirebaseLogin());
    }
  }

  attachEventListeners() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => { toggleTheme(); this.updateThemeButtons(); });
    });

    document.getElementById('add-category-btn').addEventListener('click', () => this.showCategoryModal());

    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) exportBtn.addEventListener('click', () => this.handleExportData());

    const importBtn = document.getElementById('import-data-btn');
    const fileInput = document.getElementById('import-file-input');
    if (importBtn) importBtn.addEventListener('click', () => fileInput.click());
    if (fileInput) fileInput.addEventListener('change', (e) => this.handleImportData(e));

    // Modal
    const modal = document.getElementById('category-modal');
    const closeBtn = document.getElementById('category-modal-close-btn');
    const cancelBtn = document.getElementById('cancel-category-btn');
    const saveBtn = document.getElementById('save-category-btn');
    const overlay = document.getElementById('category-modal-overlay');

    const closeModal = () => { if (modal) modal.style.display = 'none'; };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    if (saveBtn) saveBtn.addEventListener('click', () => this.handleSaveCategory());
  }

  updateThemeButtons() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.style.background = btn.dataset.theme === currentTheme ? 'var(--color-accent-blue)' : 'transparent';
      btn.style.color = btn.dataset.theme === currentTheme ? 'white' : 'inherit';
    });
  }

  showCategoryModal(cat) {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
    const nameInput = document.getElementById('category-name-input');
    const colorInput = document.getElementById('category-color-input');
    const iconInput = document.getElementById('category-icon-input');

    nameInput.value = cat ? cat.name : '';
    colorInput.value = cat ? cat.color : '#007AFF';
    iconInput.value = cat ? cat.icon : '📌';
    modal.dataset.id = cat ? cat.id : '';
    modal.style.display = 'flex';
  }

  handleSaveCategory() {
    const modal = document.getElementById('category-modal');
    const name = document.getElementById('category-name-input').value;
    const color = document.getElementById('category-color-input').value;
    const icon = document.getElementById('category-icon-input').value;

    if (!name) return alert('이름을 입력하세요');

    const id = modal.dataset.id;
    if (id) {
      dataManager.updateCategory(id, { name, color, icon });
    } else {
      dataManager.addCategory({ name, color, icon });
    }
    modal.style.display = 'none';
  }

  handleEditCategory(id) {
    const cat = dataManager.getCategoryById(id);
    if (cat) this.showCategoryModal(cat);
  }

  handleDeleteCategory(id) {
    if (confirm('삭제하시겠습니까?')) dataManager.deleteCategory(id);
  }

  handleExportData() {
    const data = dataManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nanal_backup_${DateUtils.formatDate(new Date())}.json`;
    a.click();
  }

  async handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    dataManager.importData(JSON.parse(text));
    alert('완료');
    window.location.reload();
  }

  async handleFirebaseLogin() {
    try { await FirebaseAuth.signInWithGoogle(); this.renderCloudSyncStatus(); }
    catch (e) { alert(e.message); }
  }

  async handleFirebaseLogout() {
    try { await FirebaseAuth.signOut(); this.renderCloudSyncStatus(); }
    catch (e) { alert(e.message); }
  }
}
