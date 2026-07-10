=// STORAGE
function saveLocation(lat, lng) { localStorage.setItem(CONFIG.STORAGE.location, JSON.stringify({ lat, lng })); }
function getSavedLocation() {
    const saved = localStorage.getItem(CONFIG.STORAGE.location);
    return saved ? JSON.parse(saved) : null;
}
function saveLanguage(lang) { localStorage.setItem(CONFIG.STORAGE.language, lang); }
function getLanguage() { return localStorage.getItem(CONFIG.STORAGE.language) || 'en'; }

// DOM HELPERS
function setSafeText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

function getInputs() {
    return {
        n: parseInt(document.getElementById('nitrogen')?.value ?? 50),
        p: parseInt(document.getElementById('phosphorus')?.value ?? 50),
        k: parseInt(document.getElementById('potassium')?.value ?? 50),
        ph: parseFloat(document.getElementById('soilPH')?.value ?? 6.5),
        temp: parseFloat(document.getElementById('liveTemp')?.dataset.raw ?? 27),
        hum: parseFloat(document.getElementById('liveHum')?.dataset.raw ?? 60),
        rain: parseFloat(document.getElementById('liveRain')?.dataset.raw ?? 0)
    };
}

// LOADING / TOAST
function showLoading(text = 'Loading...') {
    setSafeText('loadingText', text);
    document.getElementById('loadingOverlay')?.classList.add('show');
}
function hideLoading() { document.getElementById('loadingOverlay')?.classList.remove('show'); }

function showToast(message, type = 'info') {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = message;
    el.className = `toast show toast-${type}`;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// IMAGE
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// VOICE OUTPUT
function speakText(text, lang = 'en') {
    if (!('speechSynthesis' in window) || !text) return;
    if (window.autoVoice === false) return;
    const clean = String(text).replace(/<[^>]*>/g, '').replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    const langMap = { en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN' };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.95;
    try { speechSynthesis.cancel(); speechSynthesis.speak(utterance); } catch (e) { console.warn('Speech failed:', e); }
}

// FORMATTING
function formatPrice(price) { return price > 100000 ? '₹' + (price / 100000).toFixed(2) + ' L' : '₹' + price; }
