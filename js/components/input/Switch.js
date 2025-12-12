// components/input/Switch.js - Toggle Switch Component
// iOS-style toggle switch for boolean settings

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * Switch - Toggle switch component
 *
 * Options:
 * - checked: Initial checked state (boolean)
 * - label: Label text (string)
 * - labelPosition: 'left' or 'right' (default: 'right')
 * - name: Input name attribute (string)
 * - disabled: Disabled state (boolean)
 * - onChange: Callback when state changes (function)
 * - size: 'small', 'medium', 'large' (default: 'medium')
 * - color: Custom color for active state (string)
 */
export class Switch extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      checked: false,
      label: '',
      labelPosition: 'right', // 'left' or 'right'
      name: '',
      disabled: false,
      onChange: null,
      size: 'medium',
      color: null,
      ...options
    });

    this.state = {
      checked: this.options.checked
    };
  }

  template() {
    const { label, labelPosition, name, disabled, size, color } = this.options;
    const { checked } = this.state;
    const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClass = `switch-${size}`;
    const disabledClass = disabled ? 'switch-disabled' : '';
    const checkedClass = checked ? 'switch-checked' : '';

    const colorStyle = color && checked ? `style="--switch-color: ${color};"` : '';
    const escapedLabel = ValidationUtils.escapeHtml(label);

    const switchElement = `
      <div class="switch-control ${sizeClass} ${disabledClass} ${checkedClass}" ${colorStyle}>
        <input
          type="checkbox"
          id="${switchId}"
          name="${name}"
          class="switch-input"
          ${checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        />
        <label for="${switchId}" class="switch-slider">
          <span class="switch-knob"></span>
        </label>
      </div>
    `;

    const labelElement = label ? `<span class="switch-label-text">${escapedLabel}</span>` : '';

    if (labelPosition === 'left' && label) {
      return `
        <div class="switch-wrapper switch-label-left">
          ${labelElement}
          ${switchElement}
        </div>
      `;
    } else if (label) {
      return `
        <div class="switch-wrapper switch-label-right">
          ${switchElement}
          ${labelElement}
        </div>
      `;
    } else {
      return `
        <div class="switch-wrapper">
          ${switchElement}
        </div>
      `;
    }
  }

  setupEventListeners() {
    const input = this.$('.switch-input');

    if (input) {
      this.addEventListener(input, 'change', (e) => {
        this.handleChange(e.target.checked);
      });
    }
  }

  handleChange(checked) {
    if (this.options.disabled) return;

    this.setState({ checked });

    if (this.options.onChange) {
      this.options.onChange(checked);
    }
  }

  /**
   * Get current checked state
   * @returns {boolean}
   */
  isChecked() {
    return this.state.checked;
  }

  /**
   * Set checked state programmatically
   * @param {boolean} checked - New checked state
   */
  setChecked(checked) {
    this.setState({ checked });

    const input = this.$('.switch-input');
    if (input) {
      input.checked = checked;
    }
  }

  /**
   * Toggle checked state
   */
  toggle() {
    this.setChecked(!this.state.checked);
  }

  /**
   * Enable/disable the switch
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default Switch;
