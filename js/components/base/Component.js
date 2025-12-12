// components/base/Component.js
/**
 * Base Component - 모든 UI 컴포넌트의 부모 클래스
 *
 * 제공 기능:
 * - 라이프사이클 관리 (mount, render, update, destroy)
 * - 이벤트 리스너 자동 정리
 * - DOM 참조 관리
 * - 상태 관리
 *
 * 사용법:
 * ```javascript
 * class MyComponent extends Component {
 *   constructor(containerId, options) {
 *     super(containerId, options);
 *   }
 *
 *   template() {
 *     return `<div>Hello ${this.options.name}</div>`;
 *   }
 *
 *   setupEventListeners() {
 *     const btn = this.$('button');
 *     this.addEventListener(btn, 'click', () => console.log('clicked'));
 *   }
 * }
 * ```
 */
export class Component {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.container = null;
    this.isDestroyed = false;
    this.isMounted = false;

    // 이벤트 핸들러 레지스트리 (자동 정리용)
    this.eventHandlers = new Map();

    // 내부 상태
    this.state = {};
  }

  /**
   * DOM에 컴포넌트 마운트
   */
  mount() {
    if (this.isMounted) {
      console.warn(`[${this.constructor.name}] Already mounted`);
      return;
    }

    this.container = document.getElementById(this.containerId);

    if (!this.container) {
      throw new Error(`[${this.constructor.name}] Container #${this.containerId} not found`);
    }

    this.render();
    this.setupEventListeners();
    this.onMount();
    this.isMounted = true;

    console.log(`[${this.constructor.name}] Mounted to #${this.containerId}`);
  }

  /**
   * HTML 템플릿 렌더링
   */
  render() {
    if (!this.container) return;

    const html = this.template();
    this.container.innerHTML = html;

    this.onRender();
  }

  /**
   * HTML 템플릿 생성 (자식 클래스에서 오버라이드)
   * @returns {string} HTML string
   */
  template() {
    return '';
  }

  /**
   * 이벤트 리스너 설정 (자식 클래스에서 오버라이드)
   */
  setupEventListeners() {
    // Override in child classes
  }

  /**
   * 데이터로 컴포넌트 업데이트
   * @param {object} newData - 새 데이터/옵션
   */
  update(newData = {}) {
    this.options = { ...this.options, ...newData };
    this.render();
    this.setupEventListeners();
    this.onUpdate();
  }

  /**
   * 내부 상태 업데이트
   * @param {object} newState - 새 상태
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
    this.setupEventListeners();
  }

  /**
   * 이벤트 리스너 등록 (자동 정리됨)
   * @param {Element} element - 대상 요소
   * @param {string} eventType - 이벤트 타입
   * @param {Function} listener - 리스너 함수
   */
  addEventListener(element, eventType, listener) {
    if (!element) return;

    element.addEventListener(eventType, listener);

    // 정리를 위해 등록
    const key = `${eventType}_${Math.random()}`;
    this.eventHandlers.set(key, { element, eventType, listener });
  }

  /**
   * 컴포넌트 제거 및 정리
   */
  destroy() {
    if (this.isDestroyed) return;

    this.onDestroy();

    // 모든 이벤트 리스너 제거
    this.eventHandlers.forEach(({ element, eventType, listener }) => {
      element.removeEventListener(eventType, listener);
    });
    this.eventHandlers.clear();

    // DOM 정리
    if (this.container) {
      this.container.innerHTML = '';
    }

    this.isDestroyed = true;
    this.isMounted = false;

    console.log(`[${this.constructor.name}] Destroyed`);
  }

  // ============================================================
  // 라이프사이클 훅 (자식 클래스에서 오버라이드 가능)
  // ============================================================

  /**
   * 마운트 후 호출
   */
  onMount() {
    // Override in child classes
  }

  /**
   * 렌더링 후 호출
   */
  onRender() {
    // Override in child classes
  }

  /**
   * 업데이트 후 호출
   */
  onUpdate() {
    // Override in child classes
  }

  /**
   * 제거 전 호출
   */
  onDestroy() {
    // Override in child classes
  }

  // ============================================================
  // 유틸리티 메서드
  // ============================================================

  /**
   * 컨테이너 내에서 요소 찾기
   * @param {string} selector - CSS 선택자
   * @returns {Element|null}
   */
  $(selector) {
    return this.container ? this.container.querySelector(selector) : null;
  }

  /**
   * 컨테이너 내에서 모든 요소 찾기
   * @param {string} selector - CSS 선택자
   * @returns {NodeList}
   */
  $$(selector) {
    return this.container ? this.container.querySelectorAll(selector) : [];
  }
}

export default Component;
