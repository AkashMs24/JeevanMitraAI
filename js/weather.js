class WeatherService {
    async getCoordinates(forceFresh = false) {
        if (!forceFresh) { const saved = getSavedLocation(); if (saved) return { latitude: saved.lat, longitude: saved.lng }; }
        return new Promise(resolve => {
            if (!('geolocation' in navigator)) return resolve(this.fallback());
            navigator.geolocation.getCurrentPosition(
                pos => { const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }; saveLocation(c.latitude, c.longitude); resolve(c); },
                () => resolve(this.fallback()),
                { timeout: 8000 }
            );
        });
    }
    fallback() { return { latitude: CONFIG.WEATHER_API.fallbackLat, longitude: CONFIG.WEATHER_API.fallbackLng }; }

    async fetchWeather(lat, lng) {
        try {
            const url = `${CONFIG.WEATHER_API.endpoint}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('weather fetch failed');
            const data = await res.json();
            return {
                current: {
                    temperature: Math.round(data.current.temperature_2m),
                    humidity: data.current.relative_humidity_2m,
                    rainfall: data.current.precipitation,
                    condition: this.codeToCondition(data.current.weather_code)
                },
                forecast: data.daily.time.map((date, i) => ({
                    date,
                    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                    minTemp: Math.round(data.daily.temperature_2m_min[i]),
                    rainfall: data.daily.precipitation_sum[i],
                    condition: this.codeToCondition(data.daily.weather_code[i])
                }))
            };
        } catch (e) { console.warn('Weather API failed, using mock:', e); return this.mock(); }
    }
    codeToCondition(code) {
        const map = { 0:'☀️ Clear',1:'🌤️ Mostly Clear',2:'⛅ Partly Cloudy',3:'☁️ Cloudy',45:'🌫️ Fog',48:'🌫️ Fog',
            51:'🌦️ Drizzle',61:'🌧️ Rain',63:'🌧️ Rain',65:'🌧️ Heavy Rain',71:'🌨️ Snow',80:'🌦️ Showers',95:'⛈️ Storm' };
        return map[code] || '⛅ Variable';
    }
    mock() {
        return {
            current: { temperature: Math.floor(Math.random()*15+20), humidity: Math.floor(Math.random()*30+50), rainfall: Math.floor(Math.random()*10), condition: '⛅ Partly Cloudy' },
            forecast: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ date: d, maxTemp: Math.floor(Math.random()*10+28), minTemp: Math.floor(Math.random()*10+18), rainfall: Math.floor(Math.random()*15), condition: '🌤️ Mostly Clear' }))
        };
    }
}
const weatherService = new WeatherService();
