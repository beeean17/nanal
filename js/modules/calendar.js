// calendar.js - 캘린더 화면 모듈
// 한 달 전체의 일정과 가계부를 통합 관리

import { AppState } from '../app.js';

const CalendarScreen = {
  // Calendar state
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-11
  selectedDate: null,
  today: new Date(),
  events: [], // 타임라인 이벤트들

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
      </div>
    `;
  },

  // 초기화
  async init() {
    console.log('Calendar screen initialized');

    // 이벤트 로드
    await this.loadEvents();

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

    // 해당 날짜의 일정 가져오기
    const dayEvents = this.getEventsForDate(dateStr);

    // 일정 목록 렌더링
    contentEl.innerHTML = this.renderEventList(dayEvents);

    panel.style.display = 'block';

    // 애니메이션
    panel.classList.add('slide-in');
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
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
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
    try {
      // Firebase에서 먼저 시도
      const firebaseEvents = await this.loadEventsFromFirebase();
      if (firebaseEvents.length > 0) {
        this.events = firebaseEvents;
        return;
      }

      // Firebase에 없으면 LocalStorage
      this.events = this.loadEventsFromLocal();
    } catch (error) {
      console.error('Failed to load events:', error);
      this.events = [];
    }
  },

  // 일정 목록 렌더링 (Detail Panel용)
  renderEventList(events) {
    if (!events || events.length === 0) {
      return `
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
        </div>
      `;
    }).join('');

    return `
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

  // 화면 정리
  destroy() {
    console.log('Calendar screen destroyed');
  }
};

export default CalendarScreen;
