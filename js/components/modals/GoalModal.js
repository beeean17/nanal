// components/modals/GoalModal.js - Goal creation/editing modal
import { Modal } from '../base/Modal.js';
import { DateUtils } from '../../utils.js';

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
    const categoryOptions = this.categories.map(cat =>
      `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');

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
              ${categoryOptions}
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
    const form = this.$('#goal-form');
    if (!form) return;

    const titleEl = form.querySelector('#goal-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = this.$('.modal-title');
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
    const form = this.$('#goal-form');
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

export default GoalModal;
