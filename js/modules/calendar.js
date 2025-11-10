// calendar.js - 캘린더 화면 모듈
// 한 달 전체의 일정과 가계부를 통합 관리

import { AppState } from '../app.js';

const CalendarScreen = {
  // 화면 렌더링
  render() {
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

    return `
      <div class="calendar-screen fade-in">
        <div class="calendar-header">
          <h1 class="screen-title">캘린더</h1>
          <p class="screen-subtitle">${monthName}</p>
        </div>

        <!-- 월간 캘린더 -->
        <section class="calendar-grid-section">
          <div class="calendar-controls">
            <button class="nav-btn prev-month" aria-label="이전 달">&lt;</button>
            <h2 class="current-month">${monthName}</h2>
            <button class="nav-btn next-month" aria-label="다음 달">&gt;</button>
          </div>

          <div class="calendar-grid">
            <div class="widget-placeholder">
              <span class="icon">📅</span>
              <p>월간 캘린더 그리드 (개발 예정)</p>
            </div>
          </div>
        </section>

        <!-- 선택된 날짜 상세 정보 패널 -->
        <section class="date-detail-panel">
          <div class="widget-placeholder">
            <span class="icon">📝</span>
            <p>날짜 상세 정보 패널 (개발 예정)</p>
            <p class="small-text">일정 / 가계부 / 메모</p>
          </div>
        </section>
      </div>
    `;
  },

  // 초기화
  init() {
    console.log('Calendar screen initialized');

    // TODO: Week 3-4에서 구현
    // - 월간 캘린더 그리드
    // - 일정 표시
    // - 가계부 통합
    // - 날짜 선택 시 상세 패널
  },

  // 화면 정리
  destroy() {
    console.log('Calendar screen destroyed');
  }
};

export default CalendarScreen;
