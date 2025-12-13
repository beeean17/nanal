// views/Ideas.js - Ideas Incubator view with Masonry layout

import { dataManager } from '../state.js';
import { IdeaModal } from '../components/modals/IdeaModal.js';
import { SearchBar } from '../components/input/SearchBar.js';
import { DateUtils, ValidationUtils } from '../utils.js';

export default class IdeasView {
  constructor() {
    this.ideaModal = null;
    this.searchBar = null;
    this.ideas = [];
    this.filterText = '';
    this.sortBy = 'recent';
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
           
           <!-- 1. Ideas Summary Card -->
           <div class="summary-card glass-card">
             <div class="card-header">
               <h3><span class="header-icon">💡</span> 아이디어 현황</h3>
             </div>
             <div class="card-content">
               <div class="calendar-stats-inline">
                 <div class="stat-item">
                   <span class="stat-icon">📝</span>
                   <span class="stat-value" id="ideas-total-count">0</span>
                   <span class="stat-label">전체</span>
                 </div>
                 <div class="stat-item">
                   <span class="stat-icon">🆕</span>
                   <span class="stat-value" id="ideas-recent-count">0</span>
                   <span class="stat-label">이번 주</span>
                 </div>
               </div>
             </div>
           </div>

           <!-- 2. Quick Add Card -->
           <div class="quick-add-card glass-card">
             <div class="card-header">
               <h3><span class="header-icon">✨</span> 빠른 추가</h3>
             </div>
             <div class="card-content">
               <button class="btn-primary btn-block" id="quick-add-idea-btn">+ 새 아이디어</button>
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
             <a href="#ideas" class="nav-item active" data-screen="ideas">
               <span class="nav-icon">💡</span>
               <span class="nav-label">아이디어</span>
             </a>
             <a href="#settings" class="nav-item" data-screen="settings">
               <span class="nav-icon">⚙️</span>
               <span class="nav-label">설정</span>
             </a>
           </nav>
        </aside>

        <!-- Main Panel: Ideas Content -->
        <main class="timeline-panel glass-card">
          <div class="card-header">
            <h3><span class="header-icon">💡</span> 아이디어</h3>
            <button class="btn-primary" id="add-idea-btn">+ 새 아이디어</button>
          </div>

          <div class="ideas-toolbar">
            <div id="ideas-search-container"></div>
            <select id="ideas-sort-select" class="form-select">
              <option value="recent">최근순</option>
              <option value="oldest">오래된순</option>
              <option value="updated">수정순</option>
            </select>
            <div class="ideas-count">총 <span id="ideas-count">0</span>개</div>
          </div>

          <div class="ideas-content">
            <div id="ideas-masonry" class="ideas-masonry"></div>
            <div id="ideas-empty-state" class="empty-state" style="display: none;">
              <div class="empty-icon">💡</div>
              <h3>아이디어가 없습니다</h3>
              <p>떠오르는 생각을 자유롭게 기록하세요</p>
              <button class="btn-primary" id="add-idea-empty-btn">첫 아이디어 추가</button>
            </div>
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
          <a href="#ideas" class="nav-item active" data-screen="ideas">
            <span class="nav-icon">💡</span>
          </a>
          <a href="#settings" class="nav-item" data-screen="settings">
            <span class="nav-icon">⚙️</span>
          </a>
        </nav>
      </div>
    `;
  }

  init() {
    this.initializeComponents();
    this.refreshView();
    this.subscribeToData();
    this.attachEventListeners();
  }

  initializeComponents() {
    this.searchBar = new SearchBar('ideas-search-container', {
      placeholder: '검색...',
      debounceMs: 300,
      onChange: (t) => { this.filterText = t; this.refreshView(); }
    });
    this.searchBar.mount();

    this.ideaModal = new IdeaModal('idea-modal', {
      onSave: (d) => this.handleSaveIdea(d)
    });
  }

  subscribeToData() {
    dataManager.subscribe('ideas', () => this.refreshView());
  }

  refreshView() {
    this.ideas = [...dataManager.ideas];

    if (this.filterText) {
      const lower = this.filterText.toLowerCase();
      this.ideas = this.ideas.filter(i =>
        i.title.toLowerCase().includes(lower) || i.content.toLowerCase().includes(lower)
      );
    }

    if (this.sortBy === 'recent') this.ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (this.sortBy === 'oldest') this.ideas.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (this.sortBy === 'updated') this.ideas.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    this.renderIdeas();
    const countEl = document.getElementById('ideas-count');
    if (countEl) countEl.textContent = this.ideas.length;
  }

  renderIdeas() {
    const container = document.getElementById('ideas-masonry');
    const emptyState = document.getElementById('ideas-empty-state');
    if (!container) return;

    if (this.ideas.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = this.ideas.map(idea => this.renderIdeaCard(idea)).join('');
    this.attachCardListeners();
  }

  renderIdeaCard(idea) {
    return `
      <div class="idea-card glass-card" data-id="${idea.id}">
        <div class="idea-card-header">
          <h3>${ValidationUtils.escapeHtml(idea.title)}</h3>
          <button class="card-action-btn">✏️</button>
        </div>
        <p class="idea-content">${ValidationUtils.escapeHtml(idea.content)}</p>
        <div class="idea-meta">
          ${DateUtils.formatDateKorean(new Date(idea.createdAt))}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const addBtn = document.getElementById('add-idea-btn');
    const addEmptyBtn = document.getElementById('add-idea-empty-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.handleAddIdea());
    if (addEmptyBtn) addEmptyBtn.addEventListener('click', () => this.handleAddIdea());

    const sortSelect = document.getElementById('ideas-sort-select');
    if (sortSelect) sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.refreshView();
    });
  }

  attachCardListeners() {
    document.querySelectorAll('.idea-card').forEach(card => {
      card.addEventListener('click', () => this.handleEditIdea(card.dataset.id));
    });
  }

  handleAddIdea() {
    this.ideaModal.show({});
  }

  handleEditIdea(id) {
    const idea = dataManager.getIdeaById(id);
    if (idea) this.ideaModal.show(idea);
  }

  handleSaveIdea(data) {
    if (data.id) dataManager.updateIdea(data.id, data);
    else dataManager.addIdea(data);
    this.ideaModal.hide();
  }

  destroy() {
    if (this.searchBar) this.searchBar.destroy();
    if (this.ideaModal) this.ideaModal.hide();
  }
}
