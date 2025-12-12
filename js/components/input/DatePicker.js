// components/input/DatePicker.js - Date Picker Component
// Calendar-based date selection with keyboard navigation

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * DatePicker - Calendar-based date selection component
 *
 * Options:
 * - value: Selected date (Date object or ISO string)
 * - placeholder: Placeholder text (string)
 * - disabled: Disabled state (boolean)
 * - onChange: Callback when date changes (function)
 * - minDate: Minimum selectable date (Date object or ISO string)
 * - maxDate: Maximum selectable date (Date object or ISO string)
 * - format: Display format function (default: YYYY-MM-DD)
 * - clearable: Show clear button (boolean)
 * - showToday: Show "Today" button (boolean)
 */
export class DatePicker extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      value: null,
      placeholder: 'Select a date...',
      disabled: false,
      onChange: null,
      minDate: null,
      maxDate: null,
      format: null, // Custom format function
      clearable: true,
      showToday: true,
      ...options
    });

    this.state = {
      isOpen: false,
      value: this.parseDate(this.options.value),
      viewDate: this.parseDate(this.options.value) || new Date(), // Date being viewed in calendar
      selectedDate: this.parseDate(this.options.value)
    };
  }

  template() {
    const { placeholder, disabled, clearable } = this.options;
    const { isOpen, value } = this.state;

    const displayText = value ? this.formatDate(value) : placeholder;
    const disabledClass = disabled ? 'datepicker-disabled' : '';
    const openClass = isOpen ? 'datepicker-open' : '';

    return `
      <div class="datepicker-container ${disabledClass} ${openClass}">
        <div class="datepicker-input-wrapper">
          <input
            type="text"
            class="datepicker-input"
            placeholder="${ValidationUtils.escapeHtml(placeholder)}"
            value="${value ? ValidationUtils.escapeHtml(this.formatDate(value)) : ''}"
            ${disabled ? 'disabled' : ''}
            readonly
          />
          <div class="datepicker-actions">
            ${clearable && value ? `
              <button type="button" class="datepicker-clear-btn" aria-label="Clear date">
                ×
              </button>
            ` : ''}
            <button type="button" class="datepicker-toggle-btn" aria-label="Open calendar" ${disabled ? 'disabled' : ''}>
              📅
            </button>
          </div>
        </div>

        ${isOpen ? `
          <div class="datepicker-popup">
            ${this.renderCalendar()}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderCalendar() {
    const { viewDate } = this.state;
    const { showToday } = this.options;

    return `
      <div class="datepicker-calendar">
        ${this.renderHeader()}
        ${this.renderWeekdays()}
        ${this.renderDays()}
        ${showToday ? `
          <div class="datepicker-footer">
            <button type="button" class="datepicker-today-btn">Today</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderHeader() {
    const { viewDate } = this.state;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const month = monthNames[viewDate.getMonth()];
    const year = viewDate.getFullYear();

    return `
      <div class="datepicker-header">
        <button type="button" class="datepicker-nav-btn datepicker-prev-month" aria-label="Previous month">
          ‹
        </button>
        <div class="datepicker-current-month">${month} ${year}</div>
        <button type="button" class="datepicker-nav-btn datepicker-next-month" aria-label="Next month">
          ›
        </button>
      </div>
    `;
  }

  renderWeekdays() {
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return `
      <div class="datepicker-weekdays">
        ${weekdays.map(day => `<div class="datepicker-weekday">${day}</div>`).join('')}
      </div>
    `;
  }

  renderDays() {
    const { viewDate, selectedDate } = this.state;
    const { minDate, maxDate } = this.options;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Days from previous month
    const prevMonthLastDay = new Date(year, month, 0);
    const daysInPrevMonth = prevMonthLastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '<div class="datepicker-days">';

    // Previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      html += `<div class="datepicker-day datepicker-day-other-month">${day}</div>`;
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isDisabled = this.isDateDisabled(date, minDate, maxDate);

      const classes = ['datepicker-day'];
      if (isToday) classes.push('datepicker-day-today');
      if (isSelected) classes.push('datepicker-day-selected');
      if (isDisabled) classes.push('datepicker-day-disabled');

      html += `
        <div class="${classes.join(' ')}" data-date="${date.toISOString()}">
          ${day}
        </div>
      `;
    }

    // Next month's leading days
    const totalDays = firstDayOfWeek + daysInMonth;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);

    for (let day = 1; day <= remainingDays; day++) {
      html += `<div class="datepicker-day datepicker-day-other-month">${day}</div>`;
    }

    html += '</div>';
    return html;
  }

  setupEventListeners() {
    // Input click
    const input = this.$('.datepicker-input');
    if (input) {
      this.addEventListener(input, 'click', (e) => {
        if (!this.options.disabled) {
          this.openCalendar();
        }
      });
    }

    // Toggle button
    const toggleBtn = this.$('.datepicker-toggle-btn');
    if (toggleBtn) {
      this.addEventListener(toggleBtn, 'click', (e) => {
        e.stopPropagation();
        if (!this.options.disabled) {
          this.toggleCalendar();
        }
      });
    }

    // Clear button
    const clearBtn = this.$('.datepicker-clear-btn');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', (e) => {
        e.stopPropagation();
        this.clearDate();
      });
    }

    // Navigation buttons
    const prevBtn = this.$('.datepicker-prev-month');
    if (prevBtn) {
      this.addEventListener(prevBtn, 'click', (e) => {
        e.stopPropagation();
        this.previousMonth();
      });
    }

    const nextBtn = this.$('.datepicker-next-month');
    if (nextBtn) {
      this.addEventListener(nextBtn, 'click', (e) => {
        e.stopPropagation();
        this.nextMonth();
      });
    }

    // Today button
    const todayBtn = this.$('.datepicker-today-btn');
    if (todayBtn) {
      this.addEventListener(todayBtn, 'click', (e) => {
        e.stopPropagation();
        this.selectToday();
      });
    }

    // Day clicks
    const dayElements = this.$$('.datepicker-day:not(.datepicker-day-other-month)');
    dayElements.forEach(dayEl => {
      this.addEventListener(dayEl, 'click', (e) => {
        e.stopPropagation();
        if (!dayEl.classList.contains('datepicker-day-disabled')) {
          const dateStr = dayEl.dataset.date;
          if (dateStr) {
            this.selectDate(new Date(dateStr));
          }
        }
      });
    });

    // Close on outside click
    this.addEventListener(document, 'click', (e) => {
      if (this.state.isOpen && !this.container.contains(e.target)) {
        this.closeCalendar();
      }
    });

    // Keyboard navigation
    this.addEventListener(input, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCalendar();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleCalendar();
      }
    });
  }

  toggleCalendar() {
    if (this.state.isOpen) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  openCalendar() {
    this.setState({ isOpen: true });
  }

  closeCalendar() {
    this.setState({ isOpen: false });
  }

  previousMonth() {
    const { viewDate } = this.state;
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.setState({ viewDate: newDate });
  }

  nextMonth() {
    const { viewDate } = this.state;
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.setState({ viewDate: newDate });
  }

  selectDate(date) {
    this.setState({
      value: date,
      selectedDate: date,
      viewDate: date
    });
    this.closeCalendar();

    if (this.options.onChange) {
      this.options.onChange(date);
    }
  }

  selectToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.selectDate(today);
  }

  clearDate() {
    this.setState({
      value: null,
      selectedDate: null
    });

    if (this.options.onChange) {
      this.options.onChange(null);
    }
  }

  /**
   * Parse date from various formats
   * @param {Date|string|null} date - Date to parse
   * @returns {Date|null}
   */
  parseDate(date) {
    if (!date) return null;
    if (date instanceof Date) return date;

    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '';

    // Use custom format function if provided
    if (this.options.format && typeof this.options.format === 'function') {
      return this.options.format(date);
    }

    // Default format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Check if date is disabled
   * @param {Date} date - Date to check
   * @param {Date|string|null} minDate - Minimum date
   * @param {Date|string|null} maxDate - Maximum date
   * @returns {boolean}
   */
  isDateDisabled(date, minDate, maxDate) {
    const min = this.parseDate(minDate);
    const max = this.parseDate(maxDate);

    if (min && date < min) return true;
    if (max && date > max) return true;

    return false;
  }

  /**
   * Get current selected date
   * @returns {Date|null}
   */
  getValue() {
    return this.state.value;
  }

  /**
   * Get current selected date as ISO string
   * @returns {string|null}
   */
  getValueAsString() {
    return this.state.value ? this.state.value.toISOString() : null;
  }

  /**
   * Set selected date programmatically
   * @param {Date|string|null} date - Date to select
   */
  setValue(date) {
    const parsed = this.parseDate(date);
    this.setState({
      value: parsed,
      selectedDate: parsed,
      viewDate: parsed || new Date()
    });
  }

  /**
   * Set min/max date constraints
   * @param {Date|string|null} minDate - Minimum date
   * @param {Date|string|null} maxDate - Maximum date
   */
  setDateRange(minDate, maxDate) {
    this.options.minDate = minDate;
    this.options.maxDate = maxDate;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Enable/disable the datepicker
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default DatePicker;
