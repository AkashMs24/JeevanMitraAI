let isChatVisible = false;
let autoVoice = true;
let voicesLoaded = false;

const VOICE_LANGS = { en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN' };

// ═══ VOICE INIT — must load voices async ═══
function initVoices() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) { voicesLoaded = true; resolve(voices); return; }
    speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve(speechSynthesis.getVoices());
    };
    setTimeout(() => { voicesLoaded = true; resolve(speechSynthesis.getVoices()); }, 1000);
  });
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  if (!autoVoice) return;
  speechSynthesis.cancel();
  const clean = text.replace(/<[^>]+>/g, '').replace(/[*#_`]/g, '').trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = VOICE_LANGS[currentLanguage] || 'en-IN';
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  const voices = speechSynthesis.getVoices();
  const targetLang = u.lang;
  // Find exact match first, then partial
  const exact = voices.find(v => v.lang === targetLang);
  const partial = voices.find(v => v.lang && v.lang.startsWith(currentLanguage));
  const enIN = voices.find(v => v.lang === 'en-IN');
  u.voice = exact || partial || enIN || voices[0] || null;
  try { speechSynthesis.speak(u); } catch (e) { console.warn('Speech failed:', e); }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast(t('voice_not_supported')); return; }
  const rec = new SR();
  rec.lang = VOICE_LANGS[currentLanguage] || 'en-IN';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  const btn = document.getElementById('voiceBtn');
  if (btn) btn.classList.add('listening');
  toast(t('voice_listening'));
  rec.start();
  rec.onresult = e => {
    const txt = e.results[0][0].transcript;
    const inp = document.getElementById('chatInput');
    if (inp) inp.value = txt;
    if (btn) btn.classList.remove('listening');
    sendChat();
  };
  rec.onerror = e => {
    if (btn) btn.classList.remove('listening');
    if (e.error === 'not-allowed') toast('❌ Mic permission denied');
    else if (e.error === 'no-speech') toast('❌ No speech detected');
    else toast('❌ ' + e.error);
  };
  rec.onend = () => { if (btn) btn.classList.remove('listening'); };
  setTimeout(() => { try { rec.stop(); } catch {} }, 8000);
}

function toggleAutoVoice() {
  autoVoice = !autoVoice;
  const btn = document.getElementById('voiceToggle');
  if (btn) btn.textContent = autoVoice ? '🔊' : '🔇';
  if (!autoVoice) stopSpeaking();
  toast(autoVoice ? '🔊 Voice ON' : '🔇 Voice OFF');
}

function sendChat() {
  const inp = document.getElementById('chatInput');
  const msg = inp?.value?.trim();
  if (!msg) return;
  addMsg(msg, 'user');
  inp.value = '';
  sendToGroq(msg);
}

