window.autoVoice = true;
window.addEventListener('load', async () => {
    currentLanguage = getLanguage();
    document.getElementById('langSelect').value = currentLanguage;
    applyTranslations();
    checkApiStatus();
    populateYieldCropSelect();
    updatePreview();
    setSafeText('locationStatus', '📍 Not fetched');
    setSafeText('weatherStatus', '⛅ Not fetched');
    setSafeText('dataStatus', '—');
});
function checkApiStatus() {
    const hasKey = groqAPI.isConfigured();
    setSafeText('statusText', hasKey ? '🤖 AI Ready' : '⚠️ Setup Needed');
    const dot = document.querySelector('.api-status'); if (dot) dot.style.color = hasKey ? '#10b981' : '#ef4444';
    setSafeText('aiStatus', hasKey ? '✅ Connected' : '❌ Add a key in Settings');
    const apiDisplay = document.getElementById('apiDisplay'); if (apiDisplay) apiDisplay.textContent = hasKey ? '✅ Connected' : '❌ Not configured';
}
function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    btn?.classList.add('active');
}
async function fetchLiveData() {
    showLoading(t('detectingLocation') || 'Detecting...');
    try {
        const coords = await weatherService.getCoordinates(true);
        setSafeText('locationStatus', `📍 ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`);
        setSafeText('locDisplay', `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`);
        const weather = await weatherService.fetchWeather(coords.latitude, coords.longitude);
        const c = weather.current;
        const tempEl = document.getElementById('liveTemp'); if (tempEl) { tempEl.textContent = c.temperature + '°C'; tempEl.dataset.raw = c.temperature; }
        const humEl = document.getElementById('liveHum'); if (humEl) { humEl.textContent = c.humidity + '%'; humEl.dataset.raw = c.humidity; }
        const rainEl = document.getElementById('liveRain'); if (rainEl) { rainEl.textContent = Math.round(c.rainfall) + 'mm'; rainEl.dataset.raw = c.rainfall; }
        setSafeText('weatherStatus', `${c.condition} ${c.temperature}°C`);
        hideLoading();
        showToast(t('weather_loaded') || '✅ Weather updated!', 'success');
    } catch (e) {
        hideLoading();
        showToast('❌ Could not fetch live data', 'error');
    }
}
async function loadForecast() {
    const grid = document.getElementById('forecastGrid'); if (!grid) return;
    showLoading('Loading forecast...');
    try {
        const coords = await weatherService.getCoordinates();
        const weather = await weatherService.fetchWeather(coords.latitude, coords.longitude);
        grid.innerHTML = weather.forecast.map(day => `<div class="market-card"><div class="name">${day.date}</div><div class="price">${day.maxTemp}°C</div><div class="trend">${day.condition} · ${t('weather_low')} ${day.minTemp}°C</div></div>`).join('');
        hideLoading();
        showToast('✅ Forecast loaded!', 'success');
    } catch (e) {
        hideLoading();
        showToast('❌ Failed to load forecast', 'error');
    }
}
function toggleVoice() {
    window.autoVoice = !window.autoVoice;
    setSafeText('voiceToggle', window.autoVoice ? '🔊' : '🔇');
    document.getElementById('voiceToggle').textContent = window.autoVoice ? '🔊' : '🔇';
    showToast(window.autoVoice ? t('voice_auto') + ' ON' : t('voice_auto') + ' OFF', 'info');
}
function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
    checkApiStatus();
    const saved = localStorage.getItem(CONFIG.STORAGE.apiKey);
    const input = document.getElementById('apiKeyInput'); if (input && saved) input.value = saved;
}
function closeSettings() { document.getElementById('settingsModal').classList.remove('show'); }
function clearCache() {
    if (!confirm('This clears all locally saved settings (API key, location, language). Continue?')) return;
    localStorage.clear();
    location.reload();
}
function exportData() {
    const data = {
        location: getSavedLocation(),
        language: getLanguage(),
        hasApiKey: groqAPI.isConfigured(),
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jeevanmitra-settings.json';
    a.click();
    showToast(t('settings_export') + ' ✅', 'success');
}
