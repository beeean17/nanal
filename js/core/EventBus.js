// core/EventBus.js
/**
 * EventBus - 전역 이벤트 버스 (Pub/Sub 패턴)
 *
 * 컴포넌트 간 느슨한 결합 통신을 위한 이벤트 시스템
 *
 * 사용 예:
 * ```javascript
 * // 구독
 * EventBus.on('task:created', (task) => {
 *   console.log('Task created:', task);
 * });
 *
 * // 발행
 * EventBus.emit('task:created', taskData);
 *
 * // 구독 해제
 * EventBus.off('task:created', handler);
 * ```
 */
class EventBusClass {
  constructor() {
    this.events = new Map();
  }

  /**
   * 이벤트 구독
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   * @returns {Function} 구독 해제 함수
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    this.events.get(event).push(callback);

    // 구독 해제 함수 반환
    return () => this.off(event, callback);
  }

  /**
   * 일회성 이벤트 구독
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };

    this.on(event, onceCallback);
  }

  /**
   * 이벤트 구독 해제
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  off(event, callback) {
    if (!this.events.has(event)) return;

    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);
    }

    // 구독자 없으면 삭제
    if (callbacks.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * 이벤트 발행
   * @param {string} event - 이벤트 이름
   * @param  {...any} args - 전달할 인자
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return;

    const callbacks = this.events.get(event);
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`[EventBus] Error in ${event} handler:`, error);
      }
    });

    console.log(`[EventBus] Emitted: ${event}`, args.length > 0 ? args : '');
  }

  /**
   * 모든 이벤트 구독 해제
   */
  clear() {
    this.events.clear();
    console.log('[EventBus] Cleared all events');
  }

  /**
   * 특정 이벤트의 모든 구독 해제
   * @param {string} event - 이벤트 이름
   */
  clearEvent(event) {
    this.events.delete(event);
    console.log(`[EventBus] Cleared event: ${event}`);
  }

  /**
   * 등록된 이벤트 목록 가져오기
   * @returns {Array<string>} 이벤트 이름 배열
   */
  getEvents() {
    return Array.from(this.events.keys());
  }

  /**
   * 특정 이벤트의 구독자 수 가져오기
   * @param {string} event - 이벤트 이름
   * @returns {number} 구독자 수
   */
  getListenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const EventBus = new EventBusClass();
export default EventBus;
