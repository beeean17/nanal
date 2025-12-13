
import { Modal } from '../base/Modal.js';
import { DateUtils, TimeUtils } from '../../utils.js';

export class SubGoalModal extends Modal {
  constructor(modalId, options = {}) {
    super(modalId, {
      title: '세부 목표 추가',
      ...options
    });
  }

  show(data = {}) {
    super.show(data);
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.zIndex = '30000';
      const overlay = modal.querySelector('.modal-overlay');
      const content = modal.querySelector('.modal-content');
      if (overlay) {
        overlay.style.zIndex = '30001';
        overlay.style.backdropFilter = 'blur(4px)'; // Blur the Goal Detail Modal behind
      }
      if (content) {
        content.style.zIndex = '30002'; // Content above the blur overlay
      }
    }
  }

  renderForm() {
    return `
      <form id="subgoal-form" class="modal-form">
        <div class="form-group">
          <label for="subgoal-title">세부 목표 *</label>
          <input type="text" id="subgoal-title" name="title" required maxlength="100" placeholder="목표 달성을 위한 세부 할 일" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="subgoal-date">날짜</label>
            <input type="date" id="subgoal-date" name="targetDate" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="subgoal-start-time">시작 시간</label>
            <input type="time" id="subgoal-start-time" name="startTime" />
          </div>
          <div class="form-group">
            <label for="subgoal-end-time">종료 시간</label>
            <input type="time" id="subgoal-end-time" name="endTime" />
          </div>
        </div>
      </form>
    `;
  }

  populateForm(data) {
    const form = document.getElementById('subgoal-form');
    if (!form) return;

    const titleEl = form.querySelector('#subgoal-title');
    if (titleEl) {
      titleEl.value = data.title || '';
      const modalTitle = document.querySelector(`#${this.modalId} .modal-title`);
      if (modalTitle) {
        modalTitle.textContent = data.id ? '세부 목표 수정' : '세부 목표 추가';
      }
    }

    const dateEl = form.querySelector('#subgoal-date');
    if (dateEl) dateEl.value = data.targetDate || '';

    const startEl = form.querySelector('#subgoal-start-time');
    if (startEl) startEl.value = data.startTime || '';

    const endEl = form.querySelector('#subgoal-end-time');
    if (endEl) endEl.value = data.endTime || '';
  }

  getData() {
    const form = document.getElementById('subgoal-form');
    if (!form) return null;

    const title = form.querySelector('#subgoal-title').value.trim();
    if (!title) {
      alert('세부 목표 내용을 입력해주세요.');
      return null;
    }

    const targetDate = form.querySelector('#subgoal-date').value;
    const startTime = form.querySelector('#subgoal-start-time').value;
    const endTime = form.querySelector('#subgoal-end-time').value;

    if (startTime && endTime && startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return null;
    }

    return {
      id: this.data.id || null,
      title,
      targetDate: targetDate || null,
      startTime: startTime || null,
      endTime: endTime || null
    };
  }
}
