// components/common/Button.js - Reusable button component
import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * Button - Reusable button component with variants
 * @class
 * @extends Component
 */
export class Button extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      text: 'Button',
      icon: null, // Optional emoji or icon
      iconPosition: 'left', // 'left' or 'right'
      variant: 'primary', // 'primary', 'secondary', 'danger', 'outline'
      size: 'medium', // 'small', 'medium', 'large'
      disabled: false,
      loading: false,
      fullWidth: false,
      onClick: null,
      ...options
    });
  }

  template() {
    const { text, icon, iconPosition, variant, size, disabled, loading, fullWidth } = this.options;

    const classes = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth ? 'btn-full-width' : '',
      loading ? 'btn-loading' : '',
      disabled ? 'btn-disabled' : ''
    ].filter(Boolean).join(' ');

    const iconHtml = icon ? `<span class="btn-icon">${icon}</span>` : '';
    const textHtml = `<span class="btn-text">${ValidationUtils.escapeHtml(text)}</span>`;
    const loadingHtml = loading ? '<span class="btn-spinner"></span>' : '';

    let content = '';
    if (loading) {
      content = loadingHtml;
    } else if (iconPosition === 'left') {
      content = iconHtml + textHtml;
    } else {
      content = textHtml + iconHtml;
    }

    return `
      <button class="${classes}"
              ${disabled || loading ? 'disabled' : ''}
              aria-label="${ValidationUtils.escapeHtml(text)}">
        ${content}
      </button>
    `;
  }

  setupEventListeners() {
    if (this.options.onClick && !this.options.disabled && !this.options.loading) {
      const btn = this.$('button');
      if (btn) {
        this.addEventListener(btn, 'click', this.options.onClick);
      }
    }
  }

  /**
   * Set button text
   * @param {string} newText - New button text
   */
  setText(newText) {
    this.options.text = newText;
    const textEl = this.$('.btn-text');
    if (textEl) {
      textEl.textContent = ValidationUtils.escapeHtml(newText);
    }
  }

  /**
   * Set button icon
   * @param {string} newIcon - New icon (emoji or HTML)
   */
  setIcon(newIcon) {
    this.options.icon = newIcon;
    this.render();
  }

  /**
   * Enable button
   */
  enable() {
    this.options.disabled = false;
    const btn = this.$('button');
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('btn-disabled');
    }
  }

  /**
   * Disable button
   */
  disable() {
    this.options.disabled = true;
    const btn = this.$('button');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('btn-disabled');
    }
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    this.options.loading = isLoading;
    this.render();
  }

  /**
   * Check if button is disabled
   * @returns {boolean} True if disabled
   */
  isDisabled() {
    return this.options.disabled;
  }

  /**
   * Check if button is loading
   * @returns {boolean} True if loading
   */
  isLoading() {
    return this.options.loading;
  }

  /**
   * Trigger click programmatically
   */
  click() {
    if (!this.options.disabled && !this.options.loading && this.options.onClick) {
      this.options.onClick();
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
}

export default Button;
