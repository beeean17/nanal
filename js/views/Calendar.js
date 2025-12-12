// views/Calendar.js - Calendar view with monthly display
// Shows tasks and goals on calendar grid

import { dataManager } from '../state.js';
import { TaskModal } from '../components/modals/TaskModal.js';
import { GoalModal } from '../components/modals/GoalModal.js';
import { CalendarGrid } from '../components/calendar/CalendarGrid.js';
import { DateUtils, ValidationUtils } from '../utils.js';

/**
 * Calendar View - Monthly calendar with tasks and goals
 * @class
 */
export default class CalendarView {
  constructor() {
    // Component instances
    this.taskModal = null;
    this.goalModal = null;
    this.calendarGrid = null;

    // State
    this.currentDate = new Date();
    this.selectedDate = null;

    // Bound methods
    this.boundRefreshView = this.refreshView.bind(this);
  }

  /**
   * Render calendar view HTML
   * @returns {string} HTML string
   */
  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = DateUtils.getMonthNameKorean(this.currentDate);

    return `
      <div class="calendar-screen fade-in">
        <!-- Calendar Header -->
        <div class="calendar-header">
          <div class="calendar-title">
            <h1>${monthName}</h1>
            <button class="btn-icon" id="calendar-today-btn" title="오늘로 이동">
              📍
            </button>
          </div>
          <div class="calendar-controls">
            <button class="btn-icon" id="calendar-prev-btn" aria-label="이전 달">
              ◀
            </button>
            <span class="calendar-year-month" id="calendar-year-month">
              ${year}년 ${month + 1}월
            </span>
            <button class="btn-icon" id="calendar-next-btn" aria-label="다음 달">
              ▶
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div id="calendar-grid-container">
          <!-- CalendarGrid component will be mounted here -->
        </div>

        <!-- Quick Stats -->
        <div class="calendar-stats">
          <div class="stat-card">
            <span class="stat-icon">✅</span>
            <div class="stat-info">
              <span class="stat-value" id="completed-tasks-count">0</span>
              <span class="stat-label">이번 달 완료</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📋</span>
            <div class="stat-info">
              <span class="stat-value" id="total-tasks-count">0</span>
              <span class="stat-label">이번 달 할 일</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🎯</span>
            <div class="stat-info">
              <span class="stat-value" id="active-goals-count">0</span>
              <span class="stat-label">진행 중 목표</span>
            </div>
          </div>
        </div>

        <!-- Day Detail Modal -->
        <div class="modal" id="day-detail-modal" style="display: none;">
          <div class="modal-overlay" id="day-detail-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="day-detail-title">날짜 상세</h3>
              <button class="modal-close-btn" id="day-detail-close-btn">×</button>
            </div>
            <div class="modal-body" id="day-detail-body">
              <!-- Day details rendered here -->
            </div>
            <div class="modal-footer">
              <button class="btn-primary" id="add-task-day-btn">
                <span class="btn-icon">+</span>
                <span class="btn-text">할 일 추가</span>
              </button>
              <button class="btn-secondary" id="day-detail-cancel-btn">닫기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize view after rendering
   */
  init() {
    console.log('[CalendarView] Initializing...');

    // Initialize components
    this.initializeComponents();

    // Load and display data
    this.refreshView();

    // Subscribe to data changes
    this.subscribeToData();

    // Attach event listeners
    this.attachEventListeners();

    console.log('[CalendarView] Initialized successfully');
  }

  /**
   * Initialize component instances
   */
  initializeComponents() {
    // CalendarGrid component
    this.calendarGrid = new CalendarGrid('calendar-grid-container', {
      currentDate: this.currentDate,
      showGoalBars: true,
      maxCellTasks: 3,
      onDateClick: (dateStr) => this.showDayDetail(dateStr),
      onGoalClick: (goalId) => this.handleEditGoal(goalId),
      onNavigate: (newDate) => {
        this.currentDate = newDate;
        this.updateYearMonthDisplay();
        this.updateStats();
      }
    });
    this.calendarGrid.mount();

    // TaskModal
    this.taskModal = new TaskModal('task-modal', {
      onSave: (taskData) => this.handleSaveTask(taskData),
      categories: dataManager.categories
    });

    // GoalModal
    this.goalModal = new GoalModal('goal-modal', {
      onSave: (goalData) => this.handleSaveGoal(goalData),
      categories: dataManager.categories
    });
  }

  /**
   * Subscribe to data changes
   */
  subscribeToData() {
    // Subscribe to tasks
    dataManager.subscribe('tasks', (changeInfo) => {
      console.log('[CalendarView] Tasks changed:', changeInfo);
      this.refreshView();
    });

    // Subscribe to goals
    dataManager.subscribe('goals', (changeInfo) => {
      console.log('[CalendarView] Goals changed:', changeInfo);
      this.refreshView();
    });

    // Subscribe to subGoals
    dataManager.subscribe('subGoals', (changeInfo) => {
      console.log('[CalendarView] SubGoals changed:', changeInfo);
      this.refreshView();
    });
  }

  /**
   * Refresh view with current data
   */
  refreshView() {
    if (this.calendarGrid) {
      this.calendarGrid.setCurrentDate(this.currentDate);
      this.calendarGrid.refresh();
    }
    this.updateStats();
  }


  /**
   * Update statistics
   */
  updateStats() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get all tasks for this month
    const monthTasks = dataManager.tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });

    const completedTasks = monthTasks.filter(t => t.isCompleted).length;
    const totalTasks = monthTasks.length;

    // Get active goals
    const activeGoals = dataManager.goals.filter(goal => {
      if (!goal.startDate || !goal.endDate) return false;
      const now = new Date();
      return new Date(goal.startDate) <= now && new Date(goal.endDate) >= now;
    }).length;

    // Update DOM
    const completedEl = document.getElementById('completed-tasks-count');
    const totalEl = document.getElementById('total-tasks-count');
    const goalsEl = document.getElementById('active-goals-count');

    if (completedEl) completedEl.textContent = completedTasks;
    if (totalEl) totalEl.textContent = totalTasks;
    if (goalsEl) goalsEl.textContent = activeGoals;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('calendar-prev-btn');
    const nextBtn = document.getElementById('calendar-next-btn');
    const todayBtn = document.getElementById('calendar-today-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateMonth(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateMonth(1));
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => this.goToToday());
    }

    // Day detail modal
    const closeBtn = document.getElementById('day-detail-close-btn');
    const cancelBtn = document.getElementById('day-detail-cancel-btn');
    const overlay = document.getElementById('day-detail-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDayDetailModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeDayDetailModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeDayDetailModal());
    }

    // Add task from day detail
    const addTaskBtn = document.getElementById('add-task-day-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.handleAddTaskFromDay());
    }
  }


  /**
   * Navigate to previous/next month
   * @param {number} offset - Month offset (-1 for prev, 1 for next)
   */
  navigateMonth(offset) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.updateYearMonthDisplay();
    this.refreshView();
  }

  /**
   * Go to today
   */
  goToToday() {
    this.currentDate = new Date();
    this.updateYearMonthDisplay();
    this.refreshView();
  }

  /**
   * Update year/month display
   */
  updateYearMonthDisplay() {
    const el = document.getElementById('calendar-year-month');
    if (el) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      el.textContent = `${year}년 ${month}월`;
    }

    // Update title
    const titleEl = document.querySelector('.calendar-title h1');
    if (titleEl) {
      titleEl.textContent = DateUtils.getMonthNameKorean(this.currentDate);
    }
  }

  /**
   * Show day detail modal
   * @param {string} dateStr - Date string (YYYY-MM-DD)
   */
  showDayDetail(dateStr) {
    this.selectedDate = dateStr;

    const modal = document.getElementById('day-detail-modal');
    const title = document.getElementById('day-detail-title');
    const body = document.getElementById('day-detail-body');

    if (!modal || !title || !body) return;

    // Update title
    const date = new Date(dateStr);
    title.textContent = DateUtils.formatDateKorean(date);

    // Get tasks and subgoals for this date
    const tasks = dataManager.getTasksForDate(dateStr);
    const subGoals = dataManager.getSubGoalsForDate(dateStr);

    // Render day details
    body.innerHTML = `
      <div class="day-detail-content">
        <h4>할 일 (${tasks.length})</h4>
        ${tasks.length > 0 ? `
          <div class="day-detail-tasks">
            ${tasks.map(task => this.renderDayDetailTask(task)).join('')}
          </div>
        ` : '<p class="empty-message">할 일이 없습니다</p>'}

