// weekly.js - 주간 타임라인 모듈
// 일주일 전체 타임라인을 보여주는 화면 (월~일 7일간)

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const WeeklyScreen = {
  events: [], // 주간 이벤트
  timetableEvents: [], // 고정 시간표
  currentTimeInterval: null,
  selectedEventId: null,
  dragStartTime: null,
  dragEndTime: null,
  isDragging: false,

  // 화면 렌더링
  render() {
    return `
      <div class="weekly-screen fade-in">
        <!-- 헤더 -->
        <div class="weekly-header">
          <h1>주간 타임라인</h1>
          <button class="btn-primary" id="open-timetable-btn">
            <span class="icon">📚</span>
            <span>시간표 수정</span>
          </button>
        </div>

        <!-- 주간 타임라인 -->
        <div class="weekly-timeline-container">
          <div class="weekly-timeline" id="weekly-timeline">
            <!-- 시간 라벨 열 -->
            <div class="timeline-time-column">
              <div class="timeline-header-cell"></div>
              <div class="timeline-hours-column" id="timeline-hours-column">
                <!-- 시간 라벨들이 여기에 생성됩니다 -->
              </div>
            </div>

            <!-- 요일별 열들 (월~일) -->
            <div class="timeline-days-container" id="timeline-days-container">
              <!-- 요일 열들이 여기에 생성됩니다 -->
            </div>
          </div>
        </div>

        <!-- 시간표 편집 모달 -->
        <div class="modal" id="timetable-modal" style="display: none;">
          <div class="modal-overlay"></div>
          <div class="modal-content timetable-modal-content">
            <div class="modal-header">
              <h3>시간표 편집</h3>
              <button class="modal-close-btn" id="close-timetable-modal" aria-label="닫기">×</button>
            </div>
            <div class="modal-body">
              <div class="timetable-form">
                <input
                  type="text"
                  id="timetable-title"
                  class="event-input"
                  placeholder="과목명 (예: 데이터베이스)"
                  maxlength="50"
                />
                <div class="timetable-day-select">
                  <label>요일 선택 (복수 선택 가능)</label>
                  <div class="day-checkboxes">
                    <label><input type="checkbox" value="1" /> 월</label>
                    <label><input type="checkbox" value="2" /> 화</label>
                    <label><input type="checkbox" value="3" /> 수</label>
                    <label><input type="checkbox" value="4" /> 목</label>
                    <label><input type="checkbox" value="5" /> 금</label>
                    <label><input type="checkbox" value="6" /> 토</label>
                    <label><input type="checkbox" value="0" /> 일</label>
                  </div>
                </div>
                <div class="event-time-inputs">
                  <input type="time" id="timetable-start-time" class="time-input" />
                  <span>~</span>
                  <input type="time" id="timetable-end-time" class="time-input" />
                </div>
                <select id="timetable-category" class="event-select">
                  <option value="lecture">📚 강의</option>
                  <option value="lab">🔬 실습</option>
                  <option value="exercise">🏃 운동</option>
                  <option value="other">📌 기타</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-primary" id="save-timetable-btn">저장</button>
              <button class="btn-secondary" id="cancel-timetable-btn">취소</button>
            </div>
          </div>
        </div>

        <!-- 이벤트 상세/편집 모달 -->
        <div class="modal" id="event-detail-modal" style="display: none;">
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modal-event-title">일정 상세</h3>
              <button class="modal-close-btn" id="close-event-modal" aria-label="닫기">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-event-info">
                <div class="modal-event-time">
                  <span class="icon">🕐</span>
                  <span id="modal-event-time-text">--:-- ~ --:--</span>
                </div>
                <div class="modal-event-category">
                  <span class="icon">📁</span>
                  <span id="modal-event-category-text">카테고리</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-danger" id="delete-event-btn">삭제</button>
              <button class="btn-secondary" id="close-event-detail-btn">닫기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 초기화
  init() {
    console.log('Weekly screen initialized');

    // 데이터 로드
    this.loadTimetable();
    this.loadEvents();

    // 타임라인 렌더링
    this.renderTimelineStructure();
    this.renderAllEvents();

    // 이벤트 리스너 등록
    this.attachEventListeners();

    // 현재 시간 인디케이터 업데이트
    this.updateCurrentTimeLine();
    this.currentTimeInterval = setInterval(() => {
      this.updateCurrentTimeLine();
    }, 60000); // 1분마다 업데이트
  },

  // 정리
  destroy() {
    if (this.currentTimeInterval) {
      clearInterval(this.currentTimeInterval);
      this.currentTimeInterval = null;
    }
  },

  // 타임라인 구조 렌더링 (시간 라벨 + 요일 열들)
  renderTimelineStructure() {
    this.renderTimelineHours();
    this.renderDayColumns();
  },

  // 시간 라벨 렌더링 (0:00 ~ 23:00, 5분 단위)
  renderTimelineHours() {
    const hoursColumn = document.getElementById('timeline-hours-column');
    if (!hoursColumn) return;

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const hourLabel = String(h).padStart(2, '0') + ':00';
      hours.push(`
        <div class="timeline-hour-row">
          <div class="timeline-hour-label">${hourLabel}</div>
          <div class="timeline-hour-slots">
            ${this.renderHourSlots(h)}
          </div>
        </div>
      `);
    }

    hoursColumn.innerHTML = hours.join('');
  },

  // 1시간을 12개의 5분 슬롯으로 나누기
  renderHourSlots(hour) {
    const slots = [];
    for (let m = 0; m < 60; m += 5) {
      slots.push(`<div class="timeline-slot" data-time="${hour}:${String(m).padStart(2, '0')}"></div>`);
    }
    return slots.join('');
  },

  // 요일별 열 렌더링
  renderDayColumns() {
    const container = document.getElementById('timeline-days-container');
    if (!container) return;

    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 (일요일) ~ 6 (토요일)

    // 이번 주 월요일 찾기
    const monday = new Date(today);
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    monday.setDate(today.getDate() - daysSinceMonday);

    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    const columns = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const isToday = this.isSameDay(date, today);
      const dateStr = this.formatDate(date);
      const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;

      columns.push(`
        <div class="timeline-day-column ${isToday ? 'today' : ''}" data-date="${dateStr}" data-day="${i}">
          <div class="timeline-day-header">
            <div class="day-name">${dayNames[i]}</div>
            <div class="day-date">${displayDate}</div>
          </div>
          <div class="timeline-day-slots" data-date="${dateStr}">
            ${this.renderDaySlots()}
          </div>
        </div>
      `);
    }

    container.innerHTML = columns.join('');
  },

  // 하루 전체 슬롯 렌더링 (24시간 × 12개 = 288개 슬롯)
  renderDaySlots() {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(`<div class="timeline-slot" data-time="${timeStr}"></div>`);
      }
    }
    return slots.join('');
  },

  // 모든 이벤트 렌더링 (시간표 + 일정)
  renderAllEvents() {
    // 각 요일 열에 이벤트 렌더링
    const dayColumns = document.querySelectorAll('.timeline-day-column');
    dayColumns.forEach(column => {
      const dateStr = column.dataset.date;
      const dayOfWeek = new Date(dateStr).getDay();

      // 해당 날짜의 이벤트들 가져오기
      const dayEvents = this.getEventsForDate(dateStr);
      const dayTimetable = this.getTimetableForDay(dayOfWeek);

      // 이벤트 블록 렌더링
      const slotsContainer = column.querySelector('.timeline-day-slots');
      if (slotsContainer) {
        // 기존 이벤트 블록 제거
        slotsContainer.querySelectorAll('.timeline-event-block').forEach(block => block.remove());

        // 시간표 렌더링 (고정, 배경)
        dayTimetable.forEach(event => {
          const block = this.createEventBlock(event, dateStr, true);
          slotsContainer.appendChild(block);
        });

        // 일정 렌더링 (가변, 전경)
        dayEvents.forEach(event => {
          const block = this.createEventBlock(event, dateStr, false);
          slotsContainer.appendChild(block);
        });
      }
    });
  },

  // 이벤트 블록 생성
  createEventBlock(event, dateStr, isTimetable) {
    const block = document.createElement('div');
    block.className = `timeline-event-block ${isTimetable ? 'timetable-event' : 'regular-event'} category-${event.category}`;
    block.dataset.eventId = event.id;
    block.dataset.isTimetable = isTimetable;

    // 시작/종료 시간 계산
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;

    // 위치 계산 (5분 단위 슬롯)
    const topPercent = (startMinutes / (24 * 60)) * 100;
    const heightPercent = (duration / (24 * 60)) * 100;

    block.style.top = `${topPercent}%`;
    block.style.height = `${heightPercent}%`;

    // 내용
    const categoryLabel = this.getCategoryLabel(event.category);
    block.innerHTML = `
      <div class="event-block-content">
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-title">${this.escapeHtml(event.title)}</div>
        <div class="event-category">${categoryLabel}</div>
      </div>
    `;

    // 클릭 이벤트
    block.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEventDetail(event, isTimetable);
    });

    return block;
  },

  // 현재 시간 인디케이터 업데이트
  updateCurrentTimeLine() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const topPercent = (currentMinutes / (24 * 60)) * 100;

    // 모든 요일 열에 현재 시간 라인 추가/업데이트
    const dayColumns = document.querySelectorAll('.timeline-day-column');
    dayColumns.forEach(column => {
      const slotsContainer = column.querySelector('.timeline-day-slots');
      if (!slotsContainer) return;

      let currentLine = slotsContainer.querySelector('.timeline-current-line');

      // 오늘이 아닌 날짜는 라인 제거
      const dateStr = column.dataset.date;
      const columnDate = new Date(dateStr);
      const isToday = this.isSameDay(columnDate, now);

      if (!isToday) {
        if (currentLine) currentLine.remove();
        return;
      }

      // 오늘인 경우 라인 추가/업데이트
      if (!currentLine) {
        currentLine = document.createElement('div');
        currentLine.className = 'timeline-current-line';
        currentLine.innerHTML = `
          <div class="timeline-current-dot"></div>
          <div class="timeline-current-label">${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}</div>
        `;
        slotsContainer.appendChild(currentLine);
      }

      currentLine.style.top = `${topPercent}%`;
      const label = currentLine.querySelector('.timeline-current-label');
      if (label) {
        label.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      }
    });
  },

  // 이벤트 리스너 등록
  attachEventListeners() {
    // 시간표 편집 버튼
    const openTimetableBtn = document.getElementById('open-timetable-btn');
    if (openTimetableBtn) {
      openTimetableBtn.addEventListener('click', () => this.showTimetableModal());
    }

    // 시간표 모달 닫기
    const closeTimetableModal = document.getElementById('close-timetable-modal');
    if (closeTimetableModal) {
      closeTimetableModal.addEventListener('click', () => this.hideTimetableModal());
    }

    // 시간표 저장
    const saveTimetableBtn = document.getElementById('save-timetable-btn');
    if (saveTimetableBtn) {
      saveTimetableBtn.addEventListener('click', () => this.saveTimetable());
    }

    // 시간표 취소
    const cancelTimetableBtn = document.getElementById('cancel-timetable-btn');
    if (cancelTimetableBtn) {
      cancelTimetableBtn.addEventListener('click', () => this.hideTimetableModal());
    }

    // 이벤트 상세 모달 닫기
    const closeEventModal = document.getElementById('close-event-modal');
    if (closeEventModal) {
      closeEventModal.addEventListener('click', () => this.hideEventDetailModal());
    }

    const closeEventDetailBtn = document.getElementById('close-event-detail-btn');
    if (closeEventDetailBtn) {
      closeEventDetailBtn.addEventListener('click', () => this.hideEventDetailModal());
    }

    // 이벤트 삭제
    const deleteEventBtn = document.getElementById('delete-event-btn');
    if (deleteEventBtn) {
      deleteEventBtn.addEventListener('click', () => this.deleteSelectedEvent());
    }

    // 드래그로 이벤트 생성
    this.attachDragListeners();
  },

  // 드래그 리스너 등록
  attachDragListeners() {
    const dayColumns = document.querySelectorAll('.timeline-day-slots');

    dayColumns.forEach(slotsContainer => {
      let dragOverlay = null;

      slotsContainer.addEventListener('mousedown', (e) => {
        // 이벤트 블록 클릭은 무시
        if (e.target.closest('.timeline-event-block')) return;

        this.isDragging = true;
        this.dragStartTime = this.getTimeFromPosition(slotsContainer, e);

        // 드래그 오버레이 생성
        dragOverlay = document.createElement('div');
        dragOverlay.className = 'drag-overlay';
        dragOverlay.style.top = `${(this.timeToMinutes(this.dragStartTime) / (24 * 60)) * 100}%`;
        dragOverlay.style.height = '0%';
        slotsContainer.appendChild(dragOverlay);
      });

      slotsContainer.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !dragOverlay) return;

        this.dragEndTime = this.getTimeFromPosition(slotsContainer, e);

        // 최소 5분
        const startMin = this.timeToMinutes(this.dragStartTime);
        const endMin = this.timeToMinutes(this.dragEndTime);

        if (endMin > startMin) {
          const duration = endMin - startMin;
          dragOverlay.style.height = `${(duration / (24 * 60)) * 100}%`;
        }
      });

      slotsContainer.addEventListener('mouseup', (e) => {
        if (!this.isDragging) return;

        this.dragEndTime = this.getTimeFromPosition(slotsContainer, e);

        // 드래그 오버레이 제거
        if (dragOverlay) {
          dragOverlay.remove();
          dragOverlay = null;
        }

        // 이벤트 생성
        const startMin = this.timeToMinutes(this.dragStartTime);
        const endMin = this.timeToMinutes(this.dragEndTime);

        if (endMin > startMin && (endMin - startMin) >= 5) {
          const dateStr = slotsContainer.dataset.date;
          this.createEventFromDrag(dateStr, this.dragStartTime, this.dragEndTime);
        }

        this.isDragging = false;
        this.dragStartTime = null;
        this.dragEndTime = null;
      });

      slotsContainer.addEventListener('mouseleave', () => {
        if (this.isDragging && dragOverlay) {
          dragOverlay.remove();
          dragOverlay = null;
        }
        this.isDragging = false;
      });
    });
  },

  // 마우스 위치에서 시간 계산 (5분 단위로 스냅)
  getTimeFromPosition(container, event) {
    const rect = container.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percent = y / rect.height;
    const totalMinutes = Math.round(percent * 24 * 60);

    // 5분 단위로 스냅
    const snappedMinutes = Math.round(totalMinutes / 5) * 5;
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  },

  // 시간 문자열을 분으로 변환
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // 드래그로 이벤트 생성
  createEventFromDrag(dateStr, startTime, endTime) {
    const title = prompt('일정 제목을 입력하세요:');
    if (!title || title.trim() === '') return;

    const event = {
      id: Date.now().toString(),
      title: title.trim(),
      date: dateStr,
      startTime,
      endTime,
      category: 'other',
      createdAt: new Date().toISOString()
    };

    this.events.push(event);
    this.saveEvents();
    this.renderAllEvents();
  },

  // 시간표 모달 표시
  showTimetableModal() {
    const modal = document.getElementById('timetable-modal');
    if (modal) {
      modal.style.display = 'block';
      setTimeout(() => modal.classList.add('show'), 10);
    }
  },

  // 시간표 모달 숨김
  hideTimetableModal() {
    const modal = document.getElementById('timetable-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
      this.clearTimetableForm();
    }
  },

  // 시간표 폼 초기화
  clearTimetableForm() {
    document.getElementById('timetable-title').value = '';
    document.getElementById('timetable-start-time').value = '';
    document.getElementById('timetable-end-time').value = '';
    document.getElementById('timetable-category').value = 'lecture';
    document.querySelectorAll('.day-checkboxes input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
  },

  // 시간표 저장
  saveTimetable() {
    const title = document.getElementById('timetable-title').value.trim();
    const startTime = document.getElementById('timetable-start-time').value;
    const endTime = document.getElementById('timetable-end-time').value;
    const category = document.getElementById('timetable-category').value;

    const selectedDays = Array.from(document.querySelectorAll('.day-checkboxes input[type="checkbox"]:checked'))
      .map(cb => parseInt(cb.value));

    if (!title || !startTime || !endTime || selectedDays.length === 0) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 각 요일에 대해 시간표 이벤트 생성
    selectedDays.forEach(dayOfWeek => {
      const timetableEvent = {
        id: `timetable_${Date.now()}_${dayOfWeek}`,
        title,
        dayOfWeek, // 0: 일, 1: 월, 2: 화, ..., 6: 토
        startTime,
        endTime,
        category,
        createdAt: new Date().toISOString()
      };

      this.timetableEvents.push(timetableEvent);
    });

    this.saveTimetableToStorage();
    this.hideTimetableModal();
    this.renderAllEvents();
  },

  // 이벤트 상세 표시
  showEventDetail(event, isTimetable) {
    this.selectedEventId = event.id;

    const modal = document.getElementById('event-detail-modal');
    if (!modal) return;

    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-time-text').textContent = `${event.startTime} ~ ${event.endTime}`;
    document.getElementById('modal-event-category-text').textContent = this.getCategoryLabel(event.category);

    // 시간표 이벤트는 삭제 불가
    const deleteBtn = document.getElementById('delete-event-btn');
    if (deleteBtn) {
      deleteBtn.style.display = isTimetable ? 'none' : 'block';
    }

    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
  },

  // 이벤트 상세 모달 숨김
  hideEventDetailModal() {
    const modal = document.getElementById('event-detail-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
    this.selectedEventId = null;
  },

  // 선택된 이벤트 삭제
  deleteSelectedEvent() {
    if (!this.selectedEventId) return;

    if (!confirm('이 일정을 삭제하시겠습니까?')) return;

    this.events = this.events.filter(e => e.id !== this.selectedEventId);
    this.saveEvents();
    this.hideEventDetailModal();
    this.renderAllEvents();
  },

  // 특정 날짜의 이벤트 가져오기
  getEventsForDate(dateStr) {
    return this.events.filter(e => e.date === dateStr);
  },

  // 특정 요일의 시간표 가져오기
  getTimetableForDay(dayOfWeek) {
    return this.timetableEvents.filter(e => e.dayOfWeek === dayOfWeek);
  },

  // 날짜 비교
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },

  // 날짜 포맷팅 (YYYY-MM-DD)
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 카테고리 라벨
  getCategoryLabel(category) {
    const labels = {
      study: '📚 공부',
      work: '💼 업무',
      personal: '🎯 개인',
      meeting: '👥 미팅',
      lecture: '📚 강의',
      lab: '🔬 실습',
      exercise: '🏃 운동',
      other: '📌 기타'
    };
    return labels[category] || labels.other;
  },

  // HTML 이스케이프
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 데이터 로드/저장
  loadEvents() {
    const stored = localStorage.getItem('weekly_events');
    if (stored) {
      try {
        this.events = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load events:', error);
        this.events = [];
      }
    }
  },

  saveEvents() {
    localStorage.setItem('weekly_events', JSON.stringify(this.events));
  },

  loadTimetable() {
    const stored = localStorage.getItem('timetable_events');
    if (stored) {
      try {
        this.timetableEvents = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load timetable:', error);
        this.timetableEvents = [];
      }
    }
  },

  saveTimetableToStorage() {
    localStorage.setItem('timetable_events', JSON.stringify(this.timetableEvents));
  }
};

export default WeeklyScreen;
