// views/Home.js - Home view using new component architecture
// Displays today's tasks, timeline, weather, and focus timer

import { dataManager } from '../state.js';
import { Timeline } from '../components/data-display/Timeline.js';
import { TodoList } from '../components/data-display/TodoList.js';
import { TaskModal } from '../components/modals/TaskModal.js';
import { FixedScheduleModal } from '../components/modals/FixedScheduleModal.js';
import { WeatherWidget } from '../components/widgets/WeatherWidget.js';
import { DateTimeDisplay } from '../components/widgets/DateTimeDisplay.js';
import { FocusTimer } from '../components/widgets/FocusTimer.js';
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
    this.weatherWidget = null;
    this.dateTimeDisplay = null;
    this.focusTimerComponent = null;

    // State
    this.currentDate = new Date();


    // Bound methods for event listeners
    this.boundRefreshView = this.refreshView.bind(this);
  }

  /**
   * Render home view HTML
   * @returns {string} HTML string
   */
  render() {
    return `
      <div class="home-screen fade-in">
        <!-- App Header (Logo & Bell) -->
        <header class="app-header-simple">
          <h1 class="app-logo-text">Nanal</h1>
          <div id="datetime-display-container"></div>
          <button class="icon-btn" aria-label="알림">
            <span class="icon">🔔</span>
          </button>
        </header>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
          
          <!-- Left Column (Tablet/Desktop) / Top Section (Mobile) -->
          <div class="dashboard-left-col">
            
            <!-- Weather Card -->
            <section class="glass-card weather-card" id="weather-widget-container">
              <!-- WeatherWidget component will be mounted here -->
            </section>

            <!-- Checklist Card -->
            <section class="glass-card checklist-card">
              <div class="card-header-row" id="checklist-toggle">
                <div class="header-left">
                  <span class="icon-list">📝</span>
                  <span class="card-title">오늘의 할 일 (Checklist)</span>
                </div>
                <span class="chevron">^</span>
              </div>
              
              <!-- TodoList Container -->
              <div class="checklist-body" id="todo-list-container">
                <!-- Todo items injected here -->
              </div>
            </section>

            <!-- Desktop Only: Navigation Area (Visual match) -->
            <nav class="desktop-nav-list">
              <a href="#home" class="nav-row active">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">홈 (Home)</span>
              </a>
              <a href="#calendar" class="nav-row">
                <span class="nav-icon">📅</span>
                <span class="nav-text">네비브 (Calendar)</span>
              </a>
              <a href="#goals" class="nav-row">
                <span class="nav-icon">🎯</span>
                <span class="nav-text">프로젝트 (Goals)</span>
              </a>
              <a href="#settings" class="nav-row">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">설정 (Settings)</span>
              </a>
            </nav>

          </div>

          <!-- Right Column (Tablet/Desktop) / Bottom Section (Mobile) -->
          <div class="dashboard-right-col">

            <!-- Focus Timer Card -->
            <section class="glass-card focus-timer-card" id="focus-timer-container">
              <!-- FocusTimer component will be mounted here -->
            </section>

            <!-- Timeline Card -->
            <section class="glass-card timeline-card">
              <div class="card-header-row">
                <div class="header-left">
                  <span class="icon-clock">🕒</span>
                  <span class="card-title" id="timeline-title">타임라인 (Timeline)</span>
                </div>
                <button class="icon-btn-small">›</button>
              </div>

              <!-- Timeline Component Container -->
              <div class="timeline-body" id="timeline-container">
                <!-- Timeline injected here -->
              </div>
            </section>

          </div>
        </div>
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

    console.log('[HomeView] Initialized successfully');
  }

  /**
   * Initialize component instances
   */
  initializeComponents() {
    // DateTimeDisplay component
    this.dateTimeDisplay = new DateTimeDisplay('datetime-display-container', {
      showDate: true,
      showTime: true,
      showSeconds: true,
      updateInterval: 1000,
      timeFormat: '24h',
      dateFormat: 'korean'
    });
    this.dateTimeDisplay.mount();

    // WeatherWidget component
    this.weatherWidget = new WeatherWidget('weather-widget-container', {
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      showDetails: false
    });
    this.weatherWidget.mount();

    // FocusTimer component
    this.focusTimerComponent = new FocusTimer('focus-timer-container', {
      defaultWorkDuration: 15,
      defaultBreakDuration: 5,
      showStats: true,
      enableNotifications: false,
      onSessionComplete: (session) => {
        console.log('[HomeView] Focus session completed:', session);
      }
    });
    this.focusTimerComponent.mount();

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
   * Start intervals (timeline current time)
   */
  startIntervals() {
    // Update timeline current time every minute
    if (this.timeline) {
      this.timeline.startCurrentTimeUpdate();
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
   * Destroy view - cleanup
   */
  destroy() {
    console.log('[HomeView] Destroying...');

    // Destroy components
    if (this.dateTimeDisplay) {
      this.dateTimeDisplay.destroy();
      this.dateTimeDisplay = null;
    }

    if (this.weatherWidget) {
      this.weatherWidget.destroy();
      this.weatherWidget = null;
    }

    if (this.focusTimerComponent) {
      this.focusTimerComponent.destroy();
      this.focusTimerComponent = null;
    }

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
