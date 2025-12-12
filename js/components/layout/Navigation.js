// components/layout/Navigation.js - App navigation component
import { Component } from '../base/Component.js';
import { EventBus } from '../../core/EventBus.js';

/**
 * Navigation - App navigation (sidebar + bottom nav)
 * @class
 * @extends Component
 *
 * Renders both desktop sidebar and mobile bottom navigation
 */
export class Navigation extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      items: [
        { id: 'home', icon: '🏠', label: '홈', href: '#home' },
        { id: 'calendar', icon: '📅', label: '캘린더', href: '#calendar' },
        { id: 'goals', icon: '🎯', label: '목표', href: '#goals' },
        { id: 'ideas', icon: '💡', label: '아이디어', href: '#ideas' },
        { id: 'settings', icon: '⚙️', label: '설정', href: '#settings' }
      ],
      currentScreen: 'home',
      showSidebar: true, // Desktop sidebar
      showBottomNav: true, // Mobile bottom nav
      onNavigate: null, // Callback when navigation occurs
      ...options
    });

    // Subscribe to route changes from EventBus
    EventBus.on('route:changed', (route) => {
      this.setActive(route);
    });
  }

  template() {
    const { items, currentScreen, showSidebar, showBottomNav } = this.options;

    const renderNavItems = (additionalClass = '') => items.map(item => `
      <a href="${item.href}"
         class="nav-item ${currentScreen === item.id ? 'active' : ''} ${additionalClass}"
         data-screen="${item.id}">
        <span class="icon">${item.icon}</span>
        <span class="label">${item.label}</span>
      </a>
    `).join('');

    return `
      ${showSidebar ? `
        <!-- Desktop Sidebar -->
        <aside id="sidebar" class="sidebar">
          <nav class="nav-menu">
            ${renderNavItems('sidebar-item')}
          </nav>
        </aside>
      ` : ''}

      ${showBottomNav ? `
        <!-- Mobile Bottom Nav -->
        <nav id="bottom-nav" class="bottom-nav">
          ${renderNavItems('bottom-item')}
        </nav>
      ` : ''}
    `;
  }

  setupEventListeners() {
    const navItems = this.$$('.nav-item');

    navItems.forEach(item => {
      this.addEventListener(item, 'click', (e) => {
        e.preventDefault();
        const screen = item.dataset.screen;

        // Update hash (triggers router)
        window.location.hash = `#${screen}`;

        // Update UI
        this.setActive(screen);

        // Emit event
        EventBus.emit('navigation:click', screen);

        // Callback
        if (this.options.onNavigate) {
          this.options.onNavigate(screen);
        }
      });
    });
  }

  /**
   * Set active navigation item
   * @param {string} screenId - Screen ID to activate
   */
  setActive(screenId) {
    this.options.currentScreen = screenId;

    const navItems = this.$$('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.screen === screenId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Get current active screen
   * @returns {string} Current screen ID
   */
  getCurrentScreen() {
    return this.options.currentScreen;
  }

  /**
   * Add navigation item
   * @param {Object} item - Navigation item {id, icon, label, href}
   */
  addItem(item) {
    this.options.items.push(item);
    this.render();
  }

  /**
   * Remove navigation item
   * @param {string} itemId - Item ID to remove
   */
  removeItem(itemId) {
    this.options.items = this.options.items.filter(item => item.id !== itemId);
    this.render();
  }

  /**
   * Update options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.render();
  }

  onDestroy() {
    // Cleanup EventBus subscription
    EventBus.off('route:changed', this.setActive);
  }
}

export default Navigation;
