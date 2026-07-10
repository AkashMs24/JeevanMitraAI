class ChatManager {
    constructor() {
        this.history = [];
        this.systemPrompt = `You are JeevanMitra AI, an expert Indian farming assistant. Give concise, practical 2-3 sentence answers with relevant emojis. Respond in the user's language.`;
    }
    async sendMessage(msg) {
        if (!groqAPI.isConfigured()) return this.fallback(msg);
        try {
            const res = await groqAPI.chat(msg, this.systemPrompt);
            this.history.push({ role:'user', content: msg }, { role:'assistant', content: res });
            return res;
        } catch (e) { console.error(e); return this.fallback(msg); }
    }
    fallback(msg) {
        const responses = [
            '🌾 Wheat and rice are strong choices for typical Indian soil this season.',
            '💡 Your soil looks decent — adding organic compost will help.',
            '🌤️ Conditions look favorable — keep irrigation on a regular schedule.',
            '🚨 Keep an eye out for pest activity in your region this week.',
            '📊 Better nutrient management could meaningfully lift your yield.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    clear() { this.history = []; }
}
const chatManager = new ChatManager();
let chatOpened = false;

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    const opening = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = opening ? 'flex' : 'none';
    if (opening && !chatOpened) {
        addMessage(t('chat_welcome'), 'bot');
        chatOpened = true;
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    showLoading('Thinking...');
    const response = await chatManager.sendMessage(msg);
    hideLoading();
    addMessage(response, 'bot');
    speakText(response, currentLanguage);
}

function sendPreset(kind) {
    const presets = {
        crop: 'What is the best crop for my current soil parameters?',
        yield: 'How can I improve my crop yield?',
        disease: 'How do I identify common crop diseases early?',
        price: 'Which crops are getting the best market prices right now?'
    };
    document.getElementById('chatInput').value = presets[kind] || '';
    sendMessage();
}

function addMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// VOICE INPUT
let recognizing = false;
function startVoiceInput() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast(t('voice_not_supported'), 'error'); return; }
    if (recognizing) return;
    const rec = new SR();
    const langMap = { en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN' };
    rec.lang = langMap[currentLanguage] || 'en-IN';
    rec.onstart = () => { recognizing = true; showToast(t('voice_listening'), 'info'); };
    rec.onresult = (e) => { document.getElementById('chatInput').value = e.results[0][0].transcript; };
    rec.onend = () => { recognizing = false; };
    rec.onerror = () => { recognizing = false; };
    rec.start();
}
