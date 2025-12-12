// components/input/SearchBar.js - Search bar component
import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * SearchBar - Reusable search input component
 * @class
 * @extends Component
 */
export class SearchBar extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      placeholder: '검색...',
      debounceMs: 300, // Debounce search input
      showIcon: true,
      showClearButton: true,
      onChange: null, // Callback when search text changes
      onClear: null, // Callback when clear button clicked
      onSubmit: null, // Callback when Enter key pressed
      ...options
    });

    this.searchText = '';
    this.debounceTimer = null;
  }

  template() {
    const { placeholder, showIcon, showClearButton } = this.options;

    return `
      <div class="search-bar">
        <div class="search-input-container">
          ${showIcon ? '<span class="search-icon">🔍</span>' : ''}
          <input
            type="text"
            id="search-input"
            class="search-input"
            placeholder="${ValidationUtils.escapeHtml(placeholder)}"
            value="${ValidationUtils.escapeHtml(this.searchText)}"
            aria-label="${ValidationUtils.escapeHtml(placeholder)}"
          />
          ${showClearButton && this.searchText ? `
            <button class="search-clear-btn" id="search-clear-btn" aria-label="Clear search">
              ×
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const input = this.$('#search-input');
    if (!input) return;

    // Input event (with debounce)
    this.addEventListener(input, 'input', (e) => {
      this.handleInput(e.target.value);
    });

    // Submit on Enter
    this.addEventListener(input, 'keydown', (e) => {
      if (e.key === 'Enter' && this.options.onSubmit) {
        e.preventDefault();
        this.options.onSubmit(this.searchText);
      }
    });

    // Clear button
    if (this.options.showClearButton) {
      const clearBtn = this.$('#search-clear-btn');
      if (clearBtn) {
        this.addEventListener(clearBtn, 'click', () => {
          this.clear();
        });
      }
    }
  }

  /**
   * Handle input with debounce
   * @param {string} value - Input value
   */
  handleInput(value) {
    this.searchText = value;

    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      if (this.options.onChange) {
        this.options.onChange(this.searchText);
      }
    }, this.options.debounceMs);

    // Update clear button visibility
    this.updateClearButton();
  }

  /**
   * Update clear button visibility
   */
  updateClearButton() {
    const clearBtn = this.$('#search-clear-btn');
    const inputContainer = this.$('.search-input-container');

    if (!this.options.showClearButton || !inputContainer) return;

    if (this.searchText && !clearBtn) {
      // Add clear button
      const btn = document.createElement('button');
      btn.id = 'search-clear-btn';
      btn.className = 'search-clear-btn';
      btn.setAttribute('aria-label', 'Clear search');
      btn.textContent = '×';
      this.addEventListener(btn, 'click', () => this.clear());
      inputContainer.appendChild(btn);
    } else if (!this.searchText && clearBtn) {
      // Remove clear button
      clearBtn.remove();
    }
  }

  /**
   * Clear search
   */
  clear() {
    this.searchText = '';

    const input = this.$('#search-input');
    if (input) {
      input.value = '';
      input.focus();
    }

    // Update clear button
    this.updateClearButton();

    // Trigger callbacks
    if (this.options.onChange) {
      this.options.onChange('');
    }

    if (this.options.onClear) {
      this.options.onClear();
    }
  }

  /**
   * Set search text programmatically
   * @param {string} text - New search text
   */
  setText(text) {
    this.searchText = text;

    const input = this.$('#search-input');
    if (input) {
      input.value = text;
    }

    this.updateClearButton();
  }

  /**
   * Get current search text
   * @returns {string} Current search text
   */
  getText() {
    return this.searchText;
  }

  /**
   * Focus the search input
   */
  focus() {
    const input = this.$('#search-input');
    if (input) {
      input.focus();
    }
  }

  /**
   * Update options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.render();
  }

  onDestroy() {
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

export default SearchBar;
