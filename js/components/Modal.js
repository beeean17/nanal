// components/Modal.js - Reusable Modal Components
// Base Modal class and specialized modals (Task, Goal, Habit, Idea)

import { ValidationUtils, DateUtils, TimeUtils, IDUtils } from '../utils.js';

/**
 * Modal - Base modal component
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
      title: options.title || 'Modal',
      onSave: options.onSave || (() => {}),
      onCancel: options.onCancel || (() => {}),
      ...options
    };

    this.data = {};
    this.isVisible = false;
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

    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);

    // Focus first input
    const firstInput = modal.querySelector('input, textarea');
    if (firstInput) {
      firstInput.focus();
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
          <button class="btn-primary" id="${this.modalId}-save">저장</button>
          <button class="btn-secondary" id="${this.modalId}-cancel">취소</button>
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
   * @returns {Object} Form data
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

    // Save button
    const saveBtn = modal.querySelector(`#${this.modalId}-save`);
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        this.handleSave();
      };
    }

    // Cancel button
    const cancelBtn = modal.querySelector(`#${this.modalId}-cancel`);
    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.preventDefault();
        this.handleCancel();
      };
    }

    // Close buttons (overlay, X button)
    const closeBtns = modal.querySelectorAll('[data-close="true"]');
    closeBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        this.handleCancel();
      };
    });

    // Prevent closing when clicking modal content
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.onclick = (e) => {
        e.stopPropagation();
      };
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
      this.options.onSave(data);
      this.hide();
    }
  }

  /**
   * Handle cancel button click
   */
  handleCancel() {
    this.options.onCancel();
    this.hide();
  }

  /**
   * Destroy modal
   */
  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.remove();
    }
  }
}

// ============================================================
// TASK MODAL
// ============================================================

/**
 * TaskModal - Modal for creating/editing tasks
 * @class
 * @extends Modal
 */
export class TaskModal extends Modal {
  constructor(options = {}) {
    super('task-modal', {
      title: '일정 추가',
      ...options
    });
    this.categories = options.categories || [];
  }

  renderForm() {
    return `
      <form id="task-form" class="modal-form">
        <div class="form-group">
          <label for="task-title">제목 *</label>
          <input type="text" id="task-title" name="title" required maxlength="100" placeholder="할 일을 입력하세요" />
        </div>

        <div class="form-group">
          <label for="task-description">설명</label>
          <textarea id="task-description" name="description" rows="3" maxlength="500" placeholder="상세 설명 (선택사항)"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="task-date">날짜 *</label>
            <input type="date" id="task-date" name="date" required />
          </div>

          <div class="form-group">
            <label for="task-category">카테고리</label>
            <select id="task-category" name="categoryId">
              ${this.categories.map(cat => `
                <option value="${cat.id}">${cat.icon} ${cat.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="task-start-time">시작 시간</label>
            <input type="time" id="task-start-time" name="startTime" />
          </div>

          <div class="form-group">
            <label for="task-end-time">종료 시간</label>
            <input type="time" id="task-end-time" name="endTime" />
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="task-all-day" name="isAllDay" />
            <span>종일</span>
          </label>
        </div>
      </form>
    `;
  }

  populateForm(data) {
    const form = document.getElementById('task-form');
    if (!form) return;

    // Set title
    const titleEl = form.querySelector('#task-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      // Update modal title
      const modalTitle = document.querySelector(`#${this.modalId} .modal-title`);
      if (modalTitle) {
        modalTitle.textContent = data.id ? '일정 수정' : '일정 추가';
      }
    }

    // Set description
    const descEl = form.querySelector('#task-description');
    if (descEl) descEl.value = data.description || '';

    // Set date
    const dateEl = form.querySelector('#task-date');
    if (dateEl) dateEl.value = data.date || DateUtils.getToday();

    // Set times
    const startTimeEl = form.querySelector('#task-start-time');
    if (startTimeEl) startTimeEl.value = data.startTime || '';

    const endTimeEl = form.querySelector('#task-end-time');
    if (endTimeEl) endTimeEl.value = data.endTime || '';

    // Set category
    const categoryEl = form.querySelector('#task-category');
    if (categoryEl && data.categoryId) {
      categoryEl.value = data.categoryId;
    }

    // Set all-day
    const allDayEl = form.querySelector('#task-all-day');
    if (allDayEl) allDayEl.checked = data.isAllDay || false;
  }

