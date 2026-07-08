class WeatherService {
    constructor() {
        this.endpoint = CONFIG.WEATHER.ENDPOINT;
        this.reverseGeocode = CONFIG.WEATHER.REVERSE_GEOCODE;
    }
    async getWeatherForLocation() {
        showLoading('📍 Getting location…');
        const coords = await this.getCoordinates();
        const { latitude, longitude } = coords;
        localStorage.setItem(CONFIG.STORAGE_KEYS.LOCATION, JSON.stringify({ latitude, longitude }));
        const locationName = await this.getLocationName(latitude, longitude);
        showLoading('⛅ Fetching weather…');
        const weatherData = await this.fetchWeather(latitude, longitude);
        hideLoading();
        return { latitude, longitude, locationName, ...weatherData };
    }
    async getCoordinates() {
        return new Promise((resolve) => {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
            if (stored) { try { resolve(JSON.parse(stored)); return; } catch {} }
            if (!navigator.geolocation) { resolve(getDefaultLocation()); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(getDefaultLocation())
            );
        });
    }
    async getLocationName(lat, lng) {
        try {
            const res = await fetch(`${this.reverseGeocode}?format=json&lat=${lat}&lon=${lng}`, { headers: { 'Accept-Language': 'en' } });
            const data = await res.json();
            return data.address?.city || data.address?.town || data.address?.county || 'Unknown';
        } catch { return `${lat.toFixed(2)}, ${lng.toFixed(2)}`; }
    }
    async fetchWeather(lat, lng) {
        const cacheKey = `weather_${lat}_${lng}`;
        const cached = CacheManager.get(cacheKey);
        if (cached) return cached;
        const url = `${this.endpoint}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
        const res = await fetchWithRetry(url);
        const data = await res.json();
        const weatherData = {
            current: { temperature: data.current.temperature_2m, humidity: data.current.relative_humidity_2m, rainfall: data.current.precipitation || 0, windSpeed: data.current.wind_speed_10m, weatherCode: data.current.weather_code },
            forecast: data.daily, timezone: data.timezone
        };
        CacheManager.set(cacheKey, weatherData, CONFIG.CACHE.WEATHER_TTL);
        return weatherData;
    }
    async getForecast(lat, lng) {
        const cacheKey = `forecast_${lat}_${lng}`;
        const cached = CacheManager.get(cacheKey);
        if (cached) return cached;
        const url = `${this.endpoint}?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
        const res = await fetchWithRetry(url);
        const data = await res.json();
        CacheManager.set(cacheKey, data.daily, CONFIG.CACHE.FORECAST_TTL);
        return data.daily;
    }
}
const weatherService = new WeatherService();
function fetchLiveWeather() {
    weatherService.getWeatherForLocation().then(w => {
        const ld = document.getElementById('liveDataDisplay'); if (ld) ld.style.display = 'block';
        setSafeText('liveTemp', `${w.current.temperature}°C`);
        setSafeText('liveHumidity', `${w.current.humidity}%`);
        setSafeText('liveRainfall', `${w.current.rainfall}mm`);
        setSafeText('liveLocation', w.locationName);
        setSafeText('weatherStatus', `${w.current.temperature}°C`);
        setSafeText('locationStatus', w.locationName);
        showToast(t('weather_filled') || '✅ Weather loaded!', 'success');
        const ts = document.getElementById('temperature'), hs = document.getElementById('humidity');
        if (ts) { ts.value = w.current.temperature; setSafeText('temperatureVal', Math.round(w.current.temperature)); }
        if (hs) { hs.value = w.current.humidity; setSafeText('humidityVal', Math.round(w.current.humidity)); }
    }).catch(() => {});
}
async function renderForecast() {
    const container = document.getElementById('weatherForecastContainer'); if (!container) return;
    try {
        const coords = await weatherService.getCoordinates();
        const f = await weatherService.getForecast(coords.latitude, coords.longitude);
        if (!f || !f.time) { container.innerHTML = '<p class="empty-state">No forecast data</p>'; return; }
        const icons = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌧️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'🌨️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️' };
        let html = '';
        for (let i = 0; i < Math.min(7, f.time.length); i++) {
            const d = new Date(f.time[i]);
            const day = i === 0 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' });
            html += `<div class="forecast-card"><div class="fc-icon">${icons[f.weather_code?.[i]] || '🌤️'}</div><div class="fc-day">${day}</div><div class="fc-date">${f.time[i]}</div><div class="fc-temp">${f.temperature_2m_max[i]}°</div><div class="fc-low">Low: ${f.temperature_2m_min[i]}°</div><div class="fc-rain">🌧️ ${f.precipitation_sum[i]}mm</div></div>`;
        }
        container.innerHTML = html;
    } catch { container.innerHTML = '<p class="empty-state">Failed to load</p>'; }
}
