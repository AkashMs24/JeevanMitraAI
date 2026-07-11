const CONFIG = {
    GROQ_API: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        transcribeEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
        modelsEndpoint: 'https://api.groq.com/openai/v1/models',
        chatModel: 'llama-3.3-70b-versatile',
        visionModel: 'llama-3.2-11b-vision-preview',
        whisperModel: 'whisper-large-v3-turbo',
        timeout: 25000
    },
    WEATHER_API: {
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
function validateApiKey() {
    const hasKey = window.GROQ_API_KEY && window.GROQ_API_KEY.length > 0;
    return hasKey;
}
