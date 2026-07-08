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
