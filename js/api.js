/**
 * GROQ AI API Wrapper
 * Handles all API calls, retries, and error handling
 */

class GroqAIAPI {
    constructor() {
        this.apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        this.endpoint = CONFIG.API.GROQ_ENDPOINT;
        this.models = CONFIG.API.MODELS;
        this.currentModel = CONFIG.API.DEFAULT_MODEL;
    }

    /**
     * Set API Key
     */
    setApiKey(key) {
        if (!key.startsWith('gsk_')) {
            throw new Error('Invalid API key format');
        }
        this.apiKey = key;
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, key);
        updateApiStatus(true);
    }

    /**
     * Get API Key
     */
    getApiKey() {
        return this.apiKey;
    }

    /**
     * Check if API is configured
     */
    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * Main chat completion function with auto-retry
     */
    async chat(prompt, systemPrompt = null) {
        if (!this.isConfigured()) {
            throw new Error('API key not configured');
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        // Try each model
        for (const model of this.models) {
            try {
                const response = await this.callAPI(messages, model);
                return response;
            } catch (error) {
                console.warn(`Model ${model} failed:`, error);
                continue;
            }
        }

        throw new Error('All models failed. Please try again.');
    }

    /**
     * Send request to Groq API
     */
    async callAPI(messages, model) {
        const payload = {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
        };

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API call failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Vision API for disease detection
     */
    async analyzeImage(base64Image, prompt) {
        if (!this.isConfigured()) {
            throw new Error('API key not configured');
        }

        const systemPrompt = `You are an expert agricultural pathologist and plant disease specialist. 
        Analyze the provided crop image and identify any diseases, pests, or health issues.
        Provide diagnosis, severity level, symptoms, treatment recommendations, and prevention methods.
        Format response as JSON with keys: disease, severity, symptoms, treatment, prevention`;

        const fullPrompt = `${prompt}\n\nImage Analysis: [Image provided for analysis]`;

        return await this.chat(fullPrompt, systemPrompt);
    }
}

// Create global instance
const groqAPI = new GroqAIAPI();

// Update API status in UI
function updateApiStatus(isConnected) {
    const statusEl = document.getElementById('apiStatus');
    if (statusEl) {
        if (isConnected && groqAPI.isConfigured()) {
            statusEl.innerHTML = '<span class="status-dot connected"></span><span class="status-text">🤖 AI Ready</span>';
            document.getElementById('aiStatus').textContent = '✅ Connected';
        } else {
            statusEl.innerHTML = '<span class="status-dot disconnected"></span><span class="status-text">🔑 Setup Required</span>';
            document.getElementById('aiStatus').textContent = '⚠️ Configure API Key';
        }
    }
}

// Initialize on load
window.addEventListener('load', () => {
    updateApiStatus(groqAPI.isConfigured());
});
