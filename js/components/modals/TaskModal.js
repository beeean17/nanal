// components/modals/TaskModal.js - Task creation/editing modal
import { Modal } from '../base/Modal.js';
import { ValidationUtils, DateUtils, TimeUtils } from '../../utils.js';

/**
 * TaskModal - Modal for creating/editing tasks
 * @class
 * @extends Modal
 */
export class TaskModal extends Modal {
  constructor(modalId, options = {}) {
    super(modalId, {
      title: '일정 추가',
      ...options
    });
    this.categories = options.categories || [];
  }

  renderForm() {
    const categoryOptions = this.categories.map(cat =>
      `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');

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
              ${categoryOptions}
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
    const form = this.$('#task-form');
    if (!form) return;

    // Set title
    const titleEl = form.querySelector('#task-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      // Update modal title
      const modalTitle = this.$('.modal-title');
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
    const form = this.$('#task-form');
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
      completed: this.data.completed || false
    };
  }

  setCategories(categories) {
    this.categories = categories;
  }
}

export default TaskModal;
