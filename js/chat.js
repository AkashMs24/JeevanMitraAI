let isChatVisible = false;
function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
    u.lang = { en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN' }[currentLanguage] || 'en-IN';
    u.rate = 0.85;
    const voices = speechSynthesis.getVoices();
    const best = voices.find(v => v.lang === u.lang) || voices.find(v => v.lang.startsWith(currentLanguage));
    if (best) u.voice = best;
    speechSynthesis.speak(u);
}
function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast(t('voice_not_supported')); return; }
    const rec = new SR();
    rec.lang = { en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN' }[currentLanguage] || 'en-IN';
    rec.interimResults = false; rec.maxAlternatives = 1; rec.continuous = false;
    const btn = document.getElementById('voiceBtn');
    if (btn) btn.classList.add('listening');
    toast(t('voice_listening'));
    rec.start();
    rec.onresult = e => {
        const txt = e.results[0][0].transcript;
        const inp = document.getElementById('chatInput'); if (inp) inp.value = txt;
        if (btn) btn.classList.remove('listening');
        sendChat();
    };
    rec.onerror = e => {
        if (btn) btn.classList.remove('listening');
        if (e.error === 'not-allowed') toast('❌ Mic permission denied');
        else if (e.error === 'no-speech') toast('❌ No speech detected');
        else toast('❌ Voice error: ' + e.error);
    };
    rec.onend = () => { if (btn) btn.classList.remove('listening'); };
    setTimeout(() => { try { rec.stop(); } catch {} }, 8000);
}
async function callGroq(prompt) { return await groqAPI.chat(prompt); }
function sendChat() {
    const inp = document.getElementById('chatInput');
    const msg = inp?.value?.trim(); if (!msg) return;
    addMsg(msg, 'user');
    inp.value = '';
    sendToGroq(msg);
}
function quickChat(type) {
    const phrases = {
        en: { crop:'Which crop should I grow?', yield:'Predict my crop yield', disease:'How to detect plant disease?', price:'Show market prices' },
        kn: { crop:'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield:'ಇಳುವರಿ ಊಹಿಸಿ', disease:'ರೋಗ ಗುರುತಿಸುವುದು?', price:'ಬೆಲೆ ತೋರಿಸಿ' },
        hi: { crop:'कौन सी फसल उगाएं?', yield:'उपज का अनुमान', disease:'रोग पहचान?', price:'बाजार मूल्य' },
        ml: { crop:'ഏത് വിള?', yield:'വിളവ് പ്രവചിക്കുക', disease:'രോഗം?', price:'വിലകൾ' },
        ta: { crop:'எந்த பயிர்?', yield:'விளைச்சல்', disease:'நோய்?', price:'விலை' },
        te: { crop:'ఏ పంట?', yield:'దిగుబడి', disease:'వ్యాధి?', price:'ధరలు' }
    };
    const msg = phrases[currentLanguage]?.[type] || phrases.en[type];
    const inp = document.getElementById('chatInput'); if (inp) inp.value = msg;
    sendChat();
}
async function sendToGroq(userMsg) {
    const tid = addTyping();
    const inp = getInputs();
    const ranked = getAllRanked(inp);
    const top3 = ranked.slice(0, 3).map(c => `${lcn(c.k)} (${c.score.toFixed(0)}%)`).join(', ');
    const langName = { en:'English', kn:'Kannada', hi:'Hindi', ml:'Malayalam', ta:'Tamil', te:'Telugu' }[currentLanguage] || 'English';
    const sys = `You are JeevanMitra AI, an expert Indian farming assistant.\nSoil: N=${inp.n} P=${inp.p} K=${inp.k} Temp=${inp.temp}°C Hum=${inp.hum}% pH=${inp.ph} Rain=${inp.rain}mm\nTop crops: ${top3}\nRespond in ${langName}. 2-4 sentences, practical. Use <b> for key terms.`;
    try {
        const text = await callGroq(sys + '\n\nFarmer: ' + userMsg);
        removeTyping(tid);
        const html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
        addMsg(html, 'bot');
        speakText(text.replace(/<[^>]+>/g, ''));
    } catch {
        removeTyping(tid);
        addMsg(localReply(userMsg) + '<br><small style="opacity:0.5">(Demo — add Groq key for AI)</small>', 'bot');
    }
}
function localReply(msg) {
    const m = msg.toLowerCase();
    const l = currentLanguage;
    const inp = getInputs();
    const ranked = getAllRanked(inp);
    if (/crop|grow|plant|recommend|wheat|rice|ಬೆಳ|फसल/.test(m)) {
        if (!ranked.length) return 'Enter soil data first.';
        const [a, b, c] = ranked;
        return { en:`🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%)<br>🥈 <b>${lcn(b.k)}</b> (${b.score.toFixed(0)}%)<br>🥉 <b>${lcn(c.k)}</b> (${c.score.toFixed(0)}%)`, kn:`🥇 <b>${lcn(a.k)}</b>`, hi:`🥇 <b>${lcn(a.k)}</b>` }[l] || `🥇 <b>${lcn(a.k)}</b>`;
    }
    if (/disease|sick|spot|ರೋग|रोग/.test(m)) return { en:'Upload leaf photo in Disease Detection tab! 🔍', kn:'Disease Detection ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ 🔍' }[l] || 'Upload a photo in Disease tab. 🔍';
    if (/price|market|cost|ಬೆಲ|मूल्य/.test(m)) {
        const top5 = marketPricesService.getAllPrices().slice(0, 5);
        const str = top5.map(c => `• ${c.name}: ₹${c.price} ${c.emoji}`).join('<br>');
        return { en:`Market prices:<br>${str}`, kn:`ಬೆಲೆ:<br>${str}` }[l] || str;
    }
    if (/hi|hello|namaste|ನಮಸ್|नमस्/.test(m)) return { en:"Hello! 🌿 I'm <b>JeevanMitra AI</b> — ask about crops, yield, diseases, prices!", kn:'ನಮಸ್ಕಾರ! 🌿 ನಾನು <b>ಜೀವನಮಿತ್ರ AI</b>' }[l] || 'Hello! 🌿';
    return { en:'🌿 Ask me about crops, yield, diseases, or market prices!', kn:'🌿 ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ ಬಗ್ಗೆ ಕೇಳಿ.' }[l] || '🌿 Ask me anything about farming!';
}
function addMsg(text, sender) {
    const c = document.getElementById('chatMessages'); if (!c) return;
    const d = document.createElement('div');
    d.className = `cmsg ${sender}`;
    const safe = sender === 'user' ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : text;
    d.innerHTML = `<div class="cavatar">${sender === 'bot' ? '🤖' : '👨‍🌾'}</div><div class="cbubble">${safe}</div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
}
function addTyping() {
    const c = document.getElementById('chatMessages'); if (!c) return 't0';
    const id = 't' + Date.now();
    const d = document.createElement('div'); d.id = id; d.className = 'cmsg bot';
    d.innerHTML = '<div class="cavatar">🤖</div><div class="cbubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
    c.appendChild(d); c.scrollTop = c.scrollHeight;
    return id;
}
function removeTyping(id) { document.getElementById(id)?.remove(); }
function toggleChat() {
    isChatVisible = !isChatVisible;
    const cp = document.getElementById('chatPanel');
    const mc = document.getElementById('mainContainer');
    const fb = document.getElementById('chatFab');
    if (cp) cp.style.display = isChatVisible ? 'flex' : 'none';
    if (mc) mc.classList.toggle('chat-open', isChatVisible);
    if (fb) fb.innerHTML = isChatVisible ? '✕' : '💬';
}
