// components/input/ColorPicker.js - Color Picker Component
// Color selection with preset colors and custom color input

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * ColorPicker - Color selection component
 *
 * Options:
 * - value: Selected color (hex string)
 * - colors: Array of preset colors (hex strings)
 * - allowCustom: Allow custom color input (boolean)
 * - placeholder: Placeholder text (string)
 * - disabled: Disabled state (boolean)
 * - onChange: Callback when color changes (function)
 * - clearable: Show clear button (boolean)
 * - showValue: Display color value text (boolean)
 */
export class ColorPicker extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      value: null,
      colors: [
        '#FF6B6B', '#FFA06B', '#FFD06B', '#6BFF9D',
        '#6BFFE3', '#6BC3FF', '#6B8BFF', '#A56BFF',
        '#E66BFF', '#FF6BCC', '#FF6B8B', '#B8B8B8'
      ],
      allowCustom: true,
      placeholder: 'Select a color...',
      disabled: false,
      onChange: null,
      clearable: true,
      showValue: true,
      ...options
    });

    this.state = {
      isOpen: false,
      value: this.options.value,
      customColor: this.options.value || '#000000'
    };
  }

  template() {
    const { placeholder, disabled, clearable, showValue } = this.options;
    const { isOpen, value } = this.state;

    const disabledClass = disabled ? 'colorpicker-disabled' : '';
    const openClass = isOpen ? 'colorpicker-open' : '';
    const hasValue = value !== null;

    return `
      <div class="colorpicker-container ${disabledClass} ${openClass}">
        <div class="colorpicker-trigger" tabindex="${disabled ? -1 : 0}">
          <div class="colorpicker-preview">
            ${hasValue ? `
              <div class="colorpicker-color-box" style="background-color: ${value};"></div>
            ` : `
              <div class="colorpicker-color-box colorpicker-no-color"></div>
            `}
          </div>
          <div class="colorpicker-display">
            ${hasValue
              ? (showValue ? `<span class="colorpicker-value">${ValidationUtils.escapeHtml(value)}</span>` : '')
              : `<span class="colorpicker-placeholder">${ValidationUtils.escapeHtml(placeholder)}</span>`
            }
          </div>
          <div class="colorpicker-actions">
            ${clearable && hasValue ? `
              <button type="button" class="colorpicker-clear-btn" aria-label="Clear color">
                ×
              </button>
            ` : ''}
            <span class="colorpicker-arrow">▼</span>
          </div>
        </div>

        ${isOpen ? `
          <div class="colorpicker-popup">
            ${this.renderColorGrid()}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderColorGrid() {
    const { colors, allowCustom } = this.options;
    const { value, customColor } = this.state;

    return `
      <div class="colorpicker-grid">
        <div class="colorpicker-preset-colors">
          ${colors.map(color => {
            const selected = color.toLowerCase() === (value || '').toLowerCase();
            const selectedClass = selected ? 'colorpicker-color-selected' : '';

            return `
              <button
                type="button"
                class="colorpicker-color-option ${selectedClass}"
                data-color="${color}"
                style="background-color: ${color};"
                aria-label="Select color ${color}"
                title="${color}"
              >
                ${selected ? '<span class="colorpicker-check">✓</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>

        ${allowCustom ? `
          <div class="colorpicker-custom">
            <div class="colorpicker-custom-label">Custom Color</div>
            <div class="colorpicker-custom-input">
              <input
                type="color"
                class="colorpicker-native-input"
                value="${customColor}"
              />
              <input
                type="text"
                class="colorpicker-hex-input"
                value="${customColor}"
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
                maxlength="7"
              />
              <button type="button" class="colorpicker-apply-custom-btn">
                Apply
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    // Trigger click
    const trigger = this.$('.colorpicker-trigger');
    if (trigger) {
      this.addEventListener(trigger, 'click', (e) => {
        if (this.options.disabled) return;
        e.stopPropagation();
        this.togglePicker();
      });

      // Keyboard navigation
      this.addEventListener(trigger, 'keydown', (e) => {
        if (this.options.disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.togglePicker();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.closePicker();
        }
      });
    }

    // Clear button
    const clearBtn = this.$('.colorpicker-clear-btn');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', (e) => {
        e.stopPropagation();
        this.clearColor();
      });
    }

    // Preset color options
    const colorOptions = this.$$('.colorpicker-color-option');
    colorOptions.forEach(option => {
      this.addEventListener(option, 'click', (e) => {
        e.stopPropagation();
        const color = option.dataset.color;
        this.selectColor(color);
      });
    });

    // Custom color inputs
    const nativeInput = this.$('.colorpicker-native-input');
    if (nativeInput) {
      this.addEventListener(nativeInput, 'input', (e) => {
        const color = e.target.value;
        this.setState({ customColor: color });

        // Update hex input
        const hexInput = this.$('.colorpicker-hex-input');
        if (hexInput) {
          hexInput.value = color;
        }
      });
    }

    const hexInput = this.$('.colorpicker-hex-input');
    if (hexInput) {
      this.addEventListener(hexInput, 'input', (e) => {
        let value = e.target.value;

        // Auto-add # if missing
        if (value && !value.startsWith('#')) {
          value = '#' + value;
          e.target.value = value;
        }

        // Validate hex format
        if (this.isValidHex(value)) {
          this.setState({ customColor: value });

          // Update native input
          const nativeInput = this.$('.colorpicker-native-input');
          if (nativeInput) {
            nativeInput.value = value;
          }
        }
      });

      this.addEventListener(hexInput, 'keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const color = e.target.value;
          if (this.isValidHex(color)) {
            this.selectColor(color);
          }
        }
      });
    }

    // Apply custom color button
    const applyBtn = this.$('.colorpicker-apply-custom-btn');
    if (applyBtn) {
      this.addEventListener(applyBtn, 'click', (e) => {
        e.stopPropagation();
        const { customColor } = this.state;
        if (this.isValidHex(customColor)) {
          this.selectColor(customColor);
        }
      });
    }

    // Close on outside click
    this.addEventListener(document, 'click', (e) => {
      if (this.state.isOpen && !this.container.contains(e.target)) {
        this.closePicker();
      }
    });
  }

  togglePicker() {
    if (this.state.isOpen) {
      this.closePicker();
    } else {
      this.openPicker();
    }
  }

  openPicker() {
    this.setState({ isOpen: true });
  }

  closePicker() {
    this.setState({ isOpen: false });
  }

  selectColor(color) {
    const normalizedColor = color.toUpperCase();
    this.setState({ value: normalizedColor, customColor: normalizedColor });
    this.closePicker();

    if (this.options.onChange) {
      this.options.onChange(normalizedColor);
    }
  }

  clearColor() {
    this.setState({ value: null });

    if (this.options.onChange) {
      this.options.onChange(null);
    }
  }

  /**
   * Validate hex color format
   * @param {string} color - Color to validate
   * @returns {boolean}
   */
  isValidHex(color) {
    if (!color) return false;
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Get current selected color
   * @returns {string|null}
   */
  getValue() {
    return this.state.value;
  }

  /**
   * Set color programmatically
   * @param {string|null} color - Color to set (hex format)
   */
  setValue(color) {
    if (color && this.isValidHex(color)) {
      const normalizedColor = color.toUpperCase();
      this.setState({ value: normalizedColor, customColor: normalizedColor });
    } else {
      this.setState({ value: null });
    }
  }

  /**
   * Update preset colors
   * @param {Array} colors - New preset colors array
   */
  setColors(colors) {
    this.options.colors = colors;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Enable/disable the color picker
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.render();
    this.setupEventListeners();
  }
}

export default ColorPicker;
