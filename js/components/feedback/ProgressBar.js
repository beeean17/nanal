// components/feedback/ProgressBar.js - Progress Bar Component
// Visual progress indicator for tasks and operations

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * ProgressBar - Progress indicator component
 *
 * Options:
 * - value: Current progress value (number, 0-100)
 * - max: Maximum value (number, default: 100)
 * - min: Minimum value (number, default: 0)
 * - label: Label text (string)
 * - showPercentage: Show percentage text (boolean, default: true)
 * - showValue: Show value text (boolean, default: false)
 * - color: Custom bar color (string)
 * - size: 'small', 'medium', 'large' (default: 'medium')
 * - striped: Show striped pattern (boolean, default: false)
 * - animated: Animate stripes (boolean, default: false)
 * - type: 'default', 'success', 'warning', 'error', 'info' (default: 'default')
 */
export class ProgressBar extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      value: 0,
      max: 100,
      min: 0,
      label: '',
      showPercentage: true,
      showValue: false,
      color: null,
      size: 'medium', // 'small', 'medium', 'large'
      striped: false,
      animated: false,
      type: 'default', // 'default', 'success', 'warning', 'error', 'info'
      ...options
    });

    this.state = {
      value: this.options.value
    };
  }

  template() {
    const { label, showPercentage, showValue, color, size, striped, animated, type, min, max } = this.options;
    const { value } = this.state;

    const percentage = this.calculatePercentage(value, min, max);
    const sizeClass = `progress-${size}`;
    const typeClass = `progress-${type}`;
    const stripedClass = striped ? 'progress-striped' : '';
    const animatedClass = animated ? 'progress-animated' : '';

    const colorStyle = color ? `style="background-color: ${color};"` : '';

    return `
      <div class="progress-wrapper ${sizeClass}">
        ${label ? `<div class="progress-label">${ValidationUtils.escapeHtml(label)}</div>` : ''}
        <div class="progress-container">
          <div class="progress-track">
            <div
              class="progress-bar ${typeClass} ${stripedClass} ${animatedClass}"
              style="width: ${percentage}%;${color ? ` background-color: ${color};` : ''}"
              role="progressbar"
              aria-valuenow="${value}"
              aria-valuemin="${min}"
              aria-valuemax="${max}"
            >
              ${showPercentage || showValue ? `
                <span class="progress-text">
                  ${showPercentage ? `${Math.round(percentage)}%` : ''}
                  ${showValue ? `${value}/${max}` : ''}
                </span>
              ` : ''}
            </div>
          </div>
          ${showPercentage || showValue ? `
            <div class="progress-info">
              ${showPercentage ? `<span class="progress-percentage">${Math.round(percentage)}%</span>` : ''}
              ${showValue ? `<span class="progress-value">${value}/${max}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  calculatePercentage(value, min, max) {
    const range = max - min;
    const normalized = Math.max(min, Math.min(max, value)) - min;
    return (normalized / range) * 100;
  }

  setupEventListeners() {
    // No interactive events for progress bar
  }

  /**
   * Get current value
   * @returns {number}
   */
  getValue() {
    return this.state.value;
  }

  /**
   * Set progress value
   * @param {number} value - New progress value
   */
  setValue(value) {
    this.setState({ value: Math.max(this.options.min, Math.min(this.options.max, value)) });
  }

  /**
   * Increment progress by amount
   * @param {number} amount - Amount to increment (default: 1)
   */
  increment(amount = 1) {
    this.setValue(this.state.value + amount);
  }

  /**
   * Decrement progress by amount
   * @param {number} amount - Amount to decrement (default: 1)
   */
  decrement(amount = 1) {
    this.setValue(this.state.value - amount);
  }

  /**
   * Reset to minimum value
   */
  reset() {
    this.setValue(this.options.min);
  }

  /**
   * Set to maximum value
   */
  complete() {
    this.setValue(this.options.max);
  }

  /**
   * Check if progress is complete
   * @returns {boolean}
   */
  isComplete() {
    return this.state.value >= this.options.max;
  }

  /**
   * Get percentage
   * @returns {number}
   */
  getPercentage() {
    return this.calculatePercentage(this.state.value, this.options.min, this.options.max);
  }

  /**
   * Update label text
   * @param {string} label - New label
   */
  setLabel(label) {
    this.options.label = label;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Update progress type
   * @param {string} type - New type (default/success/warning/error/info)
   */
  setType(type) {
    this.options.type = type;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Animate progress to target value
   * @param {number} targetValue - Target value to animate to
   * @param {number} duration - Animation duration in ms (default: 1000)
   */
  animateTo(targetValue, duration = 1000) {
    const startValue = this.state.value;
    const endValue = Math.max(this.options.min, Math.min(this.options.max, targetValue));
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;

      this.setState({ value: currentValue });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.setState({ value: endValue });
      }
    };

    requestAnimationFrame(animate);
  }
}

/**
 * CircularProgress - Circular progress indicator
 *
 * Options:
 * - value: Current progress value (number, 0-100)
 * - max: Maximum value (number, default: 100)
 * - size: Diameter in pixels (number, default: 120)
 * - strokeWidth: Stroke width in pixels (number, default: 8)
 * - showPercentage: Show percentage text (boolean, default: true)
 * - color: Custom color (string)
 * - type: 'default', 'success', 'warning', 'error', 'info' (default: 'default')
 */
export class CircularProgress extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      value: 0,
      max: 100,
      size: 120,
      strokeWidth: 8,
      showPercentage: true,
      color: null,
      type: 'default',
      ...options
    });

    this.state = {
      value: this.options.value
    };
  }

  template() {
    const { size, strokeWidth, showPercentage, color, type, max } = this.options;
    const { value } = this.state;

    const percentage = (value / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const typeClass = `circular-progress-${type}`;
    const strokeColor = color || this.getTypeColor(type);

    return `
      <div class="circular-progress ${typeClass}" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" class="circular-progress-svg">
          <!-- Background circle -->
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="#e0e0e0"
            stroke-width="${strokeWidth}"
          />
          <!-- Progress circle -->
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="${strokeColor}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            transform="rotate(-90 ${size / 2} ${size / 2})"
            class="circular-progress-circle"
          />
        </svg>
        ${showPercentage ? `
          <div class="circular-progress-text">
            <span class="circular-progress-value">${Math.round(percentage)}</span>
            <span class="circular-progress-percent">%</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  getTypeColor(type) {
    const colors = {
      default: '#4CAF50',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    };
    return colors[type] || colors.default;
  }

  setupEventListeners() {
    // No interactive events
  }

  getValue() {
    return this.state.value;
  }

  setValue(value) {
    this.setState({ value: Math.max(0, Math.min(this.options.max, value)) });
  }

  getPercentage() {
    return (this.state.value / this.options.max) * 100;
  }

  animateTo(targetValue, duration = 1000) {
    const startValue = this.state.value;
    const endValue = Math.max(0, Math.min(this.options.max, targetValue));
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;

      this.setState({ value: currentValue });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.setState({ value: endValue });
      }
    };

    requestAnimationFrame(animate);
  }
}

export default ProgressBar;
