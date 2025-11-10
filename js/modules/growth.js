// growth.js - 성장 트래킹 화면 모듈
// 장기 목표와 매일의 습관을 추적하고 관리

import { AppState } from '../app.js';

const GrowthScreen = {
  currentTab: 'goals', // 'goals' or 'habits'

  // 화면 렌더링
  render() {
    return `
      <div class="growth-screen fade-in">
        <div class="growth-header">
          <h1 class="screen-title">성장 트래킹</h1>
          <p class="screen-subtitle">목표를 달성하고 습관을 만들어가세요</p>
        </div>

        <!-- 탭 네비게이션 -->
        <div class="tab-navigation">
          <button class="tab-btn active" data-tab="goals">목표</button>
          <button class="tab-btn" data-tab="habits">습관</button>
        </div>

        <!-- 목표 탭 -->
        <section class="tab-content goals-tab active" data-tab-content="goals">
          <div class="section-header">
            <h2>진행 중인 목표</h2>
            <button class="add-btn" aria-label="목표 추가">+</button>
          </div>
          <div class="goals-list">
            <div class="widget-placeholder">
              <span class="icon">🎯</span>
              <p>목표 카드 리스트 (개발 예정)</p>
              <p class="small-text">진행률 바, D-Day 표시</p>
            </div>
          </div>
        </section>

        <!-- 습관 탭 -->
        <section class="tab-content habits-tab" data-tab-content="habits">
          <div class="section-header">
            <h2>습관 트래커</h2>
            <button class="add-btn" aria-label="습관 추가">+</button>
          </div>
          <div class="habits-list">
            <div class="widget-placeholder">
              <span class="icon">📊</span>
              <p>습관 히트맵 (개발 예정)</p>
              <p class="small-text">월간 캘린더, 연속 달성 일수</p>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  // 초기화
  init() {
    console.log('Growth screen initialized');

    // 탭 전환 이벤트 설정
    this.setupTabNavigation();

    // TODO: Week 4에서 구현
    // - 목표 CRUD
    // - 습관 트래커
    // - 진행률 바
    // - 히트맵
  },

  // 탭 네비게이션 설정
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;

        // 모든 탭 비활성화
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // 선택된 탭 활성화
        e.target.classList.add('active');
        document.querySelector(`[data-tab-content="${targetTab}"]`).classList.add('active');

        this.currentTab = targetTab;
      });
    });
  },

  // 화면 정리
  destroy() {
    console.log('Growth screen destroyed');
  }
};

export default GrowthScreen;
