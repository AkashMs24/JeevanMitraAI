// ═══════════════════════════════════════════════════════
// GROQ API FUNCTIONS
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
  throw new Error('All models rate-limited. Please wait 30 seconds.');
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
  throw new Error('Vision analysis failed. Check API key or try again.');
}

// ═══════════════════════════════════════════════════════
// VOICE INPUT — Speech to Text (for Groq chat input)
// ═══════════════════════════════════════════════════════
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    toast('❌ Voice input not supported. Use OmniDimension voice widget instead.');
    return;
  }
  
  const rec = new SR();
  const langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' };
  rec.lang = langMap[currentLanguage] || 'en-IN';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  
  const btn = document.getElementById('voiceBtn');
  btn.classList.add('listening');
  toast('🎤 Listening… Speak now');
  
  rec.start();
  
  rec.onresult = e => {
    const txt = e.results[0][0].transcript;
    document.getElementById('chatInput').value = txt;
    btn.classList.remove('listening');
    sendChat();
  };
  
  rec.onerror = e => {
    btn.classList.remove('listening');
    if (e.error === 'not-allowed') toast('❌ Microphone permission denied');
    else if (e.error === 'no-speech') toast('❌ No speech detected');
    else toast('❌ Voice error: ' + e.error);
  };
  
  rec.onend = () => btn.classList.remove('listening');
  setTimeout(() => { try { rec.stop(); } catch (e) {} }, 10000);
}

// ═══════════════════════════════════════════════════════
// CHAT FUNCTIONS (Text only — OmniDimension handles voice)
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
    en: { crop: 'Which crop should I grow based on my soil data?', yield: 'Predict my crop yield', disease: 'How to detect plant disease?', price: 'Show current market prices', season: 'What crops should I grow this season?' },
    kn: { crop: 'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield: 'ಇಳುವರಿ ಊಹಿಸಿ', disease: 'ರೋಗ ಗುರುತಿಸುವುದು ಹೇಗೆ?', price: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ತೋರಿಸಿ', season: 'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ?' },
    hi: { crop: 'कौन सी फसल उगाएं?', yield: 'उपज का अनुमान करें', disease: 'रोग पहचान कैसे करें?', price: 'बाजार मूल्य दिखाएं', season: 'इस मौसम में कौन सी फसल?' },
    ml: { crop: 'ഞാൻ ഏത് വിള വളർത്തണം?', yield: 'വിളവ് പ്രവചിക്കുക', disease: 'ചെടിരോഗം?', price: 'വിപണി വിലകൾ', season: 'ഈ സീസണിൽ ഏത് വിള?' },
    ta: { crop: 'எந்த பயிர் பயிரிட வேண்டும்?', yield: 'விளைச்சல் கணிக்கவும்', disease: 'நோயை எவ்வாறு கண்டறிவது?', price: 'சந்தை விலை காட்டு', season: 'இந்த பருவத்தில் என்ன பயிர்?' },
    te: { crop: 'ఏ పంట పండించాలి?', yield: 'దిగుబడి అంచనా', disease: 'వ్యాధిని ఎలా గుర్తించాలి?', price: 'ధరలు చూపించు', season: 'ఈ సీజన్‌లో ఏ పంట?' }
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
  
  const sys = `You are JeevanMitra AI, an expert Indian agricultural assistant.
Farmer soil data: N=${inp.n} P=${inp.p} K=${inp.k} Temp=${inp.temp}°C Hum=${inp.hum}% pH=${inp.ph} Rain=${inp.rain}mm
Top recommended crops: ${top3}
Respond in ${langMap[currentLanguage] || 'English'}. Be concise (2-4 sentences), practical, helpful.`;
  
  try {
    const text = await callGroq(sys + '\n\nFarmer: ' + userMsg);
    removeTyping(tid);
    
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,3} /g, '')
      .replace(/\n/g, '<br>');
    
    addMsg(cleanText, 'bot');
    
  } catch (err) {
    removeTyping(tid);
    const fallback = localReply(userMsg);
    addMsg(fallback + '<br><small style="opacity:0.5;">(Add Groq key for AI responses)</small>', 'bot');
  }
}

function localReply(msg) {
  const m = msg.toLowerCase();
  const l = currentLanguage;
  const inp = getInputs();
  const ranked = getAllRanked(inp);
  
  if (/crop|grow|plant|recommend|ಬೆಳ|फसल|வில|పంట|wheat|rice/.test(m)) {
    const [a, b, c] = ranked;
    const replies = {
      en: `🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%)<br>🥈 <b>${lcn(b.k)}</b> (${b.score.toFixed(0)}%)<br>🥉 <b>${lcn(c.k)}</b> (${c.score.toFixed(0)}%)`,
      kn: `🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${lcn(b.k)}</b>`,
      hi: `🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${lcn(b.k)}</b>`,
      ml: `🥇 <b>${lcn(a.k)}</b> 🥈 <b>${lcn(b.k)}</b>`,
      ta: `🥇 <b>${lcn(a.k)}</b> 🥈 <b>${lcn(b.k)}</b>`,
      te: `🥇 <b>${lcn(a.k)}</b> 🥈 <b>${lcn(b.k)}</b>`
    };
    return replies[l] || replies.en;
  }
  
  if (/disease|sick|spot|ರೋಗ|रोग|நோய|వ్యాధ/.test(m)) {
    return '🔬 Upload a leaf photo in the <b>Disease Detection</b> tab — I can identify Leaf Blight, Rust, Powdery Mildew & more!';
  }
  
  if (/price|market|cost|ಬೆಲ|मूल्य|விலை|ధర/.test(m)) {
    const top5 = Object.entries(marketPrices).slice(0, 5);
    const str = top5.map(([c, d]) => `• ${lcn(c)}: ₹${d.price} ${d.icon}`).join('<br>');
    return `💰 Current prices:<br>${str}<br>Check <b>Market Prices</b> tab for all 20 crops!`;
  }
  
  return '🌿 <b>JeevanMitra AI</b> here! Ask about crops, yield, diseases, or prices. For voice chat, click the 🎤 OmniDimension button.';
}

// ═══════════════════════════════════════════════════════
// CHAT UI
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
  d.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
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
