// components/input/Dropdown.js - Custom Dropdown/Select Component
// Styleable dropdown with search and keyboard navigation

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * Dropdown - Custom dropdown/select component
 *
 * Options:
 * - options: Array of {value, label, disabled} objects
 * - value: Selected value (string/number)
 * - placeholder: Placeholder text (string)
 * - disabled: Disabled state (boolean)
 * - searchable: Enable search filtering (boolean)
 * - clearable: Show clear button (boolean)
 * - onChange: Callback when selection changes (function)
 * - maxHeight: Max height of dropdown menu (string)
 */
export class Dropdown extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      options: [],
      value: null,
      placeholder: 'Select an option...',
      disabled: false,
      searchable: false,
      clearable: false,
      onChange: null,
      maxHeight: '200px',
      ...options
    });

    this.state = {
      isOpen: false,
      value: this.options.value,
      searchQuery: '',
      highlightedIndex: -1
    };
  }

  template() {
    const { placeholder, disabled, searchable, clearable } = this.options;
    const { isOpen, value, searchQuery } = this.state;

    const selectedOption = this.options.options.find(opt => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const disabledClass = disabled ? 'dropdown-disabled' : '';
    const openClass = isOpen ? 'dropdown-open' : '';

    return `
      <div class="dropdown-container ${disabledClass} ${openClass}">
        <div class="dropdown-trigger" tabindex="${disabled ? -1 : 0}">
          <span class="dropdown-display">${ValidationUtils.escapeHtml(displayText)}</span>
          <div class="dropdown-actions">
            ${clearable && value ? `
              <button type="button" class="dropdown-clear-btn" aria-label="Clear selection">
                ×
              </button>
            ` : ''}
            <span class="dropdown-arrow">▼</span>
          </div>
        </div>

        ${isOpen ? `
          <div class="dropdown-menu" style="max-height: ${this.options.maxHeight};">
            ${searchable ? `
              <div class="dropdown-search">
                <input
                  type="text"
                  class="dropdown-search-input"
                  placeholder="Search..."
                  value="${ValidationUtils.escapeHtml(searchQuery)}"
                  autocomplete="off"
                />
              </div>
            ` : ''}
            <div class="dropdown-options">
              ${this.renderOptions()}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderOptions() {
    const { searchQuery, value, highlightedIndex } = this.state;
    const filteredOptions = this.getFilteredOptions();

    if (filteredOptions.length === 0) {
      return '<div class="dropdown-empty">No options found</div>';
    }

    return filteredOptions.map((option, index) => {
      const selected = option.value === value;
      const highlighted = index === highlightedIndex;
      const disabled = option.disabled;

      const selectedClass = selected ? 'dropdown-option-selected' : '';
      const highlightedClass = highlighted ? 'dropdown-option-highlighted' : '';
      const disabledClass = disabled ? 'dropdown-option-disabled' : '';

      return `
        <div
          class="dropdown-option ${selectedClass} ${highlightedClass} ${disabledClass}"
          data-value="${option.value}"
          data-index="${index}"
        >
          ${ValidationUtils.escapeHtml(option.label)}
          ${selected ? '<span class="dropdown-check">✓</span>' : ''}
        </div>
      `;
    }).join('');
  }

  getFilteredOptions() {
    const { searchQuery } = this.state;

    if (!searchQuery) {
      return this.options.options;
    }

    const query = searchQuery.toLowerCase();
    return this.options.options.filter(option =>
      option.label.toLowerCase().includes(query)
    );
  }

  setupEventListeners() {
    // Trigger click
    const trigger = this.$('.dropdown-trigger');
    if (trigger) {
      this.addEventListener(trigger, 'click', (e) => {
        if (this.options.disabled) return;
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Keyboard navigation on trigger
      this.addEventListener(trigger, 'keydown', (e) => {
        if (this.options.disabled) return;
        this.handleTriggerKeydown(e);
      });
    }

    // Clear button
    const clearBtn = this.$('.dropdown-clear-btn');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', (e) => {
        e.stopPropagation();
        this.clearSelection();
      });
    }

    // Search input
    const searchInput = this.$('.dropdown-search-input');
    if (searchInput) {
      this.addEventListener(searchInput, 'input', (e) => {
        this.handleSearch(e.target.value);
      });

      this.addEventListener(searchInput, 'keydown', (e) => {
        this.handleSearchKeydown(e);
      });
    }

    // Option clicks
    const optionElements = this.$$('.dropdown-option');
    optionElements.forEach(option => {
      this.addEventListener(option, 'click', (e) => {
        const value = option.dataset.value;
        const disabled = option.classList.contains('dropdown-option-disabled');
        if (!disabled) {
          this.selectOption(value);
        }
      });

      this.addEventListener(option, 'mouseenter', (e) => {
        const index = parseInt(option.dataset.index);
        this.setState({ highlightedIndex: index });
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
    this.setState({ isOpen: true, highlightedIndex: -1 });

    // Focus search input if searchable
    setTimeout(() => {
      const searchInput = this.$('.dropdown-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
  }

  closeDropdown() {
    this.setState({ isOpen: false, searchQuery: '', highlightedIndex: -1 });
  }

  selectOption(value) {
    this.setState({ value });
    this.closeDropdown();

    if (this.options.onChange) {
      const selectedOption = this.options.options.find(opt => opt.value === value);
      this.options.onChange(value, selectedOption);
    }
  }

  clearSelection() {
    this.setState({ value: null });

    if (this.options.onChange) {
      this.options.onChange(null, null);
    }
  }

  handleSearch(query) {
    this.setState({ searchQuery: query, highlightedIndex: -1 });
  }

  handleTriggerKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleDropdown();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.openDropdown();
    }
  }

  handleSearchKeydown(e) {
    const filteredOptions = this.getFilteredOptions();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.min(this.state.highlightedIndex + 1, filteredOptions.length - 1);
      this.setState({ highlightedIndex: newIndex });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.max(this.state.highlightedIndex - 1, 0);
      this.setState({ highlightedIndex: newIndex });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.highlightedIndex >= 0) {
        const option = filteredOptions[this.state.highlightedIndex];
        if (option && !option.disabled) {
          this.selectOption(option.value);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.closeDropdown();
    }
  }

  /**
   * Get current selected value
   * @returns {any}
   */
  getValue() {
    return this.state.value;
  }

  /**
   * Set selected value programmatically
   * @param {any} value - Value to select
   */
  setValue(value) {
    this.setState({ value });
  }

  /**
   * Update dropdown options
   * @param {Array} options - New options array
   */
  setOptions(options) {
    this.options.options = options;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Enable/disable the dropdown
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default Dropdown;
