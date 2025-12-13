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
        <div id="calendar-goals-legend" style="display: none;"></div>
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

    // Add resize listener to update goal bars when grid changes
    if (!this._resizeListener) {
      this._resizeListener = this.debounce(() => {
        if (this.options.showGoalBars) this.renderGoalBars();
      }, 100);
      window.addEventListener('resize', this._resizeListener);
    }
  }

  // Helper for debounce
  debounce(func, wait) {
    let timeout;
    return function formatted(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
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
        <div class="calendar-cell-header" style="justify-content: space-between; padding: 4px;">
          ${totalItems > 0 ? `<span class="calendar-cell-count" style="font-size: 0.75rem; font-weight: bold; color: var(--color-primary); background: none;">${totalItems}</span>` : '<span></span>'}
          <span class="calendar-cell-day">${day}</span>
        </div>
        <div class="calendar-cell-body">
          <!-- Simplified View: No list, just scan -->
        </div>
      </div>
    `;
  }

  /**
   * Render goal bars across calendar
   */
  renderGoalBars() {
    const overlay = this.$('#calendar-goals-overlay');
    console.log('[CalendarGrid] renderGoalBars called, overlay found:', !!overlay);
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

    console.log('[CalendarGrid] Active goals for this month:', activeGoals.length, activeGoals);

    if (activeGoals.length === 0) {
      overlay.innerHTML = '';
      return;
    }

    // Render legend
    this.renderGoalLegend(activeGoals);

    // Sort goals by start date, then by duration (longer first)
    activeGoals.sort((a, b) => {
      const startDiff = new Date(a.startDate) - new Date(b.startDate);
      if (startDiff !== 0) return startDiff;
      // Duration desc
      const durA = new Date(a.endDate) - new Date(a.startDate);
      const durB = new Date(b.endDate) - new Date(b.startDate);
      return durB - durA;
    });

    // Packing Algorithm (Lane assignment)
    // lanes array stores the end date of the last goal in that lane
    const lanes = [];
    const goalsWithLane = activeGoals.map(goal => {
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);

      let assignedLane = -1;

      // Find the first lane where this goal fits (i.e., lane's last goal ends before this goal starts)
      for (let i = 0; i < lanes.length; i++) {
        // We add a simplified check: if lane is free by start date.
        // Needs to be strictly free? end of prev < start of current
        if (lanes[i] < start) {
          assignedLane = i;
          lanes[i] = end; // Update lane end
          break;
        }
      }

      // If no lane found, add a new one
      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push(end);
      }

      return { goal, lane: assignedLane };
    });

    // Measure grid rows for accurate positioning
    const grid = this.$('#calendar-grid-cells');
    const cells = grid ? Array.from(grid.children) : [];
    if (cells.length === 0) return;

    const rowMetrics = [];
    // Assuming 7 columns. Measure first cell of each row.
    for (let i = 0; i < cells.length; i += 7) {
      const cell = cells[i];
      // Calculate true top relative to container
      const rowTop = grid.offsetTop + cell.offsetTop;
      const rowHeight = cell.offsetHeight;

      rowMetrics.push({ top: rowTop, height: rowHeight });
    }

    // Overlay offset to correct coordinate space (if overlay has top/margin)
    const overlayTop = overlay.offsetTop || 0;

    // Render goal bars using assigned lane
    const bars = goalsWithLane.map(({ goal, lane }) => {
      console.log(`[GoalDebug] id=${goal.id} title=${goal.title} start=${goal.startDate} end=${goal.endDate}`);
      return this.renderGoalBar(goal, lane, year, month, rowMetrics, overlayTop);
    }).join('');

    console.log('[CalendarGrid] Rendered bars HTML:', bars);
    overlay.innerHTML = bars;

    // Attach goal bar listeners
    this.attachGoalBarListeners();
  }

  renderGoalLegend(activeGoals) {
    const legendContainer = this.$('#calendar-goals-legend');
    if (!legendContainer) return;

    if (activeGoals.length === 0) {
      legendContainer.innerHTML = '';
      legendContainer.style.display = 'none';
      return;
    }

    legendContainer.style.display = 'flex';
    legendContainer.style.flexWrap = 'wrap';
    legendContainer.style.gap = '12px';
    legendContainer.style.marginBottom = '12px';
    legendContainer.style.padding = '0 8px';

    legendContainer.innerHTML = activeGoals.map(goal => `
      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-primary, #333);">
        <span style="display: block; width: 10px; height: 10px; border-radius: 50%; background-color: ${goal.categoryColor || '#007AFF'};"></span>
        <span>${ValidationUtils.escapeHtml(goal.title)}</span>
      </div>
    `).join('');
  }

  /**
   * Helper to convert hex to rgba
   */
  hexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
  }

  /**
   * Render a single goal bar (potentially split across rows)
   * @param {Object} goal - Goal object
   * @param {number} index - Goal index for positioning
   * @param {number} year - Current year
   * @param {number} month - Current month
   * @returns {string} HTML string
   */
  renderGoalBar(goal, lane, year, month, rowMetrics, overlayTop = 0) {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const displayStart = startDate < monthStart ? monthStart : startDate;
    const displayEnd = endDate > monthEnd ? monthEnd : endDate;
    const firstDayOffset = new Date(year, month, 1).getDay();

    const startDay = displayStart.getDate();
    const endDay = displayEnd.getDate();
    const startCellIndex = firstDayOffset + (startDay - 1);
    const endCellIndex = firstDayOffset + (endDay - 1);

    const startRow = Math.floor(startCellIndex / 7);
    const endRow = Math.floor(endCellIndex / 7);

    const columnWidth = 100 / 7;
    const categoryColor = goal.categoryColor || '#007AFF';
    const titleEscaped = ValidationUtils.escapeHtml(goal.title);
    const bgColor = this.hexToRgba(categoryColor, 0.6);

    let html = '';

    for (let r = startRow; r <= endRow; r++) {
      const rowStartCol = (r === startRow) ? (startCellIndex % 7) : 0;
      const rowEndCol = (r === endRow) ? (endCellIndex % 7) : 6;

      const left = rowStartCol * columnWidth;
      const width = (rowEndCol - rowStartCol + 1) * columnWidth;

      // Dynamic positioning using measured metrics
      // If rowMetrics exists and has entry for this row
      if (!rowMetrics || !rowMetrics[r]) {
        continue; // Guard
      }

      const metrics = rowMetrics[r]; // { top, height }

      // Stack from bottom: 
      // barBottom = rowTop + rowHeight - paddingBottom - (stack * (height + gap))
      // top = barBottom - barHeight

      const barHeight = 6;
      const gap = 3;
      const paddingBottom = 8; // User said "very low", increasing space from bottom

      const bottomOffset = paddingBottom + (lane * (barHeight + gap)); // Use lane instead of index
      const topPosition = metrics.top + metrics.height - bottomOffset - barHeight - overlayTop;

      console.log(`[GoalDebug] Goal ${goal.title}: Row ${r}. Lane=${lane}. MetricsTop=${metrics.top} Height=${metrics.height}. TopPos=${topPosition}. OverlayTop=${overlayTop}`);

      const isStartOfGoal = (startDate >= monthStart) && (r === startRow);
      const isEndOfGoal = (endDate <= monthEnd) && (r === endRow);

      const radiusLeft = isStartOfGoal ? '4px' : '0px';
      const radiusRight = isEndOfGoal ? '4px' : '0px';
      const radius = `border-radius: ${radiusLeft} ${radiusRight} ${radiusRight} ${radiusLeft};`;

      // Optional: Darker left border for start
      const borderLeft = isStartOfGoal ? `border-left: 2px solid ${categoryColor};` : '';

      html += `
        <div class="calendar-goal-bar"
             style="background-color: ${bgColor}; top: ${topPosition}px; left: ${left}%; width: ${width}%; height: ${barHeight}px; ${radius} ${borderLeft} pointer-events: auto;"
             data-goal-id="${goal.id}"
             title="${titleEscaped} (${DateUtils.formatDateKorean(startDate)} ~ ${DateUtils.formatDateKorean(endDate)})">
        </div>
      `;
    }

    return html;
  }

  /**
   * Attach event listeners to calendar cells
   */
  attachCellListeners() {
    const cells = this.$$('.calendar-cell');

    cells.forEach(cell => {
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
