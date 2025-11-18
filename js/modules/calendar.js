// calendar.js - 캘린더 화면 모듈
// 한 달 전체의 일정과 가계부를 통합 관리

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const CalendarScreen = {
  // Calendar state
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-11
  selectedDate: null,
  today: new Date(),
  events: [], // 타임라인 이벤트들
  budgets: [], // 예산 데이터 (수입/지출)
  currentTab: 'events', // 'events' | 'budget'

  // 화면 렌더링
  render() {
    const monthName = new Date(this.currentYear, this.currentMonth).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    });

    return `
      <div class="calendar-screen fade-in">
        <div class="calendar-header">
          <h1 class="screen-title">캘린더</h1>
          <p class="screen-subtitle">${monthName}</p>
        </div>

        <!-- 월간 캘린더 -->
        <section class="calendar-grid-section">
          <div class="calendar-controls">
            <button class="nav-btn prev-month" id="prev-month-btn" aria-label="이전 달">
              <span>←</span>
            </button>
            <h2 class="current-month" id="current-month">${monthName}</h2>
            <button class="nav-btn next-month" id="next-month-btn" aria-label="다음 달">
              <span>→</span>
            </button>
          </div>

          <!-- 요일 헤더 -->
          <div class="calendar-weekdays">
            <div class="weekday sunday">일</div>
            <div class="weekday">월</div>
            <div class="weekday">화</div>
            <div class="weekday">수</div>
            <div class="weekday">목</div>
            <div class="weekday">금</div>
            <div class="weekday saturday">토</div>
          </div>

          <!-- 날짜 그리드 -->
          <div class="calendar-grid" id="calendar-grid">
            <!-- 달력 날짜들이 여기에 동적으로 생성됩니다 -->
          </div>
        </section>

        <!-- 선택된 날짜 상세 정보 패널 -->
        <section class="date-detail-panel" id="date-detail-panel" style="display: none;">
          <div class="detail-panel-header">
            <h3 id="selected-date-title">날짜를 선택하세요</h3>
            <button class="close-panel-btn" id="close-panel-btn" aria-label="닫기">×</button>
          </div>
          <div class="detail-panel-content">
            <div class="widget-placeholder">
              <span class="icon">📝</span>
              <p>날짜 상세 정보 (개발 중)</p>
            </div>
          </div>
        </section>

        <!-- 일정 추가/편집 모달 -->
        <div class="modal-overlay" id="event-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modal-title">새 일정 추가</h3>
              <button class="modal-close-btn" id="modal-close-btn">×</button>
            </div>
            <div class="modal-body">
              <form id="event-form">
                <div class="form-group">
                  <label for="event-title">일정 제목</label>
                  <input type="text" id="event-title" class="form-input" placeholder="일정 제목을 입력하세요" required />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="event-start-time">시작 시간</label>
                    <input type="time" id="event-start-time" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label for="event-end-time">종료 시간</label>
                    <input type="time" id="event-end-time" class="form-input" required />
                  </div>
                </div>

                <div class="form-group">
                  <label for="event-category">카테고리</label>
                  <select id="event-category" class="form-select">
                    <option value="study">📚 공부</option>
                    <option value="work">💼 업무</option>
                    <option value="personal">🎯 개인</option>
                    <option value="meeting">👥 미팅</option>
                    <option value="other">📌 기타</option>
                  </select>
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-secondary" id="cancel-btn">취소</button>
                  <button type="submit" class="btn-primary" id="save-event-btn">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 예산 추가/편집 모달 -->
        <div class="modal-overlay" id="budget-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="budget-modal-title">새 예산 추가</h3>
              <button class="modal-close-btn" id="budget-modal-close-btn">×</button>
            </div>
            <div class="modal-body">
              <form id="budget-form">
                <div class="form-group">
                  <label for="budget-type">유형</label>
                  <select id="budget-type" class="form-select" required>
                    <option value="income">💰 수입</option>
                    <option value="expense">💸 지출</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="budget-amount">금액</label>
                  <input type="number" id="budget-amount" class="form-input" placeholder="금액을 입력하세요" min="0" step="1000" required />
                </div>

                <div class="form-group">
                  <label for="budget-category">카테고리</label>
                  <select id="budget-category" class="form-select" required>
                    <option value="food">🍽️ 식비</option>
                    <option value="transport">🚗 교통</option>
                    <option value="shopping">🛍️ 쇼핑</option>
                    <option value="health">💊 의료</option>
                    <option value="education">📚 교육</option>
                    <option value="entertainment">🎮 여가</option>
                    <option value="utility">🔌 공과금</option>
                    <option value="salary">💼 급여</option>
                    <option value="other">📌 기타</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="budget-description">설명</label>
                  <input type="text" id="budget-description" class="form-input" placeholder="간단한 설명 (선택)" />
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-secondary" id="budget-cancel-btn">취소</button>
                  <button type="submit" class="btn-primary" id="save-budget-btn">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 초기화
  async init() {
    console.log('[Calendar] ===== Calendar screen initialized =====');

    // 이벤트 및 예산 로드
    await this.loadEvents();
    await this.loadBudgets();

    console.log('[Calendar] init() 완료 - 현재 events:', this.events);
    console.log('[Calendar] init() 완료 - 현재 budgets:', this.budgets);

    // 달력 그리드 렌더링
    this.renderCalendarGrid();

    // 이벤트 리스너 설정
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    const closeBtn = document.getElementById('close-panel-btn');

    prevBtn?.addEventListener('click', () => this.previousMonth());
    nextBtn?.addEventListener('click', () => this.nextMonth());
    closeBtn?.addEventListener('click', () => this.closeDetailPanel());
  },

  // 달력 그리드 렌더링
  renderCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    // 현재 달의 첫 날과 마지막 날
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    // 달력 시작 날짜 (첫 주의 일요일)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // 달력 끝 날짜 (마지막 주의 토요일)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    // 날짜 셀 생성
    const cells = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate);
      const isToday = this.isSameDay(currentDate, this.today);
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
      const isSelected = this.selectedDate && this.isSameDay(currentDate, new Date(this.selectedDate));

      // 해당 날짜의 이벤트 가져오기
      const dayEvents = this.getEventsForDate(dateStr);
      const eventDotsHTML = this.renderEventDots(dayEvents);

      cells.push(`
        <div class="calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             data-date="${dateStr}">
          <div class="cell-date">${currentDate.getDate()}</div>
          <div class="cell-events" id="events-${dateStr}">
            ${eventDotsHTML}
          </div>
        </div>
      `);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    grid.innerHTML = cells.join('');

    // 날짜 클릭 이벤트 리스너
    document.querySelectorAll('.calendar-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dateStr = cell.dataset.date;
        this.selectDate(dateStr);
      });
    });
  },

  // 이전 달
  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.updateCalendar();
  },

  // 다음 달
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.updateCalendar();
  },

  // 달력 업데이트
  updateCalendar() {
    // 월 표시 업데이트
    const monthName = new Date(this.currentYear, this.currentMonth).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    });
    const monthElements = document.querySelectorAll('#current-month, .screen-subtitle');
    monthElements.forEach(el => {
      if (el) el.textContent = monthName;
    });

    // 그리드 재렌더링
    this.renderCalendarGrid();
  },

  // 날짜 선택
  selectDate(dateStr) {
    this.selectedDate = dateStr;

    // 선택된 날짜 하이라이트
    document.querySelectorAll('.calendar-cell').forEach(cell => {
      cell.classList.remove('selected');
      if (cell.dataset.date === dateStr) {
        cell.classList.add('selected');
      }
    });

    // 상세 패널 표시
    this.showDetailPanel(dateStr);
  },

  // 상세 패널 표시
  showDetailPanel(dateStr) {
    const panel = document.getElementById('date-detail-panel');
    const titleEl = document.getElementById('selected-date-title');
    const contentEl = panel?.querySelector('.detail-panel-content');

    if (!panel || !titleEl || !contentEl) return;

    // 날짜 포맷팅
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    titleEl.textContent = formatted;

    // 탭 UI + 컨텐츠 렌더링
    contentEl.innerHTML = this.renderDetailPanelContent(dateStr);

    panel.style.display = 'block';

    // 애니메이션
    panel.classList.add('slide-in');

    // 이벤트 리스너 추가
    this.attachEventListeners(dateStr);
    this.attachTabListeners(dateStr);
  },

  // 상세 패널 컨텐츠 렌더링 (탭 포함)
  renderDetailPanelContent(dateStr) {
    const dayEvents = this.getEventsForDate(dateStr);
    const dayBudgets = this.getBudgetsForDate(dateStr);

    return `
      <div class="detail-tabs">
        <button class="tab-btn ${this.currentTab === 'events' ? 'active' : ''}" data-tab="events">
          일정 (${dayEvents.length})
        </button>
        <button class="tab-btn ${this.currentTab === 'budget' ? 'active' : ''}" data-tab="budget">
          예산 (${dayBudgets.length})
        </button>
      </div>
      <div class="tab-content">
        ${this.currentTab === 'events' ? this.renderEventList(dayEvents) : this.renderBudgetList(dayBudgets)}
      </div>
    `;
  },

  // 탭 리스너 추가
  attachTabListeners(dateStr) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.dataset.tab;
        this.showDetailPanel(dateStr);
      });
    });
  },

  // 이벤트 리스너 추가
  attachEventListeners(dateStr) {
    // "+ 새 일정" 버튼
    const addBtn = document.getElementById('add-event-btn');
    addBtn?.addEventListener('click', () => this.openEventModal('add', dateStr));

    // 수정 버튼들
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.id;
        this.openEventModal('edit', dateStr, eventId);
      });
    });

    // 삭제 버튼들
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.id;
        await this.deleteEvent(eventId);
      });
    });
  },

  // 상세 패널 닫기
  closeDetailPanel() {
    const panel = document.getElementById('date-detail-panel');
    if (panel) {
      panel.style.display = 'none';
      panel.classList.remove('slide-in');
    }

    // 선택 해제
    document.querySelectorAll('.calendar-cell').forEach(cell => {
      cell.classList.remove('selected');
    });
    this.selectedDate = null;
  },

  // 유틸리티: 날짜 포맷 (YYYY-MM-DD)
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 유틸리티: 같은 날짜인지 확인
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },

  // 특정 날짜의 이벤트 가져오기
  getEventsForDate(dateStr) {
    return this.events.filter(event => event.date === dateStr);
  },

  // 이벤트 점 렌더링 (최대 3개까지 표시)
  renderEventDots(events) {
    if (!events || events.length === 0) return '';

    const maxDots = 3;
    const displayEvents = events.slice(0, maxDots);

    const dots = displayEvents.map(event => {
      const color = this.getCategoryColor(event.category);
      return `<span class="event-dot" style="background-color: ${color};" title="${event.title}"></span>`;
    }).join('');

    // 이벤트가 3개보다 많으면 +N 표시
    const moreCount = events.length - maxDots;
    const moreIndicator = moreCount > 0 ? `<span class="event-more">+${moreCount}</span>` : '';

    return dots + moreIndicator;
  },

  // 카테고리별 색상 (Home Timeline과 동일)
  getCategoryColor(category) {
    const colors = {
      study: '#007AFF',
      work: '#FF9500',
      personal: '#34C759',
      meeting: '#AF52DE',
      other: '#8E8E93'
    };
    return colors[category] || colors.other;
  },

  // LocalStorage에서 이벤트 불러오기
  loadEventsFromLocal() {
    try {
      const data = localStorage.getItem('nanal_events');
      const parsed = data ? JSON.parse(data) : [];
      console.log('[Calendar] LocalStorage에서 불러온 데이터:', parsed);
      return parsed;
    } catch (error) {
      console.error('[Calendar] LocalStorage load error:', error);
      return [];
    }
  },

  // Firebase에서 이벤트 불러오기
  async loadEventsFromFirebase() {
    // Firebase가 로드되지 않았으면 빈 배열 반환
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return [];
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.events || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // 이벤트 로드 (Firebase 우선, 없으면 LocalStorage)
  async loadEvents() {
    console.log('[Calendar] loadEvents() 시작');
    try {
      // Firebase에서 먼저 시도
      const firebaseEvents = await this.loadEventsFromFirebase();
      console.log('[Calendar] Firebase에서 로드:', firebaseEvents);

      if (firebaseEvents.length > 0) {
        this.events = firebaseEvents;
        console.log('[Calendar] Firebase 데이터 사용:', this.events);
        return;
      }

      // Firebase에 없으면 LocalStorage
      this.events = this.loadEventsFromLocal();
      console.log('[Calendar] LocalStorage 데이터 사용:', this.events);
    } catch (error) {
      console.error('[Calendar] Failed to load events:', error);
      this.events = [];
    }
  },

  // 일정 목록 렌더링 (Detail Panel용)
  renderEventList(events) {
    const addButton = `
      <button class="add-event-btn" id="add-event-btn">
        <span class="btn-icon">+</span>
        <span class="btn-text">새 일정</span>
      </button>
    `;

    if (!events || events.length === 0) {
      return `
        ${addButton}
        <div class="empty-events">
          <span class="empty-icon">📅</span>
          <p class="empty-message">등록된 일정이 없습니다</p>
        </div>
      `;
    }

    // 시간순으로 정렬
    const sortedEvents = [...events].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const eventItems = sortedEvents.map(event => {
      const color = this.getCategoryColor(event.category);
      const categoryLabel = this.getCategoryLabel(event.category);

      return `
        <div class="event-item" data-id="${event.id}">
          <div class="event-item-time">
            <span class="time-badge">${event.startTime} - ${event.endTime}</span>
          </div>
          <div class="event-item-content">
            <div class="event-item-header">
              <span class="event-category-badge" style="background-color: ${color};">
                ${categoryLabel}
              </span>
            </div>
            <h4 class="event-item-title">${this.escapeHtml(event.title)}</h4>
          </div>
          <div class="event-item-actions">
            <button class="event-action-btn edit-btn" data-id="${event.id}" title="수정">
              ✏️
            </button>
            <button class="event-action-btn delete-btn" data-id="${event.id}" title="삭제">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      ${addButton}
      <div class="event-list">
        <div class="event-list-header">
          <span class="event-count">총 ${events.length}개의 일정</span>
        </div>
        ${eventItems}
      </div>
    `;
  },

  // 카테고리 레이블 (Home Timeline과 동일)
  getCategoryLabel(category) {
    const labels = {
      study: '📚 공부',
      work: '💼 업무',
      personal: '🎯 개인',
      meeting: '👥 미팅',
      other: '📌 기타'
    };
    return labels[category] || labels.other;
  },

  // HTML 이스케이프 (XSS 방지)
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 일정 모달 열기
  openEventModal(mode, dateStr, eventId = null) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('event-form');

    if (!modal || !modalTitle || !form) return;

    // 모달 모드 설정
    this.currentModalMode = mode;
    this.currentModalDate = dateStr;
    this.currentEditingEventId = eventId;

    // 제목 설정
    modalTitle.textContent = mode === 'add' ? '새 일정 추가' : '일정 수정';

    // 폼 초기화 또는 데이터 로드
    if (mode === 'edit' && eventId) {
      const event = this.events.find(e => e.id === eventId);
      if (event) {
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-start-time').value = event.startTime;
        document.getElementById('event-end-time').value = event.endTime;
        document.getElementById('event-category').value = event.category;
      }
    } else {
      form.reset();
      // 기본값 설정 (현재 시간)
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('event-start-time').value = `${hours}:${minutes}`;

      // 종료 시간은 1시간 후
      const endTime = new Date(now.getTime() + 60 * 60 * 1000);
      const endHours = String(endTime.getHours()).padStart(2, '0');
      const endMinutes = String(endTime.getMinutes()).padStart(2, '0');
      document.getElementById('event-end-time').value = `${endHours}:${endMinutes}`;
    }

    // 모달 표시
    modal.style.display = 'flex';

    // 이벤트 리스너
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    closeBtn?.addEventListener('click', () => this.closeEventModal());
    cancelBtn?.addEventListener('click', () => this.closeEventModal());

    form.onsubmit = (e) => {
      e.preventDefault();
      this.saveEvent();
    };

    // 모달 바깥 클릭 시 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeEventModal();
      }
    });
  },

  // 일정 모달 닫기
  closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentModalMode = null;
    this.currentModalDate = null;
    this.currentEditingEventId = null;
  },

  // 일정 저장 (추가 또는 수정)
  async saveEvent() {
    const title = document.getElementById('event-title').value.trim();
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const category = document.getElementById('event-category').value;

    console.log('[Calendar] saveEvent 호출됨:', { title, startTime, endTime, category, date: this.currentModalDate });

    if (!title || !startTime || !endTime) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 시간 유효성 검사
    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    if (this.currentModalMode === 'add') {
      // 새 일정 추가
      const newEvent = {
        id: Date.now().toString(),
        title,
        startTime,
        endTime,
        category,
        date: this.currentModalDate,
        createdAt: new Date().toISOString()
      };

      console.log('[Calendar] 새 일정 추가:', newEvent);
      this.events.push(newEvent);
      console.log('[Calendar] 현재 events 배열:', this.events);
    } else if (this.currentModalMode === 'edit') {
      // 기존 일정 수정
      const event = this.events.find(e => e.id === this.currentEditingEventId);
      if (event) {
        event.title = title;
        event.startTime = startTime;
        event.endTime = endTime;
        event.category = category;
        console.log('[Calendar] 일정 수정됨:', event);
      }
    }

    // 저장
    console.log('[Calendar] saveEvents() 호출 전');
    await this.saveEvents();
    console.log('[Calendar] saveEvents() 호출 후');

    // UI 업데이트
    this.renderCalendarGrid();
    if (this.selectedDate) {
      this.showDetailPanel(this.selectedDate);
    }

    // 모달 닫기
    this.closeEventModal();
  },

  // 일정 삭제
  async deleteEvent(eventId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.events = this.events.filter(e => e.id !== eventId);
    await this.saveEvents();

    // UI 업데이트
    this.renderCalendarGrid();
    if (this.selectedDate) {
      this.showDetailPanel(this.selectedDate);
    }
  },

  // LocalStorage에 저장
  saveEventsToLocal() {
    try {
      console.log('[Calendar] LocalStorage 저장 시도:', this.events);
      localStorage.setItem('nanal_events', JSON.stringify(this.events));
      console.log('[Calendar] LocalStorage 저장 완료');

      // 확인용: 저장 후 즉시 읽어보기
      const saved = localStorage.getItem('nanal_events');
      console.log('[Calendar] LocalStorage 저장 확인:', JSON.parse(saved));
    } catch (error) {
      console.error('[Calendar] LocalStorage save error:', error);
    }
  },

  // Firebase에 저장
  async saveEventsToFirebase() {
    console.log('[Calendar] saveEventsToFirebase() 시작');

    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      console.log('[Calendar] Firebase 미사용 (FirebaseAuth/DB undefined)');
      return;
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) {
      console.log('[Calendar] Firebase 미사용 (로그인 안됨)');
      return;
    }

    console.log('[Calendar] Firebase 저장 시도 - 사용자:', user.email);

    try {
      // 기존 데이터 가져오기
      const existingData = await FirebaseDB.get('users', user.uid);
      console.log('[Calendar] 기존 Firebase 데이터:', existingData);

      const dataToSave = {
        ...existingData,
        events: this.events,
        updatedAt: new Date().toISOString()
      };
      console.log('[Calendar] Firebase에 저장할 데이터:', dataToSave);

      // events만 업데이트
      await FirebaseDB.set('users', user.uid, dataToSave);
      console.log('[Calendar] ✅ Firebase 저장 완료');
    } catch (error) {
      console.error('[Calendar] ❌ Firebase save error:', error);
    }
  },

  // 일정 저장 (LocalStorage + Firebase)
  async saveEvents() {
    this.saveEventsToLocal();
    await this.saveEventsToFirebase();
  },

  // ====== 예산 관련 함수들 ======

  // 특정 날짜의 예산 가져오기
  getBudgetsForDate(dateStr) {
    return this.budgets.filter(budget => budget.date === dateStr);
  },

  // 예산 목록 렌더링
  renderBudgetList(budgets) {
    const addButton = `
      <button class="add-budget-btn" id="add-budget-btn">
        <span class="btn-icon">+</span>
        <span class="btn-text">새 예산</span>
      </button>
    `;

    if (!budgets || budgets.length === 0) {
      return `
        ${addButton}
        <div class="empty-events">
          <span class="empty-icon">💰</span>
          <p class="empty-message">등록된 예산이 없습니다</p>
        </div>
      `;
    }

    // 수입/지출 계산
    const totalIncome = budgets.filter(b => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
    const totalExpense = budgets.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
    const balance = totalIncome - totalExpense;

    const budgetItems = budgets.map(budget => {
      const categoryLabel = this.getBudgetCategoryLabel(budget.category);
      const typeColor = budget.type === 'income' ? '#34C759' : '#FF3B30';
      const typeLabel = budget.type === 'income' ? '💰 수입' : '💸 지출';

      return `
        <div class="budget-item" data-id="${budget.id}">
          <div class="budget-item-header">
            <span class="budget-type-badge" style="background-color: ${typeColor};">
              ${typeLabel}
            </span>
            <span class="budget-category">${categoryLabel}</span>
          </div>
          <div class="budget-item-body">
            <div class="budget-amount ${budget.type}">
              ${budget.type === 'income' ? '+' : '-'}${budget.amount.toLocaleString()}원
            </div>
            ${budget.description ? `<p class="budget-description">${this.escapeHtml(budget.description)}</p>` : ''}
          </div>
          <div class="budget-item-actions">
            <button class="budget-action-btn edit-budget-btn" data-id="${budget.id}" title="수정">
              ✏️
            </button>
            <button class="budget-action-btn delete-budget-btn" data-id="${budget.id}" title="삭제">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      ${addButton}
      <div class="budget-summary">
        <div class="summary-item income">
          <span class="label">수입</span>
          <span class="value">+${totalIncome.toLocaleString()}원</span>
        </div>
        <div class="summary-item expense">
          <span class="label">지출</span>
          <span class="value">-${totalExpense.toLocaleString()}원</span>
        </div>
        <div class="summary-item balance ${balance >= 0 ? 'positive' : 'negative'}">
          <span class="label">잔액</span>
          <span class="value">${balance >= 0 ? '+' : ''}${balance.toLocaleString()}원</span>
        </div>
      </div>
      <div class="budget-list">
        ${budgetItems}
      </div>
    `;
  },

  // 예산 카테고리 레이블
  getBudgetCategoryLabel(category) {
    const labels = {
      food: '🍽️ 식비',
      transport: '🚗 교통',
      shopping: '🛍️ 쇼핑',
      health: '💊 의료',
      education: '📚 교육',
      entertainment: '🎮 여가',
      utility: '🔌 공과금',
      salary: '💼 급여',
      other: '📌 기타'
    };
    return labels[category] || labels.other;
  },

  // 예산 이벤트 리스너 추가
  attachBudgetListeners(dateStr) {
    // "+ 새 예산" 버튼
    const addBtn = document.getElementById('add-budget-btn');
    addBtn?.addEventListener('click', () => this.openBudgetModal('add', dateStr));

    // 수정 버튼들
    document.querySelectorAll('.edit-budget-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const budgetId = btn.dataset.id;
        this.openBudgetModal('edit', dateStr, budgetId);
      });
    });

    // 삭제 버튼들
    document.querySelectorAll('.delete-budget-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const budgetId = btn.dataset.id;
        await this.deleteBudget(budgetId);
      });
    });
  },

  // attachEventListeners 수정하여 예산 리스너도 포함
  attachEventListeners(dateStr) {
    // "+ 새 일정" 버튼
    const addBtn = document.getElementById('add-event-btn');
    addBtn?.addEventListener('click', () => this.openEventModal('add', dateStr));

    // 수정 버튼들
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.id;
        this.openEventModal('edit', dateStr, eventId);
      });
    });

    // 삭제 버튼들
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.id;
        await this.deleteEvent(eventId);
      });
    });

    // 예산 리스너도 추가
    this.attachBudgetListeners(dateStr);
  },

  // 예산 모달 열기
  openBudgetModal(mode, dateStr, budgetId = null) {
    const modal = document.getElementById('budget-modal');
    const modalTitle = document.getElementById('budget-modal-title');
    const form = document.getElementById('budget-form');

    if (!modal || !modalTitle || !form) return;

    // 모달 모드 설정
    this.currentBudgetMode = mode;
    this.currentBudgetDate = dateStr;
    this.currentEditingBudgetId = budgetId;

    // 제목 설정
    modalTitle.textContent = mode === 'add' ? '새 예산 추가' : '예산 수정';

    // 폼 초기화 또는 데이터 로드
    if (mode === 'edit' && budgetId) {
      const budget = this.budgets.find(b => b.id === budgetId);
      if (budget) {
        document.getElementById('budget-type').value = budget.type;
        document.getElementById('budget-amount').value = budget.amount;
        document.getElementById('budget-category').value = budget.category;
        document.getElementById('budget-description').value = budget.description || '';
      }
    } else {
      form.reset();
    }

    // 모달 표시
    modal.style.display = 'flex';

    // 이벤트 리스너
    const closeBtn = document.getElementById('budget-modal-close-btn');
    const cancelBtn = document.getElementById('budget-cancel-btn');

    closeBtn?.addEventListener('click', () => this.closeBudgetModal());
    cancelBtn?.addEventListener('click', () => this.closeBudgetModal());

    form.onsubmit = (e) => {
      e.preventDefault();
      this.saveBudget();
    };

    // 모달 바깥 클릭 시 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeBudgetModal();
      }
    });
  },

  // 예산 모달 닫기
  closeBudgetModal() {
    const modal = document.getElementById('budget-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentBudgetMode = null;
    this.currentBudgetDate = null;
    this.currentEditingBudgetId = null;
  },

  // 예산 저장
  async saveBudget() {
    const type = document.getElementById('budget-type').value;
    const amount = parseInt(document.getElementById('budget-amount').value);
    const category = document.getElementById('budget-category').value;
    const description = document.getElementById('budget-description').value.trim();

    if (!type || !amount || amount <= 0 || !category) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    if (this.currentBudgetMode === 'add') {
      // 새 예산 추가
      const newBudget = {
        id: Date.now().toString(),
        type,
        amount,
        category,
        description,
        date: this.currentBudgetDate,
        createdAt: new Date().toISOString()
      };

      this.budgets.push(newBudget);
    } else if (this.currentBudgetMode === 'edit') {
      // 기존 예산 수정
      const budget = this.budgets.find(b => b.id === this.currentEditingBudgetId);
      if (budget) {
        budget.type = type;
        budget.amount = amount;
        budget.category = category;
        budget.description = description;
      }
    }

    // 저장
    await this.saveBudgets();

    // UI 업데이트
    if (this.selectedDate) {
      this.showDetailPanel(this.selectedDate);
    }

    // 모달 닫기
    this.closeBudgetModal();
  },

  // 예산 삭제
  async deleteBudget(budgetId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.budgets = this.budgets.filter(b => b.id !== budgetId);
    await this.saveBudgets();

    // UI 업데이트
    if (this.selectedDate) {
      this.showDetailPanel(this.selectedDate);
    }
  },

  // LocalStorage에 예산 저장
  saveBudgetsToLocal() {
    try {
      localStorage.setItem('nanal_budgets', JSON.stringify(this.budgets));
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  },

  // LocalStorage에서 예산 불러오기
  loadBudgetsFromLocal() {
    try {
      const data = localStorage.getItem('nanal_budgets');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },

  // Firebase에 예산 저장
  async saveBudgetsToFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return;
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return;

    try {
      const existingData = await FirebaseDB.get('users', user.uid);

      await FirebaseDB.set('users', user.uid, {
        ...existingData,
        budgets: this.budgets,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  },

  // Firebase에서 예산 불러오기
  async loadBudgetsFromFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return [];
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.budgets || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // 예산 저장 (LocalStorage + Firebase)
  async saveBudgets() {
    this.saveBudgetsToLocal();
    await this.saveBudgetsToFirebase();
  },

  // 예산 로드 (Firebase 우선, 없으면 LocalStorage)
  async loadBudgets() {
    try {
      const firebaseBudgets = await this.loadBudgetsFromFirebase();
      if (firebaseBudgets.length > 0) {
        this.budgets = firebaseBudgets;
        return;
      }

      this.budgets = this.loadBudgetsFromLocal();
    } catch (error) {
      console.error('Failed to load budgets:', error);
      this.budgets = [];
    }
  },

  // 화면 정리
  destroy() {
    console.log('Calendar screen destroyed');
  }
};

export default CalendarScreen;