  getData() {
    const form = document.getElementById('task-form');
    if (!form) return null;

    const title = form.querySelector('#task-title').value.trim();
    if (!title) {
      alert('제목을 입력해주세요.');
      return null;
    }

    const description = form.querySelector('#task-description').value.trim();
    const date = form.querySelector('#task-date').value;
    const startTime = form.querySelector('#task-start-time').value;
    const endTime = form.querySelector('#task-end-time').value;
    const categoryId = form.querySelector('#task-category').value;
    const isAllDay = form.querySelector('#task-all-day').checked;

    // Validate date
    if (!date || !ValidationUtils.validateDateFormat(date)) {
      alert('올바른 날짜를 선택해주세요.');
      return null;
    }

    // Validate time range if both provided
    if (startTime && endTime) {
      if (!TimeUtils.isValidTimeRange(startTime, endTime)) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return null;
      }
    }

    return {
      id: this.data.id || null,
      title,
      description,
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      categoryId: categoryId || 'cat_other',
      isAllDay,
      isCompleted: this.data.isCompleted || false
    };
  }

  setCategories(categories) {
    this.categories = categories;
  }
}

// ============================================================
// GOAL MODAL
// ============================================================

/**
 * GoalModal - Modal for creating/editing goals
 * @class
 * @extends Modal
 */
export class GoalModal extends Modal {
  constructor(options = {}) {
    super('goal-modal', {
      title: '목표 추가',
      ...options
    });
    this.categories = options.categories || [];
  }

  renderForm() {
    return `
      <form id="goal-form" class="modal-form">
        <div class="form-group">
          <label for="goal-title">목표 *</label>
          <input type="text" id="goal-title" name="title" required maxlength="100" placeholder="달성하고 싶은 목표" />
        </div>

        <div class="form-group">
          <label for="goal-description">설명</label>
          <textarea id="goal-description" name="description" rows="3" maxlength="500" placeholder="목표에 대한 설명"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="goal-start-date">시작일 *</label>
            <input type="date" id="goal-start-date" name="startDate" required />
          </div>

          <div class="form-group">
            <label for="goal-end-date">종료일 *</label>
            <input type="date" id="goal-end-date" name="endDate" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="goal-category">카테고리</label>
            <select id="goal-category" name="categoryId">
              ${this.categories.map(cat => `
                <option value="${cat.id}">${cat.icon} ${cat.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="goal-progress">진행률 (%)</label>
            <input type="number" id="goal-progress" name="progress" min="0" max="100" value="0" />
          </div>
        </div>
      </form>
    `;
  }

  populateForm(data) {
    const form = document.getElementById('goal-form');
    if (!form) return;

    const titleEl = form.querySelector('#goal-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = document.querySelector(`#${this.modalId} .modal-title`);
      if (modalTitle) {
        modalTitle.textContent = data.id ? '목표 수정' : '목표 추가';
      }
    }

    const descEl = form.querySelector('#goal-description');
    if (descEl) descEl.value = data.description || '';

    const startDateEl = form.querySelector('#goal-start-date');
    if (startDateEl) startDateEl.value = data.startDate || DateUtils.getToday();

    const endDateEl = form.querySelector('#goal-end-date');
    if (endDateEl) endDateEl.value = data.endDate || DateUtils.getToday();

    const categoryEl = form.querySelector('#goal-category');
    if (categoryEl && data.categoryId) {
      categoryEl.value = data.categoryId;
    }

    const progressEl = form.querySelector('#goal-progress');
    if (progressEl) progressEl.value = data.progress || 0;
  }

  getData() {
    const form = document.getElementById('goal-form');
    if (!form) return null;

    const title = form.querySelector('#goal-title').value.trim();
    if (!title) {
      alert('목표를 입력해주세요.');
      return null;
    }

    const description = form.querySelector('#goal-description').value.trim();
    const startDate = form.querySelector('#goal-start-date').value;
    const endDate = form.querySelector('#goal-end-date').value;
    const categoryId = form.querySelector('#goal-category').value;
    const progress = parseInt(form.querySelector('#goal-progress').value) || 0;

    if (new Date(endDate) < new Date(startDate)) {
      alert('종료일은 시작일보다 늦어야 합니다.');
      return null;
    }

    return {
      id: this.data.id || null,
      title,
      description,
      startDate,
      endDate,
      categoryId: categoryId || 'cat_other',
      progress: Math.max(0, Math.min(100, progress))
    };
  }

