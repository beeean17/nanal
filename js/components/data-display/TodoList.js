// components/data-display/TodoList.js - Reusable Todo/Checklist Component
// Refactored to extend base Component class
// Used for displaying tasks as a checklist

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * TodoList - Reusable checklist component
 * Displays tasks with checkboxes, handles completion toggle, edit, delete
 * @class
 * @extends Component
 */
export class TodoList extends Component {
  /**
   * Create a TodoList component
   * @param {string} containerId - Container element ID
   * @param {Object} options - Configuration options
   * @param {Array} [options.items=[]] - Array of task/todo objects
   * @param {Function} [options.onToggle] - Callback when checkbox toggled (id, isCompleted)
   * @param {Function} [options.onItemClick] - Callback when item clicked (item)
   * @param {Function} [options.onEdit] - Callback when edit button clicked (id)
   * @param {Function} [options.onDelete] - Callback when delete button clicked (id)
   * @param {boolean} [options.showTime=true] - Show time badges for timed tasks
   * @param {boolean} [options.showDate=false] - Show dates for tasks
   * @param {boolean} [options.showActions=true] - Show edit/delete buttons
   * @param {string} [options.emptyMessage] - Message when no tasks
   */
  constructor(containerId, options = {}) {
    super(containerId, {
      items: [],
      onToggle: null,
      onItemClick: null,
      onEdit: null,
      onDelete: null,
      showTime: true,
      showDate: false,
      showActions: true,
      emptyMessage: '할 일이 없습니다.',
      ...options
    });

    // Bound methods
    this.boundHandleToggle = this.handleToggle.bind(this);
    this.boundHandleEdit = this.handleEdit.bind(this);
    this.boundHandleDelete = this.handleDelete.bind(this);
    this.boundHandleItemClick = this.handleItemClick.bind(this);
  }

  /**
   * Generate complete todo list HTML
   * @returns {string} HTML string
   */
  template() {
    const items = this.options.items || [];

    if (items.length === 0) {
      return this.renderEmptyState();
    }

    // Group items by completion status
    const incompleteItems = items.filter(t => !t.completed && !t.isCompleted);
    const completedItems = items.filter(t => t.completed || t.isCompleted);

    return `
      <div class="todo-list-container">
        <!-- Incomplete items -->
        <div class="todo-section">
          ${incompleteItems.map(item => this.renderItem(item)).join('')}
        </div>

        <!-- Completed items (collapsible) -->
        ${completedItems.length > 0 ? `
          <div class="completed-section">
            <div class="completed-header" id="completed-toggle">
              <span>완료됨 (${completedItems.length})</span>
              <span class="toggle-icon">▼</span>
            </div>
            <div class="completed-tasks" id="completed-tasks">
              ${completedItems.map(item => this.renderItem(item)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render empty state
   * @returns {string} HTML string
   */
  renderEmptyState() {
    return `
      <div class="todo-empty-state">
        <p class="empty-icon">✓</p>
        <p class="empty-message">${this.options.emptyMessage}</p>
      </div>
    `;
  }

  /**
   * Render a single item
   * @param {Object} item - Item object
   * @returns {string} HTML string
   */
  renderItem(item) {
    const escapedTitle = ValidationUtils.escapeHtml(item.title || '');
    const isCompleted = item.completed || item.isCompleted || false;

    return `
      <div class="todo-item ${isCompleted ? 'completed' : ''}"
           data-id="${item.id}">

        <!-- Checkbox Wrapper -->
        <label class="checkbox-wrapper" onclick="event.stopPropagation()">
          <input type="checkbox"
                 class="todo-checkbox"
                 ${isCompleted ? 'checked' : ''}
                 data-id="${item.id}"
                 aria-label="완료 체크" />
          <span class="checkmark"></span>
        </label>

        <!-- Content -->
        <div class="todo-content">
          <span class="todo-title">${escapedTitle}</span>
          ${this.options.showTime && item.startTime ? `<span class="task-time-badge">${item.startTime}</span>` : ''}
          ${this.options.showDate && item.date ? `<span class="task-date-badge">${item.date}</span>` : ''}
        </div>

        <!-- Actions (Hover only) -->
        ${this.options.showActions ? `
          <div class="todo-actions">
            <button class="todo-action-btn edit-btn" data-id="${item.id}" aria-label="수정">✏️</button>
            <button class="todo-action-btn delete-btn" data-id="${item.id}" aria-label="삭제">🗑️</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Checkbox toggle
    const checkboxes = this.$$('.todo-checkbox');
    checkboxes.forEach(checkbox => {
      this.addEventListener(checkbox, 'change', this.boundHandleToggle);
    });

    // Edit buttons
    if (this.options.showActions) {
      const editBtns = this.$$('.edit-btn');
      editBtns.forEach(btn => {
        this.addEventListener(btn, 'click', this.boundHandleEdit);
      });

      // Delete buttons
      const deleteBtns = this.$$('.delete-btn');
      deleteBtns.forEach(btn => {
        this.addEventListener(btn, 'click', this.boundHandleDelete);
      });
    }

    // Item click (for mobile tap)
    const todoItems = this.$$('.todo-item');
    todoItems.forEach(item => {
      this.addEventListener(item, 'click', this.boundHandleItemClick);
    });

    // Completed section toggle
    const completedToggle = this.$('#completed-toggle');
    if (completedToggle) {
      this.addEventListener(completedToggle, 'click', () => {
        const completedTasks = this.$('#completed-tasks');
        const icon = completedToggle.querySelector('.toggle-icon');

        if (completedTasks.style.display === 'none') {
          completedTasks.style.display = 'block';
          icon.textContent = '▼';
        } else {
          completedTasks.style.display = 'none';
          icon.textContent = '▶';
        }
      });
    }
  }

  /**
   * Handle checkbox toggle
   * @param {Event} e - Change event
   */
  handleToggle(e) {
    e.stopPropagation();
    const id = e.target.dataset.id;
    const isCompleted = e.target.checked;

    if (this.options.onToggle) {
      this.options.onToggle(id, isCompleted);
    }
  }

  /**
   * Handle item click
   * @param {Event} e - Click event
   */
  handleItemClick(e) {
    // Don't trigger if clicking on checkbox or actions
    if (e.target.closest('.checkbox-wrapper') || e.target.closest('.todo-actions')) {
      return;
    }

    const itemEl = e.currentTarget;
    const id = itemEl.dataset.id;
    const item = this.options.items.find(i => i.id === id);

    if (item && this.options.onItemClick) {
      this.options.onItemClick(item);
    }
  }

  /**
   * Handle edit button click
   * @param {Event} e - Click event
   */
  handleEdit(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;

    if (this.options.onEdit) {
      this.options.onEdit(id);
    }
  }

  /**
   * Handle delete button click
   * @param {Event} e - Click event
   */
  handleDelete(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const item = this.options.items.find(i => i.id === id);

    if (item) {
      const message = `"${item.title}"을(를) 삭제하시겠습니까?`;
      if (confirm(message)) {
        if (this.options.onDelete) {
          this.options.onDelete(id);
        }
      }
    }
  }

  /**
   * Get item by ID from current list
   * @param {string} id - Item ID
   * @returns {Object|null} Item or null
   */
  getItemById(id) {
    return this.options.items.find(i => i.id === id) || null;
  }
}

export default TodoList;
