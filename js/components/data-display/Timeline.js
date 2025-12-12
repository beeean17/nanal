// components/data-display/Timeline.js - Reusable Timeline Component
// Refactored to extend base Component class
// Renders 08:00-07:59 timeline with drag-to-create functionality

import { Component } from '../base/Component.js';
import { TimeUtils, DateUtils, ValidationUtils } from '../../utils.js';

/**
 * Timeline - Reusable timeline component with drag-to-create
 * @class
 * @extends Component
 */
export class Timeline extends Component {
  /**
   * Create a Timeline component
   * @param {string} containerId - Container element ID
   * @param {Object} options - Configuration options
   * @param {Array} [options.dateRange=[]] - Array of date strings to display
   * @param {Array} [options.items=[]] - Array of tasks/events to display
   * @param {Array} [options.fixedSchedules=[]] - Array of fixed schedules
   * @param {boolean} [options.showCurrentTime=true] - Show current time indicator
   * @param {Function} [options.onTaskClick] - Callback when task clicked
   * @param {Function} [options.onSlotClick] - Callback when empty slot clicked
   * @param {Function} [options.onScheduleClick] - Callback when schedule clicked
   */
  constructor(containerId, options = {}) {
    super(containerId, {
      dateRange: [],
      items: [],
      fixedSchedules: [],
      showCurrentTime: true,
      onTaskClick: null,
      onSlotClick: null,
      onScheduleClick: null,
      ...options
    });

    // Drag state
    this.dragState = {
      isDragging: false,
      dayColumn: null,
      date: null,
      startY: null,
      startTime: null,
      endTime: null
    };

    // Current time interval
    this.currentTimeInterval = null;

    // Bound methods for event listeners
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
  }

  /**
   * Generate complete timeline HTML
   * @returns {string} HTML string
   */
  template() {
    const dates = this.options.dateRange || [];

    return `
      <div class="timeline-grid">
        <!-- Time labels column -->
        <div class="timeline-time-column">
          ${this.renderTimeLabels()}
        </div>

        <!-- Day columns -->
        <div class="timeline-days-container">
          ${dates.map((date, index) => this.renderDayColumn(date, index)).join('')}
        </div>
      </div>

      <!-- Drag overlay (hidden by default) -->
      <div class="timeline-drag-overlay" id="timeline-drag-overlay" style="display: none;"></div>
    `;
  }

  /**
   * Render time labels (08:00 - 07:00)
   * @returns {string} HTML string
   */
  renderTimeLabels() {
    const hours = [];

    // 08:00 to 23:00
    for (let h = 8; h <= 23; h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
    }

    // 00:00 to 07:00 (next day)
    for (let h = 0; h <= 7; h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
    }

    return hours.map(time => `
      <div class="timeline-hour-label">${time}</div>
    `).join('');
  }

