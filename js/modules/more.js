// more.js - 더보기 화면 모듈
// 부가 기능과 설정을 제공하는 메뉴

import { AppState, toggleTheme } from '../app.js';

const MoreScreen = {
  // 화면 렌더링
  render() {
    const currentTheme = AppState.theme;
    const user = AppState.user;

    return `
      <div class="more-screen fade-in">
        <div class="more-header">
          <h1 class="screen-title">더보기</h1>
          <p class="screen-subtitle">설정 및 추가 기능</p>
        </div>

        <!-- 사용자 정보 -->
        <section class="user-section">
          ${user ? `
            <div class="user-info">
              <div class="user-avatar">👤</div>
              <div class="user-details">
                <h3>${user.email || '사용자'}</h3>
                <button class="logout-btn">로그아웃</button>
              </div>
            </div>
          ` : `
            <div class="login-prompt">
              <p>로그인하여 데이터를 동기화하세요</p>
              <button class="login-btn">로그인</button>
            </div>
          `}
        </section>

        <!-- 빠른 기능 -->
        <section class="quick-features">
          <h2>빠른 기능</h2>
          <div class="feature-grid">
            <button class="feature-card">
              <span class="icon">📝</span>
              <span class="label">빠른 메모</span>
            </button>
            <button class="feature-card">
              <span class="icon">📊</span>
              <span class="label">통계</span>
            </button>
            <button class="feature-card">
              <span class="icon">🔍</span>
              <span class="label">전체 검색</span>
            </button>
            <button class="feature-card">
              <span class="icon">⏰</span>
              <span class="label">D-Day</span>
            </button>
          </div>
        </section>

        <!-- 설정 -->
        <section class="settings-section">
          <h2>설정</h2>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">${currentTheme === 'light' ? '☀️' : '🌙'}</span>
                <span class="label">테마</span>
              </div>
              <button class="toggle-btn" id="theme-toggle-more">
                ${currentTheme === 'light' ? '라이트' : '다크'}
              </button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">🔔</span>
                <span class="label">알림</span>
              </div>
              <span class="setting-value">개발 예정</span>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">💾</span>
                <span class="label">데이터 백업</span>
              </div>
              <button class="action-btn">백업</button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">📥</span>
                <span class="label">데이터 복원</span>
              </div>
              <button class="action-btn">복원</button>
            </div>
          </div>
        </section>

        <!-- 앱 정보 -->
        <section class="app-info">
          <p class="app-version">나날 (Nanal) v1.0.0</p>
          <p class="app-description">일상 관리 허브</p>
        </section>
      </div>
    `;
  },

  // 초기화
  init() {
    console.log('More screen initialized');

    // 테마 토글 버튼
    const themeToggleBtn = document.getElementById('theme-toggle-more');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
        // 화면 다시 렌더링하여 버튼 텍스트 업데이트
        const container = document.getElementById('screen-container');
        container.innerHTML = this.render();
        this.init();
      });
    }

    // TODO: Week 5에서 구현
    // - 로그인/로그아웃
    // - 빠른 메모
    // - 통계 및 인사이트
    // - 전체 검색
    // - D-Day 관리
    // - 데이터 백업/복원
  },

  // 화면 정리
  destroy() {
    console.log('More screen destroyed');
  }
};

export default MoreScreen;
