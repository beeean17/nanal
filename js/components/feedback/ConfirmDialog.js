// components/feedback/ConfirmDialog.js - Confirm Dialog Component
// Replaces confirm() with better UX

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * ConfirmDialog - Confirmation dialog component (replaces confirm())
 *
 * Options:
 * - title: Dialog title (string)
 * - message: Confirmation message (string)
 * - confirmText: Confirm button text (string, default: 'Confirm')
 * - cancelText: Cancel button text (string, default: 'Cancel')
 * - type: 'default', 'danger', 'warning', 'info' (default: 'default')
 * - icon: Icon to display (string)
 * - onConfirm: Callback when confirmed (function)
 * - onCancel: Callback when cancelled (function)
 * - closeOnOverlay: Close when clicking overlay (boolean, default: true)
 */
export class ConfirmDialog extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      title: 'Confirm',
      message: 'Are you sure?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'default', // 'default', 'danger', 'warning', 'info'
      icon: null,
      onConfirm: null,
      onCancel: null,
      closeOnOverlay: true,
      ...options
    });

    this.state = {
      visible: false
    };

    this.resolvePromise = null;
    this.rejectPromise = null;
  }

  template() {
    const { title, message, confirmText, cancelText, type, icon } = this.options;
    const { visible } = this.state;

    if (!visible) return '';

    const typeClass = `confirm-dialog-${type}`;
    const iconDisplay = icon || this.getDefaultIcon(type);

    return `
      <div class="confirm-dialog-overlay">
        <div class="confirm-dialog ${typeClass}" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          ${iconDisplay ? `
            <div class="confirm-dialog-icon">
              ${iconDisplay}
            </div>
          ` : ''}

          <div class="confirm-dialog-content">
            <h3 id="confirm-dialog-title" class="confirm-dialog-title">
              ${ValidationUtils.escapeHtml(title)}
            </h3>

            <p class="confirm-dialog-message">
              ${ValidationUtils.escapeHtml(message)}
            </p>
          </div>

          <div class="confirm-dialog-actions">
            <button type="button" class="confirm-dialog-btn confirm-dialog-cancel-btn">
              ${ValidationUtils.escapeHtml(cancelText)}
            </button>
            <button type="button" class="confirm-dialog-btn confirm-dialog-confirm-btn">
              ${ValidationUtils.escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getDefaultIcon(type) {
    const icons = {
      default: '❓',
      danger: '⚠️',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.default;
  }

  setupEventListeners() {
    // Confirm button
    const confirmBtn = this.$('.confirm-dialog-confirm-btn');
    if (confirmBtn) {
      this.addEventListener(confirmBtn, 'click', () => {
        this.confirm();
      });
    }

    // Cancel button
    const cancelBtn = this.$('.confirm-dialog-cancel-btn');
    if (cancelBtn) {
      this.addEventListener(cancelBtn, 'click', () => {
        this.cancel();
      });
    }

    // Overlay click
    if (this.options.closeOnOverlay) {
      const overlay = this.$('.confirm-dialog-overlay');
      if (overlay) {
        this.addEventListener(overlay, 'click', (e) => {
          if (e.target === overlay) {
            this.cancel();
          }
        });
      }
    }

    // Keyboard events
    this.addEventListener(document, 'keydown', (e) => {
      if (!this.state.visible) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.cancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.confirm();
      }
    });

    // Focus confirm button
    setTimeout(() => {
      const confirmBtn = this.$('.confirm-dialog-confirm-btn');
      if (confirmBtn) {
        confirmBtn.focus();
      }
    }, 100);
  }

  /**
   * Show the dialog
   * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
   */
  show() {
    this.setState({ visible: true });

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });
  }

  /**
   * Hide the dialog
   */
  hide() {
    this.setState({ visible: false });
  }

  /**
   * Confirm action
   */
  confirm() {
    this.hide();

    if (this.options.onConfirm) {
      this.options.onConfirm();
    }

    if (this.resolvePromise) {
      this.resolvePromise(true);
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }

  /**
   * Cancel action
   */
  cancel() {
    this.hide();

    if (this.options.onCancel) {
      this.options.onCancel();
    }

    if (this.resolvePromise) {
      this.resolvePromise(false);
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }
}

/**
 * ConfirmDialogManager - Singleton for managing confirm dialogs
 */
export class ConfirmDialogManager {
  constructor() {
    this.containerId = 'confirm-dialog-manager-container';
    this.ensureContainer();
  }

  ensureContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      document.body.appendChild(container);
    }
  }

  /**
   * Show a confirm dialog
   * @param {string} message - Confirmation message
   * @param {object} options - Dialog options
   * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
   */
  async show(message, options = {}) {
    const dialogId = `confirm-dialog-${Date.now()}`;
    const dialogContainer = document.createElement('div');
    dialogContainer.id = dialogId;

    const managerContainer = document.getElementById(this.containerId);
    managerContainer.appendChild(dialogContainer);

    const dialog = new ConfirmDialog(dialogId, {
      message,
      ...options
    });

    dialog.mount();

    try {
      const result = await dialog.show();
      return result;
    } finally {
      // Cleanup after dialog closes
      setTimeout(() => {
        dialog.destroy();
        if (dialogContainer.parentNode) {
          dialogContainer.parentNode.removeChild(dialogContainer);
        }
      }, 300);
    }
  }

  /**
   * Show default confirmation
   * @param {string} message - Message to display
   * @param {string} title - Dialog title
   * @returns {Promise<boolean>}
   */
  async confirm(message, title = 'Confirm') {
    return this.show(message, {
      title,
      type: 'default'
    });
  }

  /**
   * Show danger confirmation (for destructive actions)
   * @param {string} message - Message to display
   * @param {string} title - Dialog title
   * @returns {Promise<boolean>}
   */
  async danger(message, title = 'Warning') {
    return this.show(message, {
      title,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  }

  /**
   * Show warning confirmation
   * @param {string} message - Message to display
   * @param {string} title - Dialog title
   * @returns {Promise<boolean>}
   */
  async warning(message, title = 'Warning') {
    return this.show(message, {
      title,
      type: 'warning'
    });
  }

  /**
   * Show info confirmation
   * @param {string} message - Message to display
   * @param {string} title - Dialog title
   * @returns {Promise<boolean>}
   */
  async info(message, title = 'Information') {
    return this.show(message, {
      title,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  }

  /**
   * Ask for delete confirmation
   * @param {string} itemName - Name of item to delete
   * @returns {Promise<boolean>}
   */
  async confirmDelete(itemName) {
    return this.danger(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      'Delete Confirmation'
    );
  }

  /**
   * Ask for discard changes confirmation
   * @returns {Promise<boolean>}
   */
  async confirmDiscard() {
    return this.warning(
      'You have unsaved changes. Are you sure you want to discard them?',
      'Discard Changes'
    );
  }

  /**
   * Ask for logout confirmation
   * @returns {Promise<boolean>}
   */
  async confirmLogout() {
    return this.confirm(
      'Are you sure you want to log out?',
      'Logout'
    );
  }
}

// Singleton instance
export const confirm = new ConfirmDialogManager();

export default ConfirmDialog;
