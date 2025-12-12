// components/progress/GoalProgressBar.js - Progress bar component
import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * GoalProgressBar - Displays progress with a visual bar
 * @class
 * @extends Component
 */
export class GoalProgressBar extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      progress: 0, // 0-100
      label: '진행률',
      showValue: true,
      showLabel: true,
      color: '#007AFF',
      height: '8px',
      animated: true,
      onClick: null,
      ...options
    });
  }

  template() {
    const { progress, label, showLabel, showValue, color, height, animated } = this.options;
    const safeProgress = Math.max(0, Math.min(100, progress));

    return `
      <div class="progress-bar-container">
        ${showLabel || showValue ? `
          <div class="progress-bar-header">
            ${showLabel ? `<span class="progress-bar-label">${ValidationUtils.escapeHtml(label)}</span>` : ''}
            ${showValue ? `<span class="progress-bar-value">${safeProgress}%</span>` : ''}
          </div>
        ` : ''}
        <div class="progress-bar-track" style="height: ${height};">
          <div class="progress-bar-fill ${animated ? 'animated' : ''}"
               style="width: ${safeProgress}%; background-color: ${color};">
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (this.options.onClick) {
      const track = this.$('.progress-bar-track');
      if (track) {
        this.addEventListener(track, 'click', this.options.onClick);
      }
    }
  }

  /**
   * Update progress value
   * @param {number} newProgress - New progress value (0-100)
   */
  setProgress(newProgress) {
    this.options.progress = Math.max(0, Math.min(100, newProgress));
    this.updateProgressDisplay();
  }

  /**
   * Update progress display without full re-render
   */
  updateProgressDisplay() {
    const safeProgress = Math.max(0, Math.min(100, this.options.progress));

    // Update fill width
    const fill = this.$('.progress-bar-fill');
    if (fill) {
      fill.style.width = `${safeProgress}%`;
    }

    // Update value text
    const valueEl = this.$('.progress-bar-value');
    if (valueEl) {
      valueEl.textContent = `${safeProgress}%`;
    }
  }

  /**
   * Update progress color
   * @param {string} newColor - New color (hex, rgb, etc.)
   */
  setColor(newColor) {
    this.options.color = newColor;
    const fill = this.$('.progress-bar-fill');
    if (fill) {
      fill.style.backgroundColor = newColor;
    }
  }

  /**
   * Update label text
   * @param {string} newLabel - New label text
   */
  setLabel(newLabel) {
    this.options.label = newLabel;
    const labelEl = this.$('.progress-bar-label');
    if (labelEl) {
      labelEl.textContent = ValidationUtils.escapeHtml(newLabel);
    }
  }

  /**
   * Get current progress
   * @returns {number} Current progress (0-100)
   */
  getProgress() {
    return this.options.progress;
  }

  /**
   * Update options and re-render
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.render();
  }
}

export default GoalProgressBar;
