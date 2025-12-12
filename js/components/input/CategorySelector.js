// components/input/CategorySelector.js - Category Selection Component
// Specialized dropdown for category selection with color indicators

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * CategorySelector - Category selection dropdown with color indicators
 *
 * Options:
 * - categories: Array of {id, name, color, icon} objects
 * - value: Selected category ID (string)
 * - placeholder: Placeholder text (string)
 * - disabled: Disabled state (boolean)
 * - onChange: Callback when selection changes (function)
 * - allowNone: Allow "No category" selection (boolean)
 * - noneText: Text for "no category" option (string)
 */
export class CategorySelector extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      categories: [],
      value: null,
      placeholder: 'Select a category...',
      disabled: false,
      onChange: null,
      allowNone: true,
      noneText: 'No Category',
      ...options
    });

    this.state = {
      isOpen: false,
      value: this.options.value
    };
  }

  template() {
    const { placeholder, disabled, allowNone, noneText } = this.options;
    const { isOpen, value } = this.state;

    const selectedCategory = this.options.categories.find(cat => cat.id === value);

    let displayContent;
    if (value === null) {
      displayContent = allowNone ? noneText : placeholder;
    } else if (selectedCategory) {
      displayContent = this.renderCategoryDisplay(selectedCategory);
    } else {
      displayContent = placeholder;
    }

    const disabledClass = disabled ? 'category-selector-disabled' : '';
    const openClass = isOpen ? 'category-selector-open' : '';

    return `
      <div class="category-selector-container ${disabledClass} ${openClass}">
        <div class="category-selector-trigger" tabindex="${disabled ? -1 : 0}">
          <div class="category-selector-display">
            ${displayContent}
          </div>
          <span class="category-selector-arrow">▼</span>
        </div>

        ${isOpen ? `
          <div class="category-selector-menu">
            ${this.renderCategories()}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderCategoryDisplay(category) {
    const { icon, name, color } = category;
    const escapedName = ValidationUtils.escapeHtml(name);

    return `
      <div class="category-display-item">
        ${icon ? `<span class="category-icon">${icon}</span>` : ''}
        <span class="category-color-indicator" style="background-color: ${color};"></span>
        <span class="category-name">${escapedName}</span>
      </div>
    `;
  }

  renderCategories() {
    const { categories, allowNone, noneText } = this.options;
    const { value } = this.state;

    let html = '';

    // Add "None" option if allowed
    if (allowNone) {
      const selectedClass = value === null ? 'category-option-selected' : '';
      html += `
        <div class="category-option ${selectedClass}" data-value="">
          <div class="category-display-item">
            <span class="category-color-indicator" style="background-color: transparent; border: 1px solid #ccc;"></span>
            <span class="category-name">${noneText}</span>
          </div>
          ${value === null ? '<span class="category-check">✓</span>' : ''}
        </div>
      `;
    }

    // Add category options
    categories.forEach(category => {
      const selected = category.id === value;
      const selectedClass = selected ? 'category-option-selected' : '';

      html += `
        <div class="category-option ${selectedClass}" data-value="${category.id}">
          ${this.renderCategoryDisplay(category)}
          ${selected ? '<span class="category-check">✓</span>' : ''}
        </div>
      `;
    });

    return html;
  }

  setupEventListeners() {
    // Trigger click
    const trigger = this.$('.category-selector-trigger');
    if (trigger) {
      this.addEventListener(trigger, 'click', (e) => {
        if (this.options.disabled) return;
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Keyboard navigation
      this.addEventListener(trigger, 'keydown', (e) => {
        if (this.options.disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDropdown();
        }
      });
    }

    // Option clicks
    const optionElements = this.$$('.category-option');
    optionElements.forEach(option => {
      this.addEventListener(option, 'click', (e) => {
        const value = option.dataset.value;
        this.selectCategory(value || null);
      });
    });

    // Close on outside click
    this.addEventListener(document, 'click', (e) => {
      if (this.state.isOpen && !this.container.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    if (this.state.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.setState({ isOpen: true });
  }

  closeDropdown() {
    this.setState({ isOpen: false });
  }

  selectCategory(categoryId) {
    this.setState({ value: categoryId });
    this.closeDropdown();

    if (this.options.onChange) {
      const selectedCategory = categoryId
        ? this.options.categories.find(cat => cat.id === categoryId)
        : null;
      this.options.onChange(categoryId, selectedCategory);
    }
  }

  /**
   * Get current selected category ID
   * @returns {string|null}
   */
  getValue() {
    return this.state.value;
  }

  /**
   * Get current selected category object
   * @returns {object|null}
   */
  getSelectedCategory() {
    if (!this.state.value) return null;
    return this.options.categories.find(cat => cat.id === this.state.value) || null;
  }

  /**
   * Set selected category programmatically
   * @param {string|null} categoryId - Category ID to select
   */
  setValue(categoryId) {
    this.setState({ value: categoryId });
  }

  /**
   * Update categories list
   * @param {Array} categories - New categories array
   */
  setCategories(categories) {
    this.options.categories = categories;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Enable/disable the selector
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default CategorySelector;
