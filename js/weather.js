class WeatherService {
    constructor() {
        this.endpoint = 'https://api.open-meteo.com/v1/forecast';
        this.geocode = 'https://nominatim.openstreetmap.org/reverse';
    }

    async getCoordinates() {
        return new Promise((resolve) => {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
            if (stored) { try { resolve(JSON.parse(stored)); return; } catch {} }
            if (!navigator.geolocation) { resolve({ latitude: 12.9716, longitude: 77.5946 }); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve({ latitude: 12.9716, longitude: 77.5946 })
            );
        });
    }

    async getLocationName(lat, lng) {
        try {
            const res = await fetch(`${this.geocode}?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'Accept-Language': 'en' },
                signal: AbortSignal.timeout(5000)
            });
            const data = await res.json();
            return data.address?.city || data.address?.town || data.address?.county || data.address?.village || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        } catch { return `${lat.toFixed(2)}, ${lng.toFixed(2)}`; }
    }

    async fetchWeather(lat, lng) {
        const url = `${this.endpoint}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`Weather API: ${res.status}`);
        const data = await res.json();
        if (!data?.current) throw new Error('Invalid weather data');
        return data;
    }

    async getForecast(lat, lng) {
        const url = `${this.endpoint}?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`Forecast API: ${res.status}`);
        const data = await res.json();
        return data?.daily || null;
    }
}

const weatherService = new WeatherService();

async function fetchLiveWeather() {
    const fetchBtn = document.getElementById('fetchWeatherBtn');
    if (fetchBtn) fetchBtn.disabled = true;

    try {
        showLoading(t('live_hint') || '📡 Fetching live weather…');
        const coords = await weatherService.getCoordinates();
        localStorage.setItem(CONFIG.STORAGE_KEYS.LOCATION, JSON.stringify(coords));

        const locationName = await weatherService.getLocationName(coords.latitude, coords.longitude);
        showLoading('⛅ Loading weather data…');
        const data = await weatherService.fetchWeather(coords.latitude, coords.longitude);
        hideLoading();

        const temp = data.current.temperature_2m;
        const hum = data.current.relative_humidity_2m;
        const rain = data.current.precipitation || 0;

        const ld = document.getElementById('liveDataDisplay');
        if (ld) ld.style.display = 'block';
        setSafeText('liveTemp', `${temp}°C`);
        setSafeText('liveHumidity', `${hum}%`);
        setSafeText('liveRainfall', `${rain}mm`);
        setSafeText('liveLocation', locationName);
        setSafeText('weatherStatus', `${temp}°C`);
        setSafeText('locationStatus', locationName);
        setSafeText('locationDisplay', `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} (${locationName})`);
        setSafeText('dataStatus', '✅ Live');

        // Auto-fill sliders if they exist
        const ts = document.getElementById('temperature');
        const hs = document.getElementById('humidity');
        if (ts) ts.value = temp;
        if (hs) hs.value = hum;

        showToast(t('weather_loaded') || '✅ Weather loaded!', 'success');
    } catch (e) {
        hideLoading();
        console.error('Weather fetch failed:', e);
        showToast(`❌ Weather failed: ${e.message}`, 'error');
        setSafeText('dataStatus', '❌ Offline');
    } finally {
        if (fetchBtn) fetchBtn.disabled = false;
    }
}

async function renderForecast() {
    const container = document.getElementById('weatherForecastContainer');
    if (!container) return;

    try {
        showLoading('⛅ Loading forecast…');
        const coords = await weatherService.getCoordinates();
        const f = await weatherService.getForecast(coords.latitude, coords.longitude);
        hideLoading();

        if (!f?.time?.length) {
            container.innerHTML = '<p class="empty-state">No forecast available</p>';
            return;
        }

        const icons = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌧️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'🌨️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️' };
        const today = t('weather_today') || 'Today';
        let html = '';
        for (let i = 0; i < Math.min(7, f.time.length); i++) {
            const d = new Date(f.time[i] + 'T00:00:00');
            const day = i === 0 ? today : d.toLocaleDateString('en', { weekday: 'short' });
            html += `<div class="forecast-card">
                <div class="fc-icon">${icons[f.weather_code?.[i]] || '🌤️'}</div>
                <div class="fc-day">${day}</div>
                <div class="fc-date">${f.time[i]}</div>
                <div class="fc-temp">${f.temperature_2m_max[i]}°</div>
                <div class="fc-low">${t('weather_low') || 'Low:'} ${f.temperature_2m_min[i]}°</div>
                <div class="fc-rain">🌧️ ${f.precipitation_sum[i]}mm</div>
            </div>`;
        }
        container.innerHTML = html;
    } catch (e) {
        hideLoading();
        console.error('Forecast failed:', e);
        container.innerHTML = `<p class="empty-state">❌ Forecast failed: ${e.message}</p>`;
    }
}
