// components/calendar/CalendarGrid.js - Monthly calendar grid component
import { Component } from '../base/Component.js';
import { DateUtils, ValidationUtils } from '../../utils.js';
import { dataManager } from '../../state.js';

/**
 * CalendarGrid - Monthly calendar grid displaying tasks and goals
 * @class
 * @extends Component
 */
export class CalendarGrid extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      currentDate: new Date(),
      showGoalBars: true,
      maxCellTasks: 3, // Max tasks to show in cell before "+X more"
      onDateClick: null, // Callback when date cell is clicked
      onGoalClick: null, // Callback when goal bar is clicked
      onNavigate: null, // Callback when month changes
      ...options
    });

    this.currentDate = this.options.currentDate;
  }

  template() {
    return `
      <div class="calendar-grid-container">
        <!-- Day Headers -->
        <div class="calendar-day-headers">
          <div class="calendar-day-header">일</div>
          <div class="calendar-day-header">월</div>
          <div class="calendar-day-header">화</div>
          <div class="calendar-day-header">수</div>
          <div class="calendar-day-header">목</div>
          <div class="calendar-day-header">금</div>
          <div class="calendar-day-header">토</div>
        </div>

        <!-- Calendar Days Grid -->
        <div class="calendar-grid" id="calendar-grid-cells">
          <!-- Calendar cells rendered here -->
        </div>

        <!-- Goal Bars Overlay -->
        ${this.options.showGoalBars ? `
          <div class="calendar-goals-overlay" id="calendar-goals-overlay">
            <!-- Goal bars rendered here -->
          </div>
        ` : ''}
      </div>
    `;
  }

  onRender() {
    this.renderCells();
    if (this.options.showGoalBars) {
      this.renderGoalBars();
    }
  }

  setupEventListeners() {
    // Cell clicks handled after each render
    this.attachCellListeners();
  }

  /**
   * Render calendar cells
   */
  renderCells() {
    const grid = this.$('#calendar-grid-cells');
    if (!grid) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Get today for highlighting
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const cells = [];

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      cells.push(this.renderCell(date, true));
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isCurrentMonth && today.getDate() === day;
      cells.push(this.renderCell(date, false, isToday));
    }

    // Next month's days (to fill grid)
    const remainingCells = 42 - cells.length; // 6 weeks max
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      cells.push(this.renderCell(date, true));
    }

    grid.innerHTML = cells.join('');

    // Re-attach cell listeners after render
    this.attachCellListeners();
  }

  /**
   * Render a single calendar cell
   * @param {Date} date - Date for this cell
   * @param {boolean} isOtherMonth - Is from previous/next month
   * @param {boolean} isToday - Is today
   * @returns {string} HTML string
   */
  renderCell(date, isOtherMonth = false, isToday = false) {
    const dateStr = DateUtils.formatDate(date);
    const day = date.getDate();

    // Get tasks for this date
    const tasks = dataManager.getTasksForDate(dateStr);
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const totalCount = tasks.length;

    // Get subgoals for this date
    const subGoals = dataManager.getSubGoalsForDate(dateStr);
    const totalItems = totalCount + subGoals.length;

    const classes = [
      'calendar-cell',
      isOtherMonth ? 'other-month' : '',
      isToday ? 'today' : '',
      totalItems > 0 ? 'has-items' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}" data-date="${dateStr}">
        <div class="calendar-cell-header">
          <span class="calendar-cell-day">${day}</span>
          ${totalItems > 0 ? `<span class="calendar-cell-count">${totalItems}</span>` : ''}
        </div>
        <div class="calendar-cell-body">
          ${this.renderCellTasks(tasks.slice(0, this.options.maxCellTasks))}
          ${totalItems > this.options.maxCellTasks ?
            `<div class="calendar-cell-more">+${totalItems - this.options.maxCellTasks}개 더</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render tasks in calendar cell
   * @param {Array} tasks - Tasks to render
   * @returns {string} HTML string
   */
  renderCellTasks(tasks) {
    return tasks.map(task => {
      const categoryColor = task.categoryColor || '#8E8E93';
      const titleShort = task.title.length > 15 ?
        task.title.substring(0, 15) + '...' :
        task.title;

      return `
        <div class="calendar-cell-task ${task.isCompleted ? 'completed' : ''}"
             style="border-left-color: ${categoryColor};"
             title="${ValidationUtils.escapeHtml(task.title)}">
          ${task.isCompleted ? '✓' : ''} ${ValidationUtils.escapeHtml(titleShort)}
        </div>
      `;
    }).join('');
  }

  /**
   * Render goal bars across calendar
   */
  renderGoalBars() {
    const overlay = this.$('#calendar-goals-overlay');
    if (!overlay) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get active goals that span this month
    const activeGoals = dataManager.goals.filter(goal => {
      if (!goal.startDate || !goal.endDate) return false;

      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      // Check if goal overlaps with this month
      return startDate <= monthEnd && endDate >= monthStart;
    });

    if (activeGoals.length === 0) {
      overlay.innerHTML = '';
      return;
    }

    // Render goal bars
    const bars = activeGoals.map((goal, index) => {
      return this.renderGoalBar(goal, index, year, month);
    }).join('');

    overlay.innerHTML = bars;

    // Attach goal bar listeners
    this.attachGoalBarListeners();
  }

  /**
   * Render a single goal bar
   * @param {Object} goal - Goal object
   * @param {number} index - Goal index for positioning
   * @param {number} year - Current year
   * @param {number} month - Current month
   * @returns {string} HTML string
   */
  renderGoalBar(goal, index, year, month) {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // Calculate start/end positions within month
    const displayStart = startDate < monthStart ? monthStart : startDate;
    const displayEnd = endDate > monthEnd ? monthEnd : endDate;

    const categoryColor = goal.categoryColor || '#007AFF';
    const titleEscaped = ValidationUtils.escapeHtml(goal.title);

    // Calculate position
    const topOffset = 30 + (index * 25); // Each bar 25px apart

    return `
      <div class="calendar-goal-bar"
           style="background-color: ${categoryColor}; top: ${topOffset}px;"
           data-goal-id="${goal.id}"
           title="${titleEscaped} (${DateUtils.formatDateKorean(startDate)} - ${DateUtils.formatDateKorean(endDate)})">
        <span class="goal-bar-label">${titleEscaped}</span>
        <span class="goal-bar-progress">${goal.progress || 0}%</span>
      </div>
    `;
  }

  /**
   * Attach event listeners to calendar cells
   */
  attachCellListeners() {
    this.$$('.calendar-cell').forEach(cell => {
      this.addEventListener(cell, 'click', () => {
        const dateStr = cell.dataset.date;
        if (this.options.onDateClick) {
          this.options.onDateClick(dateStr);
        }
      });
    });
  }

  /**
   * Attach event listeners to goal bars
   */
  attachGoalBarListeners() {
    this.$$('.calendar-goal-bar').forEach(bar => {
      this.addEventListener(bar, 'click', (e) => {
        e.stopPropagation();
        const goalId = bar.dataset.goalId;
        if (this.options.onGoalClick) {
          this.options.onGoalClick(goalId);
        }
      });
    });
  }

  /**
   * Navigate to previous/next month
   * @param {number} offset - Month offset (-1 for prev, 1 for next)
   */
  navigateMonth(offset) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.render();

    if (this.options.onNavigate) {
      this.options.onNavigate(this.currentDate);
    }
  }

  /**
   * Go to today
   */
  goToToday() {
    this.currentDate = new Date();
    this.render();

    if (this.options.onNavigate) {
      this.options.onNavigate(this.currentDate);
    }
  }

  /**
   * Set current date
   * @param {Date} date - New current date
   */
  setCurrentDate(date) {
    this.currentDate = new Date(date);
    this.render();
  }

  /**
   * Get current date
   * @returns {Date} Current date
   */
  getCurrentDate() {
    return new Date(this.currentDate);
  }

  /**
   * Refresh calendar (re-render)
   */
  refresh() {
    this.render();
  }

  /**
   * Update options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.render();
  }
}

export default CalendarGrid;
