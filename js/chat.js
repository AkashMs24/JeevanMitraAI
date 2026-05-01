// ═══════════════════════════════════════════════════════
// GROQ API
// ═══════════════════════════════════════════════════════
async function callGroq(prompt) {
  if (!_groqKey) throw new Error('No API key');
  const msgs = [{ role: 'user', content: prompt }];
  for (const model of MODELS) {
    try {
      const r = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey },
        body: JSON.stringify({ model, messages: msgs, max_tokens: 1024, temperature: 0.7 })
      });
      if (r.status === 429 || r.status === 503) continue;
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch (e) {
      if (e.message.includes('429') || e.message.includes('503')) continue;
      throw e;
    }
  }
  throw new Error('All models rate-limited');
}

async function callGroqVision(prompt, b64, mime = 'image/jpeg') {
  if (!_groqKey) throw new Error('No API key');
  const msgs = [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } },
      { type: 'text', text: prompt }
    ]
  }];
  for (const model of VISION_MODELS) {
    try {
      const r = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey },
        body: JSON.stringify({ model, messages: msgs, max_tokens: 1024, temperature: 0.2 })
      });
      if (r.status === 429 || r.status === 503) continue;
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch (e) {
      if (e.message.includes('429') || e.message.includes('503')) continue;
      throw e;
    }
  }
  throw new Error('Vision analysis failed');
}

// ═══════════════════════════════════════════════════════
// VOICE INPUT
// ═══════════════════════════════════════════════════════
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Not supported'); return; }
  const rec = new SR();
  const langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' };
  rec.lang = langMap[currentLanguage] || 'en-IN';
  rec.interimResults = false;
  const btn = document.getElementById('voiceBtn');
  btn.classList.add('listening');
  toast('Listening...');
  rec.start();
  rec.onresult = e => {
    document.getElementById('chatInput').value = e.results[0][0].transcript;
    btn.classList.remove('listening');
    sendChat();
  };
  rec.onerror = e => { btn.classList.remove('listening'); toast('Voice error: ' + e.error); };
  rec.onend = () => btn.classList.remove('listening');
  setTimeout(() => { try { rec.stop(); } catch(e) {} }, 10000);
}

// ═══════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════
function sendChat() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  addMsg(msg, 'user');
  inp.value = '';
  sendToGroq(msg);
}

function quickChat(type) {
  const p = {
    en: { crop: 'Which crop should I grow?', yield: 'Predict my yield', disease: 'How to detect disease?', price: 'Show market prices', season: 'What to grow this season?' },
    kn: { crop: 'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield: 'ಇಳುವರಿ ಊಹಿಸಿ', disease: 'ರೋಗ ಪತ್ತೆ ಹೇಗೆ?', price: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', season: 'ಈ ಋತುವಿನಲ್ಲಿ ಏನು?' },
    hi: { crop: 'कौन सी फसल उगाएं?', yield: 'उपज अनुमान', disease: 'रोग कैसे पहचानें?', price: 'बाजार मूल्य', season: 'इस मौसम में क्या?' },
    ml: { crop: 'ഏത് വിള വളർത്തണം?', yield: 'വിളവ് പ്രവചിക്കുക', disease: 'രോഗം കണ്ടെത്താം?', price: 'വിപണി വില', season: 'ഈ സീസണിൽ?' },
    ta: { crop: 'எந்த பயிர்?', yield: 'விளைச்சல் கணிக்கவும்', disease: 'நோயை கண்டறிவது?', price: 'சந்தை விலை', season: 'இந்த பருவத்தில்?' },
    te: { crop: 'ఏ పంట?', yield: 'దిగుబడి అంచనా', disease: 'వ్యాధిని గుర్తించాలి?', price: 'ధరలు', season: 'ఈ సీజన్‌లో?' }
  };
  const msg = p[currentLanguage]?.[type] || p.en[type];
  document.getElementById('chatInput').value = msg;
  sendChat();
}

