// components/input/Checkbox.js - Custom Checkbox Component
// Accessible, styleable checkbox with label support

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * Checkbox - Custom styled checkbox component
 *
 * Options:
 * - checked: Initial checked state (boolean)
 * - label: Label text (string)
 * - name: Input name attribute (string)
 * - disabled: Disabled state (boolean)
 * - onChange: Callback when checked state changes (function)
 * - size: 'small', 'medium', 'large' (default: 'medium')
 * - color: Custom color for checked state (string)
 */
export class Checkbox extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      checked: false,
      label: '',
      name: '',
      disabled: false,
      onChange: null,
      size: 'medium', // 'small', 'medium', 'large'
      color: null, // Custom color
      ...options
    });

    this.state = {
      checked: this.options.checked
    };
  }

  template() {
    const { label, name, disabled, size, color } = this.options;
    const { checked } = this.state;
    const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClass = `checkbox-${size}`;
    const disabledClass = disabled ? 'checkbox-disabled' : '';
    const checkedClass = checked ? 'checkbox-checked' : '';

    const colorStyle = color && checked ? `style="--checkbox-color: ${color};"` : '';
    const escapedLabel = ValidationUtils.escapeHtml(label);

    return `
      <div class="checkbox-wrapper ${sizeClass} ${disabledClass} ${checkedClass}" ${colorStyle}>
        <input
          type="checkbox"
          id="${checkboxId}"
          name="${name}"
          class="checkbox-input"
          ${checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        />
        <label for="${checkboxId}" class="checkbox-label">
          <span class="checkbox-box">
            <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          ${label ? `<span class="checkbox-text">${escapedLabel}</span>` : ''}
        </label>
      </div>
    `;
  }

  setupEventListeners() {
    const input = this.$('.checkbox-input');

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

    const input = this.$('.checkbox-input');
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
   * Enable/disable the checkbox
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default Checkbox;
