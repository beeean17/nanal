// views/Home.js - Modular & Responsive Layout
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
  }

  /**
   * Render The Layout (HTML Structure)
   */
  render() {
    return `
      <!-- Home Layout Container -->
      <div class="home-layout fade-in">
        
        <!-- Left Panel: Weather, Todo, (Desktop Nav) -->
        <aside class="left-panel">
           
           <!-- 1. Weather Section -->
           <div class="weather-section glass-card">
              <div id="weather-widget-container"></div>
              <div id="datetime-display-container"></div>
           </div>

           <!-- 2. Checklist Section -->
           <div class="checklist-section glass-card">
              <div class="section-header">
                  <h3>오늘의 할 일</h3>
                  <button class="icon-btn">+</button>
              </div>
              <div id="todo-list-container"></div>
           </div>

           <!-- 3. Desktop Navigation (Hidden on Mobile/Tablet) -->
           <nav class="sidebar-nav desktop-only">
               <a href="#home" class="nav-item active" data-screen="home">
                    <span class="icon">🏠</span><span class="label">홈</span>
               </a>
               <a href="#calendar" class="nav-item" data-screen="calendar">
                    <span class="icon">📅</span><span class="label">캘린더</span>
               </a>
               <a href="#goals" class="nav-item" data-screen="goals">
                    <span class="icon">🎯</span><span class="label">목표</span>
               </a>
               <a href="#ideas" class="nav-item" data-screen="ideas">
                    <span class="icon">💡</span><span class="label">아이디어</span>
               </a>
               <a href="#settings" class="nav-item" data-screen="settings">
                    <span class="icon">⚙️</span><span class="label">설정</span>
               </a>
           </nav>
        </aside>

        <!-- Main Panel: Timeline -->
        <main class="timeline-panel glass-card">
            <div class="section-header">
                <h3>타임라인</h3>
                <div id="focus-timer-container"></div> <!-- Timer in header -->
            </div>
            <div id="timeline-container"></div>
            <button class="add-event-btn mobile-fab">+</button>
        </main>

        <!-- Mobile Bottom Nav (Hidden on Desktop) -->
        <nav class="bottom-nav mobile-only">
           <a href="#home" class="nav-item active" data-screen="home">
                <span class="icon">🏠</span><span class="label">홈</span>
           </a>
           <a href="#calendar" class="nav-item" data-screen="calendar">
                <span class="icon">📅</span><span class="label">캘린더</span>
           </a>
           <a href="#goals" class="nav-item" data-screen="goals">
                <span class="icon">🎯</span><span class="label">목표</span>
           </a>
           <a href="#ideas" class="nav-item" data-screen="ideas">
                <span class="icon">💡</span><span class="label">아이디어</span>
           </a>
           <a href="#settings" class="nav-item" data-screen="settings">
                <span class="icon">⚙️</span><span class="label">설정</span>
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
    this.startIntervals();

    // Initial Responsive check
    this.handleResize(); // Set timeline day count
  }

  initializeComponents() {
    // 1. DateTime
    this.dateTimeDisplay = new DateTimeDisplay('datetime-display-container', {
      showDate: false, showTime: true, showSeconds: false
    });
    this.dateTimeDisplay.mount();

    // 2. Weather
    this.weatherWidget = new WeatherWidget('weather-widget-container', { showDetails: false });
    this.weatherWidget.mount();

    // 3. FocusTimer
    this.focusTimerComponent = new FocusTimer('focus-timer-container', { showStats: false });
    this.focusTimerComponent.mount();

    // 4. Timeline
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) {
      this.timeline = new Timeline(timelineContainer, {
        dayCount: this.getResponsiveDayCount(),
        startDate: this.currentDate,
        showCurrentTime: true,
        onEventClick: (id, type) => this.handleEventClick(id, type),
        onCreateEvent: (date, s, e) => this.handleCreateEvent(date, s, e)
      });
    }

    // 5. TodoList
    const todoListContainer = document.getElementById('todo-list-container');
    if (todoListContainer) {
      this.todoList = new TodoList(todoListContainer, {
        onToggle: (id, c) => this.handleToggleTodo(id, c),
        showTime: true
      });
    }

    // 6. Modals
    this.taskModal = new TaskModal('task-modal', {
      onSave: (d) => this.handleSaveTask(d),
      categories: dataManager.categories
    });
    this.fixedScheduleModal = new FixedScheduleModal('timetable-modal', {
      onSave: (d) => this.handleSaveFixedSchedule(d),
      categories: dataManager.categories
    });
  }

  subscribeToData() {
    dataManager.subscribe('tasks', () => this.refreshView());
    dataManager.subscribe('fixedSchedules', () => this.refreshView());
  }

  refreshView() {
    const today = DateUtils.formatDate(this.currentDate);
    const todayTasks = dataManager.getTasksForDate(today);
    const todaySubGoals = dataManager.getSubGoalsForDate(today);

    // Timeline Data (Tasks with Time)
    const timelineItems = [
      ...todayTasks.filter(t => t.startTime && t.endTime),
      ...todaySubGoals.filter(sg => sg.startTime && sg.endTime)
    ];

    // Fixed Schedules
    const dayOfWeek = this.currentDate.getDay();
    const activeFixedSchedules = dataManager.fixedSchedules.filter(fs =>
      fs.isActive !== false && fs.dayOfWeek && fs.dayOfWeek.includes(dayOfWeek)
    );

    if (this.timeline) this.timeline.render(timelineItems, activeFixedSchedules);
    if (this.todoList) this.todoList.render([...todayTasks, ...todaySubGoals]);
  }

  attachEventListeners() {
    // Add Task Buttons
    document.querySelectorAll('.add-event-btn, .icon-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleAddTask());
    });

    // Resize
    window.addEventListener('resize', () => this.handleResize());
  }

  startIntervals() {
    if (this.timeline) this.timeline.startCurrentTimeUpdate();
  }

  // --- Responsive Logic ---

  handleResize() {
    const newDayCount = this.getResponsiveDayCount();
    if (this.timeline && this.timeline.options.dayCount !== newDayCount) {
      this.timeline.updateOptions({ dayCount: newDayCount });
      this.refreshView();
    }
  }

  getResponsiveDayCount() {
    const width = window.innerWidth;
    if (width < 768) return 1;   // Mobile: 1 Day
    if (width < 1200) return 3;  // Tablet: 3 Days
    return 7;                    // Desktop: 7 Days
  }

  // --- Handlers ---

  handleAddTask() {
    this.taskModal.show({ date: DateUtils.formatDate(this.currentDate), isAllDay: false });
  }

  handleCreateEvent(date, start, end) {
    this.taskModal.show({ date, startTime: start, endTime: end, isAllDay: false });
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
    window.removeEventListener('resize', this.handleResize);
    if (this.timeline) this.timeline.destroy();
    if (this.todoList) this.todoList.destroy();
    if (this.weatherWidget) this.weatherWidget.destroy();
    /* Cleanup Modals */
    if (this.taskModal) this.taskModal.hide();
  }
}
