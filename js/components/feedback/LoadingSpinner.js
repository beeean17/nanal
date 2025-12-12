// components/feedback/LoadingSpinner.js - Loading Spinner Component
// Visual loading indicator for async operations

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * LoadingSpinner - Loading indicator component
 *
 * Options:
 * - size: 'small', 'medium', 'large' (default: 'medium')
 * - text: Loading text to display (string)
 * - overlay: Show as full-page overlay (boolean, default: false)
 * - color: Custom spinner color (string)
 * - type: 'spinner', 'dots', 'pulse' (default: 'spinner')
 */
export class LoadingSpinner extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      size: 'medium', // 'small', 'medium', 'large'
      text: '',
      overlay: false,
      color: null,
      type: 'spinner', // 'spinner', 'dots', 'pulse'
      ...options
    });

    this.state = {
      visible: false
    };
  }

  template() {
    const { size, text, overlay, color, type } = this.options;
    const { visible } = this.state;

    if (!visible) return '';

    const sizeClass = `loading-${size}`;
    const overlayClass = overlay ? 'loading-overlay' : '';
    const colorStyle = color ? `style="--spinner-color: ${color};"` : '';

    const spinnerContent = this.renderSpinner(type);

    return `
      <div class="loading-container ${overlayClass}" ${colorStyle}>
        <div class="loading-content ${sizeClass}">
          ${spinnerContent}
          ${text ? `<div class="loading-text">${ValidationUtils.escapeHtml(text)}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderSpinner(type) {
    switch (type) {
      case 'dots':
        return this.renderDots();
      case 'pulse':
        return this.renderPulse();
      case 'spinner':
      default:
        return this.renderCircularSpinner();
    }
  }

  renderCircularSpinner() {
    return `
      <div class="spinner">
        <div class="spinner-circle"></div>
      </div>
    `;
  }

  renderDots() {
    return `
      <div class="spinner-dots">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </div>
    `;
  }

  renderPulse() {
    return `
      <div class="spinner-pulse">
        <div class="spinner-pulse-ring"></div>
        <div class="spinner-pulse-ring"></div>
      </div>
    `;
  }

  setupEventListeners() {
    // Prevent clicks from passing through overlay
    if (this.options.overlay) {
      const overlay = this.$('.loading-overlay');
      if (overlay) {
        this.addEventListener(overlay, 'click', (e) => {
          e.stopPropagation();
        });
      }
    }
  }

  /**
   * Show the loading spinner
   */
  show() {
    this.setState({ visible: true });
  }

  /**
   * Hide the loading spinner
   */
  hide() {
    this.setState({ visible: false });
  }

  /**
   * Toggle loading spinner visibility
   */
  toggle() {
    this.setState({ visible: !this.state.visible });
  }

  /**
   * Check if spinner is visible
   * @returns {boolean}
   */
  isVisible() {
    return this.state.visible;
  }

  /**
   * Update loading text
   * @param {string} text - New loading text
   */
  setText(text) {
    this.options.text = text;
    this.render();
    this.setupEventListeners();
  }
}

/**
 * LoadingManager - Singleton for managing global loading state
 */
export class LoadingManager {
  constructor() {
    this.loadingCount = 0;
    this.containerId = 'loading-manager-container';
    this.spinner = null;
    this.ensureContainer();
    this.initSpinner();
  }

  ensureContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      document.body.appendChild(container);
    }
  }

  initSpinner() {
    this.spinner = new LoadingSpinner(this.containerId, {
      overlay: true,
      size: 'large',
      text: 'Loading...'
    });
    this.spinner.mount();
  }

  /**
   * Show global loading spinner
   * @param {string} text - Optional loading text
   */
  show(text = 'Loading...') {
    this.loadingCount++;
    if (this.spinner) {
      this.spinner.setText(text);
      this.spinner.show();
    }
  }

  /**
   * Hide global loading spinner
   */
  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0 && this.spinner) {
      this.spinner.hide();
    }
  }

  /**
   * Force hide loading spinner (reset count)
   */
  forceHide() {
    this.loadingCount = 0;
    if (this.spinner) {
      this.spinner.hide();
    }
  }

  /**
   * Check if loading is visible
   * @returns {boolean}
   */
  isLoading() {
    return this.loadingCount > 0;
  }

  /**
   * Wrap an async function with loading indicator
   * @param {Function} asyncFn - Async function to wrap
   * @param {string} text - Loading text
   * @returns {Function} Wrapped function
   */
  wrap(asyncFn, text = 'Loading...') {
    return async (...args) => {
      this.show(text);
      try {
        return await asyncFn(...args);
      } finally {
        this.hide();
      }
    };
  }

  /**
   * Execute async function with loading indicator
   * @param {Function} asyncFn - Async function to execute
   * @param {string} text - Loading text
   * @returns {Promise} Function result
   */
  async execute(asyncFn, text = 'Loading...') {
    this.show(text);
    try {
      return await asyncFn();
    } finally {
      this.hide();
    }
  }
}

// Singleton instance
export const loading = new LoadingManager();

export default LoadingSpinner;
