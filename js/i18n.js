let currentLanguage = 'en';
const i18n = {
    en: {
        tab_crop:'Crop Advisor',tab_yield:'Yield',tab_disease:'Disease',tab_market:'Market',tab_soil:'Soil',tab_weather:'Weather',tab_advisory:'Advisories',
        soil_data:'Soil & Environment',nitrogen:'Nitrogen (N)',phosphorus:'Phosphorus (P)',potassium:'Potassium (K)',
        temperature:'Temperature (°C)',humidity:'Humidity (%)',ph:'Soil pH',rainfall:'Rainfall (mm)',soil_type:'Soil Type',
        get_recommendations:'Get Recommendations',recommendations:'Recommendations',enter_data_prompt:'Enter soil data and click Get',
        select_crop:'Select Crop',predict_yield:'Predict Yield',yield_results:'Yield Results',
        upload_leaf:'Upload Leaf Image',detect_disease:'Detect Disease (AI)',
        market_prices:'Market Prices',crop_col:'Crop',price_col:'Price (₹/qtl)',trend_col:'Trend',
        chat_welcome:"Hello! I'm JeevanMitra AI 🌿 Ask me about crops, diseases, yield or prices!",
        qa_crop:'🌱 Best crop?',qa_yield:'📊 Yield',qa_disease:'🔍 Disease',qa_price:'💰 Prices',
        voice_listening:'🎤 Listening…',voice_not_supported:'❌ Voice not supported',
        lang_changed:'Language: English',top_crops:'🏆 Top 5 Crops',weather_filled:'🌤️ Weather loaded!'
    },
    kn: {
        tab_crop:'ಬೆಳೆ ಸಲಹೆ',tab_yield:'ಇಳುವರಿ',tab_disease:'ರೋಗ',tab_market:'ಬೆಲೆ',tab_soil:'ಮಣ್ಣು',tab_weather:'ಹವಾಮಾನ',tab_advisory:'ಸಲಹೆ',
        chat_welcome:'ನಮಸ್ಕಾರ! ನಾನು ಜೀವನಮಿತ್ರ AI 🌿',
        qa_crop:'🌱 ಬೆಳೆ?',qa_yield:'📊 ಇಳುವರಿ',qa_disease:'🔍 ರೋಗ',qa_price:'💰 ಬೆಲೆ',
        voice_listening:'🎤 ಕೇಳುತ್ತಿದೆ…',voice_not_supported:'❌ ಧ್ವನಿ ಇಲ್ಲ',lang_changed:'ಭಾಷೆ: ಕನ್ನಡ',weather_filled:'🌤️ ಹವಾಮಾನ!'
    },
    hi: {
        tab_crop:'फसल',tab_yield:'उपज',tab_disease:'रोग',tab_market:'बाजार',tab_soil:'मिट्टी',tab_weather:'मौसम',tab_advisory:'सलाह',
        chat_welcome:'नमस्ते! मैं जीवनमित्र AI 🌿',
        qa_crop:'🌱 फसल?',qa_yield:'📊 उपज',qa_disease:'🔍 रोग',qa_price:'💰 भाव',
        voice_listening:'🎤 सुन रहा…',voice_not_supported:'❌ वॉइस नहीं',lang_changed:'भाषा: हिंदी',weather_filled:'🌤️ मौसम!'
    },
    ml: {
        tab_crop:'വിള',tab_yield:'വിളവ്',tab_disease:'രോഗം',tab_market:'വില',tab_soil:'മണ്ണ്',tab_weather:'കാലാവസ്ഥ',tab_advisory:'ഉപദേശം',
        chat_welcome:'നമസ്കാരം! ജീവൻമിത്ര AI 🌿',lang_changed:'ഭാഷ: മലയാളം',weather_filled:'🌤️ കാലാവസ്ഥ!'
    },
    ta: {
        tab_crop:'பயிர்',tab_yield:'விளைச்சல்',tab_disease:'நோய்',tab_market:'விலை',tab_soil:'மண்',tab_weather:'வானிலை',tab_advisory:'ஆலோசனை',
        chat_welcome:'வணக்கம்! ஜீவன்மித்ரா AI 🌿',lang_changed:'மொழி: தமிழ்',weather_filled:'🌤️ வானிலை!'
    },
    te: {
        tab_crop:'పంట',tab_yield:'దిగుబడి',tab_disease:'వ్యాధి',tab_market:'ధరలు',tab_soil:'నేల',tab_weather:'వాతావరణం',tab_advisory:'సలహాలు',
        chat_welcome:'నమస్కారం! జీవన్‌మిత్ర AI 🌿',lang_changed:'భాష: తెలుగు',weather_filled:'🌤️ వాతావరణం!'
    }
};
function t(k) { return i18n[currentLanguage]?.[k] || i18n.en[k] || k; }
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
}
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    applyTranslations();
    if (typeof loadMarketPrices === 'function') loadMarketPrices();
    if (typeof updateYieldPredictor === 'function') updateYieldPredictor();
    if (typeof analyzeSoil === 'function') analyzeSoil();
    const w = document.getElementById('welcome-message');
    if (w) w.textContent = t('chat_welcome');
    showToast(t('lang_changed'));
}
