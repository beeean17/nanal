// components/widgets/WeatherWidget.js - Weather display widget
import { Component } from '../base/Component.js';
import { dataManager } from '../../state.js';

/**
 * WeatherWidget - Displays current weather information
 * @class
 * @extends Component
 */
export class WeatherWidget extends Component {
  constructor(containerId, options = {}) {
    super(containerId, {
      refreshInterval: 30 * 60 * 1000, // 30 minutes default
      showDetails: false, // Show humidity, wind speed, etc.
      onClick: null, // Optional click handler
      ...options
    });

    // State
    this.weatherData = null;
    this.isLoading = false;
    this.error = null;
    this.refreshIntervalId = null;
  }

  template() {
    if (this.isLoading && !this.weatherData) {
      return this.renderLoading();
    }

    if (this.error) {
      return this.renderError();
    }

    if (this.weatherData) {
      return this.renderWeather();
    }

    return this.renderLoading();
  }

  renderLoading() {
    return `
      <div class="weather-header">
        <span class="weather-icon-small">☁️</span>
        <span class="card-title">날씨 (Weather)</span>
        <span class="chevron">›</span>
      </div>
      <div class="weather-body">
        <div class="weather-main-text">날씨 정보 불러오는 중...</div>
      </div>
    `;
  }

  renderError() {
    return `
      <div class="weather-header">
        <span class="weather-icon-small">❌</span>
        <span class="card-title">날씨 (Weather)</span>
        <span class="chevron">›</span>
      </div>
      <div class="weather-body">
        <div class="weather-main-text weather-error">날씨 정보를 불러올 수 없습니다</div>
      </div>
    `;
  }

  renderWeather() {
    const { temp, condition, icon, humidity, windSpeed } = this.weatherData;
    const location = dataManager.data.settings?.weatherLocation || '서울';

    let detailsHtml = '';
    if (this.options.showDetails && humidity !== undefined && windSpeed !== undefined) {
      detailsHtml = `
        <div class="weather-details">
          <span>습도: ${humidity}%</span>
          <span>풍속: ${windSpeed}m/s</span>
        </div>
      `;
    }

    return `
      <div class="weather-header">
        <span class="weather-icon-small">${icon}</span>
        <span class="card-title">날씨 (Weather)</span>
        <span class="chevron">›</span>
      </div>
      <div class="weather-body">
        <div class="weather-main-text">${location}, ${temp}°C ${condition}</div>
        ${detailsHtml}
      </div>
    `;
  }

  setupEventListeners() {
    if (this.options.onClick) {
      this.addEventListener(this.container, 'click', this.options.onClick);
    }
  }

  onMount() {
    // Load weather immediately
    this.loadWeather();

    // Start refresh interval
    if (this.options.refreshInterval > 0) {
      this.refreshIntervalId = setInterval(() => {
        this.loadWeather();
      }, this.options.refreshInterval);
    }
  }

  onDestroy() {
    // Clear refresh interval
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  /**
   * Load weather data
   */
  async loadWeather() {
    this.isLoading = true;
    this.error = null;

    try {
      // Get location from settings or default to Seoul
      const location = dataManager.data.settings?.weatherLocation || 'Seoul';

      // Fetch weather (using OpenWeatherMap or similar API)
      // For now, using mock data - replace with actual API call
      // TODO: Replace with actual API integration
      const mockWeather = await this.fetchWeatherMock(location);

      this.weatherData = mockWeather;
      this.error = null;

    } catch (error) {
      console.error('[WeatherWidget] Load error:', error);
      this.error = error.message || '날씨 정보를 불러올 수 없습니다';
      this.weatherData = null;
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  /**
   * Fetch weather data (mock implementation)
   * TODO: Replace with actual API call
   * @param {string} location - Location name
   * @returns {Promise<Object>} Weather data
   */
  async fetchWeatherMock(location) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock weather data
    const conditions = [
      { condition: '맑음', icon: '☀️', temp: 18 },
      { condition: '흐림', icon: '☁️', temp: 15 },
      { condition: '비', icon: '🌧️', temp: 12 },
      { condition: '눈', icon: '❄️', temp: -2 }
    ];

    // Random condition for variety (in real app, this comes from API)
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      temp: randomCondition.temp,
      condition: randomCondition.condition,
      icon: randomCondition.icon,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.random() * 5 + 1 // 1-6 m/s
    };
  }

  /**
   * Manually refresh weather
   */
  refresh() {
    this.loadWeather();
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

export default WeatherWidget;