  /**
   * Render a single day column
   * @param {string} date - Date string (YYYY-MM-DD)
   * @param {number} index - Column index
   * @returns {string} HTML string
   */
  renderDayColumn(date, index) {
    const dateObj = new Date(date);
    const isToday = DateUtils.isToday(dateObj);
    const dayNumber = dateObj.getDate();
    const dayCount = this.options.dateRange.length;

    // Determine Label
    let labelText = DateUtils.getDayNameKorean(dateObj);
    const dayDiff = DateUtils.daysBetween(new Date(), dateObj);

    if (dayCount === 3) {
      if (DateUtils.isSameDay(dateObj, new Date())) {
        labelText = '오늘 (Today)';
      } else if (dayDiff === -1) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateObj);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate < today) labelText = '어제 (Yesterday)';
        else labelText = '내일 (Tomorrow)';
      } else if (dayDiff === 1) {
        labelText = '내일 (Tomorrow)';
      }
    } else if (dayCount === 7) {
      const kDay = DateUtils.getDayNameKorean(dateObj);
      const eDay = DateUtils.getDayNameEnglish(dateObj);
      labelText = `${kDay} (${eDay})`;
    }

    // Filter items for this date
    const dayItems = (this.options.items || []).filter(item => item.date === date && item.startTime && item.endTime);
    const dayFixedSchedules = this.getFixedSchedulesForDate(dateObj);

    return `
      <div class="timeline-day-column ${isToday ? 'today' : ''}"
           data-date="${date}"
           data-index="${index}">

        <!-- Day header -->
        <div class="timeline-day-header">
          <span class="day-name">${labelText}</span>
          ${dayCount === 7 ? '' : `<span class="day-number">${dayNumber}</span>`}
        </div>

        <!-- Event slots -->
        <div class="timeline-slots" data-date="${date}">
          ${this.renderHourSlots()}

          <!-- Events -->
          ${dayItems.map(item => this.renderEvent(item, 'event')).join('')}

          <!-- Fixed schedules -->
          ${dayFixedSchedules.map(schedule => this.renderEvent(schedule, 'fixed')).join('')}

          <!-- Current time line (only for today) -->
          ${isToday && this.options.showCurrentTime ? this.renderCurrentTimeLine() : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render hour slots for interaction
   * @returns {string} HTML string
   */
  renderHourSlots() {
    const slots = [];
    for (let i = 0; i < 288; i++) {
      slots.push(`<div class="timeline-slot" data-slot="${i}"></div>`);
    }
    return slots.join('');
  }

  /**
   * Get fixed schedules for a specific date
   * @param {Date} date - Date object
   * @returns {Array} Array of fixed schedules
   */
  getFixedSchedulesForDate(date) {
    const dayOfWeek = date.getDay();
    const schedules = this.options.fixedSchedules || [];

    return schedules.filter(schedule =>
      schedule.isActive !== false &&
      schedule.dayOfWeek &&
      schedule.dayOfWeek.includes(dayOfWeek)
    );
  }

  /**
   * Render an event block
   * @param {Object} item - Event or fixed schedule item
   * @param {string} type - 'event' or 'fixed'
   * @returns {string} HTML string
   */
  renderEvent(item, type = 'event') {
    const position = TimeUtils.calculateTimelinePosition(item.startTime, item.endTime);
    const duration = TimeUtils.calculateDuration(item.startTime, item.endTime);
    const durationText = TimeUtils.formatDuration(duration);

    const isFixed = type === 'fixed';
    const escapedTitle = ValidationUtils.escapeHtml(item.title || '');
    const categoryColor = item.categoryColor || '#007AFF';

    return `
      <div class="timeline-event ${isFixed ? 'fixed-schedule' : 'regular-event'}"
           data-id="${item.id}"
           data-type="${type}"
           style="top: ${position.top}%; height: ${position.height}%; background-color: ${categoryColor};">

        <div class="event-content">
          ${isFixed ? '<span class="fixed-icon">🔁</span>' : ''}
          <span class="event-title">${escapedTitle}</span>
          <span class="event-time">${item.startTime} - ${item.endTime}</span>
          <span class="event-duration">${durationText}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render current time line
   * @returns {string} HTML string
   */
  renderCurrentTimeLine() {
    const currentTime = TimeUtils.getCurrentTime();
    const position = TimeUtils.calculateTimelinePosition(currentTime, currentTime);

    return `
      <div class="timeline-current-time" id="timeline-current-time" style="top: ${position.top}%;">
        <div class="current-time-dot"></div>
        <div class="current-time-line"></div>
        <div class="current-time-label">${currentTime}</div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Click on event blocks
    const events = this.$$('.timeline-event');
    events.forEach(eventEl => {
      this.addEventListener(eventEl, 'click', (e) => {
        e.stopPropagation();
        const id = eventEl.dataset.id;
        const type = eventEl.dataset.type;

        if (type === 'event' && this.options.onTaskClick) {
          const task = this.options.items.find(t => t.id === id);
          if (task) this.options.onTaskClick(task);
        } else if (type === 'fixed' && this.options.onScheduleClick) {
          const schedule = this.options.fixedSchedules.find(s => s.id === id);
          if (schedule) this.options.onScheduleClick(schedule);
        }
      });
    });

    // Drag-to-create on slots
    const slots = this.$$('.timeline-slots');
    slots.forEach(slotsEl => {
      this.addEventListener(slotsEl, 'mousedown', this.boundHandleMouseDown);
      this.addEventListener(slotsEl, 'touchstart', this.boundHandleMouseDown);
    });
  }

  /**
   * Handle mouse/touch down on timeline slots
   * @param {Event} e - Mouse or touch event
   */
  handleMouseDown(e) {
    // Ignore if clicking on an event
    if (e.target.classList.contains('timeline-event') ||
      e.target.closest('.timeline-event')) {
      return;
    }

    e.preventDefault();

    const slotsEl = e.currentTarget;
    const date = slotsEl.dataset.date;
    const rect = slotsEl.getBoundingClientRect();

    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    const y = clientY - rect.top;

    // Calculate start time
    const startTime = TimeUtils.getTimeFromY(y, rect.height);

    this.dragState = {
      isDragging: true,
      dayColumn: slotsEl.parentElement,
      date: date,
      startY: y,
      startTime: startTime,
      endTime: startTime,
      containerRect: rect
    };

    // Show drag overlay
    this.showDragOverlay(y, 0, slotsEl);

    // Add move and up listeners
    document.addEventListener('mousemove', this.boundHandleMouseMove);
    document.addEventListener('mouseup', this.boundHandleMouseUp);
    document.addEventListener('touchmove', this.boundHandleMouseMove, { passive: false });
    document.addEventListener('touchend', this.boundHandleMouseUp);
  }

  /**
   * Handle mouse/touch move during drag
   * @param {Event} e - Mouse or touch event
   */
  handleMouseMove(e) {
    if (!this.dragState.isDragging) return;

    e.preventDefault();

    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const y = clientY - this.dragState.containerRect.top;

    // Calculate end time
    const endTime = TimeUtils.getTimeFromY(y, this.dragState.containerRect.height);

    // Ensure minimum duration (5 minutes)
    const startMin = TimeUtils.timeToMinutes(this.dragState.startTime);
    const endMin = TimeUtils.timeToMinutes(endTime);

    if (Math.abs(endMin - startMin) < 5) {
      return; // Too short
    }

    this.dragState.endTime = endTime;

    // Update drag overlay
    const height = Math.abs(y - this.dragState.startY);
    const top = Math.min(y, this.dragState.startY);

    this.updateDragOverlay(top, height);
  }

  /**
   * Handle mouse/touch up (end drag)
   * @param {Event} e - Mouse or touch event
   */
  handleMouseUp(e) {
    if (!this.dragState.isDragging) return;

    e.preventDefault();

    const { date, startTime, endTime } = this.dragState;

    // Validate time range
    const startMin = TimeUtils.timeToMinutes(startTime);
    const endMin = TimeUtils.timeToMinutes(endTime);

    if (Math.abs(endMin - startMin) >= 5) {
      // Valid drag - create event
      const snappedStart = TimeUtils.snapToInterval(startTime, 5);
      const snappedEnd = TimeUtils.snapToInterval(endTime, 5);

      // Ensure start < end
      const finalStart = startMin < endMin ? snappedStart : snappedEnd;
      const finalEnd = startMin < endMin ? snappedEnd : snappedStart;

      // Call onSlotClick callback
      if (this.options.onSlotClick) {
        this.options.onSlotClick(date, finalStart);
      }
    }

    // Hide drag overlay
    this.hideDragOverlay();

    // Clear drag state
    this.dragState = {
      isDragging: false,
      dayColumn: null,
      date: null,
      startY: null,
      startTime: null,
      endTime: null
    };

    // Remove move and up listeners
    document.removeEventListener('mousemove', this.boundHandleMouseMove);
    document.removeEventListener('mouseup', this.boundHandleMouseUp);
    document.removeEventListener('touchmove', this.boundHandleMouseMove);
    document.removeEventListener('touchend', this.boundHandleMouseUp);
  }

  /**
   * Show drag overlay
   * @param {number} top - Top position in pixels
   * @param {number} height - Height in pixels
   * @param {HTMLElement} parentEl - Parent element
   */
  showDragOverlay(top, height, parentEl) {
    const overlay = this.$('#timeline-drag-overlay');
    if (!overlay) return;

    const parent = parentEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    overlay.style.display = 'block';
    overlay.style.left = `${parent.left - containerRect.left}px`;
    overlay.style.width = `${parent.width}px`;
    overlay.style.top = `${top}px`;
    overlay.style.height = `${Math.max(height, 2)}px`;
  }

  /**
   * Update drag overlay size
   * @param {number} top - Top position in pixels
   * @param {number} height - Height in pixels
   */
  updateDragOverlay(top, height) {
    const overlay = this.$('#timeline-drag-overlay');
    if (!overlay) return;

    overlay.style.top = `${top}px`;
    overlay.style.height = `${height}px`;
  }

  /**
   * Hide drag overlay
   */
  hideDragOverlay() {
    const overlay = this.$('#timeline-drag-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Start updating current time line
   */
  startCurrentTimeUpdate() {
    // Update immediately
    this.updateCurrentTimeLine();

    // Update every minute
    this.currentTimeInterval = setInterval(() => {
      this.updateCurrentTimeLine();
    }, 60000); // 60 seconds
  }

  /**
   * Update current time line position
   */
  updateCurrentTimeLine() {
    const timeLine = this.$('#timeline-current-time');
    if (!timeLine) return;

    const currentTime = TimeUtils.getCurrentTime();
    const position = TimeUtils.calculateTimelinePosition(currentTime, currentTime);

    timeLine.style.top = `${position.top}%`;

    // Update label
    const label = timeLine.querySelector('.current-time-label');
    if (label) {
      label.textContent = currentTime;
    }
  }

  /**
   * Set date range for timeline
   * @param {Array<string>} dateRange - Array of date strings
   */
  setDateRange(dateRange) {
    this.update({ dateRange });
  }

  /**
   * After render callback
   */
  onRender() {
    if (this.options.showCurrentTime) {
      this.startCurrentTimeUpdate();
    }
  }

  /**
   * Before destroy callback
   */
  onDestroy() {
    // Clear current time interval
    if (this.currentTimeInterval) {
      clearInterval(this.currentTimeInterval);
      this.currentTimeInterval = null;
    }

    // Remove drag event listeners if still attached
    document.removeEventListener('mousemove', this.boundHandleMouseMove);
    document.removeEventListener('mouseup', this.boundHandleMouseUp);
    document.removeEventListener('touchmove', this.boundHandleMouseMove);
    document.removeEventListener('touchend', this.boundHandleMouseUp);
  }
}

export default Timeline;
