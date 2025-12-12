// components/modals/IdeaModal.js - Idea creation/editing modal
import { Modal } from '../base/Modal.js';

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
    const form = this.$('#idea-form');
    if (!form) return;

    const titleEl = form.querySelector('#idea-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = this.$('.modal-title');
      if (modalTitle) {
        modalTitle.textContent = data.id ? '아이디어 수정' : '새 아이디어';
      }
    }

    const contentEl = form.querySelector('#idea-content');
    if (contentEl) contentEl.value = data.content || '';
  }

  getData() {
    const form = this.$('#idea-form');
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

export default IdeaModal;
