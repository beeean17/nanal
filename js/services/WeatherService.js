// services/WeatherService.js - Weather API Service using Open-Meteo
// Free API without API key requirement

/**
 * WeatherService - Handles weather API calls using Open-Meteo API
 * 
 * Features:
 * - Fetch weather from Open-Meteo API (free, no API key)
 * - Geocoding for city names
 * - Cache weather data to avoid unnecessary API calls
 * - Map weather conditions to emoji icons
 */
class WeatherServiceClass {
    constructor() {
        // Open-Meteo API URLs
        this.forecastUrl = 'https://api.open-meteo.com/v1/forecast';
        this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

        // Cache settings
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes

        // Location cache for geocoding
        this.locationCache = new Map();

        // Weather code to condition mapping (WMO Weather codes)
        this.weatherCodes = {
            0: { condition: 'Clear', icon: '☀️', kr: '맑음' },
            1: { condition: 'Mainly Clear', icon: '🌤️', kr: '대체로 맑음' },
            2: { condition: 'Partly Cloudy', icon: '⛅', kr: '부분 흐림' },
            3: { condition: 'Overcast', icon: '☁️', kr: '흐림' },
            45: { condition: 'Fog', icon: '🌫️', kr: '안개' },
            48: { condition: 'Depositing Rime Fog', icon: '🌫️', kr: '안개' },
            51: { condition: 'Light Drizzle', icon: '🌦️', kr: '가벼운 이슬비' },
            53: { condition: 'Moderate Drizzle', icon: '🌦️', kr: '이슬비' },
            55: { condition: 'Dense Drizzle', icon: '🌦️', kr: '짙은 이슬비' },
            61: { condition: 'Slight Rain', icon: '🌧️', kr: '약한 비' },
            63: { condition: 'Moderate Rain', icon: '🌧️', kr: '비' },
            65: { condition: 'Heavy Rain', icon: '🌧️', kr: '강한 비' },
            66: { condition: 'Light Freezing Rain', icon: '🌧️', kr: '약한 얼어붙는 비' },
            67: { condition: 'Heavy Freezing Rain', icon: '🌧️', kr: '강한 얼어붙는 비' },
            71: { condition: 'Slight Snow', icon: '🌨️', kr: '약한 눈' },
            73: { condition: 'Moderate Snow', icon: '❄️', kr: '눈' },
            75: { condition: 'Heavy Snow', icon: '❄️', kr: '폭설' },
            77: { condition: 'Snow Grains', icon: '❄️', kr: '싸락눈' },
            80: { condition: 'Slight Rain Showers', icon: '🌦️', kr: '약한 소나기' },
            81: { condition: 'Moderate Rain Showers', icon: '🌧️', kr: '소나기' },
            82: { condition: 'Violent Rain Showers', icon: '⛈️', kr: '강한 소나기' },
            85: { condition: 'Slight Snow Showers', icon: '🌨️', kr: '약한 눈 소나기' },
            86: { condition: 'Heavy Snow Showers', icon: '❄️', kr: '눈 소나기' },
            95: { condition: 'Thunderstorm', icon: '⛈️', kr: '뇌우' },
            96: { condition: 'Thunderstorm with Hail', icon: '⛈️', kr: '우박 동반 뇌우' },
            99: { condition: 'Thunderstorm with Heavy Hail', icon: '⛈️', kr: '강한 우박 동반 뇌우' }
        };

        // Default Korean cities coordinates
        this.defaultLocations = {
            'seoul': { lat: 37.5665, lon: 126.9780, name: '서울' },
            '서울': { lat: 37.5665, lon: 126.9780, name: '서울' },
            'busan': { lat: 35.1796, lon: 129.0756, name: '부산' },
            '부산': { lat: 35.1796, lon: 129.0756, name: '부산' },
            'daegu': { lat: 35.8714, lon: 128.6014, name: '대구' },
            '대구': { lat: 35.8714, lon: 128.6014, name: '대구' },
            'incheon': { lat: 37.4563, lon: 126.7052, name: '인천' },
            '인천': { lat: 37.4563, lon: 126.7052, name: '인천' },
            'daejeon': { lat: 36.3504, lon: 127.3845, name: '대전' },
            '대전': { lat: 36.3504, lon: 127.3845, name: '대전' },
            'gwangju': { lat: 35.1595, lon: 126.8526, name: '광주' },
            '광주': { lat: 35.1595, lon: 126.8526, name: '광주' },
            'ulsan': { lat: 35.5384, lon: 129.3114, name: '울산' },
            '울산': { lat: 35.5384, lon: 129.3114, name: '울산' },
            'sejong': { lat: 36.4800, lon: 127.2890, name: '세종' },
            '세종': { lat: 36.4800, lon: 127.2890, name: '세종' }
        };
    }

    /**
     * Fetch weather for a location
     * @param {string} location - City name
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
            // Get coordinates for location
            const coords = await this.getCoordinates(location);
            if (!coords) {
                throw new Error('Location not found');
            }

            // Fetch weather from Open-Meteo
            const data = await this.fetchFromApi(coords.lat, coords.lon, coords.name || location);
            this.cacheWeather(location, data);
            return data;

        } catch (error) {
            console.error('[WeatherService] Fetch error:', error);
            // Return mock data on error
            return this.getMockData(location);
        }
    }

    /**
     * Get coordinates for a location (geocoding)
     * @param {string} location - City name
     * @returns {Promise<Object|null>} {lat, lon, name} or null
     */
    async getCoordinates(location) {
        const locationKey = location.toLowerCase().trim();

        // Check default locations first
        if (this.defaultLocations[locationKey]) {
            return this.defaultLocations[locationKey];
        }

        // Check location cache
        if (this.locationCache.has(locationKey)) {
            return this.locationCache.get(locationKey);
        }

        try {
            // Use Open-Meteo Geocoding API
            const url = `${this.geocodingUrl}?name=${encodeURIComponent(location)}&count=1&language=ko`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const coords = {
                    lat: result.latitude,
                    lon: result.longitude,
                    name: result.name
                };
                this.locationCache.set(locationKey, coords);
                return coords;
            }

            return null;
        } catch (error) {
            console.error('[WeatherService] Geocoding error:', error);
            // Fallback to Seoul
            return this.defaultLocations['seoul'];
        }
    }

    /**
     * Fetch from Open-Meteo API
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} locationName - Location name for display
     * @returns {Promise<Object>} Weather data
     */
    async fetchFromApi(lat, lon, locationName) {
        const url = `${this.forecastUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Seoul`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const apiData = await response.json();
        const current = apiData.current;

        // Get weather condition from code
        const weatherCode = current.weather_code;
        const weatherInfo = this.weatherCodes[weatherCode] || { condition: 'Unknown', icon: '🌡️', kr: '알 수 없음' };

        return {
            temp: Math.round(current.temperature_2m),
            condition: weatherInfo.kr,
            icon: weatherInfo.icon,
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
            description: weatherInfo.kr,
            location: locationName
        };
    }

    /**
     * Get mock weather data
     * @param {string} location - Location name
     * @returns {Object} Mock weather data
     */
    getMockData(location) {
        return {
            temp: 15,
            condition: '맑음 (오프라인)',
            icon: '☀️',
            humidity: 50,
            windSpeed: 3.5,
            description: '날씨 정보를 불러올 수 없습니다',
            location: location
        };
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
