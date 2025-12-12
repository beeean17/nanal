// core/Logger.js
/**
 * Logger - 앱 로깅 시스템
 *
 * 기능:
 * - 레벨별 로깅 (debug, info, warn, error)
 * - 개발/프로덕션 모드 전환
 * - 로그 히스토리 저장
 * - 그룹 로깅
 *
 * 사용 예:
 * ```javascript
 * Logger.info('User logged in', { userId: 123 });
 * Logger.error('Failed to save', error);
 * Logger.debug('Component mounted', componentName);
 * ```
 */
class LoggerClass {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };

    // 현재 로그 레벨 (개발: DEBUG, 프로덕션: INFO)
    this.currentLevel = this.levels.DEBUG;

    // 프로덕션 모드 여부
    this.isProduction = false;

    // 로그 히스토리 (최대 100개)
    this.history = [];
    this.maxHistory = 100;

    // 로그 활성화 여부
    this.enabled = true;
  }

  /**
   * 프로덕션 모드 설정
   * @param {boolean} isProduction - 프로덕션 모드 여부
   */
  setProduction(isProduction) {
    this.isProduction = isProduction;
    this.currentLevel = isProduction ? this.levels.INFO : this.levels.DEBUG;
    console.log(`[Logger] Mode: ${isProduction ? 'Production' : 'Development'}`);
  }

  /**
   * 로거 활성화/비활성화
   * @param {boolean} enabled - 활성화 여부
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * 로그 레벨 설정
   * @param {string} level - 로그 레벨 (DEBUG, INFO, WARN, ERROR)
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
      console.log(`[Logger] Level set to: ${level}`);
    }
  }

  /**
   * 로그 메시지 기록
   * @param {string} level - 로그 레벨
   * @param {string} message - 메시지
   * @param  {...any} args - 추가 인자
   */
  log(level, message, ...args) {
    if (!this.enabled) return;
    if (this.levels[level] < this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: args
    };

    // 히스토리에 추가
    this.addToHistory(logEntry);

    // 콘솔 출력
    const style = this.getStyle(level);
    const prefix = `[${timestamp.split('T')[1].slice(0, 8)}] [${level}]`;

    switch (level) {
      case 'DEBUG':
        console.log(`%c${prefix}`, style, message, ...args);
        break;
      case 'INFO':
        console.info(`%c${prefix}`, style, message, ...args);
        break;
      case 'WARN':
        console.warn(`%c${prefix}`, style, message, ...args);
        break;
      case 'ERROR':
        console.error(`%c${prefix}`, style, message, ...args);
        break;
    }
  }

  /**
   * 디버그 로그
   * @param {string} message - 메시지
   * @param  {...any} args - 추가 인자
   */
  debug(message, ...args) {
    this.log('DEBUG', message, ...args);
  }

  /**
   * 정보 로그
   * @param {string} message - 메시지
   * @param  {...any} args - 추가 인자
   */
  info(message, ...args) {
    this.log('INFO', message, ...args);
  }

  /**
   * 경고 로그
   * @param {string} message - 메시지
   * @param  {...any} args - 추가 인자
   */
  warn(message, ...args) {
    this.log('WARN', message, ...args);
  }

  /**
   * 에러 로그
   * @param {string} message - 메시지
   * @param  {...any} args - 추가 인자
   */
  error(message, ...args) {
    this.log('ERROR', message, ...args);
  }

  /**
   * 그룹 로그 시작
   * @param {string} label - 그룹 레이블
   */
  group(label) {
    if (!this.enabled) return;
    console.group(label);
  }

  /**
   * 그룹 로그 종료
   */
  groupEnd() {
    if (!this.enabled) return;
    console.groupEnd();
  }

  /**
   * 테이블 로그
   * @param {Array|Object} data - 테이블로 표시할 데이터
   */
  table(data) {
    if (!this.enabled) return;
    console.table(data);
  }

  /**
   * 시간 측정 시작
   * @param {string} label - 타이머 레이블
   */
  time(label) {
    if (!this.enabled) return;
    console.time(label);
  }

  /**
   * 시간 측정 종료
   * @param {string} label - 타이머 레이블
   */
  timeEnd(label) {
    if (!this.enabled) return;
    console.timeEnd(label);
  }

  /**
   * 히스토리에 로그 추가
   * @param {object} logEntry - 로그 항목
   */
  addToHistory(logEntry) {
    this.history.push(logEntry);

    // 최대 개수 초과 시 오래된 로그 제거
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * 로그 히스토리 가져오기
   * @param {string} level - 필터링할 레벨 (선택)
   * @returns {Array} 로그 히스토리
   */
  getHistory(level = null) {
    if (level) {
      return this.history.filter(entry => entry.level === level);
    }
    return [...this.history];
  }

  /**
   * 히스토리 초기화
   */
  clearHistory() {
    this.history = [];
    console.log('[Logger] History cleared');
  }

  /**
   * 로그 레벨별 스타일 가져오기
   * @param {string} level - 로그 레벨
   * @returns {string} CSS 스타일
   */
  getStyle(level) {
    const styles = {
      DEBUG: 'color: #888; font-weight: normal;',
      INFO: 'color: #2196F3; font-weight: bold;',
      WARN: 'color: #FF9800; font-weight: bold;',
      ERROR: 'color: #F44336; font-weight: bold;'
    };
    return styles[level] || '';
  }

  /**
   * 로거 통계 출력
   */
  printStats() {
    const stats = {
      total: this.history.length,
      debug: this.history.filter(e => e.level === 'DEBUG').length,
      info: this.history.filter(e => e.level === 'INFO').length,
      warn: this.history.filter(e => e.level === 'WARN').length,
      error: this.history.filter(e => e.level === 'ERROR').length
    };

    console.log('[Logger] Statistics:');
    this.table(stats);
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const Logger = new LoggerClass();
export default Logger;
