let isChatVisible = false;
let autoVoice = true;

const VOICE_LANGS = { en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN' };

function speakText(text) {
  if (!('speechSynthesis' in window) || !autoVoice) return;
  speechSynthesis.cancel();
  const clean = text.replace(/<[^>]+>/g, '').replace(/[*#_`]/g, '');
  if (!clean.trim()) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = VOICE_LANGS[currentLanguage] || 'en-IN';
  u.rate = 0.88;
  u.pitch = 1.0;
  const voices = speechSynthesis.getVoices();
  const exact = voices.find(v => v.lang === u.lang);
  const partial = voices.find(v => v.lang.startsWith(currentLanguage));
  u.voice = exact || partial || voices[0];
  speechSynthesis.speak(u);
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

  const sys = `You are JeevanMitra AI, an expert Indian farming assistant. Respond ONLY in ${langName} language.\nFarmer's soil: N=${inp.n}mg/kg, P=${inp.p}mg/kg, K=${inp.k}mg/kg, pH=${inp.ph}, Temp=${inp.temp}°C, Humidity=${inp.hum}%, Rainfall=${inp.rain}mm, Soil=${inp.soilType}\nTop recommended crops: ${top3}\n\nBe practical, concise (2-4 sentences), use <b> for key terms. Always be helpful.`;

  try {
    const text = await groqAPI.chat(sys + '\n\nFarmer asks: ' + userMsg);
    removeTyping(tid);
    const html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    addMsg(html, 'bot');
    speakText(text);
  } catch {
    removeTyping(tid);
    const reply = localReply(userMsg);
    addMsg(reply + '<br><small style="opacity:0.4">Demo — add Groq key for full AI</small>', 'bot');
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
    return { en: fmt(a,b,c), kn: fmt(a,b,c), hi: fmt(a,b,c), ml: fmt(a,b,c), ta: fmt(a,b,c), te: fmt(a,b,c) }[l] || fmt(a,b,c);
  }

  if (/disease|sick|spot|blight|rust|ಬೆಳ|ರೋग|रोग|ரோగ|వ్యాధ/.test(m)) {
    return { en:'Upload a leaf photo in the 🔬 Disease Detection tab — I\'ll identify Leaf Blight, Rust, Powdery Mildew & more with AI!', kn:'🔬 Disease Detection ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ರೋಗ ಗುರುತಿಸುತ್ತದೆ!', hi:'🔬 Disease Detection टैब में पत्ते की फोटो अपलोड करें — AI रोग पहचानेगा!', ml:'🔬 Disease Detection ടാബിൽ ഇല ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യൂ — AI രോഗം കണ്ടെത്തും!', ta:'🔬 Disease Detection tab-ல் இலை படம் பதிவேற்றம் செய்யுங்கள் — AI நோயை கண்டறியும்!', te:'🔬 Disease Detection tab లో ఆకు ఫోటో అప్‌లోడ్ చేయండి — AI వ్యాధి గుర్తిస్తుంది!' }[l] || '';
  }

  if (/price|market|cost|sell|mandi|ಬೆಲ|मूल्य|विपണി|விலை|ధర/.test(m)) {
    const prices = (typeof marketPricesService !== 'undefined' ? marketPricesService.getAllPrices() : []).slice(0, 6);
    if (!prices.length) return '📡 Click "Fetch Live Prices" in the 💰 Market tab!';
    const list = prices.map(p => `• ${p.name}: ₹${p.price} ${p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️'}`).join('\n');
    return { en:`Current mandi prices:\n${list}\n\nCheck 💰 Market tab for all!`, kn:`ಬೆಲೆಗಳು:\n${list}`, hi:`बाजार भाव:\n${list}`, ml:`വിലകൾ:\n${list}`, ta:`விலைகள்:\n${list}`, te:`ధరలు:\n${list}` }[l] || list;
  }

  if (/yield|harvest|production|output|ಇಳುವ|उपज|വിളവ்|விளைச்சல்|దిగుబడి/.test(m)) {
    if (!ranked.length) return t('soil_empty');
    const top = ranked[0];
    return { en:`Based on your soil, <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}% match) is your best bet! Go to 📊 Yield tab to predict detailed yield.`, kn:`ನಿಮ್ಮ ಮಣ್ಣಿಗೆ <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) ಅತ್ಯುತ್ತಮ. 📊 Yield ಟ್ಯಾಬ್ ನೋಡಿ!`, hi:`आपकी मिट्टी के लिए <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) सबसे अच्छा! 📊 Yield टैब देखें।`, ml:`നിങ്ങളുടെ മണ്ണിന് <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) ഏറ്റവും നല്ലത്! 📊 Yield ടാബ് കാണുക.`, ta:`உங்கள் மண்ணுக்கு <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) சிறந்தது! 📊 Yield tab பாருங்கள்.`, te:`మీ నేలకు <b>${lcn(top.k)}</b> (${top.score.toFixed(0)}%) ఉత్తమం! 📊 Yield tab చూడండి.` }[l] || '';
  }

  if (/hi|hello|namaste|ನಮಸ್|नमस्|வணக்க|నమస్/.test(m)) {
    return { en:"Hello! 🌿 I'm <b>JeevanMitra AI</b> — your smart farming companion.\n\nI can help with:\n🌱 Crop recommendations (based on your soil)\n📊 Yield prediction\n🔬 Disease detection (upload a photo!)\n💰 Live market prices\n⛅ Weather forecast\n📢 Farming advisories\n\nJust ask me anything!", kn:'ನಮಸ್ಕಾರ! 🌿 ನಾನು <b>ಜೀವನಮಿತ್ರ AI</b>\n\nನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n🌱 ಬೆಳೆ ಶಿಫಾರಸು\n📊 ಇಳುವರಿ ಊಹೆ\n🔬 ರೋಗ ಪತ್ತೆ\n💰 ಮಾರುಕಟ್ಟೆ ಬೆಲೆ\n⛅ ಹವಾಮಾನ\n📢 ಸಲಹೆ\n\nಏನು ಬೇಕಾದರೂ ಕೇಳಿ!', hi:'नमस्ते! 🌿 मैं <b>जीवनमित्र AI</b>\n\nमैं मदद कर सकता हूं:\n🌱 फसल सिफारिश\n📊 उपज अनुमान\n🔬 रोग पहचान\n💰 बाजार मूल्य\n⛅ मौसम\n📢 सलाह\n\nकुछ भी पूछें!', ml:'നമസ്കാരം! 🌿 <b>ജീവൻമിത്ര AI</b>\n\nസഹായം: 🌱 വിള ശുപാർശ 📊 വിളവ് 🔬 രോഗം 💰 വില ⛅ കാലാവസ്ഥ 📢 ഉപദേശം', ta:'வணக்கம்! 🌿 <b>ஜீவன்மித்ரா AI</b>\n\nஉதவி: 🌱 பயிர் 📊 விளைச்சல் 🔬 நோய் 💰 விலை ⛅ வானிலை 📢 ஆலோசனை', te:'నమస్కారం! 🌿 <b>జీవన్‌మిత్ర AI</b>\n\nసహాయం: 🌱 పంట 📊 దిగుబడి 🔬 వ్యాధి 💰 ధరలు ⛅ వాతావరణం 📢 సలహాలు' }[l] || '';
  }

  return { en:"Ask me about 🌱 crops, 📊 yield, 🔬 diseases, 💰 prices, ⛅ weather, or 📢 advisories. I'm here to help!", kn:'🌿 ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ, ಬೆಲೆ, ಹವಾಮಾನ ಬಗ್ಗೆ ಕೇಳಿ!', hi:'🌿 फसल, उपज, रोग, भाव, मौसम या सलाह के बारे में पूछें!', ml:'🌿 വിള, വിളവ്, രോഗം, വില, കാലാവസ്ഥ, ഉപദേശം — എന്തും ചോദിക്കൂ!', ta:'🌿 பயிர், விளைச்சல், நோய், விலை, வானிலை — எதையும் கேளுங்கள்!', te:'🌿 పంట, దిగుబడి, వ్యాధి, ధర, వాతావరణం — ఏదైనా అడగండి!' }[l] || '';
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
