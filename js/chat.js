// Chat & Groq AI Module
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it', 'llama3-8b-8192'];
const VISION_MODELS = ['meta-llama/llama-4-scout-17b-16e-instruct', 'llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'];
let _groqKey = '';
const KEY_STORE = 'jeevanmitra_groq_key_v2';

// ---------- API Key Management ----------
function showModal() { document.getElementById('apiModal').style.display = 'flex'; setTimeout(() => document.getElementById('apiKeyInput').focus(), 100); }
function closeModal() { document.getElementById('apiModal').style.display = 'none'; }
function saveKey() {
  const k = document.getElementById('apiKeyInput').value.trim();
  if (!k.startsWith('gsk_') || k.length < 20) { alert('❌ Invalid key. Groq keys start with gsk_...'); return; }
  _groqKey = k; localStorage.setItem(KEY_STORE, k);
  closeModal(); updateApiBar(true); toast('✅ Groq AI connected! Full AI mode active.');
}
function updateApiBar(connected) {
  const bar = document.getElementById('apiBar'); const txt = document.getElementById('apiBarText');
  bar.className = 'api-bar ' + (connected ? 'connected' : 'disconnected');
  txt.textContent = connected ? '⚡ Groq AI Connected — Direct API, No Server Needed  (click to change key)' : '🔑 Click to enter your FREE Groq API key — works directly in browser, no server needed';
}

// ---------- Groq API Calls ----------
async function callGroq(prompt) {
  if (!_groqKey) throw new Error('No API key. Click the status bar to add your free Groq key.');
  const msgs = [{ role: 'user', content: prompt }];
  for (const model of MODELS) {
    try {
      const r = await fetch(GROQ_API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey }, body: JSON.stringify({ model, messages: msgs, max_tokens: 1024, temperature: 0.7 }) });
      if (r.status === 429 || r.status === 503) continue;
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch (e) { if (e.message.includes('429') || e.message.includes('503')) continue; throw e; }
  }
  throw new Error('All models rate-limited. Please wait 30 seconds.');
}
async function callGroqVision(prompt, b64, mime = 'image/jpeg') {
  if (!_groqKey) throw new Error('No API key. Click the status bar to add your free Groq key.');
  const msgs = [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } }, { type: 'text', text: prompt }] }];
  for (const model of VISION_MODELS) {
    try {
      const r = await fetch(GROQ_API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey }, body: JSON.stringify({ model, messages: msgs, max_tokens: 1024, temperature: 0.2 }) });
      if (r.status === 429 || r.status === 503) continue;
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch (e) { if (e.message.includes('429') || e.message.includes('503')) continue; throw e; }
  }
  throw new Error('Vision analysis failed. Check API key or try again.');
}

