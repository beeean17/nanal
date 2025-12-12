// components/modals/HabitModal.js - Habit creation/editing modal
import { Modal } from '../base/Modal.js';

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
    const categoryOptions = this.categories.map(cat =>
      `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');

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
              ${categoryOptions}
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
    const form = this.$('#habit-form');
    if (!form) return;

    const titleEl = form.querySelector('#habit-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = this.$('.modal-title');
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
    const form = this.$('#habit-form');
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

export default HabitModal;
