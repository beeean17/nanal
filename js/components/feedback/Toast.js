// components/feedback/Toast.js - Toast Notification Component
// Replaces alert() with better UX notifications

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * Toast - Toast notification component (replaces alert())
 *
 * Options:
 * - message: Toast message text (string)
 * - type: 'success', 'error', 'warning', 'info' (default: 'info')
 * - duration: Auto-hide duration in ms (default: 3000, 0 = no auto-hide)
 * - position: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center' (default: 'top-right')
 * - closable: Show close button (boolean, default: true)
 * - onClose: Callback when toast closes (function)
 */
export class Toast extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      message: '',
      type: 'info', // 'success', 'error', 'warning', 'info'
      duration: 3000, // milliseconds, 0 = no auto-hide
      position: 'top-right',
      closable: true,
      onClose: null,
      ...options
    });

    this.state = {
      visible: false,
      closing: false
    };

    this.autoHideTimer = null;
  }

  template() {
    const { message, type, position, closable } = this.options;
    const { visible, closing } = this.state;

    if (!visible && !closing) return '';

    const positionClass = `toast-${position}`;
    const typeClass = `toast-${type}`;
    const closingClass = closing ? 'toast-closing' : '';
    const visibleClass = visible ? 'toast-visible' : '';

    const icon = this.getIcon(type);

    return `
      <div class="toast-container ${positionClass}">
        <div class="toast ${typeClass} ${visibleClass} ${closingClass}" role="alert" aria-live="polite">
          <div class="toast-content">
            ${icon ? `<span class="toast-icon">${icon}</span>` : ''}
            <span class="toast-message">${ValidationUtils.escapeHtml(message)}</span>
          </div>
          ${closable ? `
            <button type="button" class="toast-close-btn" aria-label="Close notification">
              ×
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  setupEventListeners() {
    const closeBtn = this.$('.toast-close-btn');
    if (closeBtn) {
      this.addEventListener(closeBtn, 'click', () => {
        this.hide();
      });
    }

    // Click toast to dismiss
    const toast = this.$('.toast');
    if (toast) {
      this.addEventListener(toast, 'click', (e) => {
        // Don't dismiss if clicking close button
        if (!e.target.closest('.toast-close-btn')) {
          this.hide();
        }
      });
    }
  }

  /**
   * Show the toast
   */
  show() {
    this.setState({ visible: true, closing: false });

    // Auto-hide after duration
    if (this.options.duration > 0) {
      this.clearAutoHideTimer();
      this.autoHideTimer = setTimeout(() => {
        this.hide();
      }, this.options.duration);
    }
  }

  /**
   * Hide the toast with animation
   */
  hide() {
    this.clearAutoHideTimer();
    this.setState({ closing: true });

    // Wait for animation to complete before removing
    setTimeout(() => {
      this.setState({ visible: false, closing: false });

      if (this.options.onClose) {
        this.options.onClose();
      }
    }, 300); // Match CSS animation duration
  }

  clearAutoHideTimer() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  destroy() {
    this.clearAutoHideTimer();
    super.destroy();
  }

  /**
   * Update toast message
   * @param {string} message - New message
   */
  setMessage(message) {
    this.options.message = message;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Update toast type
   * @param {string} type - New type (success/error/warning/info)
   */
  setType(type) {
    this.options.type = type;
    this.render();
    this.setupEventListeners();
  }
}

/**
 * ToastManager - Singleton for managing multiple toasts
 */
export class ToastManager {
  constructor() {
    this.toasts = [];
    this.containerId = 'toast-manager-container';
    this.ensureContainer();
  }

  ensureContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'toast-manager';
      document.body.appendChild(container);
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {object} options - Toast options
   * @returns {Toast} Toast instance
   */
  show(message, options = {}) {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toastContainer = document.createElement('div');
    toastContainer.id = toastId;

    const managerContainer = document.getElementById(this.containerId);
    managerContainer.appendChild(toastContainer);

    const toast = new Toast(toastId, {
      message,
      ...options,
      onClose: () => {
        if (options.onClose) {
          options.onClose();
        }
        this.remove(toastId);
      }
    });

    toast.mount();
    toast.show();

    this.toasts.push({ id: toastId, instance: toast });

    return toast;
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {object} options - Additional options
   */
  success(message, options = {}) {
    return this.show(message, { type: 'success', ...options });
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {object} options - Additional options
   */
  error(message, options = {}) {
    return this.show(message, { type: 'error', duration: 5000, ...options });
  }

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {object} options - Additional options
   */
  warning(message, options = {}) {
    return this.show(message, { type: 'warning', duration: 4000, ...options });
  }

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {object} options - Additional options
   */
  info(message, options = {}) {
    return this.show(message, { type: 'info', ...options });
  }

  /**
   * Remove a toast
   * @param {string} toastId - Toast ID to remove
   */
  remove(toastId) {
    const index = this.toasts.findIndex(t => t.id === toastId);
    if (index !== -1) {
      const toast = this.toasts[index];
      toast.instance.destroy();

      const element = document.getElementById(toastId);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }

      this.toasts.splice(index, 1);
    }
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    this.toasts.forEach(toast => {
      toast.instance.destroy();
      const element = document.getElementById(toast.id);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.toasts = [];
  }
}

// Singleton instance
export const toast = new ToastManager();

export default Toast;
