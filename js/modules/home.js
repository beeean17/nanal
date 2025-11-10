// home.js - 홈 화면 모듈
// 오늘에 집중할 수 있도록 중요한 정보들을 모아 보여주는 대시보드

import { AppState } from '../app.js';

const HomeScreen = {
  // 화면 렌더링
  render() {
    return `
      <div class="home-screen fade-in">
        <div class="home-header">
          <h1 class="screen-title">홈</h1>
          <p class="screen-subtitle">오늘 하루를 시작해보세요</p>
        </div>

        <!-- 날씨 위젯 -->
        <section class="weather-widget">
          <div class="widget-placeholder">
            <span class="icon">🌤️</span>
            <p>날씨 위젯 (개발 예정)</p>
          </div>
        </section>

        <!-- To-Do List -->
        <section class="todo-section">
          <div class="section-header">
            <h2>오늘의 할 일</h2>
            <button class="add-btn" aria-label="할 일 추가">+</button>
          </div>
          <div class="todo-list">
            <div class="widget-placeholder">
              <span class="icon">✓</span>
              <p>To-Do List (개발 예정)</p>
            </div>
          </div>
        </section>

        <!-- 타임라인 -->
        <section class="timeline-section">
          <div class="section-header">
            <h2>오늘의 일정</h2>
          </div>
          <div class="timeline-container">
            <div class="widget-placeholder">
              <span class="icon">📋</span>
              <p>타임라인 (개발 예정)</p>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  // 초기화 및 이벤트 리스너 설정
  init() {
    console.log('Home screen initialized');

    // TODO: Week 2에서 구현
    // - To-Do List 기능
    // - 날씨 위젯
    // - 타임라인
    // - 뽀모도로 타이머
  },

  // 화면 정리
  destroy() {
    console.log('Home screen destroyed');
    // 이벤트 리스너 제거 등
  }
};

export default HomeScreen;
