// components/habits/HabitHeatmap.js - Habit completion heatmap (GitHub-style)
import { Component } from '../base/Component.js';
import { DateUtils } from '../../utils.js';
import { dataManager } from '../../state.js';

/**
 * HabitHeatmap - Displays habit completion history as a heatmap
 * @class
 * @extends Component
 */
export class HabitHeatmap extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      habitId: null, // Habit ID to display
      weeks: 12, // Number of weeks to display
      cellSize: 12, // Size of each cell in pixels
      cellGap: 2, // Gap between cells
      color: '#34C759', // Color for completed days
      showLabels: true, // Show month labels
      onCellClick: null, // Callback when cell is clicked
      ...options
    });

    this.habitLogs = [];
    this.dateRange = this.calculateDateRange();
  }

  template() {
    if (!this.options.habitId) {
      return '<div class="habit-heatmap-empty">습관을 선택해주세요</div>';
    }

    const { weeks, cellSize, cellGap, showLabels } = this.options;
    const totalWidth = (cellSize + cellGap) * weeks * 7;

    return `
      <div class="habit-heatmap">
        ${showLabels ? this.renderMonthLabels() : ''}
        <div class="heatmap-grid" style="width: ${totalWidth}px;">
          ${this.renderWeeks()}
        </div>
        <div class="heatmap-legend">
          <span class="legend-label">Less</span>
          ${this.renderLegendCells()}
          <span class="legend-label">More</span>
        </div>
      </div>
    `;
  }

  onMount() {
    this.loadHabitLogs();
  }

  setupEventListeners() {
    if (this.options.onCellClick) {
      this.$$('.heatmap-cell').forEach(cell => {
        this.addEventListener(cell, 'click', () => {
          const date = cell.dataset.date;
          const isCompleted = cell.classList.contains('completed');
          this.options.onCellClick(date, isCompleted);
        });
      });
    }
  }

  /**
   * Calculate date range for heatmap
   * @returns {Object} Start and end dates
   */
  calculateDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (this.options.weeks * 7) + 1);

    return {
      start: DateUtils.formatDate(start),
      end: DateUtils.formatDate(end)
    };
  }

  /**
   * Load habit logs from dataManager
   */
  loadHabitLogs() {
    if (!this.options.habitId) return;

    // Get all logs for this habit in date range
    const allLogs = dataManager.habitLogs || [];
    this.habitLogs = allLogs.filter(log =>
      log.habitId === this.options.habitId &&
      log.date >= this.dateRange.start &&
      log.date <= this.dateRange.end
    );
  }

  /**
   * Check if habit was completed on date
   * @param {string} dateStr - Date string (YYYY-MM-DD)
   * @returns {boolean} True if completed
   */
  isCompletedOnDate(dateStr) {
    return this.habitLogs.some(log => log.date === dateStr && log.isCompleted);
  }

  /**
   * Render month labels
   * @returns {string} HTML string
   */
  renderMonthLabels() {
    const { cellSize, cellGap } = this.options;
    const months = [];
    const currentDate = new Date(this.dateRange.start);

    let currentMonth = currentDate.getMonth();
    months.push({
      name: DateUtils.getMonthNameKorean(currentDate).substring(0, 3),
      offset: 0
    });

    // Track month changes
    for (let i = 0; i < this.options.weeks * 7; i++) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getMonth() !== currentMonth) {
        currentMonth = currentDate.getMonth();
        const weekOffset = Math.floor(i / 7);
        months.push({
          name: DateUtils.getMonthNameKorean(currentDate).substring(0, 3),
          offset: weekOffset * (cellSize + cellGap)
        });
      }
    }

    return `
      <div class="heatmap-months">
        ${months.map(month => `
          <span class="month-label" style="left: ${month.offset}px;">${month.name}</span>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render all weeks
   * @returns {string} HTML string
   */
  renderWeeks() {
    const weeks = [];
    const startDate = new Date(this.dateRange.start);

    for (let week = 0; week < this.options.weeks; week++) {
      weeks.push(this.renderWeek(startDate, week));
      startDate.setDate(startDate.getDate() + 7);
    }

    return weeks.join('');
  }

  /**
   * Render a single week column
   * @param {Date} startDate - Start date of week
   * @param {number} weekIndex - Week index
   * @returns {string} HTML string
   */
  renderWeek(startDate, weekIndex) {
    const { cellSize, cellGap } = this.options;
    const cells = [];
    const weekStart = new Date(startDate);

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + day);

      cells.push(this.renderCell(currentDate));
    }

    return `
      <div class="heatmap-week" style="display: inline-block; width: ${cellSize}px; margin-right: ${cellGap}px;">
        ${cells.join('')}
      </div>
    `;
  }

  /**
   * Render a single cell
   * @param {Date} date - Date for cell
   * @returns {string} HTML string
   */
  renderCell(date) {
    const { cellSize, cellGap, color } = this.options;
    const dateStr = DateUtils.formatDate(date);
    const isCompleted = this.isCompletedOnDate(dateStr);
    const isFuture = date > new Date();

    const classes = [
      'heatmap-cell',
      isCompleted ? 'completed' : 'empty',
      isFuture ? 'future' : ''
    ].filter(Boolean).join(' ');

    const backgroundColor = isCompleted ? color : '#eee';
    const opacity = isCompleted ? 1 : 0.3;

    return `
      <div class="${classes}"
           data-date="${dateStr}"
           title="${DateUtils.formatDateKorean(date)}"
           style="width: ${cellSize}px; height: ${cellSize}px; margin-bottom: ${cellGap}px; background-color: ${backgroundColor}; opacity: ${opacity};">
      </div>
    `;
  }

  /**
   * Render legend cells
   * @returns {string} HTML string
   */
  renderLegendCells() {
    const { cellSize, cellGap, color } = this.options;
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

    return levels.map(level => {
      const backgroundColor = level === 0 ? '#eee' : color;
      const opacity = level || 0.3;

      return `
        <div class="legend-cell"
             style="width: ${cellSize}px; height: ${cellSize}px; background-color: ${backgroundColor}; opacity: ${opacity}; margin: 0 2px;">
        </div>
      `;
    }).join('');
  }

  /**
   * Update habit and refresh
   * @param {string} habitId - New habit ID
   */
  setHabit(habitId) {
    this.options.habitId = habitId;
    this.dateRange = this.calculateDateRange();
    this.loadHabitLogs();
    this.render();
  }

  /**
   * Refresh heatmap data
   */
  refresh() {
    this.loadHabitLogs();
    this.render();
  }

  /**
   * Update options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.dateRange = this.calculateDateRange();
    this.loadHabitLogs();
    this.render();
  }
}

export default HabitHeatmap;