async function sendToGroq(userMsg) {
  const tid = addTyping();
  const inp = getInputs();
  const ranked = getAllRanked(inp);
  const top3 = ranked.slice(0, 3).map(c => `${lcn(c.k)} (${c.score.toFixed(0)}%)`).join(', ');
  const langMap = { en: 'English', kn: 'Kannada', hi: 'Hindi', ml: 'Malayalam', ta: 'Tamil', te: 'Telugu' };
  const sys = `You are JeevanMitra AI, Indian agricultural assistant. Farmer soil: N=${inp.n} P=${inp.p} K=${inp.k} Temp=${inp.temp}C Hum=${inp.hum}% pH=${inp.ph} Rain=${inp.rain}mm. Top crops: ${top3}. Respond in ${langMap[currentLanguage] || 'English'}. 2-4 sentences, practical.`;

  try {
    const text = await callGroq(sys + '\n\nFarmer: ' + userMsg);
    removeTyping(tid);
    const clean = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*/g, '').replace(/#{1,3} /g, '').replace(/\n/g, '<br>');
    addMsg(clean, 'bot');
  } catch (err) {
    removeTyping(tid);
    addMsg(localReply(userMsg) + '<br><small>(Add Groq key for AI)</small>', 'bot');
  }
}

function localReply(msg) {
  const m = msg.toLowerCase();
  const l = currentLanguage;
  const ranked = getAllRanked(getInputs());
  const a = ranked[0], b = ranked[1];

  if (/crop|grow|plant|ಬೆಳ|फसल|வில|పంట/.test(m)) {
    return `🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%)<br>🥈 <b>${lcn(b.k)}</b> (${b.score.toFixed(0)}%)<br>Use Crop Advisor tab for details.`;
  }
  if (/disease|sick|spot|ರೋಗ|रोग|நோய|వ్యాధ/.test(m)) {
    return 'Upload leaf photo in <b>Disease Detection</b> tab. I can identify Blight, Rust, Mildew & more!';
  }
  if (/price|market|cost|ಬೆಲ|मूल्य|விலை|ధర/.test(m)) {
    return 'Check <b>Market Prices</b> tab for all 20 crops with live chart.';
  }

  const replies = {
    en: 'Hello! I am JeevanMitra AI. Ask about crops, yield, diseases, or prices. For voice chat, click the OmniDimension button.',
    kn: 'ನಮಸ್ಕಾರ! ನಾನು ಜೀವನಮಿತ್ರ AI.',
    hi: 'नमस्ते! मैं जीवनमित्र AI हूं।',
    ml: 'നമസ്കാരം! ഞാൻ ജീവൻമിത്ര AI.',
    ta: 'வணக்கம்! நான் ஜீவன்மித்ரா AI.',
    te: 'నమస్కారం! నేను జీవన్‌మిత్ర AI.'
  };
  return replies[l] || replies.en;
}

// ═══════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════
function addMsg(text, sender) {
  const c = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.className = `chat-msg ${sender}`;
  const safe = sender === 'user' ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : text;
  d.innerHTML = `<div class="chat-avatar">${sender === 'bot' ? '🤖' : '👨‍🌾'}</div><div class="chat-bubble">${safe}</div>`;
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

function addTyping() {
  const c = document.getElementById('chatMessages');
  const id = 't' + Date.now();
  const d = document.createElement('div');
  d.id = id;
  d.className = 'chat-msg bot';
  d.innerHTML = '<div class="chat-avatar">🤖</div><div class="chat-bubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function toggleChat() {
  isChatVisible = !isChatVisible;
  document.getElementById('chatPanel').style.display = isChatVisible ? 'flex' : 'none';
  document.getElementById('mainContainer').classList.toggle('chat-hidden', !isChatVisible);
  document.getElementById('chatFab').innerHTML = isChatVisible ? '✕' : '💬';
}
