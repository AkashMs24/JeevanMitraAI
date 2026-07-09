const TRANSLATIONS = {
    en: {
        cropAdvisor: 'Crop Advisor',
        disease: 'Disease Detection',
        soil: 'Soil Health',
        yield: 'Yield Prediction',
        market: 'Market Prices',
        weather: 'Weather Forecast',
        advisory: 'Advisories',
        location: 'Location',
        weather: 'Weather',
        temp: 'Temperature',
        humidity: 'Humidity',
        rain: 'Rainfall',
        nitrogen: 'Nitrogen (N)',
        phosphorus: 'Phosphorus (P)',
        potassium: 'Potassium (K)',
        ph: 'Soil pH',
        recommendations: 'AI Recommendations',
        detectingLocation: 'Detecting...',
        fetchingWeather: 'Fetching weather...',
        analyzing: 'Analyzing...',
        askAnything: 'Ask about farming...'
    },
    kn: {
        cropAdvisor: 'ಬೆಳೆ ಸಲಹೆ',
        disease: 'ರೋಗ ಪತ್ತೆ',
        soil: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
        yield: 'ಇಳುವರಿ ಮುನ್ನೋಟ',
        market: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',
        weather: 'ಹವಾಮಾನ',
        advisory: 'ಸೂಚನೆ',
        location: 'ಸ್ಥಾನ',
        temp: 'ತಾಪಮಾನ',
        humidity: 'ತೇವಾಂಶ',
        rain: 'ಮಳೆ',
        nitrogen: 'ನೈಟ್ರೋಜನ್',
        phosphorus: 'ಫಾಸ್ಫರಸ್',
        potassium: 'ಪೊಟ್ಯಾಶಿಯಮ್',
        ph: 'ಮಣ್ಣಿನ pH',
        recommendations: 'AI ಸಲಹೆ',
        detectingLocation: 'ಪತ್ತೆ ಮಾಡುತ್ತಿದೆ...',
        fetchingWeather: 'ಹವಾಮಾನ ಪಡೆಯುತ್ತಿದೆ...',
        analyzing: 'ವಿಶ್ಲೇಷಣ ಮಾಡುತ್ತಿದೆ...',
        askAnything: 'ಕೃಷಿ ಬಗ್ಗೆ ಕೇಳಿ...'
    },
    hi: {
        cropAdvisor: 'फसल सलाहकार',
        disease: 'रोग पहचान',
        soil: 'मिट्टी स्वास्थ्य',
        yield: 'उपज पूर्वानुमान',
        market: 'बाजार भाव',
        weather: 'मौसम पूर्वानुमान',
        advisory: 'सलाह',
        location: 'स्थान',
        temp: 'तापमान',
        humidity: 'आर्द्रता',
        rain: 'वर्षा',
        nitrogen: 'नाइट्रोजन',
        phosphorus: 'फॉस्फोरस',
        potassium: 'पोटेशियम',
        ph: 'मिट्टी pH',
        recommendations: 'AI सलाह',
        detectingLocation: 'पता लगा रहे हैं...',
        fetchingWeather: 'मौसम प्राप्त कर रहे हैं...',
        analyzing: 'विश्लेषण कर रहे हैं...',
        askAnything: 'कृषि के बारे में पूछें...'
    }
};

function t(key) {
    const lang = localStorage.getItem(CONFIG.STORAGE.language) || 'en';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}
