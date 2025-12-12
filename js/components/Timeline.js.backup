// components/Timeline.js - Reusable Timeline Component
// Used in Home, Weekly, and Calendar views
// Renders 08:00-07:59 timeline with drag-to-create functionality

import { TimeUtils, DateUtils, ValidationUtils } from '../utils.js';

/**
 * Timeline - Reusable timeline component with drag-to-create
 * @class
 */
export class Timeline {
  /**
   * Create a Timeline component
   * @param {HTMLElement} containerEl - Container DOM element
   * @param {Object} options - Configuration options
   * @param {number} [options.dayCount=1] - Number of days to display (1/3/5/7)
   * @param {Date|string} [options.startDate] - Starting date for timeline
   * @param {boolean} [options.showCurrentTime=true] - Show current time indicator
   * @param {Function} [options.onEventClick] - Callback when event clicked
   * @param {Function} [options.onCreateEvent] - Callback when event created via drag
   */
  constructor(containerEl, options = {}) {
    if (!containerEl) {
      throw new Error('Timeline: containerEl is required');
    }

    this.container = containerEl;
    this.options = {
      dayCount: options.dayCount || 1,
      startDate: options.startDate || new Date(),
      showCurrentTime: options.showCurrentTime !== false,
      onEventClick: options.onEventClick || (() => { }),
      onCreateEvent: options.onCreateEvent || (() => { }),
      ...options
    };

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
   * Render timeline with events
   * @param {Array} items - Array of tasks/events to display
   * @param {Array} fixedSchedules - Array of fixed schedules to display
   */
  render(items = [], fixedSchedules = []) {
    this.items = items || [];
    this.fixedSchedules = fixedSchedules || [];

    const html = this.generateHTML();
    this.container.innerHTML = html;

    this.attachEventListeners();

    if (this.options.showCurrentTime) {
      this.startCurrentTimeUpdate();
    }
  }

  /**
   * Generate complete timeline HTML
   * @returns {string} HTML string
   */
  generateHTML() {
    const dates = this.getDateRange();

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
   * Get array of dates to display
   * @returns {Array<string>} Array of date strings (YYYY-MM-DD)
   */
  getDateRange() {
    const startDate = typeof this.options.startDate === 'string' ?
      new Date(this.options.startDate) :
      this.options.startDate;

    return DateUtils.getDateRange(startDate, this.options.dayCount);
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

    // Determine Label (Yesterday/Today/Tomorrow or Day Name)
    let labelText = DateUtils.getDayNameKorean(dateObj); // Default: Mon, Tue...
    const dayDiff = DateUtils.daysBetween(new Date(), dateObj);

    // Logic for relative labels (mainly for Tablet 3-day view)
    if (this.options.dayCount === 3) {
      if (DateUtils.isSameDay(dateObj, new Date())) {
        labelText = '오늘 (Today)';
      } else if (dayDiff === -1) { // Logic to verify yesterday
        // Simple check: if date is before today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateObj);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate < today) labelText = '어제 (Yesterday)';
        else labelText = '내일 (Tomorrow)';
      } else if (dayDiff === 1) {
        labelText = '내일 (Tomorrow)';
      }
    } else if (this.options.dayCount === 7) {
      // Desktop: Mon, Tue... (English/Korean mix from image?)
      // The image shows "월 (Mon)"
      const kDay = DateUtils.getDayNameKorean(dateObj);
      const eDay = DateUtils.getDayNameEnglish(dateObj);
      labelText = `${kDay} (${eDay})`;
    }

    // Filter items for this date
    const dayItems = this.items.filter(item => item.date === date && item.startTime && item.endTime);
    const dayFixedSchedules = this.getFixedSchedulesForDate(dateObj);

    return `
      <div class="timeline-day-column ${isToday ? 'today' : ''}"
           data-date="${date}"
           data-index="${index}">

        <!-- Day header -->
        <div class="timeline-day-header">
          <span class="day-name">${labelText}</span>
          ${this.options.dayCount === 7 ? '' : `<span class="day-number">${dayNumber}</span>`}
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
    // 24 hours × 12 slots per hour (5-minute intervals) = 288 slots
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

    return this.fixedSchedules.filter(schedule =>
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

    // Get category color (if available)
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
    const now = new Date();
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
   * Attach event listeners
   */
  attachEventListeners() {
    // Click on event blocks
    const events = this.container.querySelectorAll('.timeline-event');
    events.forEach(eventEl => {
      eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = eventEl.dataset.id;
        const type = eventEl.dataset.type;
        this.options.onEventClick(id, type);
      });
    });

    // Drag-to-create on slots
    const slots = this.container.querySelectorAll('.timeline-slots');
    slots.forEach(slotsEl => {
      slotsEl.addEventListener('mousedown', this.boundHandleMouseDown);
      slotsEl.addEventListener('touchstart', this.boundHandleMouseDown, { passive: false });
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

      // Call onCreate callback
      this.options.onCreateEvent(date, finalStart, finalEnd);
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
    const overlay = this.container.querySelector('#timeline-drag-overlay');
    if (!overlay) return;

    const parent = parentEl.getBoundingClientRect();
    const container = this.container.getBoundingClientRect();

    overlay.style.display = 'block';
    overlay.style.left = `${parent.left - container.left}px`;
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
    const overlay = this.container.querySelector('#timeline-drag-overlay');
    if (!overlay) return;

    overlay.style.top = `${top}px`;
    overlay.style.height = `${height}px`;
  }

  /**
   * Hide drag overlay
   */
  hideDragOverlay() {
    const overlay = this.container.querySelector('#timeline-drag-overlay');
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
    const timeLine = this.container.querySelector('#timeline-current-time');
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
   * Update timeline options (e.g., change day count)
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }

  /**
   * Destroy timeline component
   * Cleans up intervals and event listeners
   */
  destroy() {
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

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default Timeline;
