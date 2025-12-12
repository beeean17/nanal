// components/modals/FixedScheduleModal.js - Fixed schedule creation/editing modal
import { Modal } from '../base/Modal.js';

/**
 * FixedScheduleModal - Modal for creating/editing fixed schedules (timetable)
 * @class
 * @extends Modal
 */
export class FixedScheduleModal extends Modal {
  constructor(containerId, options = {}) {
    // FixedScheduleModal uses a custom container ID (timetable-modal)
    super(containerId || 'timetable-modal', {
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
    const form = this.$('#fixed-schedule-form');
    if (!form) return;

    const titleEl = form.querySelector('#schedule-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = this.$('.modal-title');
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
    const form = this.$('#fixed-schedule-form');
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

export default FixedScheduleModal;
