// views/Settings.js - Settings and configuration view
// Categories management, data export/import, theme, statistics

import { dataManager } from '../state.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';
import { DateUtils, ValidationUtils } from '../utils.js';
import { toggleTheme } from '../app.js';

/**
 * Settings View - App configuration and data management
 * @class
 */
export default class SettingsView {
  constructor() {
    // State
    this.currentUser = null;

    // Bound methods
    this.boundRefreshView = this.refreshView.bind(this);
  }

  /**
   * Render settings view HTML
   * @returns {string} HTML string
   */
  render() {
    return `
      <div class="settings-screen fade-in">
        <!-- Header -->
        <div class="settings-header">
          <h1>⚙️ 설정</h1>
        </div>

        <!-- Settings Sections -->
        <div class="settings-container">
          <!-- Theme Settings -->
          <section class="settings-section">
            <h2>테마</h2>
            <div class="settings-group">
              <div class="theme-buttons">
                <button class="theme-btn" data-theme="light" id="theme-light-btn">
                  <span class="theme-icon">☀️</span>
                  <span class="theme-label">라이트</span>
                </button>
                <button class="theme-btn" data-theme="dark" id="theme-dark-btn">
                  <span class="theme-icon">🌙</span>
                  <span class="theme-label">다크</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Default View -->
          <section class="settings-section">
            <h2>기본 시작 화면</h2>
            <div class="settings-group">
              <select id="default-view-select" class="settings-select">
                <option value="home">홈</option>
                <option value="calendar">캘린더</option>
                <option value="goals">목표</option>
                <option value="ideas">아이디어</option>
              </select>
            </div>
          </section>

          <!-- Weather Location -->
          <section class="settings-section">
            <h2>날씨 위치</h2>
            <div class="settings-group">
              <input
                type="text"
                id="weather-location-input"
                class="settings-input"
                placeholder="Seoul"
                maxlength="50"
              />
              <button class="btn-primary" id="save-weather-location-btn">저장</button>
            </div>
          </section>

          <!-- Statistics -->
          <section class="settings-section">
            <h2>📊 통계</h2>
            <div class="stats-grid" id="stats-grid">
              <!-- Stats rendered here -->
            </div>
          </section>

          <!-- Categories Management -->
          <section class="settings-section">
            <h2>🏷️ 카테고리 관리</h2>
            <div class="settings-group">
              <div class="categories-list" id="categories-list">
                <!-- Categories rendered here -->
              </div>
              <button class="btn-primary" id="add-category-btn">
                <span class="btn-icon">+</span>
                <span class="btn-text">카테고리 추가</span>
              </button>
            </div>
          </section>

          <!-- Data Management -->
          <section class="settings-section">
            <h2>💾 데이터 관리</h2>
            <div class="settings-group">
              <button class="btn-secondary" id="export-data-btn">
                <span class="btn-icon">📥</span>
                <span class="btn-text">데이터 내보내기 (JSON)</span>
              </button>
              <button class="btn-secondary" id="import-data-btn">
                <span class="btn-icon">📤</span>
                <span class="btn-text">데이터 가져오기</span>
              </button>
              <input type="file" id="import-file-input" accept=".json" style="display: none;" />
            </div>
          </section>

          <!-- Cloud Sync -->
          <section class="settings-section">
            <h2>☁️ 클라우드 동기화</h2>
            <div class="settings-group">
              <div class="cloud-sync-status" id="cloud-sync-status">
                <!-- Sync status rendered here -->
              </div>
              <div class="cloud-sync-actions" id="cloud-sync-actions">
                <!-- Sync actions rendered here -->
              </div>
            </div>
          </section>

          <!-- App Info -->
          <section class="settings-section">
            <h2>ℹ️ 앱 정보</h2>
            <div class="app-info">
              <div class="app-version">Nanal v1.0.0</div>
              <div class="app-description">일상 관리 허브</div>
              <div class="app-links">
                <a href="https://github.com/beeean17/nanal" class="app-link" target="_blank">
                  <span class="icon">📦</span>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        <!-- Category Edit Modal -->
        <div class="modal" id="category-modal" style="display: none;">
          <div class="modal-overlay" id="category-modal-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="category-modal-title">카테고리 편집</h3>
              <button class="modal-close-btn" id="category-modal-close-btn">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="category-name-input">이름</label>
                <input
                  type="text"
                  id="category-name-input"
                  class="form-input"
                  placeholder="카테고리 이름"
                  maxlength="20"
                />
              </div>
              <div class="form-group">
                <label for="category-color-input">색상</label>
                <div class="color-picker">
                  <input type="color" id="category-color-input" class="color-input" />
                  <input
                    type="text"
                    id="category-color-text"
                    class="form-input"
                    placeholder="#007AFF"
                    maxlength="7"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="category-icon-input">아이콘</label>
                <input
                  type="text"
                  id="category-icon-input"
                  class="form-input"
                  placeholder="📌"
                  maxlength="2"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-primary" id="save-category-btn">저장</button>
              <button class="btn-secondary" id="cancel-category-btn">취소</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize view after rendering
   */
  async init() {
    console.log('[SettingsView] Initializing...');

    // Load current settings
    this.loadSettings();

    // Subscribe to data changes
    this.subscribeToData();

    // Attach event listeners
    this.attachEventListeners();

    // Render dynamic content
    this.renderStatistics();
    this.renderCategories();
    this.renderCloudSyncStatus();

    // Update theme buttons
    this.updateThemeButtons();

    console.log('[SettingsView] Initialized successfully');
  }

  /**
   * Subscribe to data changes
   */
  subscribeToData() {
    dataManager.subscribe('categories', (changeInfo) => {
      console.log('[SettingsView] Categories changed:', changeInfo);
      this.renderCategories();
    });

    dataManager.subscribe('settings', (changeInfo) => {
      console.log('[SettingsView] Settings changed:', changeInfo);
      this.loadSettings();
    });

    dataManager.subscribe('focusSessions', (changeInfo) => {
      console.log('[SettingsView] Focus sessions changed:', changeInfo);
      this.renderStatistics();
    });
  }

  /**
   * Refresh view with current data
   */
  refreshView() {
    this.renderStatistics();
    this.renderCategories();
    this.renderCloudSyncStatus();
  }

  /**
   * Load current settings
   */
  loadSettings() {
    const settings = dataManager.data.settings || {};

    // Default view
    const defaultViewSelect = document.getElementById('default-view-select');
    if (defaultViewSelect) {
      defaultViewSelect.value = settings.defaultView || 'home';
    }

    // Weather location
    const weatherLocationInput = document.getElementById('weather-location-input');
    if (weatherLocationInput) {
      weatherLocationInput.value = settings.weatherLocation || 'Seoul';
    }
  }

  /**
   * Render statistics
   */
  renderStatistics() {
    const container = document.getElementById('stats-grid');
    if (!container) return;

    // Calculate stats
    const totalTasks = dataManager.tasks.length;
    const completedTasks = dataManager.tasks.filter(t => t.isCompleted).length;
    const totalGoals = dataManager.goals.length;
    const totalHabits = dataManager.habits.filter(h => h.isActive !== false).length;
    const totalIdeas = dataManager.ideas.length;
    const totalFocusSessions = dataManager.focusSessions.length;
    const totalFocusMinutes = dataManager.focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    container.innerHTML = `
      <div class="stat-card">
        <span class="stat-icon">✅</span>
        <div class="stat-info">
          <span class="stat-value">${completedTasks}</span>
          <span class="stat-label">완료한 할 일</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📋</span>
        <div class="stat-info">
          <span class="stat-value">${totalTasks}</span>
          <span class="stat-label">총 할 일</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎯</span>
        <div class="stat-info">
          <span class="stat-value">${totalGoals}</span>
          <span class="stat-label">목표</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">✨</span>
        <div class="stat-info">
          <span class="stat-value">${totalHabits}</span>
          <span class="stat-label">활성 습관</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💡</span>
        <div class="stat-info">
          <span class="stat-value">${totalIdeas}</span>
          <span class="stat-label">아이디어</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔥</span>
        <div class="stat-info">
          <span class="stat-value">${totalFocusSessions}</span>
          <span class="stat-label">집중 세션</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <div class="stat-info">
          <span class="stat-value">${Math.floor(totalFocusMinutes / 60)}h</span>
          <span class="stat-label">총 집중 시간</span>
        </div>
      </div>
    `;
  }

  /**
   * Render categories list
   */
  renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    const categories = dataManager.categories;

    if (categories.length === 0) {
      container.innerHTML = '<p class="empty-message">카테고리가 없습니다</p>';
      return;
    }

    container.innerHTML = categories.map(cat => `
      <div class="category-item" data-category-id="${cat.id}">
        <div class="category-color-box" style="background-color: ${cat.color};"></div>
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${ValidationUtils.escapeHtml(cat.name)}</span>
        <div class="category-actions">
          <button class="btn-icon edit-category-btn" data-category-id="${cat.id}" title="수정">
            ✏️
          </button>
          <button class="btn-icon delete-category-btn" data-category-id="${cat.id}" title="삭제">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    // Attach category item listeners
    this.attachCategoryListeners();
  }

