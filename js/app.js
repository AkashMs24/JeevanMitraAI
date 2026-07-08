document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌿 JeevanMitra AI v2.0 Starting…');

    // Init speech voices
    if ('speechSynthesis' in window) {
        await initVoices();
        console.log(`🔊 ${speechSynthesis.getVoices().length} voices loaded`);
    }

    // Restore language
    const savedLang = localStorage.getItem('language');
    if (savedLang && CONFIG.LANGUAGES[savedLang]) {
        currentLanguage = savedLang;
        const ls = document.getElementById('languageSelect'); if (ls) ls.value = savedLang;
    }

    // Restore API key
    const savedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    if (savedKey) {
        const inp = document.getElementById('apiKeyInput'); if (inp) inp.value = savedKey;
        groqAPI.apiKey = savedKey;
    } else {
        showToast('⚙️ Configure Groq API key in Settings', 'info');
    }
    updateApiStatus(groqAPI.isConfigured());

    // Restore location
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
    if (stored) {
        try {
            const loc = JSON.parse(stored);
            setSafeText('locationDisplay', `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`);
            setSafeText('locationStatus', `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`);
        } catch {}
    }

    // Populate dropdowns
    populateYieldCropSelect();
    setSafeText('weatherStatus', t('weather_loading'));
    setSafeText('dataStatus', t('data_syncing'));
    setSafeText('aiStatus', t('ai_connecting'));
    setSafeText('locationDetecting', t('location_detecting'));

    // Apply translations
    applyTranslations();
    console.log('✅ Initialized');
});
