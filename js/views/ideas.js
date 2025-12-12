// views/Ideas.js - Ideas Incubator view with Masonry layout
// Pinterest-style idea board for capturing and organizing ideas

import { dataManager } from '../state.js';
import { IdeaModal } from '../components/modals/IdeaModal.js';
import { SearchBar } from '../components/input/SearchBar.js';
import { DateUtils, ValidationUtils } from '../utils.js';

/**
 * Ideas View - Masonry layout idea board
 * @class
 */
export default class IdeasView {
  constructor() {
    // Component instances
    this.ideaModal = null;
    this.searchBar = null;

    // State
    this.ideas = [];
    this.filterText = '';
    this.sortBy = 'recent'; // 'recent', 'oldest', 'updated'

    // Bound methods
    this.boundRefreshView = this.refreshView.bind(this);
  }

  /**
   * Render ideas view HTML
   * @returns {string} HTML string
   */
  render() {
    return `
      <div class="ideas-screen fade-in">
        <!-- Header -->
        <div class="ideas-header">
          <div class="ideas-header-left">
            <h1>💡 아이디어 인큐베이터</h1>
            <p class="ideas-subtitle">떠오르는 아이디어를 기록하고 관리하세요</p>
          </div>
          <div class="ideas-header-right">
            <button class="btn-primary" id="add-idea-btn" aria-label="새 아이디어 추가">
              <span class="btn-icon">+</span>
              <span class="btn-text">새 아이디어</span>
            </button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="ideas-toolbar">
          <!-- Search -->
          <div id="ideas-search-container"></div>

          <!-- Sort -->
          <div class="ideas-sort">
            <label for="ideas-sort-select">정렬:</label>
            <select id="ideas-sort-select" class="sort-select">
              <option value="recent">최근 생성순</option>
              <option value="oldest">오래된순</option>
              <option value="updated">최근 수정순</option>
            </select>
          </div>

          <!-- Stats -->
          <div class="ideas-stats">
            <span class="stat-item">
              <span class="stat-label">총 아이디어:</span>
              <span class="stat-value" id="ideas-count">0</span>
            </span>
          </div>
        </div>

        <!-- Masonry Container -->
        <div class="masonry-container" id="ideas-masonry">
          <!-- Idea cards rendered here -->
        </div>

        <!-- Empty State -->
        <div class="ideas-empty-state" id="ideas-empty-state" style="display: none;">
          <div class="empty-icon">💡</div>
          <h3>아이디어가 없습니다</h3>
          <p>새로운 아이디어를 추가하여 시작하세요!</p>
          <button class="btn-primary" id="add-idea-empty-btn">
            <span class="btn-icon">+</span>
            <span class="btn-text">첫 아이디어 추가</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Initialize view after rendering
   */
  init() {
    console.log('[IdeasView] Initializing...');

    // Initialize components
    this.initializeComponents();

    // Load and display data
    this.refreshView();

    // Subscribe to data changes
    this.subscribeToData();

    // Attach event listeners
    this.attachEventListeners();

    console.log('[IdeasView] Initialized successfully');
  }

  /**
   * Initialize component instances
   */
  initializeComponents() {
    // SearchBar
    this.searchBar = new SearchBar('ideas-search-container', {
      placeholder: '아이디어 검색...',
      debounceMs: 300,
      onChange: (searchText) => {
        this.filterText = searchText;
        this.refreshView();
      }
    });
    this.searchBar.mount();

    // IdeaModal
    this.ideaModal = new IdeaModal('idea-modal', {
      onSave: (ideaData) => this.handleSaveIdea(ideaData)
    });
  }

  /**
   * Subscribe to data changes
   */
  subscribeToData() {
    dataManager.subscribe('ideas', (changeInfo) => {
      console.log('[IdeasView] Ideas changed:', changeInfo);
      this.refreshView();
    });
  }

  /**
   * Refresh view with current data
   */
  refreshView() {
    // Get all ideas
    this.ideas = [...dataManager.ideas];

    // Apply filter
    if (this.filterText) {
      const searchLower = this.filterText.toLowerCase();
      this.ideas = this.ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchLower) ||
        idea.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    this.sortIdeas();

    // Render ideas
    this.renderIdeas();

    // Update stats
    this.updateStats();
  }

  /**
   * Sort ideas based on current sortBy setting
   */
  sortIdeas() {
    switch (this.sortBy) {
      case 'recent':
        this.ideas.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;

      case 'oldest':
        this.ideas.sort((a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;

      case 'updated':
        this.ideas.sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        break;
    }
  }

  /**
   * Render ideas in masonry layout
   */
  renderIdeas() {
    const container = document.getElementById('ideas-masonry');
    const emptyState = document.getElementById('ideas-empty-state');

    if (!container) return;

    if (this.ideas.length === 0) {
      // Show empty state
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    // Hide empty state
    container.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    // Render idea cards
    container.innerHTML = this.ideas.map(idea => this.renderIdeaCard(idea)).join('');

    // Attach card event listeners
    this.attachCardListeners();
  }

  /**
   * Render a single idea card
   * @param {Object} idea - Idea object
   * @returns {string} HTML string
   */
  renderIdeaCard(idea) {
    const escapedTitle = ValidationUtils.escapeHtml(idea.title || '제목 없음');
    const escapedContent = ValidationUtils.escapeHtml(idea.content || '');

    // Truncate content for preview (max 200 chars)
    const contentPreview = escapedContent.length > 200 ?
      escapedContent.substring(0, 200) + '...' :
      escapedContent;

    // Format dates
    const createdDate = DateUtils.formatDateKorean(new Date(idea.createdAt));
    const updatedDate = idea.updatedAt ?
      DateUtils.formatDateKorean(new Date(idea.updatedAt)) :
      null;

    const dateDisplay = updatedDate && updatedDate !== createdDate ?
      `수정: ${updatedDate}` :
      createdDate;

    return `
      <div class="idea-card" data-id="${idea.id}">
        <!-- Card Header -->
        <div class="idea-card-header">
          <h3 class="idea-card-title">${escapedTitle}</h3>
          <div class="idea-card-actions">
            <button class="card-action-btn edit-idea-btn" data-id="${idea.id}" aria-label="수정" title="수정">
              ✏️
            </button>
            <button class="card-action-btn delete-idea-btn" data-id="${idea.id}" aria-label="삭제" title="삭제">
              🗑️
            </button>
          </div>
        </div>

        <!-- Card Content -->
        <div class="idea-card-content">
          ${contentPreview ? `<p>${contentPreview}</p>` : '<p class="idea-no-content">내용 없음</p>'}
        </div>

        <!-- Card Footer -->
        <div class="idea-card-footer">
          <span class="idea-card-date">${dateDisplay}</span>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add idea button (header)
    const addIdeaBtn = document.getElementById('add-idea-btn');
    if (addIdeaBtn) {
      addIdeaBtn.addEventListener('click', () => this.handleAddIdea());
    }

    // Add idea button (empty state)
    const addIdeaEmptyBtn = document.getElementById('add-idea-empty-btn');
    if (addIdeaEmptyBtn) {
      addIdeaEmptyBtn.addEventListener('click', () => this.handleAddIdea());
    }

    // Sort select
    const sortSelect = document.getElementById('ideas-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.refreshView();
      });
    }
  }

  /**
   * Attach event listeners to idea cards
   */
  attachCardListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-idea-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        this.handleEditIdea(id);
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-idea-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        this.handleDeleteIdea(id);
      });
    });

    // Card click to view/edit
    document.querySelectorAll('.idea-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking action buttons
        if (e.target.closest('.card-action-btn')) return;

        const id = card.dataset.id;
        this.handleEditIdea(id);
      });
    });
  }

  /**
   * Handle add idea
   */
  handleAddIdea() {
    this.ideaModal.show({
      title: '',
      content: ''
    });
  }

  /**
   * Handle edit idea
   * @param {string} id - Idea ID
   */
  handleEditIdea(id) {
    const idea = dataManager.getIdeaById(id);
    if (idea) {
      this.ideaModal.show(idea);
    }
  }

  /**
   * Handle delete idea
   * @param {string} id - Idea ID
   */
  handleDeleteIdea(id) {
    const idea = dataManager.getIdeaById(id);
    if (!idea) return;

    const confirmMsg = `"${idea.title}"을(를) 삭제하시겠습니까?`;
    if (confirm(confirmMsg)) {
      dataManager.deleteIdea(id);
    }
  }

  /**
   * Handle save idea from modal
   * @param {Object} ideaData - Idea data from modal
   */
  handleSaveIdea(ideaData) {
    if (ideaData.id) {
      // Update existing idea
      dataManager.updateIdea(ideaData.id, {
        title: ideaData.title,
        content: ideaData.content
      });
    } else {
      // Add new idea
      dataManager.addIdea(ideaData);
    }

    this.ideaModal.hide();
  }

  /**
   * Update stats display
   */
  updateStats() {
    const countEl = document.getElementById('ideas-count');
    if (countEl) {
      // Use original dataManager.ideas length (not filtered)
      countEl.textContent = dataManager.ideas.length;
    }
  }

  /**
   * Destroy view - cleanup
   */
  destroy() {
    console.log('[IdeasView] Destroying...');

    // Destroy components
    if (this.searchBar) {
      this.searchBar.destroy();
      this.searchBar = null;
    }

    if (this.ideaModal) {
      this.ideaModal.hide();
      this.ideaModal = null;
    }

    console.log('[IdeasView] Destroyed');
  }
}
