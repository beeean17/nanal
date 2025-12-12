// core/Router.js
/**
 * Router - SPA 클라이언트 사이드 라우팅
 *
 * 기능:
 * - Hash-based routing (#home, #calendar 등)
 * - 뷰 전환 관리
 * - 브라우저 히스토리 연동
 * - 뷰 라이프사이클 관리
 *
 * 사용법:
 * ```javascript
 * const router = new Router({
 *   home: HomeView,
 *   calendar: CalendarView
 * }, 'home');
 *
 * router.init();
 * router.navigateTo('calendar');
 * ```
 */
export class Router {
  constructor(viewClasses = {}, defaultRoute = 'home', containerId = 'screen-container') {
    this.viewClasses = viewClasses;     // { home: HomeView, calendar: CalendarView, ... }
    this.defaultRoute = defaultRoute;
    this.containerId = containerId;
    this.currentView = null;
    this.currentRoute = null;
    this.container = null;

    // View instances (재사용)
    this.viewInstances = {};
  }

  /**
   * 라우터 초기화
   */
  init() {
    console.log('[Router] Initializing...');

    // 컨테이너 확인
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`[Router] Container #${this.containerId} not found`);
    }

    // Hash change 이벤트 리스너
    window.addEventListener('hashchange', () => this.handleRouteChange());

    // Popstate 이벤트 리스너 (뒤로가기)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.screen) {
        this.navigateTo(e.state.screen, false);
      }
    });

    // 초기 라우트
    this.handleRouteChange();

    console.log('[Router] Initialized');
  }

  /**
   * Hash 변경 핸들러
   */
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || this.defaultRoute;
    this.navigateTo(hash, false);
  }

  /**
   * 라우트 이동
   * @param {string} route - 이동할 라우트
   * @param {boolean} pushState - 히스토리에 추가할지 여부
   */
  navigateTo(route, pushState = true) {
    console.log(`[Router] Navigating to: ${route}`);

    // 유효한 라우트 확인
    if (!this.viewClasses[route]) {
      console.error(`[Router] Route not found: ${route}`);
      route = this.defaultRoute;
    }

    // 같은 라우트면 무시
    if (this.currentRoute === route) {
      console.log(`[Router] Already on route: ${route}`);
      return;
    }

    // 이전 뷰 정리
    this.hideCurrentView();

    // 새 뷰 표시
    this.showView(route);

    // 네비게이션 업데이트
    this.updateNavigation(route);

    // 히스토리 업데이트
    if (pushState) {
      window.history.pushState({ screen: route }, '', `#${route}`);
    }

    this.currentRoute = route;
  }

  /**
   * 현재 뷰 숨기기 및 정리
   */
  hideCurrentView() {
    if (this.currentView && this.currentView.destroy) {
      this.currentView.destroy();
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.currentView = null;
  }

  /**
   * 뷰 표시
   * @param {string} route - 표시할 라우트
   */
  showView(route) {
    // View 인스턴스 가져오기 (없으면 생성)
    if (!this.viewInstances[route]) {
      const ViewClass = this.viewClasses[route];
      this.viewInstances[route] = new ViewClass();
      console.log(`[Router] Created view instance: ${route}`);
    }

    const view = this.viewInstances[route];
    this.currentView = view;

    // 뷰 렌더링
    if (!this.container) return;

    const html = view.render();
    this.container.innerHTML = html;

    // 뷰 초기화
    if (view.init) {
      view.init();
    }

    console.log(`[Router] Loaded view: ${route}`);
  }

  /**
   * 네비게이션 활성 상태 업데이트
   * @param {string} route - 현재 라우트
   */
  updateNavigation(route) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const screen = item.dataset.screen;
      if (screen === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * 현재 라우트 가져오기
   * @returns {string} 현재 라우트
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * 현재 뷰 가져오기
   * @returns {object|null} 현재 뷰 인스턴스
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * 라우터 정리
   */
  destroy() {
    this.hideCurrentView();

    // 모든 뷰 인스턴스 정리
    Object.values(this.viewInstances).forEach(view => {
      if (view.destroy) {
        view.destroy();
      }
    });

    this.viewInstances = {};
    console.log('[Router] Destroyed');
  }
}

export default Router;
