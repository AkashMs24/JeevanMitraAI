/* ═══ CACHE ═══ */
class CacheManager {
    static set(key, value, ttl) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CACHE_PREFIX + key, JSON.stringify({ value, expires: Date.now() + ttl }));
    }
    static get(key) {
        const item = localStorage.getItem(CONFIG.STORAGE_KEYS.CACHE_PREFIX + key);
        if (!item) return null;
        try {
            const data = JSON.parse(item);
            if (Date.now() > data.expires) { localStorage.removeItem(CONFIG.STORAGE_KEYS.CACHE_PREFIX + key); return null; }
            return data.value;
        } catch { return null; }
    }
    static clear() {
        Object.keys(localStorage).forEach(k => { if (k.startsWith(CONFIG.STORAGE_KEYS.CACHE_PREFIX)) localStorage.removeItem(k); });
    }
}
window.CacheManager = CacheManager;
/* ═══ LOADING ═══ */
function showLoading(text) {
    const s = document.getElementById('loadingSpinner'), t = document.getElementById('loadingText');
    if (s) s.style.display = 'flex';
    if (t) t.textContent = text || 'Processing…';
}
function hideLoading() { const s = document.getElementById('loadingSpinner'); if (s) s.style.display = 'none'; }
/* ═══ TOAST ═══ */
function showToast(message, type) {
    const t = document.getElementById('notificationToast');
    if (t) { t.textContent = message; t.className = `toast show ${type || 'info'}`; setTimeout(() => t.classList.remove('show'), 3000); }
}
window.toast = showToast;
/* ═══ TABS ═══ */
function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    const p = document.getElementById(`tab-${name}`); if (p) p.classList.add('active');
    const b = document.querySelector(`[data-tab="${name}"]`); if (b) b.classList.add('active');
}
/* ═══ MODAL ═══ */
function openSettings() { const m = document.getElementById('settingsModal'); if (m) m.style.display = 'flex'; }
function closeSettings() { const m = document.getElementById('settingsModal'); if (m) m.style.display = 'none'; }
/* ═══ API KEY ═══ */
function saveApiKey() {
    const inp = document.getElementById('apiKeyInput'); if (!inp) return;
    const key = inp.value.trim();
    if (!key) { showToast('❌ Enter a key', 'error'); return; }
    try { groqAPI.setApiKey(key); showToast('✅ Key saved!', 'success'); inp.value = ''; closeSettings(); }
    catch (e) { showToast(`❌ ${e.message}`, 'error'); }
}
function clearApiKey() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY); groqAPI.apiKey = '';
    const i = document.getElementById('apiKeyInput'); if (i) i.value = '';
    updateApiStatus(false); showToast('🗑️ Key cleared', 'info');
}
function clearCache() { CacheManager.clear(); showToast('✅ Cache cleared', 'success'); }
function exportData() {
    const d = { preferences: localStorage.getItem(CONFIG.STORAGE_KEYS.PREFERENCES), location: localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION), ts: new Date().toISOString() };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'jeevanmitra-data.json'; a.click();
}
/* ═══ GEOLOCATION ═══ */
function getLocation() {
    if (!navigator.geolocation) { showToast('❌ Not supported', 'error'); return; }
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            localStorage.setItem(CONFIG.STORAGE_KEYS.LOCATION, JSON.stringify({ latitude: lat, longitude: lng }));
            setSafeText('locationDisplay', `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setSafeText('locationStatus', `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
            showToast('✅ Location updated', 'success');
        },
        () => showToast('❌ Location denied', 'error')
    );
}
/* ═══ HELPERS ═══ */
function setSafeText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function formatValue(v, u) { return `${parseFloat(v).toFixed(1)} ${u}`; }
async function imageToBase64(file) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result.split(',')[1]); r.onerror = reject; r.readAsDataURL(file); });
}
async function fetchWithRetry(url, opts = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try { const res = await fetch(url, opts); if (res.ok) return res; if (i < retries - 1) await new Promise(r => setTimeout(r, 1000)); }
        catch (e) { if (i === retries - 1) throw e; await new Promise(r => setTimeout(r, 1000)); }
    }
    throw new Error('Request failed after retries');
}
function getDefaultLocation() { return { latitude: 12.9716, longitude: 77.5946 }; }
/* ═══ GET INPUTS ═══ */
function getInputs() {
    return {
        n: parseFloat(document.getElementById('nitrogen')?.value || 50),
        p: parseFloat(document.getElementById('phosphorus')?.value || 50),
        k: parseFloat(document.getElementById('potassium')?.value || 50),
        ph: parseFloat(document.getElementById('soilPH')?.value || 6.5),
        temp: parseFloat(document.getElementById('temperature')?.value || document.getElementById('liveTemp')?.textContent?.replace('°C', '') || 25),
        hum: parseFloat(document.getElementById('humidity')?.value || document.getElementById('liveHumidity')?.textContent?.replace('%', '') || 65),
        rain: parseFloat(document.getElementById('rainfall')?.value || document.getElementById('liveRainfall')?.textContent?.replace('mm', '') || 100),
        soilType: document.getElementById('soilType')?.value || 'loamy'
    };
}
window.getInputs = getInputs;
/* ═══ SCORING ═══ */
function scoreCrop(crop, val, range) {
    const [optMin, optMax, absMin, absMax] = range;
    if (val >= optMin && val <= optMax) return 1.0;
    if (val >= absMin && val < optMin) return 0.5 + 0.5 * ((val - absMin) / (optMin - absMin));
    if (val > optMax && val <= absMax) return 0.5 + 0.5 * ((absMax - val) / (absMax - optMax));
    return Math.max(0, 0.3 - Math.abs(val - (optMin + optMax) / 2) / (absMax * 0.5));
}
function getAllRanked(inputs) {
    if (typeof CROP_DB === 'undefined') return [];
    const { n, p, k, ph, temp, hum, rain, soilType } = inputs;
    const scores = [];
    Object.entries(CROP_DB).forEach(([key, crop]) => {
        const s = [
            scoreCrop(crop, n, crop.N) * 25, scoreCrop(crop, p, crop.P) * 20,
            scoreCrop(crop, k, crop.K) * 20, scoreCrop(crop, temp, crop.temp) * 15,
            scoreCrop(crop, hum, crop.hum) * 10, scoreCrop(crop, ph, crop.ph) * 5,
            scoreCrop(crop, rain, crop.rain) * 5
        ];
        let total = s.reduce((a, b) => a + b, 0);
        if (typeof SOIL_BONUS !== 'undefined' && SOIL_BONUS[key]?.[soilType]) total += SOIL_BONUS[key][soilType] * 100;
        scores.push({ k: key, score: Math.min(total, 100), crop });
    });
    scores.sort((a, b) => b.score - a.score);
    return scores;
}
window.getAllRanked = getAllRanked;
