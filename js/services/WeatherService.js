// services/WeatherService.js - Weather API Service
// Centralized weather data fetching with caching

/**
 * WeatherService - Handles weather API calls and caching
 * 
 * Features:
 * - Fetch weather from OpenWeatherMap API (with mock fallback)
 * - Cache weather data to avoid unnecessary API calls
 * - Map weather conditions to emoji icons
 */
class WeatherServiceClass {
    constructor() {
        // OpenWeatherMap API Key (replace with your own in production)
        this.apiKey = null; // Set via setApiKey()
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

        // Cache settings
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes

        // Weather condition to emoji mapping
        this.conditionIcons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
    }

    /**
     * Set API key for OpenWeatherMap
     * @param {string} key - API key
     */
    setApiKey(key) {
        this.apiKey = key;
        console.log('[WeatherService] API key configured');
    }

    /**
     * Fetch weather for a location
     * @param {string} location - City name or coordinates
     * @returns {Promise<Object>} Weather data
     */
    async fetchWeather(location) {
        console.log(`[WeatherService] Fetching weather for: ${location}`);

        // Check cache first
        const cached = this.getCachedWeather(location);
        if (cached) {
            console.log('[WeatherService] Returning cached data');
            return cached;
        }

        try {
            // Try real API if key is configured
            if (this.apiKey) {
                const data = await this.fetchFromApi(location);
                this.cacheWeather(location, data);
                return data;
            } else {
                // Fall back to mock data
                console.log('[WeatherService] No API key, using mock data');
                const data = await this.fetchMock(location);
                this.cacheWeather(location, data);
                return data;
            }
        } catch (error) {
            console.error('[WeatherService] Fetch error:', error);

            // Return mock data on error
            const data = await this.fetchMock(location);
            return data;
        }
    }

    /**
     * Fetch from OpenWeatherMap API
     * @param {string} location - City name
     * @returns {Promise<Object>} Weather data
     */
    async fetchFromApi(location) {
        const url = `${this.baseUrl}?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&lang=kr`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const apiData = await response.json();

        // Transform API response to our format
        return {
            temp: Math.round(apiData.main.temp),
            condition: this.translateCondition(apiData.weather[0].main),
            icon: this.getWeatherIcon(apiData.weather[0].main),
            humidity: apiData.main.humidity,
            windSpeed: Math.round(apiData.wind.speed * 10) / 10,
            description: apiData.weather[0].description,
            location: apiData.name
        };
    }

    /**
     * Fetch mock weather data
     * @param {string} location - Location name
     * @returns {Promise<Object>} Mock weather data
     */
    async fetchMock(location) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Mock conditions
        const conditions = [
            { condition: 'Clear', temp: 18 },
            { condition: 'Clouds', temp: 15 },
            { condition: 'Rain', temp: 12 },
            { condition: 'Snow', temp: -2 }
        ];

        // Pseudo-random based on location string for consistency
        const index = location.length % conditions.length;
        const { condition, temp } = conditions[index];

        return {
            temp: temp + Math.floor(Math.random() * 5),
            condition: this.translateCondition(condition),
            icon: this.getWeatherIcon(condition),
            humidity: 40 + Math.floor(Math.random() * 40),
            windSpeed: 1 + Math.round(Math.random() * 5 * 10) / 10,
            description: `${this.translateCondition(condition)} (mock)`,
            location: location
        };
    }

    /**
     * Get weather icon for condition
     * @param {string} condition - Weather condition (English)
     * @returns {string} Emoji icon
     */
    getWeatherIcon(condition) {
        return this.conditionIcons[condition] || '🌡️';
    }

    /**
     * Translate condition to Korean
     * @param {string} condition - English condition
     * @returns {string} Korean condition
     */
    translateCondition(condition) {
        const translations = {
            'Clear': '맑음',
            'Clouds': '흐림',
            'Rain': '비',
            'Drizzle': '이슬비',
            'Thunderstorm': '뇌우',
            'Snow': '눈',
            'Mist': '안개',
            'Fog': '안개',
            'Haze': '연무'
        };
        return translations[condition] || condition;
    }

    /**
     * Get cached weather if still valid
     * @param {string} location - Location key
     * @returns {Object|null} Cached data or null
     */
    getCachedWeather(location) {
        const cacheKey = location.toLowerCase();
        const cached = this.cache.get(cacheKey);

        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheExpiry;
        if (isExpired) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached.data;
    }

    /**
     * Cache weather data
     * @param {string} location - Location key
     * @param {Object} data - Weather data
     */
    cacheWeather(location, data) {
        const cacheKey = location.toLowerCase();
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('[WeatherService] Cache cleared');
    }
}

// Singleton instance
export const weatherService = new WeatherServiceClass();
export default weatherService;