function quickChat(type) {
  const phrases = {
    en: { crop:'Which crop should I grow based on my soil?', yield:'Predict my crop yield for this season', disease:'How to detect plant diseases early?', price:'What are current market prices?' },
    kn: { crop:'ನನ್ನ ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield:'ಈ ಋತುವಿನ ಇಳುವರಿ ಊಹಿಸಿ', disease:'ಬೆಳೆ ರೋಗ ಹೇಗೆ ಗುರುತಿಸುವುದು?', price:'ಈಗಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಏನು?' },
    hi: { crop:'मेरी मिट्टी के लिए कौन सी फसल?', yield:'इस मौसम की उपज बताओ', disease:'पौधों के रोग कैसे पहचानें?', price:'मौजूदा बाजार भाव क्या हैं?' },
    ml: { crop:'എന്റെ മണ്ണിന് ഏത് വിള?', yield:'ഈ സീസണിലെ വിളവ്', disease:'ചെടിരോഗം എങ്ങനെ കണ്ടെത്താം?', price:'ഇപ്പോഴത്തെ വിപണി വില?' },
    ta: { crop:'என் மண்ணுக்கு ஏது பயிர்?', yield:'இந்த பருவத்தின் விளைச்சல்', disease:'தாவர நோயை எப்படி கண்டறிவது?', price:'இப்போதைய சந்தை விலை?' },
    te: { crop:'నా నేలకు ఏ పంట?', yield:'ఈ సీజన్ దిగుబడి', disease:'మొక్కల వ్యాధి ఎలా గుర్తించాలి?', price:'ప్రస్తుత మార్కెట్ ధరలు?' }
  };
  const msg = phrases[currentLanguage]?.[type] || phrases.en[type];
  const inp = document.getElementById('chatInput');
  if (inp) inp.value = msg;
  sendChat();
}

async function sendToGroq(userMsg) {
  const tid = addTyping();
  const inp = getInputs();
  const ranked = getAllRanked(inp);
  const top3 = ranked.slice(0, 3).map(c => `${lcn(c.k)} (${c.score.toFixed(0)}%)`).join(', ');
  const langName = { en:'English', kn:'Kannada', hi:'Hindi', ml:'Malayalam', ta:'Tamil', te:'Telugu' }[currentLanguage] || 'English';

  const sys = `You are JeevanMitra AI, an expert Indian farming assistant. IMPORTANT: Respond ONLY in ${langName} language.\nFarmer's soil: N=${inp.n}mg/kg, P=${inp.p}mg/kg, K=${inp.k}mg/kg, pH=${inp.ph}, Temp=${inp.temp}°C, Humidity=${inp.hum}%, Rain=${inp.rain}mm\nTop crops: ${top3}\nBe practical, 2-3 sentences. Use <b> for key terms.`;

  try {
    const text = await groqAPI.chat(sys + '\n\nFarmer: ' + userMsg);
    removeTyping(tid);
    const html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    addMsg(html, 'bot');
    // AUTO SPEAK in selected language
    speakText(text);
  } catch (err) {
    removeTyping(tid);
    const reply = localReply(userMsg);
    addMsg(reply + '<br><small style="opacity:0.4">Demo — add Groq key</small>', 'bot');
    // AUTO SPEAK local reply too
    speakText(reply);
  }
}

function localReply(msg) {
  const m = msg.toLowerCase();
  const l = currentLanguage;
  const inp = getInputs();
  const ranked = getAllRanked(inp);

  if (/crop|grow|plant|recommend|wheat|rice|maize|cotton|ಬೆಳ|फसल|വിള|பயிர்|పంట/.test(m)) {
    if (!ranked.length) return t('soil_empty');
    const [a, b, c] = ranked;
    const fmt = (a, b, c) => `🥇 <b>${lcn(a.k)}</b> (${a.score.toFixed(0)}%) → 🥈 <b>${lcn(b.k)}</b> (${b.score.toFixed(0)}%) → 🥉 <b>${lcn(c.k)}</b> (${c.score.toFixed(0)}%)`;
    return fmt(a, b, c);
  }
  if (/disease|sick|spot|blight|rust|ರೋग|रोग|ரோగ|వ్యాధ/.test(m)) {
    return { en:'Upload a leaf photo in 🔬 Disease Detection tab — AI identifies Leaf Blight, Rust, Powdery Mildew & more!', kn:'🔬 Disease Detection ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ರೋಗ ಗುರುತಿಸುತ್ತದೆ!', hi:'🔬 Disease Detection टैब में पत्ते की फोटो अपलोड करें — AI रोग पहचानेगा!', ml:'🔬 Disease Detection ടാബിൽ ഇല ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യൂ!', ta:'🔬 Disease Detection tab-ல் இலை படம் பதிவேற்றம் செய்யுங்கள்!', te:'🔬 Disease Detection tab లో ఆకు ఫోటో అప్‌లోడ్ చేయండి!' }[l] || '';
  }
  if (/price|market|cost|sell|ಬೆಲ|मूल्य|വിപണി|விலை|ధర/.test(m)) {
    const prices = (typeof marketPricesService !== 'undefined' ? marketPricesService.getAllPrices() : []).slice(0, 6);
    if (!prices.length) return '📡 Click "Fetch Live Prices" in 💰 Market tab!';
    const list = prices.map(p => `• ${p.name}: ₹${p.price} ${p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️'}`).join('\n');
    return { en:`Market prices:\n${list}`, kn:`ಬೆಲೆಗಳು:\n${list}`, hi:`बाजार भाव:\n${list}`, ml:`വിലകൾ:\n${list}`, ta:`விலைகள்:\n${list}`, te:`ధరలు:\n${list}` }[l] || list;
  }
  if (/yield|harvest|production|output|ಇಳುವ|उपज|വിളവ்|ವಿളೈச್ಛಲ್|దిగుబడి/.test(m)) {
    if (!ranked.length) return t('soil_empty');
    const top = ranked[0];
    return { en:`Best crop for your soil: <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}% match). Go to 📊 Yield tab for detailed prediction!`, kn:`ನಿಮ್ಮ ಮಣ್ಣಿಗೆ <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) ಅತ್ಯುತ್ತಮ. 📊 Yield tab ನೋಡಿ!`, hi:`आपकी मिट्टी के लिए <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) सबसे अच्छा! 📊 Yield टैब देखें।`, ml:`നിങ്ങളുടെ മണ്ണിന് <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) ഏറ്റവും നല്ലത്! 📊 Yield ടാബ് കാണുക.`, ta:`உங்கள் மண்ணுக்கு <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) சிறந்தது! 📊 Yield tab பாருங்கள்.`, te:`మీ నేలకు <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) ఉత్తమం! 📊 Yield tab చూడండి.` }[l] || '';
  }
  if (/hi|hello|namaste|ನಮಸ್|नमस्|வணக்க|నమస్/.test(m)) {
    return { en:"Hello! 🌿 I'm <b>JeevanMitra AI</b>.\n\nI help with:\n🌱 Crop recommendations\n📊 Yield prediction\n🔬 Disease detection\n💰 Market prices\n⛅ Weather\n📢 Advisories\n\nAsk anything!", kn:'ನಮಸ್ಕಾರ! 🌿 <b>ಜೀವನಮಿತ್ರ AI</b>\n\n🌱 ಬೆಳೆ ಶಿಫಾರಸು 📊 ಇಳುವರಿ 🔬 ರೋಗ 💰 ಬೆಲೆ ⛅ ಹವಾಮಾನ 📢 ಸಲಹೆ\n\nಏನು ಬೇಕಾದರೂ ಕೇಳಿ!', hi:'नमस्ते! 🌿 <b>जीवनमित्र AI</b>\n\n🌱 फसल 📊 उपज 🔬 रोग 💰 भाव ⛅ मौसम 📢 सलाह\n\nकुछ भी पूछें!', ml:'നമസ്കാരം! 🌿 <b>ജീവൻമിത്ര AI</b>\n\n🌱 വിള 📊 വിളവ് 🔬 രോഗം 💰 വില ⛅ കാലാവസ്ഥ 📢 ഉപദേശം', ta:'வணக்கம்! 🌿 <b>ஜீவன்மித்ரா AI</b>\n\n🌱 பயிர் 📊 விளைச்சல் 🔬 நோய் 💰 விலை ⛅ வானிலை 📢 ஆலோசனை', te:'నమస్కారం! 🌿 <b>జీవన్‌మిత్ర AI</b>\n\n🌱 పంట 📊 దిగుబడి 🔬 వ్యాధి 💰 ధరలు ⛅ వాతావరణం 📢 సలహాలు' }[l] || '';
  }
  return { en:"Ask about 🌱 crops, 📊 yield, 🔬 diseases, 💰 prices, ⛅ weather, or 📢 advisories!", kn:'🌿 ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ, ಬೆಲೆ ಬಗ್ಗೆ ಕೇಳಿ!', hi:'🌿 फसल, उपज, रोग, भाव, मौसम के बारे में पूछें!', ml:'🌿 വിള, വിളവ്, രോഗം, വില — എന്തും ചോദിക്കൂ!', ta:'🌿 பயிர், விளைச்சல், நோய், விலை — எதையும் கேளுங்கள்!', te:'🌿 పంట, దిగుబడి, వ్యాధి, ధర — ఏదైనా అడగండి!' }[l] || '';
}

function addMsg(text, sender) {
  const c = document.getElementById('chatMessages');
  if (!c) return;
  const d = document.createElement('div');
  d.className = `cmsg ${sender}`;
  const safe = sender === 'user' ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : text;
  d.innerHTML = `<div class="cavatar">${sender === 'bot' ? '🤖' : '👨‍🌾'}</div><div class="cbubble">${safe}</div>`;
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

function addTyping() {
  const c = document.getElementById('chatMessages');
  if (!c) return 't0';
  const id = 't' + Date.now();
  const d = document.createElement('div');
  d.id = id; d.className = 'cmsg bot';
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
