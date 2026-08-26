class GroqAPI {
    constructor() {
        this._loadKey();
    }
    _loadKey() {
        const savedGroq = localStorage.getItem(CONFIG.STORAGE.apiKey);
        if (savedGroq) window.GROQ_API_KEY = savedGroq;
        const savedGemini = localStorage.getItem(CONFIG.STORAGE.geminiApiKey);
        if (savedGemini) window.GEMINI_API_KEY = savedGemini;
    }

    // "Configured" if EITHER provider has a usable key — the app should
    // work even if only the Gemini fallback key is set.
    isConfigured() {
        return this._hasGroqKey() || this._hasGeminiKey();
    }
    _hasGroqKey() { return !!(window.GROQ_API_KEY && window.GROQ_API_KEY.length > 10); }
    _hasGeminiKey() { return !!(window.GEMINI_API_KEY && window.GEMINI_API_KEY.length > 10); }

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
            if (e.name === 'AbortError') throw new Error('Request timed out — check your internet connection');
            throw e;
        }
    }

    // ---------------- GROQ (primary) ----------------
    async _groqChat(prompt, systemPrompt, options = {}) {
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });
        const body = { model: CONFIG.GROQ_API.chatModel, messages, temperature: 0.7, max_tokens: 1024 };
        if (options.json) body.response_format = { type: 'json_object' };

        const res = await this._fetchWithTimeout(CONFIG.GROQ_API.endpoint, {
            method: 'POST', headers: this._headers(), body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Groq API error (${res.status})`);
        }
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('Groq returned an empty response');
        return text;
    }
    async _groqAnalyzeImage(base64DataUrl, prompt, mimeType) {
        const base64Content = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
        const body = {
            model: CONFIG.GROQ_API.visionModel,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Content}` } }
                ]
            }],
            temperature: 0.3, max_tokens: 1024
        };
        const res = await this._fetchWithTimeout(CONFIG.GROQ_API.endpoint, {
            method: 'POST', headers: this._headers(), body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Vision API error (${res.status})`);
        }
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('Groq vision returned an empty response');
        return text;
    }

    // ---------------- GEMINI (fallback) ----------------
    async _geminiChat(prompt, systemPrompt, options = {}) {
        const body = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        };
        if (systemPrompt) body.system_instruction = { parts: [{ text: systemPrompt }] };
        if (options.json) body.generationConfig.responseMimeType = 'application/json';

        const url = CONFIG.GEMINI_API.chatEndpoint(CONFIG.GEMINI_API.chatModel);
        const res = await this._fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': window.GEMINI_API_KEY },
            body: JSON.stringify(body)
        }, CONFIG.GEMINI_API.timeout);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Gemini API error (${res.status})`);
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
        if (!text) throw new Error('Gemini returned an empty response');
        return text;
    }
    async _geminiAnalyzeImage(base64DataUrl, prompt, mimeType) {
        const base64Content = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
        const body = {
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: base64Content } }
                ]
            }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.3 }
        };
        const url = CONFIG.GEMINI_API.chatEndpoint(CONFIG.GEMINI_API.visionModel);
        const res = await this._fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': window.GEMINI_API_KEY },
            body: JSON.stringify(body)
        }, CONFIG.GEMINI_API.timeout);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Gemini vision error (${res.status})`);
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
        if (!text) throw new Error('Gemini vision returned an empty response');
        return text;
    }

    // ---------------- PUBLIC API (used by every module) ----------------
    // Same method signatures as before — chat.js, crop-advisor.js,
    // disease-detection.js, advisories.js, i18n.js, market-prices.js,
    // soil-analysis.js, yield-predictor.js all call these unchanged.
    // Groq is tried first (fast + generous free tier). If it's not
    // configured, or the call fails for ANY reason (bad/expired key,
    // rate limit, a model getting deprecated again, network hiccup),
    // it automatically falls back to Gemini when a Gemini key exists.
    async chat(prompt, systemPrompt, options = {}) {
        if (!this.isConfigured()) throw new Error('No API key configured — add a Groq or Gemini key in Settings');
        let groqError = null;
        if (this._hasGroqKey()) {
            try {
                return await this._groqChat(prompt, systemPrompt, options);
            } catch (e) {
                groqError = e;
                console.warn('Groq chat failed, falling back to Gemini:', e.message);
            }
        }
        if (this._hasGeminiKey()) {
            try {
                return await this._geminiChat(prompt, systemPrompt, options);
            } catch (e) {
                throw groqError
                    ? new Error(`Groq failed (${groqError.message}) and Gemini fallback also failed (${e.message})`)
                    : e;
            }
        }
        throw groqError || new Error('No working API provider configured');
    }
    async analyzeImage(base64DataUrl, prompt, mimeType) {
        if (!this.isConfigured()) throw new Error('No API key configured — add a Groq or Gemini key in Settings');
        let groqError = null;
        if (this._hasGroqKey()) {
            try {
                return await this._groqAnalyzeImage(base64DataUrl, prompt, mimeType);
            } catch (e) {
                groqError = e;
                console.warn('Groq vision failed, falling back to Gemini:', e.message);
            }
        }
        if (this._hasGeminiKey()) {
            try {
                return await this._geminiAnalyzeImage(base64DataUrl, prompt, mimeType);
            } catch (e) {
                throw groqError
                    ? new Error(`Groq failed (${groqError.message}) and Gemini fallback also failed (${e.message})`)
                    : e;
            }
        }
        throw groqError || new Error('No working API provider configured');
    }
    // Voice transcription stays on Groq Whisper only — Gemini's audio
    // pipeline needs a different request shape, and whisper-large-v3-turbo
    // isn't on Groq's deprecation list, so there's no fallback needed here.
    async transcribe(audioBlob) {
        if (!this._hasGroqKey()) throw new Error('Voice input needs a Groq API key configured');
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', CONFIG.GROQ_API.whisperModel);
        formData.append('response_format', 'verbose_json');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), CONFIG.GROQ_API.timeout);
        try {
            const res = await fetch(CONFIG.GROQ_API.transcribeEndpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${window.GROQ_API_KEY}` },
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || `Transcription error (${res.status})`);
            }
            const data = await res.json();
            const langCode = data.language
                ? (whisperNameToCode[data.language.toLowerCase()] || data.language.toLowerCase().slice(0, 2))
                : null;
            return { text: data.text || '', language: langCode };
        } catch (e) {
            clearTimeout(timer);
            if (e.name === 'AbortError') throw new Error('Transcription timed out');
            throw e;
        }
    }
    async testKey() {
        if (!this._hasGroqKey()) return { ok: false, error: 'No Groq API key set' };
        try {
            const res = await this._fetchWithTimeout(CONFIG.GROQ_API.modelsEndpoint, {
                method: 'GET', headers: { 'Authorization': `Bearer ${window.GROQ_API_KEY}` }
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
    async testGeminiKey() {
        if (!this._hasGeminiKey()) return { ok: false, error: 'No Gemini API key set' };
        try {
            await this._geminiChat('Say OK', null, {});
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }
}
const groqAPI = new GroqAPI();

// ---------------- Groq key UI ----------------
function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input?.value?.trim();
    if (!key) { showToast('❌ Enter an API key first', 'error'); return; }
    if (!key.startsWith('gsk_')) { showToast('❌ Invalid key format — Groq keys start with gsk_', 'error'); return; }
    localStorage.setItem(CONFIG.STORAGE.apiKey, key);
    window.GROQ_API_KEY = key;
    groqAPI._loadKey();
    checkApiStatus();
    showToast('✅ Groq API key saved!', 'success');
}
function clearApiKey() {
    localStorage.removeItem(CONFIG.STORAGE.apiKey);
    window.GROQ_API_KEY = '';
    checkApiStatus();
    showToast('🗑️ Groq API key cleared', 'info');
}
async function testApiKey() {
    const btn = document.getElementById('testKeyBtn');
    const resultEl = document.getElementById('testKeyResult');
    if (btn) btn.disabled = true;
    if (resultEl) resultEl.textContent = 'Testing…';
    const result = await groqAPI.testKey();
    if (btn) btn.disabled = false;
    if (resultEl) {
        resultEl.textContent = result.ok ? '✅ Key is valid and working!' : `❌ ${result.error}`;
        resultEl.style.color = result.ok ? '#10b981' : '#ef4444';
    }
    showToast(result.ok ? '✅ Key works!' : `❌ ${result.error}`, result.ok ? 'success' : 'error');
}

// ---------------- Gemini key UI (fallback) ----------------
function saveGeminiApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    const key = input?.value?.trim();
    if (!key) { showToast('❌ Enter a Gemini API key first', 'error'); return; }
    if (!key.startsWith('AIza')) { showToast('❌ Invalid key format — Gemini keys start with AIza', 'error'); return; }
    localStorage.setItem(CONFIG.STORAGE.geminiApiKey, key);
    window.GEMINI_API_KEY = key;
    groqAPI._loadKey();
    checkApiStatus();
    showToast('✅ Gemini fallback key saved!', 'success');
}
function clearGeminiApiKey() {
    localStorage.removeItem(CONFIG.STORAGE.geminiApiKey);
    window.GEMINI_API_KEY = '';
    checkApiStatus();
    showToast('🗑️ Gemini fallback key cleared', 'info');
}
async function testGeminiApiKey() {
    const btn = document.getElementById('testGeminiKeyBtn');
    const resultEl = document.getElementById('testGeminiKeyResult');
    if (btn) btn.disabled = true;
    if (resultEl) resultEl.textContent = 'Testing…';
    const result = await groqAPI.testGeminiKey();
    if (btn) btn.disabled = false;
    if (resultEl) {
        resultEl.textContent = result.ok ? '✅ Key is valid and working!' : `❌ ${result.error}`;
        resultEl.style.color = result.ok ? '#10b981' : '#ef4444';
    }
    showToast(result.ok ? '✅ Gemini key works!' : `❌ ${result.error}`, result.ok ? 'success' : 'error');
}
