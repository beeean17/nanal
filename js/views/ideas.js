// views/Ideas.js - Ideas Incubator view with Masonry layout
// Pinterest-style idea board for capturing and organizing ideas

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
               <a href="#ideas" class="nav-item active" data-screen="ideas">
                    <span class="icon">💡</span><span class="label">아이디어</span>
               </a>
               <a href="#settings" class="nav-item" data-screen="settings">
                    <span class="icon">⚙️</span><span class="label">설정</span>
               </a>
           </nav>
        </aside>

        <!-- Main Panel: Ideas Content -->
        <main class="timeline-panel glass-card" style="display: flex; flex-direction: column;">
            
            <div class="ideas-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
               <div>
                  <h1>💡 아이디어</h1>
                  <p style="color: var(--text-secondary); font-size: 0.9rem;">떠오르는 생각을 자유롭게 기록하세요</p>
               </div>
               <button class="btn-primary" id="add-idea-btn">+ 새 아이디어</button>
            </div>

            <!-- Toolbar -->
            <div class="ideas-toolbar" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
               <div id="ideas-search-container" style="flex: 1; min-width: 200px;"></div>
               <select id="ideas-sort-select" style="padding: 8px; border-radius: 8px; border: 1px solid var(--glass-border); background: var(--glass-bg);">
                  <option value="recent">최근순</option>
                  <option value="oldest">오래된순</option>
                  <option value="updated">수정순</option>
               </select>
               <div style="display: flex; align-items: center;">총 <span id="ideas-count" style="font-weight: bold; margin: 0 4px;">0</span>개</div>
            </div>

            <!-- Content Area -->
            <div style="flex: 1; overflow-y: auto;">
               <div id="ideas-masonry" style="column-count: 2; column-gap: 15px;"></div>
               
               <div id="ideas-empty-state" style="display: none; text-align: center; padding: 40px;">
                  <div style="font-size: 3rem;">💡</div>
                  <h3>아이디어가 없습니다</h3>
                  <button class="btn-primary" id="add-idea-empty-btn" style="margin-top: 10px;">첫 아이디어 추가</button>
               </div>
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
           <a href="#ideas" class="nav-item active" data-screen="ideas">
                <span class="icon">💡</span><span class="label">아이디어</span>
           </a>
           <a href="#settings" class="nav-item" data-screen="settings">
                <span class="icon">⚙️</span><span class="label">설정</span>
           </a>
        </nav>

      </div>

      <!-- Import IdeaModal -->
      <div id="idea-modal"></div>
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

    // Filter
    if (this.filterText) {
      const lower = this.filterText.toLowerCase();
      this.ideas = this.ideas.filter(i =>
        i.title.toLowerCase().includes(lower) || i.content.toLowerCase().includes(lower)
      );
    }

    // Sort
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

    container.style.display = 'block'; // Block for Masonry (column-count)
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = this.ideas.map(idea => this.renderIdeaCard(idea)).join('');
    this.attachCardListeners();
  }

  renderIdeaCard(idea) {
    return `
        <div class="idea-card glass-card" data-id="${idea.id}" style="break-inside: avoid; margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.2s;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 1rem;">${ValidationUtils.escapeHtml(idea.title)}</h3>
                <div class="card-action-btn" style="opacity: 0.7;">✏️</div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); max-height: 100px; overflow: hidden;">${ValidationUtils.escapeHtml(idea.content)}</p>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; text-align: right;">
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
