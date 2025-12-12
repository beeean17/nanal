// components/widgets/FocusTimer.js - Pomodoro-style focus timer widget
import { Component } from '../base/Component.js';
import { dataManager } from '../../state.js';
import { notificationService } from '../../services/index.js';

/**
 * FocusTimer - Pomodoro-style focus timer with work/break sessions
 * @class
 * @extends Component
 */
export class FocusTimer extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      defaultWorkDuration: 25, // minutes
      defaultBreakDuration: 5, // minutes
      showStats: true,
      enableNotifications: true,
      onSessionComplete: null,
      onModeChange: null,
      ...options
    });

    // Timer state
    this.state = {
      interval: null,
      timeLeft: this.options.defaultWorkDuration * 60, // seconds
      isRunning: false,
      mode: 'work', // 'work' or 'break'
      sessions: 0,
      workDuration: this.options.defaultWorkDuration * 60,
      breakDuration: this.options.defaultBreakDuration * 60,
      sessionStartTime: null
    };
  }

  template() {
    const workPresets = [15, 25, 45, 60];
    const breakPresets = [5, 10, 15];

    return `
      <div class="focus-timer">
        <!-- Timer Display -->
        <div class="timer-display">
          <div class="timer-mode" id="timer-mode">
            ${this.state.mode === 'work' ? '작업 시간' : '휴식 시간'}
          </div>

          <!-- Progress Circle -->
          <div class="timer-circle">
            <svg width="200" height="200" class="progress-ring">
              <circle
                class="progress-ring-bg"
                stroke="#e0e0e0"
                stroke-width="8"
                fill="transparent"
                r="90"
                cx="100"
                cy="100"
              />
              <circle
                id="timer-progress-circle"
                class="progress-ring-circle"
                stroke="var(--primary-color, #4CAF50)"
                stroke-width="8"
                fill="transparent"
                r="90"
                cx="100"
                cy="100"
                stroke-dasharray="565.48 565.48"
                stroke-dashoffset="0"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div class="timer-time" id="timer-time">${this.formatTime()}</div>
          </div>

          <!-- Controls -->
          <div class="timer-controls">
            <button class="timer-btn timer-btn-start" id="timer-start-btn">
              <span class="icon">▶️</span>
              시작
            </button>
            <button class="timer-btn timer-btn-pause" id="timer-pause-btn" style="display: none;">
              <span class="icon">⏸️</span>
              일시정지
            </button>
            <button class="timer-btn timer-btn-reset" id="timer-reset-btn">
              <span class="icon">🔄</span>
              리셋
            </button>
          </div>
        </div>

        <!-- Settings -->
        <div class="timer-settings">
          <!-- Work Duration Presets -->
          <div class="timer-preset-group">
            <label class="preset-label">작업 시간</label>
            <div class="preset-buttons">
              ${workPresets.map(minutes => `
                <button
                  class="preset-btn ${minutes === this.options.defaultWorkDuration ? 'active' : ''}"
                  data-work="${minutes}"
                >
                  ${minutes}분
                </button>
              `).join('')}
            </div>
            <div class="custom-time-input">
              <input
                type="number"
                id="custom-work-time"
                min="1"
                max="999"
                placeholder="사용자 설정"
              />
              <button class="apply-btn" id="apply-work-time">적용</button>
            </div>
          </div>

          <!-- Break Duration Presets -->
          <div class="timer-preset-group">
            <label class="preset-label">휴식 시간</label>
            <div class="preset-buttons">
              ${breakPresets.map(minutes => `
                <button
                  class="preset-btn ${minutes === this.options.defaultBreakDuration ? 'active' : ''}"
                  data-break="${minutes}"
                >
                  ${minutes}분
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Stats -->
        ${this.options.showStats ? `
          <div class="timer-stats">
            <div class="stat-item">
              <span class="stat-label">완료한 세션</span>
              <span class="stat-value" id="timer-sessions">${this.state.sessions}</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    // Work duration presets
    this.$$('[data-work]').forEach(btn => {
      this.addEventListener(btn, 'click', (e) => {
        const minutes = parseInt(e.currentTarget.dataset.work);
        this.setWorkDuration(minutes);

        // Update active state
        this.$$('[data-work]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Custom work time
    const applyWorkBtn = this.$('#apply-work-time');
    if (applyWorkBtn) {
      this.addEventListener(applyWorkBtn, 'click', () => {
        const input = this.$('#custom-work-time');
        const minutes = parseInt(input.value);
        if (minutes && minutes > 0 && minutes <= 999) {
          this.setWorkDuration(minutes);

          // Remove active from presets
          this.$$('[data-work]').forEach(b => b.classList.remove('active'));
        }
      });
    }

    // Break duration presets
    this.$$('[data-break]').forEach(btn => {
      this.addEventListener(btn, 'click', (e) => {
        const minutes = parseInt(e.currentTarget.dataset.break);
        this.state.breakDuration = minutes * 60;

        // Update active state
        this.$$('[data-break]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Start button
    const startBtn = this.$('#timer-start-btn');
    if (startBtn) {
      this.addEventListener(startBtn, 'click', () => this.start());
    }

    // Pause button
    const pauseBtn = this.$('#timer-pause-btn');
    if (pauseBtn) {
      this.addEventListener(pauseBtn, 'click', () => this.pause());
    }

    // Reset button
    const resetBtn = this.$('#timer-reset-btn');
    if (resetBtn) {
      this.addEventListener(resetBtn, 'click', () => this.reset());
    }
  }

  onMount() {
    // Request notification permission if enabled
    if (this.options.enableNotifications) {
      notificationService.requestPermission();
    }

    // Load session stats from dataManager
    this.loadStats();
  }

  onDestroy() {
    // Stop timer
    this.pause();
  }

  /**
   * Format time for display
   * @returns {string} Formatted time (MM:SS)
   */
  formatTime() {
    const minutes = Math.floor(this.state.timeLeft / 60);
    const seconds = this.state.timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Set work duration
   * @param {number} minutes - Duration in minutes
   */
  setWorkDuration(minutes) {
    this.state.workDuration = minutes * 60;

    // If not running and in work mode, update display
    if (!this.state.isRunning && this.state.mode === 'work') {
      this.state.timeLeft = this.state.workDuration;
      this.updateDisplay();
    }
  }

  /**
   * Start timer
   */
  start() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.sessionStartTime = new Date().toISOString();

    // Update UI
    const startBtn = this.$('#timer-start-btn');
    const pauseBtn = this.$('#timer-pause-btn');
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';

    // Start interval
    this.state.interval = setInterval(() => {
      this.state.timeLeft--;

      if (this.state.timeLeft <= 0) {
        this.completeSession();
      } else {
        this.updateDisplay();
      }
    }, 1000);

    console.log('[FocusTimer] Started');
  }

  /**
   * Pause timer
   */
  pause() {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;

    // Clear interval
    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.state.interval = null;
    }

    // Update UI
    const startBtn = this.$('#timer-start-btn');
    const pauseBtn = this.$('#timer-pause-btn');
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';

    console.log('[FocusTimer] Paused');
  }

  /**
   * Reset timer
   */
  reset() {
    this.pause();

    // Reset to current mode duration
    if (this.state.mode === 'work') {
      this.state.timeLeft = this.state.workDuration;
    } else {
      this.state.timeLeft = this.state.breakDuration;
    }

    this.updateDisplay();

    console.log('[FocusTimer] Reset');
  }

  /**
   * Complete current session
   */
  completeSession() {
    this.pause();

    if (this.state.mode === 'work') {
      // Work session completed
      this.state.sessions++;

      // Save focus session to data
      const session = {
        taskId: null, // TODO: Link to current task if selected
        duration: this.state.workDuration / 60, // minutes
        startedAt: this.state.sessionStartTime,
        completedAt: new Date().toISOString()
      };
      dataManager.addFocusSession(session);

      // Update stats display
      this.updateStats();

      // Switch to break mode
      this.state.mode = 'break';
      this.state.timeLeft = this.state.breakDuration;

      // Update mode text
      const modeEl = this.$('#timer-mode');
      if (modeEl) modeEl.textContent = '휴식 시간';

      // Show notification
      this.showNotification('작업 완료!', `${this.state.sessions}번째 세션을 완료했습니다. 휴식하세요!`);

      // Callback
      if (this.options.onSessionComplete) {
        this.options.onSessionComplete('work', this.state.sessions);
      }
    } else {
      // Break session completed
      this.state.mode = 'work';
      this.state.timeLeft = this.state.workDuration;

      // Update mode text
      const modeEl = this.$('#timer-mode');
      if (modeEl) modeEl.textContent = '작업 시간';

      // Show notification
      this.showNotification('휴식 완료!', '다시 집중할 시간입니다!');

      // Callback
      if (this.options.onSessionComplete) {
        this.options.onSessionComplete('break', this.state.sessions);
      }
    }

    // Callback for mode change
    if (this.options.onModeChange) {
      this.options.onModeChange(this.state.mode);
    }

    this.updateDisplay();

    console.log('[FocusTimer] Session completed');
  }

  /**
   * Update timer display
   */
  updateDisplay() {
    // Update time text
    const timeEl = this.$('#timer-time');
    if (timeEl) {
      timeEl.textContent = this.formatTime();
    }

    // Update progress circle
    this.updateProgressCircle();
  }

  /**
   * Update progress circle
   */
  updateProgressCircle() {
    const circle = this.$('#timer-progress-circle');
    if (!circle) return;

    const totalDuration = this.state.mode === 'work'
      ? this.state.workDuration
      : this.state.breakDuration;

    const progress = this.state.timeLeft / totalDuration;
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }

  /**
   * Update stats display
   */
  updateStats() {
    const sessionsEl = this.$('#timer-sessions');
    if (sessionsEl) {
      sessionsEl.textContent = this.state.sessions;
    }
  }

  /**
   * Load stats from dataManager
   */
  loadStats() {
    // Get today's focus sessions
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = dataManager.focusSessions?.filter(session => {
      const sessionDate = session.completedAt?.split('T')[0];
      return sessionDate === today;
    }) || [];

    this.state.sessions = todaySessions.length;
    this.updateStats();
  }

  /**
   * Show notification using NotificationService
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   */
  showNotification(title, body) {
    if (!this.options.enableNotifications) return;
    notificationService.show(title, body);
  }

  /**
   * Get current timer state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.render();
    this.setupEventListeners();
  }
}

export default FocusTimer;