// ---------- Chat UI ----------
function toggleChat() {
  isChatVisible = !isChatVisible;
  const panel = document.getElementById('chatPanel');
  const main = document.getElementById('mainContainer');
  const fab = document.getElementById('chatFab');
  if (panel) panel.style.display = isChatVisible ? 'flex' : 'none';
  if (main) main.classList.toggle('chat-hidden', !isChatVisible);
  if (fab) fab.innerHTML = isChatVisible ? '✕' : '💬';
}
function addMsg(text, sender) {
  const c = document.getElementById('chatMessages');
  const d = document.createElement('div'); d.className = `chat-msg ${sender}`;
  const safe = sender === 'user' ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : text;
  d.innerHTML = `<div class="chat-avatar">${sender === 'bot' ? '🤖' : '👨‍🌾'}</div><div class="chat-bubble">${safe}</div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}
function addTyping() {
  const c = document.getElementById('chatMessages');
  const id = 't' + Date.now(); const d = document.createElement('div');
  d.id = id; d.className = 'chat-msg bot';
  d.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight; return id;
}
function removeTyping(id) { const el = document.getElementById(id); if (el) el.remove(); }
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
  u.lang = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' }[currentLanguage] || 'en-IN';
  u.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  const best = voices.find(v => v.lang === u.lang) || voices.find(v => v.lang.startsWith(currentLanguage)) || null;
  if (best) u.voice = best;
  speechSynthesis.speak(u);
}
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast(t('voice_not_supported')); return; }
  const rec = new SR();
  const langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' };
  rec.lang = langMap[currentLanguage] || 'en-IN';
  rec.interimResults = false; rec.maxAlternatives = 1; rec.continuous = false;
  const btn = document.getElementById('voiceBtn');
  btn.classList.add('listening');
  toast(t('voice_listening'));
  rec.start();
  rec.onresult = e => {
    const txt = e.results[0][0].transcript;
    document.getElementById('chatInput').value = txt;
    btn.classList.remove('listening');
    sendChat();
  };
  rec.onerror = e => {
    btn.classList.remove('listening');
    if (e.error === 'not-allowed') toast('❌ Microphone permission denied.');
    else if (e.error === 'no-speech') toast('❌ No speech detected.');
    else if (e.error === 'language-not-supported') toast(`❌ ${currentLanguage} not supported. Try Chrome.`);
    else toast('❌ Voice error: ' + e.error);
  };
  rec.onend = () => btn.classList.remove('listening');
  setTimeout(() => { try { rec.stop(); } catch (e) { } }, 8000);
}
function sendChat() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  addMsg(msg, 'user');
  inp.value = '';
  sendToGroq(msg);
}
function quickChat(type) {
  const prompts = {
    en: { crop: 'Which crop should I grow based on my soil data?', yield: 'Predict my crop yield', disease: 'How to detect plant disease?', price: 'Show current market prices', season: 'What crops should I grow this season?' },
    kn: { crop: 'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield: 'ಇಳುವರಿ ಊಹಿಸಿ', disease: 'ರೋಗ ಗುರುತಿಸುವುದು ಹೇಗೆ?', price: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ತೋರಿಸಿ', season: 'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ?' },
    hi: { crop: 'कौन सी फसल उगाएं?', yield: 'उपज का अनुमान करें', disease: 'रोग पहचान कैसे करें?', price: 'बाजार मूल्य दिखाएं', season: 'इस मौसम में कौन सी फसल?' },
    ml: { crop: 'ഞാൻ ഏത് വിള വളർത്തണം?', yield: 'വിളവ് പ്രവചിക്കുക', disease: 'ചെടിരോഗം?', price: 'വിപണി വിലകൾ', season: 'ഈ സീസണിൽ ഏത് വിള?' },
    ta: { crop: 'எந்த பயிர் பயிரிட வேண்டும்?', yield: 'விளைச்சல் கணிக்கவும்', disease: 'நோயை எவ்வாறு கண்டறிவது?', price: 'சந்தை விலை காட்டு', season: 'இந்த பருவத்தில் என்ன பயிர்?' },
    te: { crop: 'ఏ పంట పండించాలి?', yield: 'దిగుబడి అంచనా', disease: 'వ్యాధిని ఎలా గుర్తించాలి?', price: 'ధరలు చూపించు', season: 'ఈ సీజన్‌లో ఏ పంట?' }
  };
  const msg = prompts[currentLanguage]?.[type] || prompts.en[type];
  document.getElementById('chatInput').value = msg;
  sendChat();
}
async function sendToGroq(userMsg) {
  const tid = addTyping();
  const inp = getInputs();
  const ranked = getAllRanked(inp);
  const top3 = ranked.slice(0, 3).map(c => `${lcn(c.k)} (${c.score.toFixed(0)}%)`).join(', ');
  const langMap = { en: 'English', kn: 'Kannada', hi: 'Hindi', ml: 'Malayalam', ta: 'Tamil', te: 'Telugu' };
  const sys = `You are JeevanMitra AI, an expert Indian agricultural assistant.\n\nFarmer soil data: N=${inp.n} P=${inp.p} K=${inp.k} Temp=${inp.temp}°C Hum=${inp.hum}% pH=${inp.ph} Rain=${inp.rain}mm\nTop recommended crops: ${top3}\n\nRespond in ${langMap[currentLanguage] || 'English'}. Be concise (2-4 sentences), practical, helpful. Use <b> tags for key terms. Always refer to yourself as JeevanMitra AI.`;
  try {
    const text = await callGroq(sys + '\n\nFarmer: ' + userMsg);
    removeTyping(tid);
    const html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '$1').replace(/#{1,3} /g, '').replace(/\n/g, '<br>');
    addMsg(html, 'bot');
    speakText(text.replace(/<[^>]+>/g, ''));
  } catch (err) {
    removeTyping(tid);
    addMsg(localReply(userMsg) + '<br><small style="opacity:0.5;">(Demo mode — add Groq key for AI responses)</small>', 'bot');
  }
}
function localReply(msg) {
  const m = msg.toLowerCase();
  const l = currentLanguage;
  const inp = getInputs();
  const ranked = getAllRanked(inp);
  if (/crop|grow|plant|recommend|ಬೆಳ|फसल|வில|పంట/.test(m)) {
    const [a, b, c] = ranked;
    const fallback = `🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%)<br>🥈 <b>${lcn(b.k)}</b> (${b.score.toFixed(0)}%)<br>🥉 <b>${lcn(c.k)}</b> (${c.score.toFixed(0)}%)`;
    if (l === 'kn') return `ನಿಮ್ಮ ಡೇಟಾ: 🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${lcn(b.k)}</b>`;
    if (l === 'hi') return `डेटा के अनुसार: 🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%)`;
    if (l === 'ml') return `ഡേറ്റ: 🥇 <b>${lcn(a.k)}</b>`;
    if (l === 'ta') return `தரவு: 🥇 <b>${lcn(a.k)}</b>`;
    if (l === 'te') return `డేటా: 🥇 <b>${lcn(a.k)}</b>`;
    return `Based on your soil data:<br>${fallback}`;
  }
  if (/disease|sick|spot|ರೋಗ|रोग|நோய|వ్యాధ/.test(m)) {
    const dict = { en: 'Upload a leaf photo in the Disease Detection tab — I can identify Leaf Blight, Rust, Powdery Mildew, Bacterial Spot & more! 🔍', kn: 'Disease Detection ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ 🔍', hi: 'Disease Detection टैब में पत्ते की छवि अपलोड करें 🔍', ml: 'Disease Detection ടാബിൽ ഇല ചിത്രം 🔍', ta: 'Disease Detection tabல் இலை படம் 🔍', te: 'Disease Detection tab లో ఆకు చిత్రం 🔍' };
    return dict[l] || dict.en;
  }
  if (/price|market|cost|ಬೆಲ|मूल्य|விலை|ధర/.test(m)) {
    const top5 = Object.entries(marketPrices).slice(0, 5);
    const str = top5.map(([c, d]) => `• ${lcn(c)}: ₹${d.price} ${d.icon}`).join('<br>');
    const dict = { en: `Current market prices:<br>${str}<br>Check the Market Prices tab for all 20 crops! 💰`, kn: `ಬೆಲೆ:<br>${str}`, hi: `बाजार:<br>${str}`, ml: `വിപണി:<br>${str}`, ta: `விலை:<br>${str}`, te: `ధర:<br>${str}` };
    return dict[l] || dict.en;
  }
  if (/hi|hello|namaste|ನಮಸ್|नमस्|வணக|నమస/.test(m)) {
    const dict = { en: 'Hello! 🌿 I\'m <b>JeevanMitra AI</b> — your smart farming companion. I can recommend crops, predict yield, detect diseases & show market prices!', kn: 'ನಮಸ್ಕಾರ! 🌿 ನಾನು <b>ಜೀವನಮಿತ್ರ AI</b>. ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ, ಬೆಲೆ ಸಹಾಯ!', hi: 'नमस्ते! 🌿 मैं <b>जीवनमित्र AI</b> — फसल, उपज, रोग, बाजार सब में मदद करता हूं!', ml: 'നമസ്കാരം! 🌿 ഞാൻ <b>ജീവൻമിത്ര AI</b>.', ta: 'வணக்கம்! 🌿 நான் <b>ஜீவன்மித்ரா AI</b>.', te: 'నమస్కారం! 🌿 నేను <b>జీవన్‌మిత్ర AI</b>.' };
    return dict[l] || dict.en;
  }
  const dict = { en: '🌿 Ask me about crops, yield, diseases, or market prices. Add your free Groq API key for full AI responses!', kn: '🌿 ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ ಅಥವಾ ಬೆಲೆ ಬಗ್ಗೆ ಕೇಳಿ.', hi: '🌿 फसल, उपज, रोग या बाजार के बारे में पूछें।', ml: '🌿 ചോദ്യം ചോദിക്കൂ — വിള, വിളവ്, രോഗം, വിപണി.', ta: '🌿 பயிர், விளைச்சல், நோய் பற்றி கேளுங்கள்.', te: '🌿 పంట, దిగుబడి, వ్యాధి గురించి అడగండి.' };
  return dict[l] || dict.en;
}