        ${subGoals.length > 0 ? `
          <h4>세부 목표 (${subGoals.length})</h4>
          <div class="day-detail-tasks">
            ${subGoals.map(sg => this.renderDayDetailTask(sg, true)).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Show modal
    modal.style.display = 'flex';
  }

  /**
   * Render task in day detail
   * @param {Object} task - Task or subgoal
   * @param {boolean} isSubGoal - Is this a subgoal
   * @returns {string} HTML string
   */
  renderDayDetailTask(task, isSubGoal = false) {
    const categoryColor = task.categoryColor || '#8E8E93';
    const timeDisplay = task.startTime && task.endTime ?
      `<span class="task-time">${task.startTime} - ${task.endTime}</span>` :
      '';

    return `
      <div class="day-detail-task ${task.isCompleted ? 'completed' : ''}"
           style="border-left-color: ${categoryColor};"
           data-task-id="${task.id}">
        <div class="task-checkbox">
          ${task.isCompleted ? '✓' : '○'}
        </div>
        <div class="task-info">
          <div class="task-title">
            ${isSubGoal ? '🎯 ' : ''}${ValidationUtils.escapeHtml(task.title)}
          </div>
          ${timeDisplay}
        </div>
      </div>
    `;
  }

  /**
   * Close day detail modal
   */
  closeDayDetailModal() {
    const modal = document.getElementById('day-detail-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedDate = null;
  }

  /**
   * Handle add task from day detail
   */
  handleAddTaskFromDay() {
    if (!this.selectedDate) return;

    this.closeDayDetailModal();
    this.taskModal.show({
      date: this.selectedDate,
      isAllDay: false
    });
  }

  /**
   * Handle save task
   * @param {Object} taskData - Task data from modal
   */
  handleSaveTask(taskData) {
    if (taskData.id) {
      dataManager.updateTask(taskData.id, taskData);
    } else {
      dataManager.addTask(taskData);
    }
    this.taskModal.hide();
  }

  /**
   * Handle edit goal
   * @param {string} goalId - Goal ID
   */
  handleEditGoal(goalId) {
    const goal = dataManager.getGoalById(goalId);
    if (goal) {
      this.goalModal.show(goal);
    }
  }

  /**
   * Handle save goal
   * @param {Object} goalData - Goal data from modal
   */
  handleSaveGoal(goalData) {
    if (goalData.id) {
      dataManager.updateGoal(goalData.id, goalData);
    } else {
      dataManager.addGoal(goalData);
    }
    this.goalModal.hide();
  }

  /**
   * Destroy view - cleanup
   */
  destroy() {
    console.log('[CalendarView] Destroying...');

    // Destroy CalendarGrid component
    if (this.calendarGrid) {
      this.calendarGrid.destroy();
      this.calendarGrid = null;
    }

    // Destroy components
    if (this.taskModal) {
      this.taskModal.hide();
      this.taskModal = null;
    }

    if (this.goalModal) {
      this.goalModal.hide();
      this.goalModal = null;
    }

    console.log('[CalendarView] Destroyed');
  }
}
