// components/common/StatisticsCard.js - Statistics display card component
import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * StatisticsCard - Displays a statistic with icon, value, and label
 * @class
 * @extends Component
 */
export class StatisticsCard extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      icon: '📊',
      value: 0,
      label: 'Stat',
      subtitle: null,
      color: '#007AFF',
      clickable: false,
      onClick: null,
      ...options
    });
  }

  template() {
    const { icon, value, label, subtitle, color, clickable } = this.options;

    const classes = [
      'stat-card',
      clickable ? 'clickable' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}">
        <span class="stat-icon" style="color: ${color};">${icon}</span>
        <div class="stat-info">
          <span class="stat-value">${ValidationUtils.escapeHtml(String(value))}</span>
          <span class="stat-label">${ValidationUtils.escapeHtml(label)}</span>
          ${subtitle ? `<span class="stat-subtitle">${ValidationUtils.escapeHtml(subtitle)}</span>` : ''}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (this.options.clickable && this.options.onClick) {
      const card = this.$('.stat-card');
      if (card) {
        this.addEventListener(card, 'click', this.options.onClick);
      }
    }
  }

  /**
   * Update statistic value
   * @param {number|string} newValue - New value
   */
  setValue(newValue) {
    this.options.value = newValue;
    const valueEl = this.$('.stat-value');
    if (valueEl) {
      valueEl.textContent = ValidationUtils.escapeHtml(String(newValue));
    }
  }

  /**
   * Update label text
   * @param {string} newLabel - New label
   */
  setLabel(newLabel) {
    this.options.label = newLabel;
    const labelEl = this.$('.stat-label');
    if (labelEl) {
      labelEl.textContent = ValidationUtils.escapeHtml(newLabel);
    }
  }

  /**
   * Update icon
   * @param {string} newIcon - New icon (emoji or HTML)
   */
  setIcon(newIcon) {
    this.options.icon = newIcon;
    const iconEl = this.$('.stat-icon');
    if (iconEl) {
      iconEl.innerHTML = newIcon;
    }
  }

  /**
   * Get current value
   * @returns {number|string} Current value
   */
  getValue() {
    return this.options.value;
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

export default StatisticsCard;
