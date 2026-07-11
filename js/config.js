// CONFIGURATION
const CONFIG = {
    GROQ_API: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        // NOTE: Groq retires models fairly often. If chat/vision calls start failing,
        // check https://console.groq.com/docs/models for current model IDs.
        chatModel: 'openai/gpt-oss-120b',
        visionModel: 'qwen/qwen3.6-27b',
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
        apiKey: 'jeevanimitra_api_key'
    }
};

// Check API Key on load
function validateApiKey() {
    const hasKey = window.GROQ_API_KEY && window.GROQ_API_KEY.length > 0;
    return hasKey;
}
