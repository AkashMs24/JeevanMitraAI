=class GroqAPI {
    get apiKey() {
        return localStorage.getItem(CONFIG.STORAGE.apiKey) || window.GROQ_API_KEY || '';
    }
    isConfigured() { return this.apiKey.length > 0; }

    async chat(message, systemPrompt = null) {
        if (!this.isConfigured()) throw new Error('API key not configured. Add it in Settings.');
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: message });
        const res = await fetch(CONFIG.GROQ_API.endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: CONFIG.GROQ_API.chatModel, messages, temperature: 0.7, max_tokens: 700 })
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || 'API error'); }
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
            body: JSON.stringify({ model: CONFIG.GROQ_API.visionModel, messages, temperature: 0.3, max_tokens: 512 })
        });
        if (!res.ok) throw new Error('Disease analysis failed');
        const data = await res.json();
        return data.choices[0].message.content;
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
