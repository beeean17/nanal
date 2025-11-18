// timetable.js - 시간표 화면 모듈
// 매주 반복되는 고정 일정을 시각적으로 관리

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const TimetableScreen = {
  currentDay: new Date().getDay(), // 0 (일요일) ~ 6 (토요일)
  classes: [], // 시간표 데이터
  selectedClass: null, // 선택된 수업

  // 화면 렌더링
  render() {
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    return `
      <div class="timetable-screen fade-in">
        <div class="timetable-header">
          <h1 class="screen-title">시간표</h1>
          <p class="screen-subtitle">주간 고정 일정</p>
          <button class="add-class-btn" id="add-class-btn">
            <span class="btn-icon">+</span>
            <span class="btn-text">수업 추가</span>
          </button>
        </div>

        <!-- 주간 그리드 -->
        <section class="timetable-grid-section">
          <div class="timetable-grid-container">
            <!-- 요일 헤더 -->
            <div class="timetable-grid-header">
              <div class="time-column-header"></div>
              ${days.map((day, index) => `
                <div class="day-column-header" data-day="${index}">
                  ${day}
                </div>
              `).join('')}
            </div>

            <!-- 시간표 그리드 -->
            <div class="timetable-grid" id="timetable-grid">
              <!-- 시간 라벨 열 -->
              <div class="time-column" id="time-column">
                ${this.renderTimeLabels()}
              </div>

              <!-- 요일별 열 (일~토) -->
              ${days.map((day, index) => `
                <div class="day-column" data-day="${index}" id="day-column-${index}">
                  ${this.renderDayColumn(index)}
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- 수업 추가/편집 모달 -->
        <div class="modal-overlay" id="class-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="class-modal-title">수업 추가</h3>
              <button class="modal-close-btn" id="class-modal-close-btn">×</button>
            </div>
            <div class="modal-body">
              <form id="class-form">
                <div class="form-group">
                  <label for="class-title">수업명</label>
                  <input type="text" id="class-title" class="form-input" placeholder="수업 이름" required />
                </div>

                <div class="form-group">
                  <label for="class-day">요일</label>
                  <select id="class-day" class="form-select" required>
                    <option value="0">일요일</option>
                    <option value="1">월요일</option>
                    <option value="2">화요일</option>
                    <option value="3">수요일</option>
                    <option value="4">목요일</option>
                    <option value="5">금요일</option>
                    <option value="6">토요일</option>
                  </select>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="class-start-time">시작 시간</label>
                    <input type="time" id="class-start-time" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label for="class-end-time">종료 시간</label>
                    <input type="time" id="class-end-time" class="form-input" required />
                  </div>
                </div>

                <div class="form-group">
                  <label for="class-location">장소 (선택)</label>
                  <input type="text" id="class-location" class="form-input" placeholder="강의실, 장소" />
                </div>

                <div class="form-group">
                  <label for="class-category">카테고리</label>
                  <select id="class-category" class="form-select" required>
                    <option value="lecture">📚 강의</option>
                    <option value="lab">🔬 실습</option>
                    <option value="study">📖 스터디</option>
                    <option value="work">💼 업무</option>
                    <option value="exercise">🏃 운동</option>
                    <option value="meeting">👥 미팅</option>
                    <option value="other">📌 기타</option>
                  </select>
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-secondary" id="class-cancel-btn">취소</button>
                  <button type="submit" class="btn-primary" id="save-class-btn">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 시간 라벨 렌더링 (08:00 ~ 23:00)
  renderTimeLabels() {
    let labels = '';
    for (let hour = 8; hour <= 23; hour++) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      labels += `<div class="time-label">${timeStr}</div>`;
    }
    return labels;
  },

  // 요일별 열 렌더링
  renderDayColumn(dayOfWeek) {
    const dayClasses = this.classes.filter(c => c.dayOfWeek === dayOfWeek);

    let blocks = '';
    dayClasses.forEach(classItem => {
      const position = this.calculatePosition(classItem.startTime, classItem.endTime);
      const color = this.getCategoryColor(classItem.category);

      blocks += `
        <div class="class-block"
             data-id="${classItem.id}"
             style="top: ${position.top}%; height: ${position.height}%; background-color: ${color};">
          <div class="class-block-time">${classItem.startTime} - ${classItem.endTime}</div>
          <div class="class-block-title">${this.escapeHtml(classItem.title)}</div>
          ${classItem.location ? `<div class="class-block-location">📍 ${this.escapeHtml(classItem.location)}</div>` : ''}
        </div>
      `;
    });

    return blocks || '';
  },

  // 초기화
  async init() {
    console.log('Timetable screen initialized');

    // 데이터 로드
    await this.loadClasses();

    // 그리드 다시 렌더링
    this.renderGrid();

    // 이벤트 리스너 설정
    const addBtn = document.getElementById('add-class-btn');
    addBtn?.addEventListener('click', () => this.openClassModal('add'));

    // 수업 블록 클릭 이벤트
    this.attachClassBlockListeners();
  },

  // 그리드 재렌더링
  renderGrid() {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    days.forEach((day, index) => {
      const column = document.getElementById(`day-column-${index}`);
      if (column) {
        column.innerHTML = this.renderDayColumn(index);
      }
    });
    this.attachClassBlockListeners();
  },

  // 수업 블록 리스너
  attachClassBlockListeners() {
    document.querySelectorAll('.class-block').forEach(block => {
      block.addEventListener('click', (e) => {
        const classId = block.dataset.id;
        this.openClassModal('edit', classId);
      });
    });
  },

  // 수업 모달 열기
  openClassModal(mode, classId = null) {
    const modal = document.getElementById('class-modal');
    const modalTitle = document.getElementById('class-modal-title');
    const form = document.getElementById('class-form');

    if (!modal || !modalTitle || !form) return;

    this.currentModalMode = mode;
    this.currentEditingClassId = classId;

    modalTitle.textContent = mode === 'add' ? '수업 추가' : '수업 수정';

    if (mode === 'edit' && classId) {
      const classItem = this.classes.find(c => c.id === classId);
      if (classItem) {
        document.getElementById('class-title').value = classItem.title;
        document.getElementById('class-day').value = classItem.dayOfWeek;
        document.getElementById('class-start-time').value = classItem.startTime;
        document.getElementById('class-end-time').value = classItem.endTime;
        document.getElementById('class-location').value = classItem.location || '';
        document.getElementById('class-category').value = classItem.category;
      }
    } else {
      form.reset();
    }

    modal.style.display = 'flex';

    // 이벤트 리스너
    const closeBtn = document.getElementById('class-modal-close-btn');
    const cancelBtn = document.getElementById('class-cancel-btn');

    closeBtn?.addEventListener('click', () => this.closeClassModal());
    cancelBtn?.addEventListener('click', () => this.closeClassModal());

    form.onsubmit = (e) => {
      e.preventDefault();
      this.saveClass();
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeClassModal();
      }
    });
  },

  // 수업 모달 닫기
  closeClassModal() {
    const modal = document.getElementById('class-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentModalMode = null;
    this.currentEditingClassId = null;
  },

  // 수업 저장
  async saveClass() {
    const title = document.getElementById('class-title').value.trim();
    const dayOfWeek = parseInt(document.getElementById('class-day').value);
    const startTime = document.getElementById('class-start-time').value;
    const endTime = document.getElementById('class-end-time').value;
    const location = document.getElementById('class-location').value.trim();
    const category = document.getElementById('class-category').value;

    if (!title || !startTime || !endTime) {
      alert('필수 필드를 입력해주세요.');
      return;
    }

    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    if (this.currentModalMode === 'add') {
      const newClass = {
        id: Date.now().toString(),
        title,
        dayOfWeek,
        startTime,
        endTime,
        location,
        category,
        createdAt: new Date().toISOString()
      };

      this.classes.push(newClass);
    } else if (this.currentModalMode === 'edit') {
      const classItem = this.classes.find(c => c.id === this.currentEditingClassId);
      if (classItem) {
        classItem.title = title;
        classItem.dayOfWeek = dayOfWeek;
        classItem.startTime = startTime;
        classItem.endTime = endTime;
        classItem.location = location;
        classItem.category = category;
      }
    }

    await this.saveClasses();
    this.renderGrid();
    this.closeClassModal();
  },

  // 수업 삭제 (모달에서 호출)
  async deleteClass(classId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.classes = this.classes.filter(c => c.id !== classId);
    await this.saveClasses();
    this.renderGrid();
    this.closeClassModal();
  },

  // 위치 계산 (시간 → %로 변환, 08:00 기준)
  calculatePosition(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // 8시부터 시작 (8:00 = 480분)
    const baseMinutes = 8 * 60; // 08:00
    const totalMinutes = 16 * 60; // 8시~23시 = 16시간

    const adjustedStart = startMinutes - baseMinutes;
    const adjustedEnd = endMinutes - baseMinutes;

    return {
      top: (adjustedStart / totalMinutes) * 100,
      height: ((adjustedEnd - adjustedStart) / totalMinutes) * 100
    };
  },

  // 카테고리 색상
  getCategoryColor(category) {
    const colors = {
      lecture: '#007AFF',
      lab: '#AF52DE',
      study: '#34C759',
      work: '#FF9500',
      exercise: '#FF3B30',
      meeting: '#5856D6',
      other: '#8E8E93'
    };
    return colors[category] || colors.other;
  },

  // HTML 이스케이프
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // LocalStorage 저장
  saveClassesToLocal() {
    try {
      localStorage.setItem('nanal_timetable', JSON.stringify(this.classes));
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  },

  // LocalStorage 로드
  loadClassesFromLocal() {
    try {
      const data = localStorage.getItem('nanal_timetable');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },

  // Firebase 저장
  async saveClassesToFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return;
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return;

    try {
      const existingData = await FirebaseDB.get('users', user.uid);

      await FirebaseDB.set('users', user.uid, {
        ...existingData,
        timetable: this.classes,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  },

  // Firebase 로드
  async loadClassesFromFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return [];
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.timetable || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // 저장
  async saveClasses() {
    this.saveClassesToLocal();
    await this.saveClassesToFirebase();
  },

  // 로드
  async loadClasses() {
    try {
      const firebaseClasses = await this.loadClassesFromFirebase();
      if (firebaseClasses.length > 0) {
        this.classes = firebaseClasses;
        return;
      }

      this.classes = this.loadClassesFromLocal();
    } catch (error) {
      console.error('Failed to load classes:', error);
      this.classes = [];
    }
  },

  // 화면 정리
  destroy() {
    console.log('Timetable screen destroyed');
  }
};

export default TimetableScreen;
