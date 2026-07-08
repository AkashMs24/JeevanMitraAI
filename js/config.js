/**
 * CONFIGURATION FILE - All settings in one place
 * Unified config using current Groq API models (2026)
 */

const CONFIG = {
    API: {
        GROQ_ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
        MODELS: [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'gemma2-9b-it',
            'llama3-8b-8192'
        ],
        VISION_MODELS: [
            'meta-llama/llama-4-scout-17b-16e-instruct',
            'llama-3.2-11b-vision-preview',
            'llama-3.2-90b-vision-preview'
        ],
        DEFAULT_MODEL: 'llama-3.3-70b-versatile',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
    },

    WEATHER: {
        ENDPOINT: 'https://api.open-meteo.com/v1/forecast',
        REVERSE_GEOCODE: 'https://nominatim.openstreetmap.org/reverse'
    },

    MARKETS: {
        MANDI_API: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b405fcc2f43'
    },

    AI_MODELS: {
        CROP_RECOMMENDATION: 'llama-3.3-70b-versatile',
        DISEASE_DETECTION: 'meta-llama/llama-4-scout-17b-16e-instruct',
        YIELD_PREDICTION: 'llama-3.3-70b-versatile',
        SOIL_ANALYSIS: 'llama-3.3-70b-versatile'
    },

    CACHE: {
        WEATHER_TTL: 3600000,
        MARKET_TTL: 1800000,
        CROP_DATA_TTL: 86400000,
        FORECAST_TTL: 3600000
    },

    STORAGE_KEYS: {
        API_KEY: 'jeevanmitra_groq_key_v2',
        LOCATION: 'user_location',
        PREFERENCES: 'app_preferences',
        CACHE_PREFIX: 'cache_'
    },

    LANGUAGES: {
        'en': { name: 'English', flag: '🇬🇧' },
        'kn': { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        'hi': { name: 'हिंदी', flag: '🇮🇳' },
        'ml': { name: 'മലയാളം', flag: '🇮🇳' },
        'ta': { name: 'தமிழ்', flag: '🇮🇳' },
        'te': { name: 'తెలుగు', flag: '🇮🇳' }
    },

    FEATURES: {
        DISEASE_DETECTION: true,
        YIELD_PREDICTION: true,
        MARKET_PRICES: true,
        WEATHER_FORECAST: true,
        SOIL_ANALYSIS: true,
        CROP_CALENDAR: true,
        ADVISORIES: true,
        CHAT: true
    }
};

window.CONFIG = CONFIG;
