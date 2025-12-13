// components/TodoList.js - Reusable Todo/Checklist Component
// Used for displaying tasks as a checklist

import { ValidationUtils, DateUtils, TimeUtils } from '../utils.js';

/**
 * TodoList - Reusable checklist component
 * Displays tasks with checkboxes, handles completion toggle, edit, delete
 * @class
 */
export class TodoList {
  /**
   * Create a TodoList component
   * @param {HTMLElement} containerEl - Container DOM element
   * @param {Object} options - Configuration options
   * @param {Function} [options.onToggle] - Callback when checkbox toggled
   * @param {Function} [options.onEdit] - Callback when edit button clicked
   * @param {Function} [options.onDelete] - Callback when delete button clicked
   * @param {Function} [options.onAdd] - Callback when add button clicked
   * @param {boolean} [options.showTime=true] - Show time badges for timed tasks
   * @param {boolean} [options.showDate=false] - Show dates for tasks
   * @param {boolean} [options.allowAdd=true] - Show add button
   * @param {string} [options.emptyMessage] - Message when no tasks
   */
  constructor(containerEl, options = {}) {
    if (!containerEl) {
      throw new Error('TodoList: containerEl is required');
    }

    this.container = containerEl;
    this.options = {
      onToggle: options.onToggle || (() => { }),
      onEdit: options.onEdit || (() => { }),
      onDelete: options.onDelete || (() => { }),
      onAdd: options.onAdd || (() => { }),
      showTime: options.showTime !== false,
      showDate: options.showDate || false,
      allowAdd: options.allowAdd !== false,
      emptyMessage: options.emptyMessage || '할 일이 없습니다.',
      ...options
    };

    // Bound methods
    this.boundHandleToggle = this.handleToggle.bind(this);
    this.boundHandleEdit = this.handleEdit.bind(this);
    this.boundHandleDelete = this.handleDelete.bind(this);
  }

  /**
   * Render todo list with tasks
   * @param {Array} tasks - Array of task objects
   */
  render(tasks = []) {
    this.tasks = tasks || [];

    const html = this.generateHTML();
    this.container.innerHTML = html;

    this.attachEventListeners();
  }

  /**
   * Generate complete todo list HTML
   * @returns {string} HTML string
   */
  generateHTML() {
    if (this.tasks.length === 0) {
      return this.renderEmptyState();
    }

    // Group tasks by completion status
    const incompleteTasks = this.tasks.filter(t => !t.isCompleted);
    const completedTasks = this.tasks.filter(t => t.isCompleted);

    return `
      <div class="todo-list-container">
        <!-- Incomplete tasks -->
        <div class="todo-section">
          ${incompleteTasks.map(task => this.renderTask(task)).join('')}
        </div>

        <!-- Completed tasks (collapsible) -->
        ${completedTasks.length > 0 ? `
          <div class="completed-section">
            <div class="completed-header" id="completed-toggle">
              <span>완료됨 (${completedTasks.length})</span>
              <span class="toggle-icon">▼</span>
            </div>
            <div class="completed-tasks" id="completed-tasks">
              ${completedTasks.map(task => this.renderTask(task)).join('')}
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
   * Render a single task item
   * @param {Object} task - Task object
   * @returns {string} HTML string
   */
  renderTask(task) {
    const escapedTitle = ValidationUtils.escapeHtml(task.title);
    const escapedDescription = ValidationUtils.escapeHtml(task.description || '');

    // Category Color (if used for border or accent)
    // const categoryColor = task.categoryId ? this.getCategoryColor(task.categoryId) : 'var(--color-primary)';

    return `
      <div class="todo-item ${task.isCompleted ? 'completed' : ''}"
           data-id="${task.id}"
           data-type="${task.itemType || (task.goalId ? 'subgoal' : 'task')}">

        <!-- Checkbox Wrapper -->
        <label class="checkbox-wrapper">
          <input type="checkbox"
                 class="todo-checkbox"
                 ${task.isCompleted ? 'checked' : ''}
                 data-id="${task.id}"
                 aria-label="완료 체크" />
          <span class="checkmark"></span>
        </label>

        <!-- Content -->
        <div class="todo-content">
          <span class="todo-title">${escapedTitle}</span>
          ${task.startTime ? `<span class="task-time-badge">${task.startTime}</span>` : ''}
        </div>

        <!-- Actions (Hover only) -->
        <div class="todo-actions">
          <button class="todo-action-btn edit-btn" data-id="${task.id}">✏️</button>
          <button class="todo-action-btn delete-btn" data-id="${task.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Checkbox toggle
    const checkboxes = this.container.querySelectorAll('.todo-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.boundHandleToggle);
    });

    // Edit buttons
    const editBtns = this.container.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', this.boundHandleEdit);
    });

    // Delete buttons
    const deleteBtns = this.container.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', this.boundHandleDelete);
    });

    // Completed section toggle
    const completedToggle = this.container.querySelector('#completed-toggle');
    if (completedToggle) {
      completedToggle.addEventListener('click', () => {
        const completedTasks = this.container.querySelector('#completed-tasks');
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

    // Double-click to edit (optional enhancement)
    const todoItems = this.container.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
      item.addEventListener('dblclick', (e) => {
        // Don't trigger if clicking on actions
        if (e.target.closest('.todo-actions')) return;

        const id = item.dataset.id;
        this.options.onEdit(id);
      });
    });
  }

  /**
   * Handle checkbox toggle
   * @param {Event} e - Change event
   */
  handleToggle(e) {
    const todoItem = e.target.closest('.todo-item');
    const id = todoItem.dataset.id;
    const itemType = todoItem.dataset.type;
    const isCompleted = e.target.checked;

    this.options.onToggle(id, isCompleted, itemType);
  }

  /**
   * Handle edit button click
   * @param {Event} e - Click event
   */
  handleEdit(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    this.options.onEdit(id);
  }

  /**
   * Handle delete button click
   * @param {Event} e - Click event
   */
  handleDelete(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const task = this.tasks.find(t => t.id === id);

    if (task) {
      const message = `"${task.title}"을(를) 삭제하시겠습니까?`;
      if (confirm(message)) {
        this.options.onDelete(id);
      }
    }
  }

  /**
   * Update list options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }

  /**
   * Get task by ID from current list
   * @param {string} id - Task ID
   * @returns {Object|null} Task or null
   */
  getTaskById(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  /**
   * Destroy component
   * Removes event listeners
   */
  destroy() {
    // Event listeners are removed when innerHTML is cleared
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default TodoList;
