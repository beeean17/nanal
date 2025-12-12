// components/input/TimePicker.js - Time Picker Component
// Time selection with hour/minute inputs and keyboard navigation

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * TimePicker - Time selection component
 *
 * Options:
 * - value: Selected time (HH:MM format string or {hours, minutes} object)
 * - placeholder: Placeholder text (string)
 * - disabled: Disabled state (boolean)
 * - onChange: Callback when time changes (function)
 * - format24: Use 24-hour format (default: true)
 * - minuteStep: Minute increment step (default: 1)
 * - clearable: Show clear button (boolean)
 * - showNow: Show "Now" button (boolean)
 */
export class TimePicker extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      value: null,
      placeholder: 'Select time...',
      disabled: false,
      onChange: null,
      format24: true,
      minuteStep: 1,
      clearable: true,
      showNow: true,
      ...options
    });

    this.state = {
      isOpen: false,
      ...this.parseTime(this.options.value)
    };
  }

  template() {
    const { placeholder, disabled, clearable } = this.options;
    const { isOpen, hours, minutes } = this.state;

    const displayText = (hours !== null && minutes !== null)
      ? this.formatTime(hours, minutes)
      : placeholder;

    const disabledClass = disabled ? 'timepicker-disabled' : '';
    const openClass = isOpen ? 'timepicker-open' : '';
    const hasValue = hours !== null && minutes !== null;

    return `
      <div class="timepicker-container ${disabledClass} ${openClass}">
        <div class="timepicker-input-wrapper">
          <input
            type="text"
            class="timepicker-input"
            placeholder="${ValidationUtils.escapeHtml(placeholder)}"
            value="${hasValue ? ValidationUtils.escapeHtml(displayText) : ''}"
            ${disabled ? 'disabled' : ''}
            readonly
          />
          <div class="timepicker-actions">
            ${clearable && hasValue ? `
              <button type="button" class="timepicker-clear-btn" aria-label="Clear time">
                ×
              </button>
            ` : ''}
            <button type="button" class="timepicker-toggle-btn" aria-label="Open time selector" ${disabled ? 'disabled' : ''}>
              🕐
            </button>
          </div>
        </div>

        ${isOpen ? `
          <div class="timepicker-popup">
            ${this.renderTimeSelector()}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderTimeSelector() {
    const { format24, showNow } = this.options;
    const { hours, minutes, period } = this.state;

    return `
      <div class="timepicker-selector">
        <div class="timepicker-controls">
          ${this.renderHourSelector()}
          <div class="timepicker-separator">:</div>
          ${this.renderMinuteSelector()}
          ${!format24 ? this.renderPeriodSelector() : ''}
        </div>

        ${showNow ? `
          <div class="timepicker-footer">
            <button type="button" class="timepicker-now-btn">Now</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderHourSelector() {
    const { format24 } = this.options;
    const { hours } = this.state;

    const maxHours = format24 ? 23 : 12;
    const displayHours = format24 ? hours : this.to12Hour(hours).hours;

    return `
      <div class="timepicker-column">
        <button type="button" class="timepicker-arrow timepicker-arrow-up" data-type="hours" aria-label="Increase hours">
          ▲
        </button>
        <input
          type="number"
          class="timepicker-number-input"
          data-type="hours"
          value="${displayHours !== null ? displayHours : ''}"
          min="${format24 ? 0 : 1}"
          max="${maxHours}"
          placeholder="HH"
        />
        <button type="button" class="timepicker-arrow timepicker-arrow-down" data-type="hours" aria-label="Decrease hours">
          ▼
        </button>
      </div>
    `;
  }

  renderMinuteSelector() {
    const { minutes } = this.state;

    return `
      <div class="timepicker-column">
        <button type="button" class="timepicker-arrow timepicker-arrow-up" data-type="minutes" aria-label="Increase minutes">
          ▲
        </button>
        <input
          type="number"
          class="timepicker-number-input"
          data-type="minutes"
          value="${minutes !== null ? String(minutes).padStart(2, '0') : ''}"
          min="0"
          max="59"
          placeholder="MM"
        />
        <button type="button" class="timepicker-arrow timepicker-arrow-down" data-type="minutes" aria-label="Decrease minutes">
          ▼
        </button>
      </div>
    `;
  }

  renderPeriodSelector() {
    const { period } = this.state;

    return `
      <div class="timepicker-column timepicker-period-column">
        <button
          type="button"
          class="timepicker-period-btn ${period === 'AM' ? 'timepicker-period-active' : ''}"
          data-period="AM"
        >
          AM
        </button>
        <button
          type="button"
          class="timepicker-period-btn ${period === 'PM' ? 'timepicker-period-active' : ''}"
          data-period="PM"
        >
          PM
        </button>
      </div>
    `;
  }

  setupEventListeners() {
    // Input click
    const input = this.$('.timepicker-input');
    if (input) {
      this.addEventListener(input, 'click', (e) => {
        if (!this.options.disabled) {
          this.openSelector();
        }
      });
    }

    // Toggle button
    const toggleBtn = this.$('.timepicker-toggle-btn');
    if (toggleBtn) {
      this.addEventListener(toggleBtn, 'click', (e) => {
        e.stopPropagation();
        if (!this.options.disabled) {
          this.toggleSelector();
        }
      });
    }

    // Clear button
    const clearBtn = this.$('.timepicker-clear-btn');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', (e) => {
        e.stopPropagation();
        this.clearTime();
      });
    }

    // Arrow buttons
    const arrowBtns = this.$$('.timepicker-arrow');
    arrowBtns.forEach(btn => {
      this.addEventListener(btn, 'click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const isUp = btn.classList.contains('timepicker-arrow-up');
        this.adjustTime(type, isUp ? 1 : -1);
      });
    });

    // Number inputs
    const numberInputs = this.$$('.timepicker-number-input');
    numberInputs.forEach(input => {
      this.addEventListener(input, 'input', (e) => {
        this.handleNumberInput(e.target);
      });

      this.addEventListener(input, 'blur', (e) => {
        this.validateNumberInput(e.target);
      });

      this.addEventListener(input, 'keydown', (e) => {
        this.handleNumberKeydown(e);
      });
    });

    // Period buttons (12-hour format)
    const periodBtns = this.$$('.timepicker-period-btn');
    periodBtns.forEach(btn => {
      this.addEventListener(btn, 'click', (e) => {
        e.stopPropagation();
        this.setPeriod(btn.dataset.period);
      });
    });

    // Now button
    const nowBtn = this.$('.timepicker-now-btn');
    if (nowBtn) {
      this.addEventListener(nowBtn, 'click', (e) => {
        e.stopPropagation();
        this.selectNow();
      });
    }

    // Close on outside click
    this.addEventListener(document, 'click', (e) => {
      if (this.state.isOpen && !this.container.contains(e.target)) {
        this.closeSelector();
      }
    });
  }

  toggleSelector() {
    if (this.state.isOpen) {
      this.closeSelector();
    } else {
      this.openSelector();
    }
  }

  openSelector() {
    // Initialize with current time if no value set
    if (this.state.hours === null || this.state.minutes === null) {
      const now = new Date();
      this.setState({
        isOpen: true,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        period: now.getHours() >= 12 ? 'PM' : 'AM'
      });
    } else {
      this.setState({ isOpen: true });
    }
  }

  closeSelector() {
    this.setState({ isOpen: false });
    this.triggerChange();
  }

  adjustTime(type, delta) {
    const { format24, minuteStep } = this.options;
    let { hours, minutes } = this.state;

    if (type === 'hours') {
      const max = format24 ? 23 : 12;
      const min = format24 ? 0 : 1;

      if (hours === null) hours = min;
      else {
        hours += delta;
        if (hours > max) hours = min;
        if (hours < min) hours = max;
      }

      this.setState({ hours });
    } else if (type === 'minutes') {
      if (minutes === null) minutes = 0;
      else {
        minutes += delta * minuteStep;
        if (minutes >= 60) minutes = 0;
        if (minutes < 0) minutes = 59 - (59 % minuteStep);
      }

      this.setState({ minutes });
    }
  }

  handleNumberInput(input) {
    const type = input.dataset.type;
    let value = parseInt(input.value);

    if (isNaN(value)) {
      this.setState({ [type]: null });
      return;
    }

    const { format24 } = this.options;

    if (type === 'hours') {
      const max = format24 ? 23 : 12;
      const min = format24 ? 0 : 1;

      if (value >= min && value <= max) {
        let hours24 = value;

        // Convert to 24-hour if in 12-hour format
        if (!format24) {
          const { period } = this.state;
          hours24 = this.to24Hour(value, period);
        }

        this.setState({ hours: hours24 });
      }
    } else if (type === 'minutes') {
      if (value >= 0 && value <= 59) {
        this.setState({ minutes: value });
      }
    }
  }

  validateNumberInput(input) {
    const type = input.dataset.type;
    const value = parseInt(input.value);
    const { format24 } = this.options;

    if (isNaN(value)) {
      input.value = '';
      return;
    }

    if (type === 'hours') {
      const max = format24 ? 23 : 12;
      const min = format24 ? 0 : 1;

      if (value < min) input.value = min;
      else if (value > max) input.value = max;
    } else if (type === 'minutes') {
      if (value < 0) input.value = 0;
      else if (value > 59) input.value = 59;
      else input.value = String(value).padStart(2, '0');
    }
  }

  handleNumberKeydown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const type = e.target.dataset.type;
      this.adjustTime(type, 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const type = e.target.dataset.type;
      this.adjustTime(type, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.closeSelector();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.closeSelector();
    }
  }

  setPeriod(period) {
    this.setState({ period });

    // Update hours to match period
    const { hours } = this.state;
    if (hours !== null) {
      const { hours: hours12 } = this.to12Hour(hours);
      const hours24 = this.to24Hour(hours12, period);
      this.setState({ hours: hours24 });
    }
  }

  selectNow() {
    const now = new Date();
    this.setState({
      hours: now.getHours(),
      minutes: now.getMinutes(),
      period: now.getHours() >= 12 ? 'PM' : 'AM'
    });
    this.closeSelector();
  }

  clearTime() {
    this.setState({
      hours: null,
      minutes: null,
      period: 'AM'
    });

    if (this.options.onChange) {
      this.options.onChange(null);
    }
  }

  triggerChange() {
    const { hours, minutes } = this.state;

    if (hours !== null && minutes !== null && this.options.onChange) {
      this.options.onChange({
        hours,
        minutes,
        formatted: this.formatTime(hours, minutes)
      });
    }
  }

  /**
   * Parse time from various formats
   * @param {string|object|null} time - Time to parse
   * @returns {object} {hours, minutes, period}
   */
  parseTime(time) {
    if (!time) {
      return { hours: null, minutes: null, period: 'AM' };
    }

    let hours = null;
    let minutes = null;

    if (typeof time === 'string') {
      // Parse HH:MM format
      const match = time.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      }
    } else if (typeof time === 'object') {
      hours = time.hours;
      minutes = time.minutes;
    }

    const period = hours !== null && hours >= 12 ? 'PM' : 'AM';

    return { hours, minutes, period };
  }

  /**
   * Format time for display
   * @param {number} hours - Hours (0-23)
   * @param {number} minutes - Minutes (0-59)
   * @returns {string}
   */
  formatTime(hours, minutes) {
    if (hours === null || minutes === null) return '';

    const { format24 } = this.options;

    if (format24) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      const { hours: hours12, period } = this.to12Hour(hours);
      return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
    }
  }

  /**
   * Convert 24-hour to 12-hour format
   * @param {number} hours24 - Hours in 24-hour format
   * @returns {object} {hours, period}
   */
  to12Hour(hours24) {
    if (hours24 === null) return { hours: null, period: 'AM' };

    const period = hours24 >= 12 ? 'PM' : 'AM';
    let hours = hours24 % 12;
    if (hours === 0) hours = 12;

    return { hours, period };
  }

  /**
   * Convert 12-hour to 24-hour format
   * @param {number} hours12 - Hours in 12-hour format
   * @param {string} period - 'AM' or 'PM'
   * @returns {number}
   */
  to24Hour(hours12, period) {
    if (hours12 === null) return null;

    let hours = hours12;
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours;
  }

  /**
   * Get current selected time
   * @returns {object|null} {hours, minutes, formatted}
   */
  getValue() {
    const { hours, minutes } = this.state;

    if (hours === null || minutes === null) return null;

    return {
      hours,
      minutes,
      formatted: this.formatTime(hours, minutes)
    };
  }

  /**
   * Get current time as string (HH:MM)
   * @returns {string|null}
   */
  getValueAsString() {
    const { hours, minutes } = this.state;

    if (hours === null || minutes === null) return null;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * Set time programmatically
   * @param {string|object|null} time - Time to set
   */
  setValue(time) {
    const parsed = this.parseTime(time);
    this.setState(parsed);
  }

  /**
   * Enable/disable the timepicker
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default TimePicker;
