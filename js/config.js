// CONFIGURATION
const CONFIG = {
    GROQ_API: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        models: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
        timeout: 30000
    },
    WEATHER_API: {
        endpoint: 'https://api.weatherapi.com/v1',
        fallbackLat: 13.1939,
        fallbackLng: 77.5941
    },
    STORAGE: {
        location: 'jeevanimitra_location',
        language: 'jeevanimitra_language'
    }
};

// Check API Key on load
function validateApiKey() {
    const hasKey = window.GROQ_API_KEY && window.GROQ_API_KEY.length > 0;
    return hasKey;
}
