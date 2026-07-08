/**
 * Main Application Controller — Fixed
 * Initializes all features, loads saved state
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌿 JeevanMitra AI v2.0 Starting...');

    // Restore saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang && CONFIG.LANGUAGES[savedLang]) {
        currentLanguage = savedLang;
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) langSelect.value = savedLang;
    }

    // Load API key if saved
    const savedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    if (savedKey) {
        const input = document.getElementById('apiKeyInput');
        if (input) input.value = savedKey;
        groqAPI.apiKey = savedKey;
    } else {
        showToast('⚙️ Please configure Groq API key in Settings', 'info');
    }
    updateApiStatus(groqAPI.isConfigured());

    // Load location
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
    if (stored) {
        try {
            const loc = JSON.parse(stored);
            const display = document.getElementById('locationDisplay');
            if (display) display.textContent = `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
        } catch {}
    }

    // Populate dropdowns
    populateYieldCropSelect();