  setCategories(categories) {
    this.categories = categories;
  }
}

// ============================================================
// HABIT MODAL
// ============================================================

/**
 * HabitModal - Modal for creating/editing habits
 * @class
 * @extends Modal
 */
export class HabitModal extends Modal {
  constructor(options = {}) {
    super('habit-modal', {
      title: '습관 추가',
      ...options
    });
    this.categories = options.categories || [];
  }

  renderForm() {
    const emojiOptions = ['✅', '💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '📝', '🎯'];

    return `
      <form id="habit-form" class="modal-form">
        <div class="form-group">
          <label for="habit-title">습관 *</label>
          <input type="text" id="habit-title" name="title" required maxlength="100" placeholder="만들고 싶은 습관" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="habit-icon">아이콘</label>
            <select id="habit-icon" name="icon">
              ${emojiOptions.map(emoji => `<option value="${emoji}">${emoji}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="habit-category">카테고리</label>
            <select id="habit-category" name="categoryId">
              ${this.categories.map(cat => `
                <option value="${cat.id}">${cat.icon} ${cat.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="habit-active" name="isActive" checked />
            <span>활성화</span>
          </label>
        </div>
      </form>
    `;
  }

  populateForm(data) {
    const form = document.getElementById('habit-form');
    if (!form) return;

    const titleEl = form.querySelector('#habit-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = document.querySelector(`#${this.modalId} .modal-title`);
      if (modalTitle) {
        modalTitle.textContent = data.id ? '습관 수정' : '습관 추가';
      }
    }

    const iconEl = form.querySelector('#habit-icon');
    if (iconEl && data.icon) iconEl.value = data.icon;

    const categoryEl = form.querySelector('#habit-category');
    if (categoryEl && data.categoryId) {
      categoryEl.value = data.categoryId;
    }

    const activeEl = form.querySelector('#habit-active');
    if (activeEl) activeEl.checked = data.isActive !== false;
  }

  getData() {
    const form = document.getElementById('habit-form');
    if (!form) return null;

    const title = form.querySelector('#habit-title').value.trim();
    if (!title) {
      alert('습관을 입력해주세요.');
      return null;
    }

    const icon = form.querySelector('#habit-icon').value;
    const categoryId = form.querySelector('#habit-category').value;
    const isActive = form.querySelector('#habit-active').checked;

    return {
      id: this.data.id || null,
      title,
      icon,
      categoryId: categoryId || 'cat_personal',
      isActive
    };
  }

  setCategories(categories) {
    this.categories = categories;
  }
}

// ============================================================
// IDEA MODAL
// ============================================================

/**
 * IdeaModal - Modal for creating/editing ideas
 * @class
 * @extends Modal
 */
export class IdeaModal extends Modal {
  constructor(options = {}) {
    super('idea-modal', {
      title: '새 아이디어',
      ...options
    });
  }

  renderForm() {
    return `
      <form id="idea-form" class="modal-form">
        <div class="form-group">
          <label for="idea-title">제목 *</label>
          <input type="text" id="idea-title" name="title" required maxlength="100" placeholder="아이디어 제목" />
        </div>

        <div class="form-group">
          <label for="idea-content">내용</label>
          <textarea id="idea-content" name="content" rows="8" maxlength="5000" placeholder="아이디어를 자유롭게 작성하세요..."></textarea>
        </div>
      </form>
    `;
  }

  populateForm(data) {
    const form = document.getElementById('idea-form');
    if (!form) return;

    const titleEl = form.querySelector('#idea-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = document.querySelector(`#${this.modalId} .modal-title`);
      if (modalTitle) {
        modalTitle.textContent = data.id ? '아이디어 수정' : '새 아이디어';
      }
    }

    const contentEl = form.querySelector('#idea-content');
    if (contentEl) contentEl.value = data.content || '';
  }

  getData() {
    const form = document.getElementById('idea-form');
    if (!form) return null;

    const title = form.querySelector('#idea-title').value.trim();
    if (!title) {
      alert('제목을 입력해주세요.');
      return null;
    }

    const content = form.querySelector('#idea-content').value.trim();

    return {
      id: this.data.id || null,
      title,
      content
    };
  }
}

// ============================================================
// FIXED SCHEDULE MODAL
// ============================================================

/**
 * FixedScheduleModal - Modal for creating/editing fixed schedules (timetable)
 * @class
 * @extends Modal
 */
export class FixedScheduleModal extends Modal {
  constructor(containerId, options = {}) {
    super(containerId, {
      title: '고정 일정',
      ...options
    });
    this.categories = options.categories || [];
  }

  renderForm() {
    const categoryOptions = this.categories.map(cat =>
      `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');

    return `
      <form id="fixed-schedule-form" class="modal-form">
        <div class="form-group">
          <label for="schedule-title">제목 *</label>
          <input type="text" id="schedule-title" name="title" required maxlength="100" placeholder="일정 제목" />
        </div>

        <div class="form-group">
          <label for="schedule-category">카테고리</label>
          <select id="schedule-category" name="categoryId">
            ${categoryOptions}
          </select>
        </div>

        <div class="form-group">
          <label>요일 *</label>
          <div class="checkbox-group">
            <label><input type="checkbox" name="dayOfWeek" value="1" /> 월</label>
            <label><input type="checkbox" name="dayOfWeek" value="2" /> 화</label>
            <label><input type="checkbox" name="dayOfWeek" value="3" /> 수</label>
            <label><input type="checkbox" name="dayOfWeek" value="4" /> 목</label>
            <label><input type="checkbox" name="dayOfWeek" value="5" /> 금</label>
            <label><input type="checkbox" name="dayOfWeek" value="6" /> 토</label>
            <label><input type="checkbox" name="dayOfWeek" value="0" /> 일</label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="schedule-start">시작 시간 *</label>
            <input type="time" id="schedule-start" name="startTime" required />
          </div>
          <div class="form-group">
            <label for="schedule-end">종료 시간 *</label>
            <input type="time" id="schedule-end" name="endTime" required />
          </div>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" id="schedule-active" name="isActive" checked />
            활성화
          </label>
        </div>
      </form>
    `;
  }

  populateForm(data) {
    const form = document.getElementById('fixed-schedule-form');
    if (!form) return;

    const titleEl = form.querySelector('#schedule-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = document.querySelector(`#${this.modalId} .modal-title`);
      if (modalTitle) {
        modalTitle.textContent = data.id ? '고정 일정 수정' : '새 고정 일정';
      }
    }

    const categoryEl = form.querySelector('#schedule-category');
    if (categoryEl && data.categoryId) categoryEl.value = data.categoryId;

    // Set day of week checkboxes
    const dayCheckboxes = form.querySelectorAll('input[name="dayOfWeek"]');
    dayCheckboxes.forEach(checkbox => {
      checkbox.checked = data.dayOfWeek && data.dayOfWeek.includes(Number(checkbox.value));
    });

    const startEl = form.querySelector('#schedule-start');
    if (startEl) startEl.value = data.startTime || '';

    const endEl = form.querySelector('#schedule-end');
    if (endEl) endEl.value = data.endTime || '';

    const activeEl = form.querySelector('#schedule-active');
    if (activeEl) activeEl.checked = data.isActive !== false;
  }

  getData() {
    const form = document.getElementById('fixed-schedule-form');
    if (!form) return null;

    const title = form.querySelector('#schedule-title').value.trim();
    if (!title) {
      alert('제목을 입력해주세요.');
      return null;
    }

    const categoryId = form.querySelector('#schedule-category').value;

    // Get checked days
    const dayCheckboxes = form.querySelectorAll('input[name="dayOfWeek"]:checked');
    const dayOfWeek = Array.from(dayCheckboxes).map(cb => Number(cb.value));

    if (dayOfWeek.length === 0) {
      alert('최소 하나의 요일을 선택해주세요.');
      return null;
    }

    const startTime = form.querySelector('#schedule-start').value;
    const endTime = form.querySelector('#schedule-end').value;

    if (!startTime || !endTime) {
      alert('시작 시간과 종료 시간을 입력해주세요.');
      return null;
    }

    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return null;
    }

    const isActive = form.querySelector('#schedule-active').checked;

    return {
      id: this.data.id || null,
      title,
      categoryId: categoryId || 'cat_personal',
      dayOfWeek,
      startTime,
      endTime,
      isActive
    };
  }

  setCategories(categories) {
    this.categories = categories;
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  Modal,
  TaskModal,
  GoalModal,
  HabitModal,
  IdeaModal,
  FixedScheduleModal
};
