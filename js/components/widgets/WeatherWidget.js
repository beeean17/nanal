// components/widgets/WeatherWidget.js - Weather display widget
import { Component } from '../base/Component.js';
import { dataManager } from '../../state.js';
import { weatherService } from '../../services/index.js';

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
   * Load weather data using WeatherService
   */
  async loadWeather() {
    this.isLoading = true;
    this.error = null;

    try {
      // Get location from settings or default to Seoul
      const location = dataManager.data.settings?.weatherLocation || 'Seoul';

      // Use WeatherService to fetch weather data
      this.weatherData = await weatherService.fetchWeather(location);
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
