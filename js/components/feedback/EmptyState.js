// components/feedback/EmptyState.js - Empty State Component
// Display when no data or content is available

import { Component } from '../base/Component.js';
import { ValidationUtils } from '../../utils.js';

/**
 * EmptyState - Empty state display component
 *
 * Options:
 * - icon: Icon/emoji to display (string)
 * - title: Main title text (string)
 * - description: Description text (string)
 * - actionText: Action button text (string)
 * - onAction: Action button callback (function)
 * - secondaryActionText: Secondary action text (string)
 * - onSecondaryAction: Secondary action callback (function)
 * - size: 'small', 'medium', 'large' (default: 'medium')
 * - image: Custom image URL (string)
 */
export class EmptyState extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      icon: '📭',
      title: 'No items found',
      description: '',
      actionText: '',
      onAction: null,
      secondaryActionText: '',
      onSecondaryAction: null,
      size: 'medium', // 'small', 'medium', 'large'
      image: null,
      ...options
    });

    this.state = {};
  }

  template() {
    const { icon, title, description, actionText, secondaryActionText, size, image } = this.options;

    const sizeClass = `empty-state-${size}`;

    return `
      <div class="empty-state ${sizeClass}">
        <div class="empty-state-content">
          ${this.renderVisual()}

          ${title ? `
            <h3 class="empty-state-title">${ValidationUtils.escapeHtml(title)}</h3>
          ` : ''}

          ${description ? `
            <p class="empty-state-description">${ValidationUtils.escapeHtml(description)}</p>
          ` : ''}

          ${this.renderActions()}
        </div>
      </div>
    `;
  }

  renderVisual() {
    const { icon, image } = this.options;

    if (image) {
      return `
        <div class="empty-state-image">
          <img src="${ValidationUtils.escapeHtml(image)}" alt="Empty state illustration" />
        </div>
      `;
    } else if (icon) {
      return `
        <div class="empty-state-icon">
          ${icon}
        </div>
      `;
    }

    return '';
  }

  renderActions() {
    const { actionText, secondaryActionText } = this.options;

    if (!actionText && !secondaryActionText) {
      return '';
    }

    return `
      <div class="empty-state-actions">
        ${actionText ? `
          <button type="button" class="empty-state-action-btn empty-state-primary-btn">
            ${ValidationUtils.escapeHtml(actionText)}
          </button>
        ` : ''}
        ${secondaryActionText ? `
          <button type="button" class="empty-state-action-btn empty-state-secondary-btn">
            ${ValidationUtils.escapeHtml(secondaryActionText)}
          </button>
        ` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    // Primary action button
    const primaryBtn = this.$('.empty-state-primary-btn');
    if (primaryBtn) {
      this.addEventListener(primaryBtn, 'click', () => {
        if (this.options.onAction) {
          this.options.onAction();
        }
      });
    }

    // Secondary action button
    const secondaryBtn = this.$('.empty-state-secondary-btn');
    if (secondaryBtn) {
      this.addEventListener(secondaryBtn, 'click', () => {
        if (this.options.onSecondaryAction) {
          this.options.onSecondaryAction();
        }
      });
    }
  }

  /**
   * Update empty state content
   * @param {object} options - New options to merge
   */
  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
    this.setupEventListeners();
  }

  /**
   * Update title
   * @param {string} title - New title
   */
  setTitle(title) {
    this.options.title = title;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Update description
   * @param {string} description - New description
   */
  setDescription(description) {
    this.options.description = description;
    this.render();
    this.setupEventListeners();
  }

  /**
   * Update icon
   * @param {string} icon - New icon
   */
  setIcon(icon) {
    this.options.icon = icon;
    this.render();
    this.setupEventListeners();
  }
}

/**
 * Predefined empty state configurations
 */
export const EmptyStatePresets = {
  /**
   * No search results
   */
  noSearchResults: (query) => ({
    icon: '🔍',
    title: 'No results found',
    description: query ? `No results found for "${query}"` : 'Try adjusting your search terms',
    actionText: 'Clear search',
    size: 'medium'
  }),

  /**
   * No data yet
   */
  noData: (itemType = 'items') => ({
    icon: '📭',
    title: `No ${itemType} yet`,
    description: `You haven't created any ${itemType} yet. Get started by creating your first one!`,
    actionText: `Create ${itemType}`,
    size: 'medium'
  }),

  /**
   * No todos
   */
  noTodos: () => ({
    icon: '✅',
    title: 'All done!',
    description: 'You have no pending tasks. Great job!',
    actionText: 'Add new task',
    size: 'medium'
  }),

  /**
   * No goals
   */
  noGoals: () => ({
    icon: '🎯',
    title: 'No goals set',
    description: 'Set your first goal and start making progress!',
    actionText: 'Create goal',
    size: 'medium'
  }),

  /**
   * No habits
   */
  noHabits: () => ({
    icon: '🔄',
    title: 'No habits tracked',
    description: 'Start building better habits by tracking your daily activities.',
    actionText: 'Create habit',
    size: 'medium'
  }),

  /**
   * No ideas
   */
  noIdeas: () => ({
    icon: '💡',
    title: 'No ideas captured',
    description: 'Capture your brilliant ideas before they slip away!',
    actionText: 'Add idea',
    size: 'medium'
  }),

  /**
   * Error state
   */
  error: (message = 'Something went wrong') => ({
    icon: '⚠️',
    title: 'Oops!',
    description: message,
    actionText: 'Try again',
    size: 'medium'
  }),

  /**
   * Network error
   */
  networkError: () => ({
    icon: '📡',
    title: 'Connection lost',
    description: 'Please check your internet connection and try again.',
    actionText: 'Retry',
    size: 'medium'
  }),

  /**
   * Permission denied
   */
  permissionDenied: () => ({
    icon: '🔒',
    title: 'Access denied',
    description: 'You don\'t have permission to view this content.',
    size: 'medium'
  }),

  /**
   * Coming soon
   */
  comingSoon: (feature = 'This feature') => ({
    icon: '🚧',
    title: 'Coming soon',
    description: `${feature} is under development and will be available soon!`,
    size: 'medium'
  }),

  /**
   * Maintenance
   */
  maintenance: () => ({
    icon: '🔧',
    title: 'Under maintenance',
    description: 'We\'re performing scheduled maintenance. Please check back soon.',
    size: 'medium'
  })
};

export default EmptyState;
