// components/common/CategoryBadge.js - Category badge display component
import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * CategoryBadge - Displays a category badge with icon and name
 * @class
 * @extends Component
 */
export class CategoryBadge extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      categoryId: null,
      categoryName: 'Uncategorized',
      categoryIcon: '📁',
      categoryColor: '#8E8E93',
      size: 'medium', // 'small', 'medium', 'large'
      showIcon: true,
      showName: true,
      clickable: false,
      onClick: null,
      ...options
    });
  }

  template() {
    const { categoryName, categoryIcon, categoryColor, size, showIcon, showName, clickable } = this.options;

    const classes = [
      'category-badge',
      `badge-${size}`,
      clickable ? 'clickable' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}"
           style="border-color: ${categoryColor};"
           ${this.options.categoryId ? `data-category-id="${this.options.categoryId}"` : ''}>
        ${showIcon ? `<span class="badge-icon">${categoryIcon}</span>` : ''}
        ${showName ? `<span class="badge-name" style="color: ${categoryColor};">${ValidationUtils.escapeHtml(categoryName)}</span>` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    if (this.options.clickable && this.options.onClick) {
      const badge = this.$('.category-badge');
      if (badge) {
        this.addEventListener(badge, 'click', () => {
          this.options.onClick(this.options.categoryId);
        });
      }
    }
  }

  /**
   * Update category
   * @param {Object} category - Category object with id, name, icon, color
   */
  setCategory(category) {
    if (category) {
      this.options.categoryId = category.id;
      this.options.categoryName = category.name;
      this.options.categoryIcon = category.icon;
      this.options.categoryColor = category.color;
      this.render();
    }
  }

  /**
   * Get current category ID
   * @returns {string|null} Category ID
   */
  getCategoryId() {
    return this.options.categoryId;
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

export default CategoryBadge;
