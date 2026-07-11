class ChatManager {
    constructor() {
        this.history = [];
        this.systemPrompt = `You are JeevanMitra AI, an expert Indian farming assistant. Give concise, practical 2-3 sentence answers with relevant emojis.
IMPORTANT: Always detect the language the user's message is written or spoken in (it can be ANY language, not just Indian languages) and reply FULLY in that same language and script. Never switch to English unless the user's message is in English.
You MUST respond with a strict JSON object and nothing else, in this exact shape:
{"reply": "<your answer, in the user's language>", "lang": "<2-letter ISO 639-1 code of the language you replied in, e.g. en, hi, kn, ta, te, ml, bn, fr, es>"}`;
    }

    async sendMessage(msg, hintLanguage = null) {
        if (!groqAPI.isConfigured()) return { text: this.fallback(msg), lang: currentLanguage };
        try {
            const userContent = hintLanguage ? `${msg}\n\n(This was spoken in ${hintLanguage}. Reply in that language.)` : msg;
            const raw = await groqAPI.chat(userContent, this.systemPrompt, { json: true });
            const parsed = this.parseReply(raw);
            this.history.push({ role:'user', content: msg }, { role:'assistant', content: parsed.text });
            return parsed;
        } catch (e) {
            console.error(e);
            return { text: `⚠️ ${e.message}`, lang: currentLanguage, error: true };
        }
    }

    parseReply(raw) {
        try {
            const match = raw.match(/\{[\s\S]*\}/);
            const obj = JSON.parse(match ? match[0] : raw);
            return { text: obj.reply || obj.text || raw, lang: (obj.lang || currentLanguage).toLowerCase().slice(0, 2) };
        } catch {
            return { text: raw, lang: currentLanguage };
        }
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

async function sendMessage(hintLanguage = null) {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    showLoading(t('chat_thinking') || 'Thinking...');
    const response = await chatManager.sendMessage(msg, hintLanguage);
    hideLoading();
    addMessage(response.text, response.error ? 'bot error' : 'bot');
    if (!response.error) speakText(response.text, response.lang || currentLanguage);
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

// ------------------------------------------------------------------
// VOICE INPUT — powered by Groq Whisper so the user can speak in ANY
// language (not limited to a fixed list). Falls back to the browser's
// built-in SpeechRecognition (limited language list) if Groq isn't
// configured or the microphone/MediaRecorder API isn't available.
// ------------------------------------------------------------------
let recognizing = false;
let mediaRecorder = null;
let audioChunks = [];

function setMicState(active) {
    const btn = document.querySelector('.mic-btn');
    if (btn) btn.classList.toggle('recording', active);
}

async function startVoiceInput() {
    if (recognizing) { stopVoiceInput(); return; }

    if (groqAPI.isConfigured() && navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                setMicState(false);
                recognizing = false;
                if (!audioChunks.length) return;
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                showLoading(t('voice_transcribing') || '🤖 Transcribing…');
                try {
                    const { text, language } = await groqAPI.transcribe(blob);
                    hideLoading();
                    if (text) {
                        document.getElementById('chatInput').value = text;
                        const langName = language ? language.toLowerCase() : null;
                        sendMessage(langName);
                    } else {
                        showToast('❌ Could not hear anything, try again', 'error');
                    }
                } catch (e) {
                    hideLoading();
                    showToast(`❌ ${e.message}`, 'error');
                }
            };
            mediaRecorder.start();
            recognizing = true;
            setMicState(true);
            showToast(t('voice_listening'), 'info');
        } catch (e) {
            showToast('❌ Microphone access denied', 'error');
        }
        return;
    }

    // Fallback: browser Web Speech API (works offline, limited language list)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast(t('voice_not_supported'), 'error'); return; }
    const rec = new SR();
    rec.lang = bcp47For(currentLanguage);
    rec.onstart = () => { recognizing = true; setMicState(true); showToast(t('voice_listening'), 'info'); };
    rec.onresult = (e) => { document.getElementById('chatInput').value = e.results[0][0].transcript; };
    rec.onend = () => { recognizing = false; setMicState(false); };
    rec.onerror = () => { recognizing = false; setMicState(false); };
    rec.start();
}

function stopVoiceInput() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    recognizing = false;
    setMicState(false);
}