  /**
   * Render cloud sync status
   */
  async renderCloudSyncStatus() {
    const statusContainer = document.getElementById('cloud-sync-status');
    const actionsContainer = document.getElementById('cloud-sync-actions');

    if (!statusContainer || !actionsContainer) return;

    // Check if user is logged in
    this.currentUser = FirebaseAuth.getCurrentUser();

    if (!this.currentUser) {
      statusContainer.innerHTML = `
        <div class="sync-status not-logged-in">
          <span class="status-icon">❌</span>
          <span class="status-text">로그인하지 않음</span>
        </div>
      `;

      actionsContainer.innerHTML = `
        <button class="btn-primary" id="firebase-login-btn">
          <span class="btn-icon">🔐</span>
          <span class="btn-text">로그인</span>
        </button>
      `;

      // Attach login button listener
      const loginBtn = document.getElementById('firebase-login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => this.handleFirebaseLogin());
      }

      return;
    }

    // User is logged in
    const settings = dataManager.data.settings || {};
    const lastBackup = settings.lastBackup ?
      DateUtils.formatDateKorean(new Date(settings.lastBackup)) :
      '없음';

    statusContainer.innerHTML = `
      <div class="sync-status logged-in">
        <span class="status-icon">✅</span>
        <span class="status-text">로그인됨: ${this.currentUser.email}</span>
      </div>
      <div class="sync-info">
        <p>마지막 백업: ${lastBackup}</p>
      </div>
    `;

    actionsContainer.innerHTML = `
      <button class="btn-primary" id="manual-backup-btn">
        <span class="btn-icon">☁️</span>
        <span class="btn-text">수동 백업</span>
      </button>
      <button class="btn-secondary" id="restore-backup-btn">
        <span class="btn-icon">⬇️</span>
        <span class="btn-text">백업 복원</span>
      </button>
      <button class="btn-secondary" id="firebase-logout-btn">
        <span class="btn-icon">🚪</span>
        <span class="btn-text">로그아웃</span>
      </button>
    `;

    // Attach cloud sync action listeners
    this.attachCloudSyncListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleTheme();
        this.updateThemeButtons();
      });
    });

    // Default view
    const defaultViewSelect = document.getElementById('default-view-select');
    if (defaultViewSelect) {
      defaultViewSelect.addEventListener('change', (e) => {
        this.handleSaveDefaultView(e.target.value);
      });
    }

    // Weather location
    const saveWeatherBtn = document.getElementById('save-weather-location-btn');
    if (saveWeatherBtn) {
      saveWeatherBtn.addEventListener('click', () => this.handleSaveWeatherLocation());
    }

    // Add category
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.handleAddCategory());
    }

    // Export/Import data
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportData());
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        importFileInput.click();
      });
    }

    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => this.handleImportData(e));
    }

    // Category modal
    this.attachCategoryModalListeners();
  }

  /**
   * Attach category modal listeners
   */
  attachCategoryModalListeners() {
    const closeBtn = document.getElementById('category-modal-close-btn');
    const cancelBtn = document.getElementById('cancel-category-btn');
    const saveBtn = document.getElementById('save-category-btn');
    const overlay = document.getElementById('category-modal-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCategoryModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeCategoryModal());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSaveCategory());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeCategoryModal());
    }

    // Color input sync
    const colorInput = document.getElementById('category-color-input');
    const colorText = document.getElementById('category-color-text');

    if (colorInput && colorText) {
      colorInput.addEventListener('input', (e) => {
        colorText.value = e.target.value;
      });

      colorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          colorInput.value = e.target.value;
        }
      });
    }
  }

  /**
   * Attach category item listeners
   */
  attachCategoryListeners() {
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const categoryId = btn.dataset.categoryId;
        this.handleEditCategory(categoryId);
      });
    });

    document.querySelectorAll('.delete-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const categoryId = btn.dataset.categoryId;
        this.handleDeleteCategory(categoryId);
      });
    });
  }

  /**
   * Attach cloud sync action listeners
   */
  attachCloudSyncListeners() {
    const backupBtn = document.getElementById('manual-backup-btn');
    const restoreBtn = document.getElementById('restore-backup-btn');
    const logoutBtn = document.getElementById('firebase-logout-btn');

    if (backupBtn) {
      backupBtn.addEventListener('click', () => this.handleManualBackup());
    }

    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => this.handleRestoreBackup());
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleFirebaseLogout());
    }
  }

  /**
   * Update theme buttons active state
   */
  updateThemeButtons() {
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });
  }

  /**
   * Handle save default view
   * @param {string} view - View name
   */
  handleSaveDefaultView(view) {
    dataManager.updateSettings({ defaultView: view });
  }

  /**
   * Handle save weather location
   */
  handleSaveWeatherLocation() {
    const input = document.getElementById('weather-location-input');
    if (!input) return;

    const location = input.value.trim();
    if (location) {
      dataManager.updateSettings({ weatherLocation: location });
      alert('날씨 위치가 저장되었습니다!');
    }
  }

  /**
   * Handle add category
   */
  handleAddCategory() {
    this.showCategoryModal();
  }

  /**
   * Handle edit category
   * @param {string} categoryId - Category ID
   */
  handleEditCategory(categoryId) {
    const category = dataManager.getCategoryById(categoryId);
    if (category) {
      this.showCategoryModal(category);
    }
  }

  /**
   * Handle delete category
   * @param {string} categoryId - Category ID
   */
  handleDeleteCategory(categoryId) {
    const category = dataManager.getCategoryById(categoryId);
    if (!category) return;

    if (confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?\n관련된 항목들은 기본 카테고리로 이동됩니다.`)) {
      dataManager.deleteCategory(categoryId);
    }
  }

  /**
   * Show category modal
   * @param {Object} category - Category to edit (null for new)
   */
  showCategoryModal(category = null) {
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const nameInput = document.getElementById('category-name-input');
    const colorInput = document.getElementById('category-color-input');
    const colorText = document.getElementById('category-color-text');
    const iconInput = document.getElementById('category-icon-input');

    if (!modal) return;

    // Update title
    if (title) {
      title.textContent = category ? '카테고리 수정' : '카테고리 추가';
    }

    // Populate form
    if (nameInput) nameInput.value = category?.name || '';
    if (colorInput) colorInput.value = category?.color || '#007AFF';
    if (colorText) colorText.value = category?.color || '#007AFF';
    if (iconInput) iconInput.value = category?.icon || '📌';

    // Store editing ID
    modal.dataset.editingId = category?.id || '';

    // Show modal
    modal.style.display = 'flex';
  }

  /**
   * Close category modal
   */
  closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.dataset.editingId = '';
    }
  }

  /**
   * Handle save category
   */
  handleSaveCategory() {
    const modal = document.getElementById('category-modal');
    const nameInput = document.getElementById('category-name-input');
    const colorInput = document.getElementById('category-color-input');
    const iconInput = document.getElementById('category-icon-input');

    if (!nameInput || !colorInput || !iconInput) return;

    const name = nameInput.value.trim();
    const color = colorInput.value;
    const icon = iconInput.value.trim();

    if (!name) {
      alert('카테고리 이름을 입력하세요!');
      return;
    }

    const editingId = modal.dataset.editingId;

    if (editingId) {
      // Update existing
      dataManager.updateCategory(editingId, { name, color, icon });
    } else {
      // Add new
      dataManager.addCategory({ name, color, icon });
    }

    this.closeCategoryModal();
  }

  /**
   * Handle export data
   */
  handleExportData() {
    try {
      const data = dataManager.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const timestamp = DateUtils.formatDate(new Date()).replace(/-/g, '');
      const filename = `nanal_backup_${timestamp}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);

      console.log('[SettingsView] Data exported successfully');
    } catch (error) {
      console.error('[SettingsView] Export error:', error);
      alert('데이터 내보내기 실패: ' + error.message);
    }
  }

  /**
   * Handle import data
   * @param {Event} e - File input change event
   */
  async handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (confirm('데이터를 가져오면 현재 데이터가 덮어씌워집니다. 계속하시겠습니까?')) {
        dataManager.importData(data);
        alert('데이터를 성공적으로 가져왔습니다!');
        this.refreshView();
      }
    } catch (error) {
      console.error('[SettingsView] Import error:', error);
      alert('데이터 가져오기 실패: ' + error.message);
    } finally {
      e.target.value = ''; // Reset file input
    }
  }

  /**
   * Handle Firebase login
   */
  async handleFirebaseLogin() {
    try {
      await FirebaseAuth.signInWithGoogle();
      this.renderCloudSyncStatus();
    } catch (error) {
      console.error('[SettingsView] Login error:', error);
      alert('로그인 실패: ' + error.message);
    }
  }

  /**
   * Handle Firebase logout
   */
  async handleFirebaseLogout() {
    try {
      await FirebaseAuth.signOut();
      this.renderCloudSyncStatus();
    } catch (error) {
      console.error('[SettingsView] Logout error:', error);
      alert('로그아웃 실패: ' + error.message);
    }
  }

  /**
   * Handle manual backup to Firebase
   */
  async handleManualBackup() {
    if (!this.currentUser) {
      alert('먼저 로그인하세요!');
      return;
    }

    try {
      const data = dataManager.exportData();
      await FirebaseDB.set('users', this.currentUser.uid, {
        ...data,
        updatedAt: new Date().toISOString()
      });

      dataManager.updateSettings({ lastBackup: new Date().toISOString() });

      alert('백업이 완료되었습니다!');
      this.renderCloudSyncStatus();
    } catch (error) {
      console.error('[SettingsView] Backup error:', error);
      alert('백업 실패: ' + error.message);
    }
  }

  /**
   * Handle restore backup from Firebase
   */
  async handleRestoreBackup() {
    if (!this.currentUser) {
      alert('먼저 로그인하세요!');
      return;
    }

    try {
      const cloudData = await FirebaseDB.get('users', this.currentUser.uid);

      if (!cloudData) {
        alert('백업 데이터가 없습니다!');
        return;
      }

      if (confirm('클라우드 백업으로 복원하면 현재 데이터가 덮어씌워집니다. 계속하시겠습니까?')) {
        dataManager.importData(cloudData);
        alert('백업 복원이 완료되었습니다!');
        this.refreshView();
      }
    } catch (error) {
      console.error('[SettingsView] Restore error:', error);
      alert('복원 실패: ' + error.message);
    }
  }

  /**
   * Destroy view - cleanup
   */
  destroy() {
    console.log('[SettingsView] Destroying...');
    // No special cleanup needed
    console.log('[SettingsView] Destroyed');
  }
}
