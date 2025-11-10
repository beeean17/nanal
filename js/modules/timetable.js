// timetable.js - 시간표 화면 모듈
// 매주 반복되는 고정 일정을 시각적으로 관리

import { AppState } from '../app.js';

const TimetableScreen = {
  currentDay: new Date().getDay(), // 0 (일요일) ~ 6 (토요일)

  // 화면 렌더링
  render() {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const currentDayName = days[this.currentDay];

    return `
      <div class="timetable-screen fade-in">
        <div class="timetable-header">
          <h1 class="screen-title">시간표</h1>
          <p class="screen-subtitle">주간 고정 일정</p>
        </div>

        <!-- 요일 선택 (모바일) -->
        <div class="day-selector mobile-only">
          ${days.map((day, index) => `
            <button class="day-btn ${index === this.currentDay ? 'active' : ''}"
                    data-day="${index}">
              ${day.substring(0, 1)}
            </button>
          `).join('')}
        </div>

        <!-- 시간표 그리드 -->
        <section class="timetable-grid-section">
          <!-- 모바일: 세로 타임라인 -->
          <div class="timetable-mobile mobile-only">
            <h2>${currentDayName}</h2>
            <div class="widget-placeholder">
              <span class="icon">📋</span>
              <p>세로 타임라인 (개발 예정)</p>
            </div>
          </div>

          <!-- 데스크탑: 주간 그리드 -->
          <div class="timetable-desktop desktop-only">
            <div class="widget-placeholder">
              <span class="icon">📅</span>
              <p>주간 그리드 (개발 예정)</p>
              <p class="small-text">가로: 요일, 세로: 시간</p>
            </div>
          </div>
        </section>

        <!-- 주간 루틴 체크리스트 -->
        <section class="routine-checklist">
          <h2>주간 루틴</h2>
          <div class="widget-placeholder">
            <span class="icon">✓</span>
            <p>루틴 체크리스트 (개발 예정)</p>
          </div>
        </section>
      </div>
    `;
  },

  // 초기화
  init() {
    console.log('Timetable screen initialized');

    // 요일 선택 이벤트
    this.setupDaySelector();

    // TODO: Week 4에서 구현
    // - 시간표 그리드
    // - 드래그 앤 드롭 편집
    // - 색상 커스터마이징
    // - 이미지 저장 기능
  },

  // 요일 선택 설정
  setupDaySelector() {
    const dayButtons = document.querySelectorAll('.day-btn');

    dayButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedDay = parseInt(e.target.dataset.day);

        // 모든 버튼 비활성화
        dayButtons.forEach(b => b.classList.remove('active'));

        // 선택된 버튼 활성화
        e.target.classList.add('active');

        this.currentDay = selectedDay;
        console.log('Selected day:', selectedDay);

        // TODO: 해당 요일의 시간표 렌더링
      });
    });
  },

  // 화면 정리
  destroy() {
    console.log('Timetable screen destroyed');
  }
};

export default TimetableScreen;
