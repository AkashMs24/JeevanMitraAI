class GroqAPI {
    get apiKey() {
        return localStorage.getItem(CONFIG.STORAGE.apiKey) || window.GROQ_API_KEY || '';
    }
    isConfigured() { return this.apiKey.length > 0; }

    async _parseError(res) {
        let body = {};
        try { body = await res.json(); } catch {}
        const msg = body?.error?.message || '';
        if (res.status === 401) return 'Invalid Groq API key. Open Settings and paste a fresh key from console.groq.com/keys.';
        if (res.status === 404) return `Model not found (${msg || 'the model id may be retired'}). Check console.groq.com/docs/models.`;
        if (res.status === 429) return 'Rate limit reached on your Groq key. Wait a moment and try again.';
        if (res.status >= 500) return 'Groq servers are having issues right now. Please try again shortly.';
        return msg || `Groq API error (${res.status})`;
    }

    async chat(message, systemPrompt = null, { json = false } = {}) {
        if (!this.isConfigured()) throw new Error('API key not configured. Add it in Settings.');
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: message });
        const body = { model: CONFIG.GROQ_API.chatModel, messages, temperature: 0.7, max_completion_tokens: 800 };
        if (json) body.response_format = { type: 'json_object' };
        const res = await fetch(CONFIG.GROQ_API.endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await this._parseError(res));
        const data = await res.json();
        return data.choices[0].message.content;
    }

    async analyzeImage(base64DataUrl, prompt, mimeType = 'image/jpeg') {
        if (!this.isConfigured()) throw new Error('API key not configured. Add it in Settings.');
        const messages = [{
            role: 'user',
            content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: base64DataUrl } }
            ]
        }];
        const res = await fetch(CONFIG.GROQ_API.endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: CONFIG.GROQ_API.visionModel, messages, temperature: 0.3, max_completion_tokens: 512 })
        });
        if (!res.ok) throw new Error(await this._parseError(res));
        const data = await res.json();
        return data.choices[0].message.content;
    }

    // Speech-to-text via Groq Whisper. Works for essentially any spoken language —
    // Whisper auto-detects it, so users are not limited to the dashboard's UI languages.
    async transcribe(audioBlob) {
        if (!this.isConfigured()) throw new Error('API key not configured. Add it in Settings.');
        const form = new FormData();
        form.append('file', audioBlob, 'speech.webm');
        form.append('model', CONFIG.GROQ_API.whisperModel);
        form.append('response_format', 'verbose_json');
        const res = await fetch(CONFIG.GROQ_API.transcribeEndpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.apiKey}` },
            body: form
        });
        if (!res.ok) throw new Error(await this._parseError(res));
        const data = await res.json();
        return { text: (data.text || '').trim(), language: data.language || null };
    }

    // Quick connectivity + key check used by the "Test Key" button in Settings.
    async testConnection() {
        if (!this.isConfigured()) return { ok: false, message: 'No API key set yet.' };
        try {
            const res = await fetch(CONFIG.GROQ_API.modelsEndpoint, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (!res.ok) return { ok: false, message: await this._parseError(res) };
            return { ok: true, message: 'Connected — your Groq key is working.' };
        } catch (e) {
            return { ok: false, message: 'Network error reaching Groq. Check your internet connection.' };
        }
    }
}
const groqAPI = new GroqAPI();

function saveApiKey() {
    const val = document.getElementById('apiKeyInput')?.value.trim();
    if (!val) { showToast('❌ Enter a key first', 'error'); return; }
    localStorage.setItem(CONFIG.STORAGE.apiKey, val);
    checkApiStatus();
    showToast('✅ Key saved to this browser', 'success');
}
function clearApiKey() {
    localStorage.removeItem(CONFIG.STORAGE.apiKey);
    const input = document.getElementById('apiKeyInput'); if (input) input.value = '';
    checkApiStatus();
    showToast('🗑️ Key cleared', 'info');
}

async function testApiKey() {
    const btn = document.getElementById('testKeyBtn');
    const resultEl = document.getElementById('testKeyResult');
    if (btn) btn.disabled = true;
    if (resultEl) resultEl.textContent = '⏳ Testing…';
    const result = await groqAPI.testConnection();
    if (resultEl) {
        resultEl.textContent = (result.ok ? '✅ ' : '❌ ') + result.message;
        resultEl.style.color = result.ok ? 'var(--primary-light)' : 'var(--danger)';
    }
    showToast(result.message, result.ok ? 'success' : 'error');
    if (btn) btn.disabled = false;
    checkApiStatus();
}
