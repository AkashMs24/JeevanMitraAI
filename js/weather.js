/**
 * Real-Time Weather Integration
 * Fetches live weather data from Open-Meteo API
 */

class WeatherService {
    constructor() {
        this.endpoint = CONFIG.WEATHER.ENDPOINT;
        this.reverseGeocode = CONFIG.WEATHER.REVERSE_GEOCODE;
    }

    /**
     * Get user location and fetch weather
     */
    async getWeatherForLocation() {
        try {
            showLoading('📍 Getting your location...');

            // Get coordinates
            const coords = await this.getCoordinates();
            const { latitude, longitude } = coords;

            // Save location
            localStorage.setItem(CONFIG.STORAGE_KEYS.LOCATION, JSON.stringify({ latitude, longitude }));

            // Get location name
            const locationName = await this.getLocationName(latitude, longitude);

            // Fetch weather
            showLoading('⛅ Fetching weather data...');
            const weatherData = await this.fetchWeather(latitude, longitude);

            hideLoading();

            return {
                latitude,
                longitude,
                locationName,
                ...weatherData
            };
        } catch (error) {
            hideLoading();
            showToast(`❌ ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Get user coordinates (geolocation or stored)
     */
    async getCoordinates() {
        return new Promise((resolve, reject) => {
            // Check if location is stored
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
            if (stored) {
                resolve(JSON.parse(stored));
                return;
            }

            // Request geolocation
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    // Fallback: Use default location (Bangalore, India)
                    resolve({
                        latitude: 12.9716,
                        longitude: 77.5946
                    });
                }
            );
        });
    }

    /**
     * Reverse geocode coordinates to location name
     */
    async getLocationName(latitude, longitude) {
        try {
            const response = await fetch(
                `${this.reverseGeocode}?format=json&lat=${latitude}&lon=${longitude}`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            return data.address?.city || data.address?.town || data.address?.county || 'Unknown Location';
        } catch (error) {
            return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        }
    }

    /**
     * Fetch weather data from Open-Meteo (FREE, no key needed)
     */
    async fetchWeather(latitude, longitude) {
        // Check cache first
        const cacheKey = `weather_${latitude}_${longitude}`;
        const cached = CacheManager.get(cacheKey);
        if (cached) return cached;

        const url = `${this.endpoint}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;

        const response = await fetchWithRetry(url);
        const data = await response.json();

        const weatherData = {
            current: {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                rainfall: data.current.precipitation || 0,
                windSpeed: data.current.wind_speed_10m,
                weatherCode: data.current.weather_code
            },
            forecast: data.daily,
            timezone: data.timezone
        };

        // Cache for 1 hour
        CacheManager.set(cacheKey, weatherData, CONFIG.CACHE.WEATHER_TTL);
        return weatherData;
    }

    /**
     * Get 7-day forecast
     */
    async getForecast(latitude, longitude) {
        const cacheKey = `forecast_${latitude}_${longitude}`;
        const cached = CacheManager.get(cacheKey);
        if (cached) return cached;

        const url = `${this.endpoint}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;

        const response = await fetchWithRetry(url);
        const data = await response.json();

        CacheManager.set(cacheKey, data.daily, CONFIG.CACHE.FORECAST_TTL);
        return data.daily;
    }

    /**
     * Get agricultural insights from weather
     */
    async getAgriculturalInsights(weatherData) {
        const prompt = `Based on this weather data: Temperature: ${weatherData.current.temperature}°C, Humidity: ${weatherData.current.humidity}%, Rainfall: ${weatherData.current.rainfall}mm
        
        Provide agricultural insights for farming. Include:
        1. Optimal crops for this weather
        2. Pest/disease risks
        3. Irrigation recommendations
        4. Harvest timing advice`;

        try {
            const insights = await groqAPI.chat(prompt);
            return insights;
        } catch (error) {
            console.error('Failed to get insights:', error);
            return null;
        }
    }
}

// Global instance
const weatherService = new WeatherService();

// Update dashboard weather
function fetchLiveWeather() {
    weatherService.getWeatherForLocation().then(weather => {
        document.getElementById('liveDataDisplay').style.display = 'block';
        document.getElementById('liveTemp').textContent = `${weather.current.temperature}°C`;
        document.getElementById('liveHumidity').textContent = `${weather.current.humidity}%`;
        document.getElementById('liveRainfall').textContent = `${weather.current.rainfall}mm`;
        document.getElementById('liveLocation').textContent = weather.locationName;

        // Update dashboard
        document.getElementById('weatherStatus').textContent = `${weather.current.temperature}°C`;
        document.getElementById('locationStatus').textContent = weather.locationName;

        // Auto-fill crop advisor
        document.getElementById('temperature').value = weather.current.temperature;
        document.getElementById('humidity').value = weather.current.humidity;
        
        // Update sliders
        document.getElementById('temperatureVal').textContent = weather.current.temperature;
        document.getElementById('humidityVal').textContent = weather.current.humidity;

        showToast('✅ Weather data loaded!', 'success');
    });
}
