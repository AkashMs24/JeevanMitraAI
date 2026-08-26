const CONFIG = {
    GROQ_API: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        transcribeEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
        modelsEndpoint: 'https://api.groq.com/openai/v1/models',
        // llama-3.3-70b-versatile and meta-llama/llama-4-scout-17b-16e-instruct
        // were both deprecated by Groq on 2026-06-17 and fully shut down by
        // 2026-08. These are their currently-recommended replacements.
        chatModel: 'openai/gpt-oss-120b',
        visionModel: 'qwen/qwen3.6-27b',
        whisperModel: 'whisper-large-v3-turbo',
        timeout: 25000
    },
    // Fallback provider — used automatically whenever Groq fails (missing key,
    // rate-limited, model decommissioned again, network error, etc.) as long
    // as the user has also added a free Gemini key in Settings.
    GEMINI_API: {
        chatEndpoint: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        chatModel: 'gemini-2.5-flash',
        visionModel: 'gemini-2.5-flash',
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
        geminiApiKey: 'jeevanimitra_gemini_api_key',
        i18nPrefix: 'jeevanimitra_i18n_',
        langMetaPrefix: 'jeevanimitra_langmeta_'
    }
};
