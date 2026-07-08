class GroqAIAPI {
    constructor() {
        // ✅ Read from injected env-config.js by GitHub Actions
        this.apiKey = window.GROQ_API_KEY || '';
        this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        this.models = ['mixtral-8x7b-32768', 'llama2-70b-4096', 'gemma-7b-it'];
        this.visionModels = ['llava-15b-preview'];
        
        // Debug log
        if (this.apiKey) {
            console.log('✅ Groq API Key loaded: ' + this.apiKey.substring(0, 10) + '...');
        } else {
            console.warn('⚠️ No Groq API Key found. Check GitHub Secret.');
        }
    }

    setApiKey(key) {
        if (!key.startsWith('gsk_')) throw new Error('Invalid key — must start with gsk_');
        this.apiKey = key;
        updateApiStatus(true);
    }

    getApiKey() { return this.apiKey; }
    isConfigured() { return !!this.apiKey; }

    async chat(prompt, systemPrompt = null) {
        if (!this.isConfigured()) throw new Error('API key not configured. Check GitHub Secrets.');
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });
        return await this._callWithFallback(messages, this.models, { temperature: 0.7, max_tokens: 2048 });
    }

    async analyzeImage(base64Image, prompt, mimeType = 'image/jpeg') {
        if (!this.isConfigured()) throw new Error('API key not configured');
        const messages = [
            { role: 'system', content: 'You are an expert agricultural pathologist. Analyze the crop image, identify diseases/pests, and respond in JSON: {disease, confidence, severity, symptoms, treatment, prevention, urgency}.' },
            { role: 'user', content: [
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
                { type: 'text', text: prompt }
            ]}
        ];
        return await this._callWithFallback(messages, this.visionModels, { temperature: 0.2, max_tokens: 1024 });
    }

    async _callWithFallback(messages, models, params) {
        for (const model of models) {
            try { return await this._callAPI(messages, model, params); }
            catch (e) { console.warn(`Model ${model} failed:`, e.message); continue; }
        }
        throw new Error('All AI models failed. Wait 30s and try again.');
    }

    async _callAPI(messages, model, params = {}) {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 30000);
        try {
            const res = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${this.apiKey}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    model, 
                    messages, 
                    temperature: params.temperature ?? 0.7, 
                    max_tokens: params.max_tokens ?? 2048, 
                    top_p: 1 
                }),
                signal: controller.signal
            });
            
            if (res.status === 429 || res.status === 503) throw new Error(`Rate limited (${res.status})`);
            if (!res.ok) { 
                const e = await res.json().catch(() => ({})); 
                throw new Error(e.error?.message || `API error ${res.status}`); 
            }
            
            const data = await res.json();
            return data.choices[0].message.content;
        } finally { clearTimeout(tid); }
    }
}

const groqAPI = new GroqAIAPI();

function updateApiStatus(connected) {
    const badge = document.getElementById('apiStatus');
    const ai = document.getElementById('aiStatus');
    
    if (badge) {
        badge.className = `api-badge ${connected && groqAPI.isConfigured() ? 'connected' : 'disconnected'}`;
        badge.querySelector('span:last-child').textContent = connected && groqAPI.isConfigured() 
            ? '🤖 AI Ready' 
            : '🔑 Setup Required';
    }
    
    if (ai) {
        ai.textContent = connected && groqAPI.isConfigured() 
            ? '✅ Connected' 
            : '⚠️ Configure Key';
    }
}

window.addEventListener('load', () => updateApiStatus(groqAPI.isConfigured()));
