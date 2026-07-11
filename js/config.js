// CONFIGURATION
const CONFIG = {
    GROQ_API: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        transcribeEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
        modelsEndpoint: 'https://api.groq.com/openai/v1/models',
        // NOTE: Groq retires models fairly often. If chat/vision/voice calls start
        // failing with a 404 "model not found" error, check
        // https://console.groq.com/docs/models for the current model IDs and
        // update the values below.
        chatModel: 'openai/gpt-oss-120b',       // fast general-purpose text model
        visionModel: 'qwen/qwen3.6-27b',        // multimodal (text + image) model
        whisperModel: 'whisper-large-v3-turbo', // speech-to-text, auto language detection
        timeout: 30000
    },
    WEATHER_API: {
        // Open-Meteo — free, no API key required, matches the query params used in weather.js
        endpoint: 'https://api.open-meteo.com/v1/forecast',
        fallbackLat: 13.1939,
        fallbackLng: 77.5941
    },
    STORAGE: {
        location: 'jeevanimitra_location',
        language: 'jeevanimitra_language',
        apiKey: 'jeevanimitra_api_key',
        i18nPrefix: 'jeevanimitra_i18n_',
        langMetaPrefix: 'jeevanimitra_langmeta_'
    }
};

// Check API Key on load
function validateApiKey() {
    const hasKey = window.GROQ_API_KEY && window.GROQ_API_KEY.length > 0;
    return hasKey;
}
