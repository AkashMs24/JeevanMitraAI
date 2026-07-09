// STORAGE
function saveLocation(lat, lng) {
    localStorage.setItem(CONFIG.STORAGE.location, JSON.stringify({ lat, lng }));
}

function getLocation() {
    const saved = localStorage.getItem(CONFIG.STORAGE.location);
    return saved ? JSON.parse(saved) : {
        lat: CONFIG.WEATHER_API.fallbackLat,
        lng: CONFIG.WEATHER_API.fallbackLng
    };
}

function saveLanguage(lang) {
    localStorage.setItem(CONFIG.STORAGE.language, lang);
}

function getLanguage() {
    return localStorage.getItem(CONFIG.STORAGE.language) || 'en';
}

// VOICE
function speakText(text, lang = 'en') {
    if (!('speechSynthesis' in window)) return;
    
    const clean = text.replace(/<[^>]*>/g, '').replace(/[*_]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    
    const langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.9;
    
    try {
        speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn('Speech synthesis failed:', e);
    }
}

// FORMATTING
function formatPrice(price) {
    if (price > 100000) return '₹' + (price / 100000).toFixed(2) + ' L';
    return '₹' + price;
}

function formatYield(yield_val) {
    return yield_val + ' q/ha';
}
