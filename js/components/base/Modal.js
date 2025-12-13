// components/base/Modal.js - Base Modal Component
/**
 * Modal - Base modal component
 *
 * Unlike regular components, modals create their own DOM element
 * and append to document.body. They use show/hide instead of mount/destroy.
 *
 * @class
 */
export class Modal {
  /**
   * Create a Modal component
   * @param {string} modalId - DOM ID for the modal
   * @param {Object} options - Configuration options
   * @param {string} [options.title] - Modal title
   * @param {Function} [options.onSave] - Callback when save button clicked
   * @param {Function} [options.onCancel] - Callback when cancel button clicked
   */
  constructor(modalId, options = {}) {
    this.modalId = modalId;
    this.options = {
      title: 'Modal',
      onSave: null,
      onCancel: null,
      onDelete: null,
      ...options
    };

    this.data = {};
    this.isVisible = false;
    this.keyHandler = null;
  }

  /**
   * Show modal with data
   * @param {Object} data - Data to populate form
   */
  show(data = {}) {
    this.data = data;

    // Create modal if doesn't exist
    let modal = document.getElementById(this.modalId);
    if (!modal) {
      modal = this.create();
      document.body.appendChild(modal);
    }

    // Populate form
    this.populateForm(data);

    // Show/hide delete button based on whether we're editing
    const deleteBtn = modal.querySelector(`#${this.modalId}-delete`);
    if (deleteBtn) {
      deleteBtn.style.display = (data.id && this.options.onDelete) ? 'inline-block' : 'none';
    }

    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);

    // Focus first input
    const firstInput = modal.querySelector('input, textarea, select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    this.isVisible = true;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Hide modal
   */
  hide() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);

    this.isVisible = false;
    this.data = {};

    // Remove key handler
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  /**
   * Create modal DOM element
   * @returns {HTMLElement} Modal element
   */
  create() {
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-close="true"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">${this.options.title}</h2>
          <button class="modal-close-btn" data-close="true" aria-label="닫기">×</button>
        </div>
        <div class="modal-body">
          ${this.renderForm()}
        </div>
        <div class="modal-footer">
          <div class="modal-footer-left">
            <button class="btn btn-danger" id="${this.modalId}-delete" style="display: none;">삭제</button>
          </div>
          <div class="modal-footer-right">
            <button class="btn btn-secondary" id="${this.modalId}-cancel">취소</button>
            <button class="btn btn-primary" id="${this.modalId}-save">저장</button>
          </div>
        </div>
      </div>
    `;
    return modal;
  }

  /**
   * Render form content (override in subclasses)
   * @returns {string} HTML string
   */
  renderForm() {
    return '<p>Override renderForm() in subclass</p>';
  }

  /**
   * Populate form with data (override in subclasses)
   * @param {Object} data - Data to populate
   */
  populateForm(data) {
    // Override in subclasses
  }

  /**
   * Get form data (override in subclasses)
   * @returns {Object|null} Form data or null if validation fails
   */
  getData() {
    // Override in subclasses
    return {};
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    // Remove old listeners by recreating buttons (simple approach)
    const saveBtn = modal.querySelector(`#${this.modalId}-save`);
    if (saveBtn) {
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

      newSaveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSave();
      });
    }

    const cancelBtn = modal.querySelector(`#${this.modalId}-cancel`);
    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

      newCancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCancel();
      });
    }

    // Delete button
    const deleteBtn = modal.querySelector(`#${this.modalId}-delete`);
    if (deleteBtn) {
      const newDeleteBtn = deleteBtn.cloneNode(true);
      // Preserve display style
      newDeleteBtn.style.display = deleteBtn.style.display;
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

      newDeleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleDelete();
      });
    }

    // Close buttons (overlay, X button)
    const closeBtns = modal.querySelectorAll('[data-close="true"]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCancel();
      });
    });

    // Prevent closing when clicking modal content
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // ESC key to close
    this.keyHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.handleCancel();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Handle save button click
   */
  handleSave() {
    const data = this.getData();
    if (data) {
      if (this.options.onSave) {
        this.options.onSave(data);
      }
    }
  }

  /**
   * Handle delete button click
   */
  handleDelete() {
    if (!this.data.id) return;

    const confirmMsg = '정말 삭제하시겠습니까?';
    if (confirm(confirmMsg)) {
      if (this.options.onDelete) {
        this.options.onDelete(this.data.id);
      }
      this.hide();
    }
  }

  /**
   * Handle cancel button click
   */
  handleCancel() {
    if (this.options.onCancel) {
      this.options.onCancel();
    }
    this.hide();
  }

  /**
   * Destroy modal (remove from DOM)
   */
  destroy() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }

    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Helper to get form element
   * @param {string} selector - CSS selector
   * @returns {Element|null}
   */
  $(selector) {
    const modal = document.getElementById(this.modalId);
    return modal ? modal.querySelector(selector) : null;
  }

  /**
   * Helper to get all matching elements
   * @param {string} selector - CSS selector
   * @returns {NodeList}
   */
  $$(selector) {
    const modal = document.getElementById(this.modalId);
    return modal ? modal.querySelectorAll(selector) : [];
  }
}

export default Modal;
