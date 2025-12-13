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
    this.taskModal = null;
    this.goalModal = null;
    this.calendarGrid = null;
    this.currentDate = new Date();
    this.selectedDate = null;
    this.boundRefreshView = this.refreshView.bind(this);
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = DateUtils.getMonthNameKorean(this.currentDate);

    return `
      <div class="home-layout fade-in">
        
        <!-- App Header (Mobile/Tablet) -->
        <header class="app-header mobile-tablet-only">
          <h1 class="app-title">Nanal</h1>
          <button class="notification-btn" aria-label="알림">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </header>

        <!-- Left Panel: Desktop Navigation -->
        <aside class="left-panel desktop-only">
          <h1 class="app-title">Nanal</h1>
          <nav class="sidebar-nav">
            <a href="#home" class="nav-item" data-screen="home">
              <span class="nav-icon">🏠</span><span class="nav-label">홈</span>
            </a>
            <a href="#calendar" class="nav-item active" data-screen="calendar">
              <span class="nav-icon">📅</span><span class="nav-label">캘린더</span>
            </a>
            <a href="#goals" class="nav-item" data-screen="goals">
              <span class="nav-icon">🎯</span><span class="nav-label">목표</span>
            </a>
            <a href="#ideas" class="nav-item" data-screen="ideas">
              <span class="nav-icon">💡</span><span class="nav-label">아이디어</span>
            </a>
            <a href="#settings" class="nav-item" data-screen="settings">
              <span class="nav-icon">⚙️</span><span class="nav-label">설정</span>
            </a>
          </nav>
        </aside>

        <!-- Main Panel: Calendar Content -->
        <main class="main-panel glass-card"> 
          <div class="card-header">
            <h3>
              <span class="header-icon">📅</span>
              ${monthName}
            </h3>
            <div class="calendar-controls">
              <button class="btn-icon" id="calendar-prev-btn" aria-label="이전 달">◀</button>
              <span class="calendar-year-month" id="calendar-year-month">${year}년 ${month + 1}월</span>
              <button class="btn-icon" id="calendar-next-btn" aria-label="다음 달">▶</button>
              <button class="btn-icon" id="calendar-today-btn" title="오늘로 이동">📍</button>
            </div>
          </div>

          <div id="calendar-grid-container" class="calendar-content"></div>

          <div class="calendar-stats">
            <div class="stat-card">
              <span class="stat-icon">✅</span>
              <span class="stat-value" id="completed-tasks-count">0</span>
              <span class="stat-label">완료</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🎯</span>
              <span class="stat-value" id="active-goals-count">0</span>
              <span class="stat-label">진행 중</span>
            </div>
          </div>
        </main>

        <!-- Mobile/Tablet Bottom Nav -->
        <nav class="bottom-nav mobile-tablet-only">
          <a href="#home" class="nav-item" data-screen="home"><span class="nav-icon">🏠</span></a>
          <a href="#calendar" class="nav-item active" data-screen="calendar"><span class="nav-icon">📅</span></a>
          <a href="#goals" class="nav-item" data-screen="goals"><span class="nav-icon">🎯</span></a>
          <a href="#ideas" class="nav-item" data-screen="ideas"><span class="nav-icon">💡</span></a>
          <a href="#settings" class="nav-item" data-screen="settings"><span class="nav-icon">⚙️</span></a>
        </nav>

        <!-- Day Detail Modal -->
        <div class="modal" id="day-detail-modal" style="display: none;">
          <div class="modal-overlay" id="day-detail-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="day-detail-title">날짜 상세</h3>
              <button class="modal-close-btn" id="day-detail-close-btn">×</button>
            </div>
            <div class="modal-body" id="day-detail-body"></div>
            <div class="modal-footer">
              <button class="btn-primary" id="add-task-day-btn">+ 할 일 추가</button>
              <button class="btn-secondary" id="day-detail-cancel-btn">닫기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    console.log('[CalendarView] Initializing...');
    this.initializeComponents();
    this.refreshView();
    this.subscribeToData();
    this.attachEventListeners();
  }

  initializeComponents() {
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

    this.taskModal = new TaskModal('task-modal', {
      onSave: (taskData) => this.handleSaveTask(taskData),
      categories: dataManager.categories
    });

    this.goalModal = new GoalModal('goal-modal', {
      onSave: (goalData) => this.handleSaveGoal(goalData),
      categories: dataManager.categories
    });
  }

  subscribeToData() {
    dataManager.subscribe('tasks', () => this.refreshView());
    dataManager.subscribe('goals', () => this.refreshView());
    dataManager.subscribe('subGoals', () => this.refreshView());
  }

  refreshView() {
    if (this.calendarGrid) {
      this.calendarGrid.setCurrentDate(this.currentDate);
      this.calendarGrid.refresh();
    }
    this.updateStats();
  }

  updateStats() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthTasks = dataManager.tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });

    const completedTasks = monthTasks.filter(t => t.isCompleted).length;
    const activeGoals = dataManager.goals.filter(goal => {
      if (!goal.startDate || !goal.endDate) return false;
      const now = new Date();
      return new Date(goal.startDate) <= now && new Date(goal.endDate) >= now;
    }).length;

    const completedEl = document.getElementById('completed-tasks-count');
    const goalsEl = document.getElementById('active-goals-count');
    if (completedEl) completedEl.textContent = completedTasks;
    if (goalsEl) goalsEl.textContent = activeGoals;
  }

  attachEventListeners() {
    const prevBtn = document.getElementById('calendar-prev-btn');
    const nextBtn = document.getElementById('calendar-next-btn');
    const todayBtn = document.getElementById('calendar-today-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.navigateMonth(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigateMonth(1));
    if (todayBtn) todayBtn.addEventListener('click', () => this.goToToday());

    const closeBtn = document.getElementById('day-detail-close-btn');
    const cancelBtn = document.getElementById('day-detail-cancel-btn');
    const overlay = document.getElementById('day-detail-overlay');
    const addTaskBtn = document.getElementById('add-task-day-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDayDetailModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeDayDetailModal());
    if (overlay) overlay.addEventListener('click', () => this.closeDayDetailModal());
    if (addTaskBtn) addTaskBtn.addEventListener('click', () => this.handleAddTaskFromDay());
  }

  navigateMonth(offset) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.updateYearMonthDisplay();
    this.refreshView();
  }

  goToToday() {
    this.currentDate = new Date();
    this.updateYearMonthDisplay();
    this.refreshView();
  }

  updateYearMonthDisplay() {
    const el = document.getElementById('calendar-year-month');
    if (el) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      el.textContent = `${year}년 ${month}월`;
    }

    const titleEl = document.querySelector('.card-header h3');
    if (titleEl) {
      titleEl.innerHTML = `<span class="header-icon">📅</span> ${DateUtils.getMonthNameKorean(this.currentDate)}`;
    }
  }

  showDayDetail(dateStr) {
    this.selectedDate = dateStr;
    const modal = document.getElementById('day-detail-modal');
    const title = document.getElementById('day-detail-title');
    const body = document.getElementById('day-detail-body');
    if (!modal || !title || !body) return;

    const date = new Date(dateStr);
    title.textContent = DateUtils.formatDateKorean(date);

    const tasks = dataManager.getTasksForDate(dateStr);
    const subGoals = dataManager.getSubGoalsForDate(dateStr);

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

    modal.style.display = 'flex';
  }

  renderDayDetailTask(task, isSubGoal = false) {
    const categoryColor = task.categoryColor || '#8E8E93';
    const timeDisplay = task.startTime && task.endTime ?
      `<span class="task-time">${task.startTime} - ${task.endTime}</span>` : '';

    return `
      <div class="day-detail-task ${task.isCompleted ? 'completed' : ''}"
           style="border-left-color: ${categoryColor};" data-task-id="${task.id}">
        <div class="task-checkbox">${task.isCompleted ? '✓' : '○'}</div>
        <div class="task-info">
          <div class="task-title">${isSubGoal ? '🎯 ' : ''}${ValidationUtils.escapeHtml(task.title)}</div>
          ${timeDisplay}
        </div>
      </div>
    `;
  }

  closeDayDetailModal() {
    const modal = document.getElementById('day-detail-modal');
    if (modal) modal.style.display = 'none';
    this.selectedDate = null;
  }

  handleAddTaskFromDay() {
    if (!this.selectedDate) return;
    this.closeDayDetailModal();
    this.taskModal.show({ date: this.selectedDate, isAllDay: false });
  }

  handleSaveTask(taskData) {
    if (taskData.id) dataManager.updateTask(taskData.id, taskData);
    else dataManager.addTask(taskData);
    this.taskModal.hide();
  }

  handleEditGoal(goalId) {
    const goal = dataManager.getGoalById(goalId);
    if (goal) this.goalModal.show(goal);
  }

  handleSaveGoal(goalData) {
    if (goalData.id) dataManager.updateGoal(goalData.id, goalData);
    else dataManager.addGoal(goalData);
    this.goalModal.hide();
  }

  destroy() {
    if (this.calendarGrid) this.calendarGrid.destroy();
    if (this.taskModal) this.taskModal.hide();
    if (this.goalModal) this.goalModal.hide();
  }
}
