// views/Home.js - Modular & Responsive Layout matching mockup design
import { dataManager } from '../state.js';
import { Timeline } from '../components/data-display/Timeline.js';
import { TodoList } from '../components/data-display/TodoList.js';
import { TaskModal } from '../components/modals/TaskModal.js';
import { FixedScheduleModal } from '../components/modals/FixedScheduleModal.js';
import { WeatherWidget } from '../components/widgets/WeatherWidget.js';
import { DateTimeDisplay } from '../components/widgets/DateTimeDisplay.js';
import { FocusTimer } from '../components/widgets/FocusTimer.js';
import { DateUtils } from '../utils.js';

/**
 * Home View - Main Dashboard
 * Implements the 3-Stage Responsive Layout (Mobile Stack / Tablet Grid / Desktop Sidebar)
 * Matches the mockup design exactly
 */
export default class HomeView {
  constructor() {
    // Component instances
    this.timeline = null;
    this.todoList = null;
    this.taskModal = null;
    this.fixedScheduleModal = null;
    this.weatherWidget = null;
    this.dateTimeDisplay = null;
    this.focusTimerComponent = null;

    // State
    this.currentDate = new Date();

    // Bound methods
    this.boundRefreshView = this.refreshView.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);
  }

  /**
   * Render The Layout (HTML Structure) - Matching Mockup Exactly
   */
  render() {
    return `
      <!-- Home Layout Container -->
      <div class="home-layout fade-in">
        
        <!-- App Header (Mobile/Tablet: Top bar with Nanal title and bell) -->
        <header class="app-header mobile-tablet-only">
          <h1 class="app-title">Nanal</h1>
          <button class="notification-btn" aria-label="알림">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </header>

        <!-- Left Panel: Weather, Checklist, (Desktop: Nav) -->
        <aside class="left-panel">
           
           <!-- Desktop App Title -->
           <h1 class="app-title desktop-only">Nanal</h1>
           
           <!-- 1. Weather Card -->
           <div class="weather-card glass-card">
             <div class="card-header">
               <h3><span class="header-icon">☀️</span> 날씨 (Weather)</h3>
               <button class="expand-btn" aria-label="더보기">›</button>
             </div>
             <div class="card-content" id="weather-widget-container"></div>
           </div>

           <!-- 2. Checklist Card -->
           <div class="checklist-card glass-card">
             <div class="card-header">
               <h3><span class="header-icon">☰</span> 오늘의 할 일 (Checklist)</h3>
               <button class="expand-btn checklist-toggle" aria-label="접기">ˆ</button>
             </div>
             <div class="card-content" id="todo-list-container"></div>
           </div>

           <!-- 3. Desktop Navigation (Hidden on Mobile/Tablet) -->
           <nav class="sidebar-nav desktop-only">
             <a href="#home" class="nav-item active" data-screen="home">
               <span class="nav-icon">🏠</span>
               <span class="nav-label">홈</span>
             </a>
             <a href="#calendar" class="nav-item" data-screen="calendar">
               <span class="nav-icon">📅</span>
               <span class="nav-label">캘린더</span>
             </a>
             <a href="#goals" class="nav-item" data-screen="goals">
               <span class="nav-icon">🎯</span>
               <span class="nav-label">목표</span>
             </a>
             <a href="#ideas" class="nav-item" data-screen="ideas">
               <span class="nav-icon">💡</span>
               <span class="nav-label">아이디어</span>
             </a>
             <a href="#settings" class="nav-item" data-screen="settings">
               <span class="nav-icon">⚙️</span>
               <span class="nav-label">설정</span>
             </a>
           </nav>
        </aside>

        <!-- Main Panel: Timeline -->
        <main class="timeline-panel glass-card">
          <div class="card-header">
            <h3>
              <span class="header-icon">🕐</span>
              <span class="timeline-title-text">타임라인 (Timeline)</span>
              <span class="timeline-title-weekly desktop-only">주별 타임라인 (Weekly Timeline)</span>
            </h3>
            <button class="expand-btn" aria-label="더보기">›</button>
          </div>
          <div class="timeline-content" id="timeline-container"></div>
        </main>

        <!-- Mobile/Tablet Bottom Nav (Hidden on Desktop) -->
        <nav class="bottom-nav mobile-tablet-only">
          <a href="#home" class="nav-item active" data-screen="home">
            <span class="nav-icon">🏠</span>
          </a>
          <a href="#calendar" class="nav-item" data-screen="calendar">
            <span class="nav-icon">📅</span>
          </a>
          <a href="#goals" class="nav-item" data-screen="goals">
            <span class="nav-icon">🎯</span>
          </a>
          <a href="#ideas" class="nav-item" data-screen="ideas">
            <span class="nav-icon">💡</span>
          </a>
          <a href="#settings" class="nav-item" data-screen="settings">
            <span class="nav-icon">⚙️</span>
          </a>
        </nav>

      </div>
    `;
  }

  /**
   * Initialize components and listeners
   */
  async init() {
    console.log('[HomeView] Initializing...');

    // Components
    this.initializeComponents();

    // Data Loading
    this.refreshView();
    this.subscribeToData();

    // Event Listeners
    this.attachEventListeners();

    // Initial Responsive check
    this.handleResize();
  }

  initializeComponents() {
    // 1. Weather Widget
    this.weatherWidget = new WeatherWidget('weather-widget-container', {
      showDetails: false,
      compact: true
    });
    this.weatherWidget.mount();

    // 2. Timeline - uses dateRange based on responsive day count
    const dateRange = this.getDateRange();
    this.timeline = new Timeline('timeline-container', {
      dateRange: dateRange,
      items: [],
      fixedSchedules: [],
      showCurrentTime: true,
      onTaskClick: (task) => this.handleEventClick(task.id, 'event'),
      onScheduleClick: (schedule) => this.handleEventClick(schedule.id, 'fixed'),
      onSlotClick: (date, time) => this.handleCreateEvent(date, time)
    });
    this.timeline.mount();

    // 3. TodoList
    this.todoList = new TodoList('todo-list-container', {
      onToggle: (id, c) => this.handleToggleTodo(id, c),
      showTime: false,
      showCheckbox: true
    });
    this.todoList.mount();

    // 4. Modals
    this.taskModal = new TaskModal('task-modal', {
      onSave: (d) => this.handleSaveTask(d),
      categories: dataManager.categories
    });
    this.fixedScheduleModal = new FixedScheduleModal('timetable-modal', {
      onSave: (d) => this.handleSaveFixedSchedule(d),
      categories: dataManager.categories
    });
  }

  /**
   * Get date range based on responsive day count
   */
  getDateRange() {
    const dayCount = this.getResponsiveDayCount();
    const dates = [];
    const today = new Date();

    if (dayCount === 1) {
      // Mobile: Just today
      dates.push(DateUtils.formatDate(today));
    } else if (dayCount === 3) {
      // Tablet: Yesterday, Today, Tomorrow
      for (let i = -1; i <= 1; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        dates.push(DateUtils.formatDate(d));
      }
    } else {
      // Desktop: This week (Mon-Sun)
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
      startOfWeek.setDate(diff);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        dates.push(DateUtils.formatDate(d));
      }
    }

    return dates;
  }

  subscribeToData() {
    dataManager.subscribe('tasks', () => this.refreshView());
    dataManager.subscribe('fixedSchedules', () => this.refreshView());
  }

  refreshView() {
    const today = DateUtils.formatDate(this.currentDate);
    const todayTasks = dataManager.getTasksForDate(today);
    const todaySubGoals = dataManager.getSubGoalsForDate(today);

    // Get all tasks for the date range
    const dateRange = this.getDateRange();
    const allTasks = [];
    const allFixedSchedules = [];

    dateRange.forEach(date => {
      const dateTasks = dataManager.getTasksForDate(date);
      const dateSubGoals = dataManager.getSubGoalsForDate(date);
      allTasks.push(...dateTasks.filter(t => t.startTime && t.endTime));
      allTasks.push(...dateSubGoals.filter(sg => sg.startTime && sg.endTime));

      // Get fixed schedules for each date
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const daySchedules = dataManager.fixedSchedules.filter(fs =>
        fs.isActive !== false && fs.dayOfWeek && fs.dayOfWeek.includes(dayOfWeek)
      );
      allFixedSchedules.push(...daySchedules);
    });

    // Update timeline
    if (this.timeline) {
      this.timeline.update({
        dateRange: dateRange,
        items: allTasks,
        fixedSchedules: allFixedSchedules
      });
    }

    // Update todo list with today's tasks only
    if (this.todoList) {
      this.todoList.update({
        items: [...todayTasks, ...todaySubGoals]
      });
    }
  }

  attachEventListeners() {
    // Checklist toggle
    const toggleBtn = document.querySelector('.checklist-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const card = toggleBtn.closest('.checklist-card');
        card.classList.toggle('collapsed');
        toggleBtn.textContent = card.classList.contains('collapsed') ? 'ˇ' : 'ˆ';
      });
    }

    // Resize listener
    window.addEventListener('resize', this.boundHandleResize);
  }

  // --- Responsive Logic ---

  handleResize() {
    const dateRange = this.getDateRange();

    // Update timeline if date range changed
    if (this.timeline) {
      const currentRange = this.timeline.options.dateRange || [];
      if (JSON.stringify(currentRange) !== JSON.stringify(dateRange)) {
        this.refreshView();
      }
    }

    // Update timeline title
    const titleText = document.querySelector('.timeline-title-text');
    const titleWeekly = document.querySelector('.timeline-title-weekly');
    if (titleText && titleWeekly) {
      const isDesktop = window.innerWidth >= 1200;
      titleText.style.display = isDesktop ? 'none' : 'inline';
      titleWeekly.style.display = isDesktop ? 'inline' : 'none';
    }
  }

  getResponsiveDayCount() {
    const width = window.innerWidth;
    if (width < 768) return 1;   // Mobile: 1 Day (Today only)
    if (width < 1200) return 3;  // Tablet: 3 Days (Yesterday, Today, Tomorrow)
    return 7;                    // Desktop: 7 Days (Weekly View Mon-Sun)
  }

  // --- Handlers ---

  handleAddTask(date = null) {
    const taskDate = date || DateUtils.formatDate(this.currentDate);
    this.taskModal.show({ date: taskDate, isAllDay: false });
  }

  handleCreateEvent(date, startTime) {
    this.taskModal.show({ date, startTime, isAllDay: false });
  }

  handleSaveTask(data) {
    if (data.id) dataManager.updateTask(data.id, data);
    else dataManager.addTask(data);
    this.taskModal.hide();
  }

  handleEventClick(id, type) {
    if (type === 'fixed') {
      const s = dataManager.getFixedScheduleById(id);
      if (s) this.fixedScheduleModal.show(s);
    } else {
      const t = dataManager.getTaskById(id);
      if (t) this.taskModal.show(t);
    }
  }

  handleToggleTodo(id, isCompleted) {
    const task = dataManager.getTaskById(id);
    if (task) dataManager.updateTask(id, { isCompleted });
  }

  handleSaveFixedSchedule(data) {
    if (data.id) dataManager.updateFixedSchedule(data.id, data);
    else dataManager.addFixedSchedule(data);
    this.fixedScheduleModal.hide();
  }

  destroy() {
    window.removeEventListener('resize', this.boundHandleResize);
    if (this.timeline) this.timeline.destroy();
    if (this.todoList) this.todoList.destroy();
    if (this.weatherWidget) this.weatherWidget.destroy();
    if (this.taskModal) this.taskModal.hide();
  }
}
