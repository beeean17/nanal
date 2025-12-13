// views/Settings.js - Settings and configuration view

import { dataManager } from '../state.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';
import { DateUtils, ValidationUtils } from '../utils.js';
import { toggleTheme } from '../app.js';

export default class SettingsView {
  constructor() {
    this.currentUser = null;
  }

  render() {
    return `
      <!-- Home Layout Container -->
      <div class="home-layout fade-in">
        
        <!-- App Header (Mobile/Tablet) -->
        <header class="app-header mobile-tablet-only">
          <h1 class="app-title">Nanal</h1>
          <button class="notification-btn" aria-label="알림">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </header>

        <!-- Left Panel: Summary and Desktop Nav -->
        <aside class="left-panel">
           
           <!-- Desktop App Title -->
           <h1 class="app-title desktop-only">Nanal</h1>
           
           <!-- 1. App Info Card -->
           <div class="summary-card glass-card">
             <div class="card-header">
               <h3><span class="header-icon">📱</span> 앱 정보</h3>
             </div>
             <div class="card-content">
               <div class="app-info-simple">
                 <div class="app-version">Nanal v1.0.0</div>
                 <a href="https://github.com/beeean17/nanal" target="_blank" class="github-link">🔗 GitHub</a>
               </div>
             </div>
           </div>

           <!-- 2. Quick Actions Card -->
           <div class="quick-add-card glass-card">
             <div class="card-header">
               <h3><span class="header-icon">⚡</span> 빠른 설정</h3>
             </div>
             <div class="card-content">
               <div class="theme-toggle-inline">
                 <button class="theme-btn-mini" data-theme="light" id="quick-theme-light">☀️</button>
                 <button class="theme-btn-mini" data-theme="dark" id="quick-theme-dark">🌙</button>
               </div>
             </div>
           </div>

           <!-- 3. Desktop Navigation -->
           <nav class="sidebar-nav desktop-only">
             <a href="#home" class="nav-item" data-screen="home">
               <span class="nav-icon">🏠</span>
               <span class="nav-label">홈</span>
             </a>
             <a href="#calendar" class="nav-item" data-screen="calendar">
               <span class="nav-icon">📅</span>
               <span class="nav-label">캘린더</span>
             </a>
             <a href="#goals" class="nav-item" data-screen="goals">
               <span class="nav-icon">🎯</span>
               <span class="nav-label">목표</span>
             </a>
             <a href="#ideas" class="nav-item" data-screen="ideas">
               <span class="nav-icon">💡</span>
               <span class="nav-label">아이디어</span>
             </a>
             <a href="#settings" class="nav-item active" data-screen="settings">
               <span class="nav-icon">⚙️</span>
               <span class="nav-label">설정</span>
             </a>
           </nav>
        </aside>

        <!-- Main Panel: Settings Content -->
        <main class="timeline-panel glass-card">
          <div class="card-header">
            <h3><span class="header-icon">⚙️</span> 설정</h3>
          </div>

          <div class="settings-content">
            
            <section class="settings-section">
              <h2>테마</h2>
              <div class="theme-buttons">
                <button class="theme-btn" data-theme="light" id="theme-light-btn">☀️ 라이트</button>
                <button class="theme-btn" data-theme="dark" id="theme-dark-btn">🌙 다크</button>
              </div>
            </section>

            <section class="settings-section">
              <h2>📊 통계</h2>
              <div class="stats-grid" id="stats-grid"></div>
            </section>

            <section class="settings-section">
              <h2>🏷️ 카테고리</h2>
              <div id="categories-list" class="categories-list"></div>
              <button class="btn-primary" id="add-category-btn">+ 카테고리 추가</button>
            </section>

            <section class="settings-section">
              <h2>💾 데이터</h2>
              <div class="data-actions">
                <button class="btn-secondary" id="export-data-btn">📥 내보내기</button>
                <button class="btn-secondary" id="import-data-btn">📤 가져오기</button>
                <input type="file" id="import-file-input" accept=".json" style="display: none;" />
              </div>
            </section>

            <section class="settings-section">
              <h2>☁️ 동기화</h2>
              <div id="cloud-sync-status"></div>
              <div id="cloud-sync-actions"></div>
            </section>

            <section class="settings-section app-info">
              <div class="app-version">Nanal v1.0.0</div>
              <div><a href="https://github.com/beeean17/nanal" target="_blank">GitHub</a></div>
            </section>
          </div>
        </main>

        <!-- Mobile/Tablet Bottom Nav -->
        <nav class="bottom-nav mobile-tablet-only">
          <a href="#home" class="nav-item" data-screen="home">
            <span class="nav-icon">🏠</span>
          </a>
          <a href="#calendar" class="nav-item" data-screen="calendar">
            <span class="nav-icon">📅</span>
          </a>
          <a href="#goals" class="nav-item" data-screen="goals">
            <span class="nav-icon">🎯</span>
          </a>
          <a href="#ideas" class="nav-item" data-screen="ideas">
            <span class="nav-icon">💡</span>
          </a>
          <a href="#settings" class="nav-item active" data-screen="settings">
            <span class="nav-icon">⚙️</span>
          </a>
        </nav>

        <!-- Category Edit Modal -->
        <div id="category-modal" class="modal" style="display:none;">
          <div class="modal-overlay" id="category-modal-overlay"></div>
          <div class="modal-content">
            <h3>카테고리 편집</h3>
            <input type="text" id="category-name-input" placeholder="이름" class="form-input">
            <div class="category-options">
              <input type="color" id="category-color-input">
              <input type="text" id="category-icon-input" placeholder="아이콘" class="form-input-sm">
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

  loadSettings() { }

  renderStatistics() {
    const container = document.getElementById('stats-grid');
    if (!container) return;

    const totalTasks = dataManager.tasks.length;
    const completedTasks = dataManager.tasks.filter(t => t.isCompleted).length;

    container.innerHTML = `
      <div class="stat-card glass-card">
        <div class="stat-value">✅ ${completedTasks}</div>
        <div class="stat-label">완료한 할 일</div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-value">📋 ${totalTasks}</div>
        <div class="stat-label">총 할 일</div>
      </div>
    `;
  }

  renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    container.innerHTML = dataManager.categories.map(cat => `
      <div class="category-item">
        <div class="category-info">
          <span class="category-color" style="background: ${cat.color};"></span>
          <span>${cat.icon} ${ValidationUtils.escapeHtml(cat.name)}</span>
        </div>
        <div class="category-actions">
          <button class="edit-category-btn btn-icon" data-id="${cat.id}">✏️</button>
          <button class="delete-category-btn btn-icon" data-id="${cat.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.edit-category-btn').forEach(b =>
      b.addEventListener('click', () => this.handleEditCategory(b.dataset.id)));
    document.querySelectorAll('.delete-category-btn').forEach(b =>
      b.addEventListener('click', () => this.handleDeleteCategory(b.dataset.id)));
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
      btn.classList.toggle('active', btn.dataset.theme === currentTheme);
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
