// views/Home.js - Home view using new component architecture
// Displays today's tasks, timeline, weather, and focus timer

import { dataManager } from '../state.js';
import { Timeline } from '../components/Timeline.js';
import { TodoList } from '../components/TodoList.js';
import { TaskModal, FixedScheduleModal } from '../components/Modal.js';
import { DateUtils, TimeUtils, ValidationUtils } from '../utils.js';

/**
 * Home View - Main dashboard
 * @class
 */
export default class HomeView {
  constructor() {
    // Component instances
    this.timeline = null;
    this.todoList = null;
    this.taskModal = null;
    this.fixedScheduleModal = null;

    // State
    this.currentDate = new Date();
    this.weatherData = null;
    this.currentTimeInterval = null;
    this.weatherInterval = null;

    // Focus timer state
    this.focusTimer = {
      interval: null,
      timeLeft: 15 * 60, // 15 minutes default
      isRunning: false,
      mode: 'work', // 'work' or 'break'
      sessions: 0,
      workDuration: 15 * 60,
      breakDuration: 5 * 60,
      sessionStartTime: null
    };

    // Bound methods for event listeners
    this.boundRefreshView = this.refreshView.bind(this);
    this.boundUpdateDateTime = this.updateDateTime.bind(this);
  }

  /**
   * Render home view HTML
   * @returns {string} HTML string
   */
  render() {
    return `
      <div class="home-screen fade-in">
        <!-- Date, Time & Weather Header -->
        <div class="home-header">
          <div class="home-datetime">
            <div class="datetime-content">
              <p class="home-time" id="home-time">00:00:00</p>
              <h2 class="home-date" id="home-date">2025년 1월 1일</h2>
            </div>
            <!-- Weather Widget Overlay -->
            <section class="weather-widget-overlay" id="weather-widget">
              <div class="weather-loading" id="weather-loading">
                <div class="loading"></div>
                <p>날씨 정보를 불러오는 중...</p>
              </div>
            </section>
          </div>
        </div>

        <!-- Main Grid: Todo List + Timeline -->
        <div class="home-grid-container">
          <!-- Todo List Section -->
          <section class="todo-section">
            <div class="section-header">
              <h2>오늘의 할 일</h2>
              <button class="add-btn" id="add-task-btn" aria-label="할 일 추가">+</button>
            </div>

            <!-- Todo List Component Container -->
            <div class="todo-list-container" id="todo-list-container">
              <!-- TodoList component renders here -->
            </div>
          </section>

          <!-- Timeline Section -->
          <section class="timeline-section">
            <div class="section-header">
              <div>
                <h2 id="timeline-title">타임라인</h2>
                <p class="timeline-hint">드래그하여 일정 추가</p>
              </div>
              <div class="timeline-header-buttons">
                <button class="btn-icon" id="edit-timetable-btn" aria-label="시간표 편집" title="시간표 편집">
                  <span class="icon">📚</span>
                </button>
              </div>
            </div>

            <!-- Timeline Component Container -->
            <div class="home-timeline-container" id="timeline-container">
              <!-- Timeline component renders here -->
            </div>
          </section>
        </div>

        <!-- Focus Timer Section -->
        <section class="pomodoro-section">
          <div class="section-header">
            <h2>집중 타이머</h2>
          </div>

          <div class="pomodoro-container">
            <!-- Timer Settings -->
            <div class="timer-settings">
              <div class="timer-setting-group">
                <label class="setting-label">작업 시간</label>
                <div class="timer-presets">
                  <button class="preset-btn active" data-work="15">15분</button>
                  <button class="preset-btn" data-work="25">25분</button>
                  <button class="preset-btn" data-work="45">45분</button>
                  <button class="preset-btn" data-work="60">60분</button>
                </div>
                <div class="custom-time-input">
                  <label class="custom-label">또는 직접 입력:</label>
                  <div class="input-wrapper">
                    <input
                      type="number"
                      id="custom-work-time"
                      class="custom-input"
                      placeholder="15"
                      min="1"
                      max="999"
                    />
                    <span class="input-unit">분</span>
                    <button class="apply-btn" id="apply-work-time">적용</button>
                  </div>
                </div>
              </div>
              <div class="timer-setting-group">
                <label class="setting-label">휴식 시간</label>
                <div class="timer-presets">
                  <button class="preset-btn active" data-break="5">5분</button>
                  <button class="preset-btn" data-break="10">10분</button>
                  <button class="preset-btn" data-break="15">15분</button>
                </div>
              </div>
            </div>

            <!-- Timer Display -->
            <div class="pomodoro-display">
              <div class="pomodoro-progress-ring">
                <svg class="progress-ring" width="200" height="200">
                  <circle
                    class="progress-ring-circle"
                    stroke="var(--color-border)"
                    stroke-width="8"
                    fill="transparent"
                    r="90"
                    cx="100"
                    cy="100"
                  />
                  <circle
                    class="progress-ring-circle progress-ring-fill"
                    stroke="var(--color-primary)"
                    stroke-width="8"
                    fill="transparent"
                    r="90"
                    cx="100"
                    cy="100"
                    id="pomodoro-progress-circle"
                  />
                </svg>
                <div class="pomodoro-timer-content">
                  <div class="pomodoro-mode" id="pomodoro-mode">작업 시간</div>
                  <div class="pomodoro-time" id="pomodoro-time">15:00</div>
                </div>
              </div>
            </div>

            <!-- Timer Controls -->
            <div class="pomodoro-controls">
              <button class="pomodoro-btn pomodoro-btn-start" id="pomodoro-start-btn">
                <span class="btn-icon">▶️</span>
                <span class="btn-text">시작</span>
              </button>
              <button class="pomodoro-btn pomodoro-btn-pause" id="pomodoro-pause-btn" style="display: none;">
                <span class="btn-icon">⏸️</span>
                <span class="btn-text">일시정지</span>
              </button>
              <button class="pomodoro-btn pomodoro-btn-reset" id="pomodoro-reset-btn">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">리셋</span>
              </button>
            </div>

            <!-- Session Stats -->
            <div class="pomodoro-stats">
              <div class="pomodoro-stat-item">
                <span class="stat-label">완료한 세션</span>
                <span class="stat-value" id="pomodoro-sessions">0</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /**
   * Initialize view after rendering
   */
  async init() {
    console.log('[HomeView] Initializing...');

    // Initialize components
    this.initializeComponents();

    // Load and display data
    this.refreshView();

    // Subscribe to data changes
    this.subscribeToData();

    // Attach event listeners
    this.attachEventListeners();

    // Start intervals
    this.startIntervals();

    // Load weather
    await this.loadWeather();

    console.log('[HomeView] Initialized successfully');
  }

  /**
   * Initialize component instances
   */
  initializeComponents() {
    // Timeline component
    const timelineContainer = document.getElementById('timeline-container');
    this.timeline = new Timeline(timelineContainer, {
      dayCount: this.getResponsiveDayCount(),
      startDate: this.currentDate,
      showCurrentTime: true,
      onEventClick: (id, type) => this.handleEventClick(id, type),
      onCreateEvent: (date, startTime, endTime) => this.handleCreateEvent(date, startTime, endTime)
    });

    // TodoList component
    const todoListContainer = document.getElementById('todo-list-container');
    this.todoList = new TodoList(todoListContainer, {
      onToggle: (id, isCompleted) => this.handleToggleTodo(id, isCompleted),
      onEdit: (id) => this.handleEditTask(id),
      onDelete: (id) => this.handleDeleteTask(id),
      showTime: true,
      showDate: false,
      emptyMessage: '할 일을 추가해보세요!'
    });

    // TaskModal
    this.taskModal = new TaskModal('task-modal', {
      onSave: (taskData) => this.handleSaveTask(taskData),
      categories: dataManager.categories
    });

    // FixedScheduleModal
    this.fixedScheduleModal = new FixedScheduleModal('timetable-modal', {
      onSave: (scheduleData) => this.handleSaveFixedSchedule(scheduleData),
      categories: dataManager.categories
    });
  }

  /**
   * Subscribe to data changes
   */
  subscribeToData() {
    // Subscribe to tasks
    dataManager.subscribe('tasks', (changeInfo) => {
      console.log('[HomeView] Tasks changed:', changeInfo);
      this.refreshView();
    });

    // Subscribe to fixedSchedules
    dataManager.subscribe('fixedSchedules', (changeInfo) => {
      console.log('[HomeView] Fixed schedules changed:', changeInfo);
      this.refreshView();
    });

    // Subscribe to focusSessions (for stats)
    dataManager.subscribe('focusSessions', (changeInfo) => {
      console.log('[HomeView] Focus sessions changed:', changeInfo);
      this.updateFocusStats();
    });
  }

  /**
   * Refresh view with current data
   */
  refreshView() {
    const today = DateUtils.formatDate(this.currentDate);

    // Get today's tasks
    const todayTasks = dataManager.getTasksForDate(today);

    // Get today's subgoals (scheduled for today)
    const todaySubGoals = dataManager.getSubGoalsForDate(today);

    // Timeline: tasks with time + scheduled subgoals
    const timelineItems = [
      ...todayTasks.filter(t => t.startTime && t.endTime),
      ...todaySubGoals.filter(sg => sg.startTime && sg.endTime)
    ];

    // Get active fixed schedules for today
    const dayOfWeek = this.currentDate.getDay();
    const activeFixedSchedules = dataManager.fixedSchedules.filter(fs =>
      fs.isActive !== false &&
      fs.dayOfWeek &&
      fs.dayOfWeek.includes(dayOfWeek)
    );

    // Render timeline
    if (this.timeline) {
      this.timeline.render(timelineItems, activeFixedSchedules);
    }

    // TodoList: ALL tasks (with or without time) + subgoals
    const checklistItems = [...todayTasks, ...todaySubGoals];

    // Render todo list
    if (this.todoList) {
      this.todoList.render(checklistItems);
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.handleAddTask());
    }

    // Edit timetable button
    const editTimetableBtn = document.getElementById('edit-timetable-btn');
    if (editTimetableBtn) {
      editTimetableBtn.addEventListener('click', () => this.handleEditTimetable());
    }

    // Focus timer controls
    this.attachFocusTimerListeners();

    // Window resize for responsive timeline
    window.addEventListener('resize', () => {
      const newDayCount = this.getResponsiveDayCount();
      if (this.timeline && this.timeline.options.dayCount !== newDayCount) {
        this.timeline.updateOptions({ dayCount: newDayCount });
        this.refreshView();
      }
    });
  }

  /**
   * Attach focus timer event listeners
   */
  attachFocusTimerListeners() {
    // Work duration presets
    document.querySelectorAll('[data-work]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const minutes = parseInt(e.currentTarget.dataset.work);
        this.setWorkDuration(minutes);

        // Update active state
        document.querySelectorAll('[data-work]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Custom work time
    const applyWorkBtn = document.getElementById('apply-work-time');
    if (applyWorkBtn) {
      applyWorkBtn.addEventListener('click', () => {
        const input = document.getElementById('custom-work-time');
        const minutes = parseInt(input.value);
        if (minutes && minutes > 0 && minutes <= 999) {
          this.setWorkDuration(minutes);

          // Remove active from presets
          document.querySelectorAll('[data-work]').forEach(b => b.classList.remove('active'));
        }
      });
    }

    // Break duration presets
    document.querySelectorAll('[data-break]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const minutes = parseInt(e.currentTarget.dataset.break);
        this.focusTimer.breakDuration = minutes * 60;

        // Update active state
        document.querySelectorAll('[data-break]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Start button
    const startBtn = document.getElementById('pomodoro-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startFocusTimer());
    }

    // Pause button
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseFocusTimer());
    }

    // Reset button
    const resetBtn = document.getElementById('pomodoro-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFocusTimer());
    }
  }

  /**
   * Start intervals (datetime, current time, weather)
   */
  startIntervals() {
    // Update datetime every second
    this.currentTimeInterval = setInterval(this.boundUpdateDateTime, 1000);
    this.updateDateTime();

    // Update timeline current time every minute
    if (this.timeline) {
      this.timeline.startCurrentTimeUpdate();
    }

    // Refresh weather every 30 minutes
    this.weatherInterval = setInterval(() => {
      this.loadWeather();
    }, 30 * 60 * 1000);
  }

  /**
   * Update date and time display
   */
  updateDateTime() {
    const now = new Date();

    // Time
    const timeEl = document.getElementById('home-time');
    if (timeEl) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Date
    const dateEl = document.getElementById('home-date');
    if (dateEl) {
      dateEl.textContent = DateUtils.formatDateKorean(now);
    }
  }

  /**
   * Get responsive day count based on window width
   * @returns {number} Day count (1/3/5/7)
   */
  getResponsiveDayCount() {
    const width = window.innerWidth;
    if (width < 500) return 1;
    if (width < 800) return 3;
    if (width < 1100) return 5;
    return 7;
  }

  /**
   * Load weather data
   */
  async loadWeather() {
    const weatherWidget = document.getElementById('weather-widget');
    const weatherLoading = document.getElementById('weather-loading');

    if (!weatherWidget) return;

    try {
      // Get location from settings or default to Seoul
      const location = dataManager.data.settings?.weatherLocation || 'Seoul';

      // Show loading
      if (weatherLoading) weatherLoading.style.display = 'block';

      // Fetch weather (using OpenWeatherMap or similar API)
      // For now, using mock data - replace with actual API call
      const mockWeather = {
        temp: 18,
        condition: '맑음',
        icon: '☀️',
        humidity: 60,
        windSpeed: 3.2
      };

      this.weatherData = mockWeather;
      this.renderWeather();

    } catch (error) {
      console.error('Weather load error:', error);
      if (weatherWidget) {
        weatherWidget.innerHTML = '<p class="weather-error">날씨 정보를 불러올 수 없습니다</p>';
      }
    } finally {
      if (weatherLoading) weatherLoading.style.display = 'none';
    }
  }

  /**
   * Render weather widget
   */
  renderWeather() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget || !this.weatherData) return;

    weatherWidget.innerHTML = `
      <div class="weather-content">
        <div class="weather-icon">${this.weatherData.icon}</div>
        <div class="weather-info">
          <div class="weather-temp">${this.weatherData.temp}°C</div>
          <div class="weather-condition">${this.weatherData.condition}</div>
        </div>
      </div>
    `;
  }

  /**
   * Handle add task button click
   */
  handleAddTask() {
    const today = DateUtils.formatDate(this.currentDate);

    this.taskModal.show({
      date: today,
      isAllDay: false
    });
  }

  /**
   * Handle create event from timeline drag
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} startTime - Start time (HH:mm)
   * @param {string} endTime - End time (HH:mm)
   */
  handleCreateEvent(date, startTime, endTime) {
    this.taskModal.show({
      date,
      startTime,
      endTime,
      isAllDay: false
    });
  }

  /**
   * Handle save task from modal
   * @param {Object} taskData - Task data from modal
   */
  handleSaveTask(taskData) {
    if (taskData.id) {
      // Update existing task
      dataManager.updateTask(taskData.id, taskData);
    } else {
      // Add new task
      dataManager.addTask(taskData);
    }

    this.taskModal.hide();
  }

  /**
   * Handle event click on timeline
   * @param {string} id - Event/task ID
   * @param {string} type - 'event' or 'fixed'
   */
  handleEventClick(id, type) {
    if (type === 'fixed') {
      // Fixed schedule - open fixed schedule modal
      const schedule = dataManager.getFixedScheduleById(id);
      if (schedule) {
        this.fixedScheduleModal.show(schedule);
      }
    } else {
      // Regular task or subgoal
      const task = dataManager.getTaskById(id);
      if (task) {
        this.taskModal.show(task);
      } else {
        // Check if it's a subgoal
        const subGoal = dataManager.getSubGoalById(id);
        if (subGoal) {
          // For now, treat as task
          // TODO: Create SubGoalModal
          this.taskModal.show({
            ...subGoal,
            title: `🎯 ${subGoal.title}` // Indicate it's a subgoal
          });
        }
      }
    }
  }

  /**
   * Handle toggle todo checkbox
   * @param {string} id - Task/subgoal ID
   * @param {boolean} isCompleted - New completion status
   */
  handleToggleTodo(id, isCompleted) {
    // Try task first
    const task = dataManager.getTaskById(id);
    if (task) {
      dataManager.updateTask(id, { isCompleted });
      return;
    }

    // Try subgoal
    const subGoal = dataManager.getSubGoalById(id);
    if (subGoal) {
      dataManager.updateSubGoal(id, { isCompleted });
    }
  }

  /**
   * Handle edit task
   * @param {string} id - Task ID
   */
  handleEditTask(id) {
    const task = dataManager.getTaskById(id);
    if (task) {
      this.taskModal.show(task);
    } else {
      // Check subgoal
      const subGoal = dataManager.getSubGoalById(id);
      if (subGoal) {
        this.taskModal.show({
          ...subGoal,
          title: `🎯 ${subGoal.title}`
        });
      }
    }
  }

  /**
   * Handle delete task
   * @param {string} id - Task ID
   */
  handleDeleteTask(id) {
    const task = dataManager.getTaskById(id);
    if (task) {
      dataManager.deleteTask(id);
    } else {
      const subGoal = dataManager.getSubGoalById(id);
      if (subGoal) {
        dataManager.deleteSubGoal(id);
      }
    }
  }

  /**
   * Handle edit timetable button
   */
  handleEditTimetable() {
    this.fixedScheduleModal.show({
      dayOfWeek: [this.currentDate.getDay()],
      isActive: true
    });
  }

  /**
   * Handle save fixed schedule from modal
   * @param {Object} scheduleData - Schedule data
   */
  handleSaveFixedSchedule(scheduleData) {
    if (scheduleData.id) {
      dataManager.updateFixedSchedule(scheduleData.id, scheduleData);
    } else {
      dataManager.addFixedSchedule(scheduleData);
    }

    this.fixedScheduleModal.hide();
  }

  /**
   * Set work duration
   * @param {number} minutes - Duration in minutes
   */
  setWorkDuration(minutes) {
    this.focusTimer.workDuration = minutes * 60;

    // If not running, update display
    if (!this.focusTimer.isRunning && this.focusTimer.mode === 'work') {
      this.focusTimer.timeLeft = this.focusTimer.workDuration;
      this.updateFocusTimerDisplay();
    }
  }

  /**
   * Start focus timer
   */
  startFocusTimer() {
    if (this.focusTimer.isRunning) return;

    this.focusTimer.isRunning = true;
    this.focusTimer.sessionStartTime = new Date().toISOString();

    // Update UI
    document.getElementById('pomodoro-start-btn').style.display = 'none';
    document.getElementById('pomodoro-pause-btn').style.display = 'inline-flex';

    // Start interval
    this.focusTimer.interval = setInterval(() => {
      this.focusTimer.timeLeft--;

      if (this.focusTimer.timeLeft <= 0) {
        this.completeFocusSession();
      } else {
        this.updateFocusTimerDisplay();
      }
    }, 1000);

    console.log('[FocusTimer] Started');
  }

  /**
   * Pause focus timer
   */
  pauseFocusTimer() {
    if (!this.focusTimer.isRunning) return;

    this.focusTimer.isRunning = false;

    // Clear interval
    if (this.focusTimer.interval) {
      clearInterval(this.focusTimer.interval);
      this.focusTimer.interval = null;
    }

    // Update UI
    document.getElementById('pomodoro-start-btn').style.display = 'inline-flex';
    document.getElementById('pomodoro-pause-btn').style.display = 'none';

    console.log('[FocusTimer] Paused');
  }

  /**
   * Reset focus timer
   */
  resetFocusTimer() {
    this.pauseFocusTimer();

    // Reset to current mode duration
    if (this.focusTimer.mode === 'work') {
      this.focusTimer.timeLeft = this.focusTimer.workDuration;
    } else {
      this.focusTimer.timeLeft = this.focusTimer.breakDuration;
    }

    this.updateFocusTimerDisplay();

    console.log('[FocusTimer] Reset');
  }

  /**
   * Complete focus session
   */
  completeFocusSession() {
    this.pauseFocusTimer();

    if (this.focusTimer.mode === 'work') {
      // Work session completed
      this.focusTimer.sessions++;

      // Save focus session to data
      const session = {
        taskId: null, // TODO: Link to current task if selected
        duration: this.focusTimer.workDuration / 60, // minutes
        startedAt: this.focusTimer.sessionStartTime,
        completedAt: new Date().toISOString()
      };
      dataManager.addFocusSession(session);

      // Update stats display
      this.updateFocusStats();

      // Switch to break mode
      this.focusTimer.mode = 'break';
      this.focusTimer.timeLeft = this.focusTimer.breakDuration;
      document.getElementById('pomodoro-mode').textContent = '휴식 시간';

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('작업 완료!', {
          body: `${this.focusTimer.sessions}번째 세션을 완료했습니다. 휴식하세요!`
        });
      }
    } else {
      // Break session completed
      this.focusTimer.mode = 'work';
      this.focusTimer.timeLeft = this.focusTimer.workDuration;
      document.getElementById('pomodoro-mode').textContent = '작업 시간';

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('휴식 완료!', {
          body: '다시 집중할 시간입니다!'
        });
      }
    }

    this.updateFocusTimerDisplay();

    console.log('[FocusTimer] Session completed');
  }

  /**
   * Update focus timer display
   */
  updateFocusTimerDisplay() {
    const minutes = Math.floor(this.focusTimer.timeLeft / 60);
    const seconds = this.focusTimer.timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const timeEl = document.getElementById('pomodoro-time');
    if (timeEl) {
      timeEl.textContent = timeStr;
    }

    // Update progress circle
    this.updateProgressCircle();
  }

  /**
   * Update progress circle
   */
  updateProgressCircle() {
    const circle = document.getElementById('pomodoro-progress-circle');
    if (!circle) return;

    const totalDuration = this.focusTimer.mode === 'work' ?
      this.focusTimer.workDuration :
      this.focusTimer.breakDuration;

    const progress = this.focusTimer.timeLeft / totalDuration;
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }

  /**
   * Update focus session stats
   */
  updateFocusStats() {
    const sessionsEl = document.getElementById('pomodoro-sessions');
    if (sessionsEl) {
      sessionsEl.textContent = this.focusTimer.sessions;
    }
  }

  /**
   * Destroy view - cleanup
   */
  destroy() {
    console.log('[HomeView] Destroying...');

    // Clear intervals
    if (this.currentTimeInterval) {
      clearInterval(this.currentTimeInterval);
      this.currentTimeInterval = null;
    }

    if (this.weatherInterval) {
      clearInterval(this.weatherInterval);
      this.weatherInterval = null;
    }

    if (this.focusTimer.interval) {
      clearInterval(this.focusTimer.interval);
      this.focusTimer.interval = null;
    }

    // Destroy components
    if (this.timeline) {
      this.timeline.destroy();
      this.timeline = null;
    }

    if (this.todoList) {
      this.todoList.destroy();
      this.todoList = null;
    }

    if (this.taskModal) {
      this.taskModal.hide();
      this.taskModal = null;
    }

    if (this.fixedScheduleModal) {
      this.fixedScheduleModal.hide();
      this.fixedScheduleModal = null;
    }

    console.log('[HomeView] Destroyed');
  }
}
