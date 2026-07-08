/**
 * Main Application Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌿 JeevanMitra AI v2.0 Starting...');

    // Initialize
    await cropAdvisor.loadCropData();
    
    // Load API key if saved
    const savedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    if (savedKey) {
        document.getElementById('apiKeyInput').value = savedKey;
        groqAPI.setApiKey(savedKey);
    } else {
        showToast('⚙️ Please configure Groq API key in Settings', 'info');
    }

    // Load location
    getLocation();

    // Initialize weather
    document.getElementById('weatherStatus').textContent = 'Click to fetch';
    document.getElementById('dataStatus').textContent = 'Ready';

    console.log('✅ App initialized successfully');
});

// Language change
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    showToast(`📝 Language changed to ${lang}`, 'info');
    // Implement i18n here
}
