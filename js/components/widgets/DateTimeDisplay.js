// components/widgets/DateTimeDisplay.js - Date and time display widget
import { Component } from '../base/Component.js';
import { DateUtils } from '../../utils.js';

/**
 * DateTimeDisplay - Displays current date and time with auto-update
 * @class
 * @extends Component
 */
export class DateTimeDisplay extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      showDate: true,
      showTime: true,
      showSeconds: true,
      updateInterval: 1000, // Update every second
      timeFormat: '24h', // '24h' or '12h'
      dateFormat: 'korean', // 'korean', 'iso', 'short'
      ...options
    });

    // State
    this.updateIntervalId = null;
    this.currentTime = new Date();
  }

  template() {
    const { showDate, showTime } = this.options;

    let html = '<div class="datetime-display">';

    if (showTime) {
      html += `<div class="datetime-time" id="datetime-time">${this.formatTime()}</div>`;
    }

    if (showDate) {
      html += `<div class="datetime-date" id="datetime-date">${this.formatDate()}</div>`;
    }

    html += '</div>';

    return html;
  }

  onMount() {
    // Start update interval
    this.startUpdating();
  }

  onDestroy() {
    // Stop update interval
    this.stopUpdating();
  }

  /**
   * Start updating time
   */
  startUpdating() {
    // Update immediately
    this.updateDateTime();

    // Start interval
    if (this.options.updateInterval > 0) {
      this.updateIntervalId = setInterval(() => {
        this.updateDateTime();
      }, this.options.updateInterval);
    }
  }

  /**
   * Stop updating time
   */
  stopUpdating() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }

  /**
   * Update date and time
   */
  updateDateTime() {
    this.currentTime = new Date();

    // Update time element
    if (this.options.showTime) {
      const timeEl = this.$('#datetime-time');
      if (timeEl) {
        timeEl.textContent = this.formatTime();
      }
    }

    // Update date element (less frequently needed, but keep in sync)
    if (this.options.showDate) {
      const dateEl = this.$('#datetime-date');
      if (dateEl) {
        dateEl.textContent = this.formatDate();
      }
    }
  }

  /**
   * Format time based on options
   * @returns {string} Formatted time string
   */
  formatTime() {
    const { timeFormat, showSeconds } = this.options;
    const hours = this.currentTime.getHours();
    const minutes = this.currentTime.getMinutes();
    const seconds = this.currentTime.getSeconds();

    if (timeFormat === '12h') {
      // 12-hour format with AM/PM
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const timeStr = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      if (showSeconds) {
        return `${timeStr}:${String(seconds).padStart(2, '0')} ${period}`;
      }
      return `${timeStr} ${period}`;
    }

    // 24-hour format (default)
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    if (showSeconds) {
      return `${timeStr}:${String(seconds).padStart(2, '0')}`;
    }
    return timeStr;
  }

  /**
   * Format date based on options
   * @returns {string} Formatted date string
   */
  formatDate() {
    const { dateFormat } = this.options;

    switch (dateFormat) {
      case 'korean':
        // Use DateUtils if available
        if (DateUtils && DateUtils.formatDateKorean) {
          return DateUtils.formatDateKorean(this.currentTime);
        }
        // Fallback
        return this.formatDateKorean();

      case 'iso':
        // YYYY-MM-DD format
        return this.currentTime.toISOString().split('T')[0];

      case 'short':
        // MM/DD format
        const month = String(this.currentTime.getMonth() + 1).padStart(2, '0');
        const date = String(this.currentTime.getDate()).padStart(2, '0');
        return `${month}/${date}`;

      default:
        return this.formatDateKorean();
    }
  }

  /**
   * Format date in Korean style
   * @returns {string} Korean formatted date
   */
  formatDateKorean() {
    const year = this.currentTime.getFullYear();
    const month = this.currentTime.getMonth() + 1;
    const date = this.currentTime.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayNames[this.currentTime.getDay()];

    return `${year}년 ${month}월 ${date}일 (${dayOfWeek})`;
  }

  /**
   * Update options and re-render
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    // Stop current interval
    this.stopUpdating();

    // Update options
    Object.assign(this.options, newOptions);

    // Re-render
    this.render();

    // Restart interval
    this.startUpdating();
  }

  /**
   * Get current time as Date object
   * @returns {Date} Current time
   */
  getCurrentTime() {
    return this.currentTime;
  }
}

export default DateTimeDisplay;
