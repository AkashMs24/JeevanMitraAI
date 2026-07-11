class GroqAPI {
    constructor() {
        this._loadKey();
    }
    _loadKey() {
        const saved = localStorage.getItem(CONFIG.STORAGE.apiKey);
        if (saved) {
            window.GROQ_API_KEY = saved;
        }
    }
    isConfigured() {
        return !!(window.GROQ_API_KEY && window.GROQ_API_KEY.length > 10);
    }
    _headers() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.GROQ_API_KEY}`
        };
    }
    async _fetchWithTimeout(url, options, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs || CONFIG.GROQ_API.timeout);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return res;
        } catch (e) {
            clearTimeout(timer);
            if (e.name === 'AbortError') {
                throw new Error('Request timed out — check your internet connection');
            }
            throw e;
        }
    }
    async chat(prompt, systemPrompt, options = {}) {
        if (!this.isConfigured()) throw new Error('API key not configured');
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const body = {
            model: CONFIG.GROQ_API.chatModel,
            messages,
            temperature: 0.7,
            max_tokens: 1024
        };
        if (options.json) {
            body.response_format = { type: 'json_object' };
        }
        const res = await this._fetchWithTimeout(CONFIG.GROQ_API.endpoint, {
            method: 'POST',
            headers: this._headers(),
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.error?.message || `Groq API error (${res.status})`;
            throw new Error(msg);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }
    async analyzeImage(base64DataUrl, prompt, mimeType) {
        if (!this.isConfigured()) throw new Error('API key not configured');
        const base64Content = base64DataUrl.includes(',')
            ? base64DataUrl.split(',')[1]
            : base64DataUrl;
        const body = {
            model: CONFIG.GROQ_API.visionModel,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Content}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 1024
        };
        const res = await this._fetchWithTimeout(CONFIG.GROQ_API.endpoint, {
            method: 'POST',
            headers: this._headers(),
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.error?.message || `Vision API error (${res.status})`;
            throw new Error(msg);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }
    async transcribe(audioBlob) {
        if (!this.isConfigured()) throw new Error('API key not configured');
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', CONFIG.GROQ_API.whisperModel);
        formData.append('response_format', 'verbose_json');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), CONFIG.GROQ_API.timeout);
        try {
            const res = await fetch(CONFIG.GROQ_API.transcribeEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.GROQ_API_KEY}`
                },
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const msg = err.error?.message || `Transcription error (${res.status})`;
                throw new Error(msg);
            }
            const data = await res.json();
            const langCode = data.language
                ? (whisperNameToCode[data.language.toLowerCase()] || data.language.toLowerCase().slice(0, 2))
                : null;
            return { text: data.text || '', language: langCode };
        } catch (e) {
            clearTimeout(timer);
            if (e.name === 'AbortError') {
                throw new Error('Transcription timed out');
            }
            throw e;
        }
    }
    async testKey() {
        if (!this.isConfigured()) return { ok: false, error: 'No API key set' };
        try {
            const res = await this._fetchWithTimeout(CONFIG.GROQ_API.modelsEndpoint, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${window.GROQ_API_KEY}` }
            }, 10000);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                return { ok: false, error: err.error?.message || `HTTP ${res.status}` };
            }
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }
}
const groqAPI = new GroqAPI();
function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input?.value?.trim();
    if (!key) {
        showToast('❌ Enter an API key first', 'error');
        return;
    }
    if (!key.startsWith('gsk_')) {
        showToast('❌ Invalid key format — Groq keys start with gsk_', 'error');
        return;
    }
    localStorage.setItem(CONFIG.STORAGE.apiKey, key);
    window.GROQ_API_KEY = key;
    groqAPI._loadKey();
    checkApiStatus();
    showToast('✅ API key saved!', 'success');
}
function clearApiKey() {
    localStorage.removeItem(CONFIG.STORAGE.apiKey);
    window.GROQ_API_KEY = '';
    checkApiStatus();
    showToast('🗑️ API key cleared', 'info');
}
async function testApiKey() {
    const btn = document.getElementById('testKeyBtn');
    const resultEl = document.getElementById('testKeyResult');
    if (btn) btn.disabled = true;
    if (resultEl) resultEl.textContent = 'Testing…';
    const result = await groqAPI.testKey();
    if (btn) btn.disabled = false;
    if (resultEl) {
        resultEl.textContent = result.ok
            ? '✅ Key is valid and working!'
            : `❌ ${result.error}`;
        resultEl.style.color = result.ok ? '#10b981' : '#ef4444';
    }
    showToast(result.ok ? '✅ Key works!' : `❌ ${result.error}`, result.ok ? 'success' : 'error');
}
