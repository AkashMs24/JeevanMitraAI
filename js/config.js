/**
 * CONFIGURATION FILE - All settings in one place
 * NO HARDCODED VALUES - Everything is dynamic
 */

const CONFIG = {
    // API Configuration
    API: {
        GROQ_ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
        MODELS: [
            'mixtral-8x7b-32768',
            'llama2-70b-4096',
            'gemma-7b-it'
        ],
        DEFAULT_MODEL: 'mixtral-8x7b-32768',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
    },

    // Weather API (Real-time)
    WEATHER: {
        ENDPOINT: 'https://api.open-meteo.com/v1/forecast',
        REVERSE_GEOCODE: 'https://nominatim.openstreetmap.org/reverse'
    },

    // Market Data APIs (Real-time)
    MARKETS: {
        MANDI_API: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b405fcc2f43',
        COMMODITY_API: 'https://www.commoditiescontrol.com/api'
    },

    // Crop Data (Fetched from agricultural database)
    CROPS_DB_ENDPOINT: 'https://api.agriculture.gov.in/crops',

    // AI Models for different tasks
    AI_MODELS: {
        CROP_RECOMMENDATION: 'mixtral-8x7b-32768',
        DISEASE_DETECTION: 'llama2-70b-4096',
        YIELD_PREDICTION: 'mixtral-8x7b-32768',
        SOIL_ANALYSIS: 'mixtral-8x7b-32768'
    },

    // Cache configuration (no hardcoded data stored)
    CACHE: {
        WEATHER_TTL: 3600000, // 1 hour
        MARKET_TTL: 1800000, // 30 minutes
        CROP_DATA_TTL: 86400000, // 24 hours
        FORECAST_TTL: 3600000 // 1 hour
    },

    // Storage keys
    STORAGE_KEYS: {
        API_KEY: 'groq_api_key',
        LOCATION: 'user_location',
        PREFERENCES: 'app_preferences',
        CACHE_PREFIX: 'cache_'
    },

    // Languages
    LANGUAGES: {
        'en': { name: 'English', flag: '🇬🇧' },
        'kn': { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        'hi': { name: 'हिंदी', flag: '🇮🇳' },
        'ml': { name: 'മലയാളം', flag: '🇮🇳' },
        'ta': { name: 'தமிழ்', flag: '🇮🇳' },
        'te': { name: 'తెలుగు', flag: '🇮🇳' }
    },

    // Feature flags
    FEATURES: {
        DISEASE_DETECTION: true,
        YIELD_PREDICTION: true,
        MARKET_PRICES: true,
        WEATHER_FORECAST: true,
        SOIL_ANALYSIS: true,
        CROP_CALENDAR: true,
        ADVISORIES: true
    }
};

// Export for use in other modules
window.CONFIG = CONFIG;
