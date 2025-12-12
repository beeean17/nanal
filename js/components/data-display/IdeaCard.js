// components/data-display/IdeaCard.js - Individual idea card component
import { Component } from '../base/Component.js';
import { ValidationUtils, DateUtils } from '../../utils.js';

/**
 * IdeaCard - Displays a single idea in card format
 * @class
 * @extends Component
 */
export class IdeaCard extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      idea: null, // Idea object with id, title, content, createdAt, updatedAt
      maxContentLength: 200, // Max chars for content preview
      onEdit: null, // Callback when edit button clicked
      onDelete: null, // Callback when delete button clicked
      onClick: null, // Callback when card clicked
      ...options
    });
  }

  template() {
    const { idea, maxContentLength } = this.options;

    if (!idea) {
      return '<div class="idea-card idea-card-empty">No idea provided</div>';
    }

    const escapedTitle = ValidationUtils.escapeHtml(idea.title || '제목 없음');
    const escapedContent = ValidationUtils.escapeHtml(idea.content || '');

    // Truncate content for preview
    const contentPreview = escapedContent.length > maxContentLength ?
      escapedContent.substring(0, maxContentLength) + '...' :
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
            <button class="card-action-btn edit-idea-btn" aria-label="수정" title="수정">
              ✏️
            </button>
            <button class="card-action-btn delete-idea-btn" aria-label="삭제" title="삭제">
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

  setupEventListeners() {
    const card = this.$('.idea-card');
    const editBtn = this.$('.edit-idea-btn');
    const deleteBtn = this.$('.delete-idea-btn');

    // Edit button
    if (editBtn && this.options.onEdit) {
      this.addEventListener(editBtn, 'click', (e) => {
        e.stopPropagation();
        this.options.onEdit(this.options.idea);
      });
    }

    // Delete button
    if (deleteBtn && this.options.onDelete) {
      this.addEventListener(deleteBtn, 'click', (e) => {
        e.stopPropagation();
        this.options.onDelete(this.options.idea.id);
      });
    }

    // Card click
    if (card && this.options.onClick) {
      this.addEventListener(card, 'click', (e) => {
        // Don't trigger if clicking action buttons
        if (e.target.closest('.card-action-btn')) return;
        this.options.onClick(this.options.idea);
      });
    }
  }

  /**
   * Update idea data
   * @param {Object} newIdea - New idea object
   */
  setIdea(newIdea) {
    this.options.idea = newIdea;
    this.render();
  }

  /**
   * Get current idea
   * @returns {Object} Current idea object
   */
  getIdea() {
    return this.options.idea;
  }

  /**
   * Update options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.render();
  }
}

export default IdeaCard;
