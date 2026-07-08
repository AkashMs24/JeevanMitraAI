document.addEventListener('DOMContentLoaded', () => {
    console.log('🌿 JeevanMitra AI v2.0 Starting…');
    const savedLang = localStorage.getItem('language');
    if (savedLang && CONFIG.LANGUAGES[savedLang]) {
        currentLanguage = savedLang;
        const ls = document.getElementById('languageSelect'); if (ls) ls.value = savedLang;
    }
    const savedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    if (savedKey) {
        const inp = document.getElementById('apiKeyInput'); if (inp) inp.value = savedKey;
        groqAPI.apiKey = savedKey;
    } else {
        showToast('⚙️ Configure Groq API key in Settings', 'info');
    }
    updateApiStatus(groqAPI.isConfigured());
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
    if (stored) {
        try { const loc = JSON.parse(stored); setSafeText('locationDisplay', `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`); } catch {}
    }
    populateYieldCropSelect();
    setSafeText('weatherStatus', 'Click to fetch');
    setSafeText('dataStatus', 'Ready');
    applyTranslations();
    console.log('✅ Initialized');
});
