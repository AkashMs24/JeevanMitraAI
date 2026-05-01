// ═══════════════════════════════════════════════════════
// GROQ API CALLS
// ═══════════════════════════════════════════════════════
async function callGroq(prompt) {
  if (!_groqKey) throw new Error('No API key');
  var msgs = [{ role: 'user', content: prompt }];
  for (var i = 0; i < MODELS.length; i++) {
    try {
      var r = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey },
        body: JSON.stringify({ model: MODELS[i], messages: msgs, max_tokens: 1024, temperature: 0.7 })
      });
      if (r.status === 429 || r.status === 503) continue;
      var d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch (e) {
      if (e.message && (e.message.includes('429') || e.message.includes('503'))) continue;
      throw e;
    }
  }
  throw new Error('All models rate-limited. Please wait 30 seconds.');
}

async function callGroqVision(prompt, b64, mime) {
  mime = mime || 'image/jpeg';
  if (!_groqKey) throw new Error('No API key');
  var msgs = [{ role: 'user', content: [
    { type: 'image_url', image_url: { url: 'data:' + mime + ';base64,' + b64 } },
    { type: 'text', text: prompt }
  ]}];
  for (var i = 0; i < VISION_MODELS.length; i++) {
    try {
      var r = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey },
        body: JSON.stringify({ model: VISION_MODELS[i], messages: msgs, max_tokens: 1024, temperature: 0.2 })
      });
      if (r.status === 429 || r.status === 503) continue;
      var d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch (e) {
      if (e.message && (e.message.includes('429') || e.message.includes('503'))) continue;
      throw e;
    }
  }
  throw new Error('Vision analysis failed. Check API key or try again.');
}

// ═══════════════════════════════════════════════════════
// VOICE INPUT (Speech to Text for chat input)
// ═══════════════════════════════════════════════════════
function startVoice() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    toast('❌ Use OmniDimension voice widget for speech');
    return;
  }
  var rec = new SR();
  var langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' };
  rec.lang = langMap[currentLanguage] || 'en-IN';
  rec.interimResults = false;
  var btn = document.getElementById('voiceBtn');
  btn.classList.add('listening');
  toast('🎤 Listening…');
  rec.start();
  rec.onresult = function(e) {
    document.getElementById('chatInput').value = e.results[0][0].transcript;
    btn.classList.remove('listening');
    sendChat();
  };
  rec.onerror = function(e) {
    btn.classList.remove('listening');
    toast('❌ Voice error: ' + e.error);
  };
  rec.onend = function() { btn.classList.remove('listening'); };
  setTimeout(function() { try { rec.stop(); } catch(e) {} }, 10000);
}

// ═══════════════════════════════════════════════════════
// CHAT FUNCTIONS
// ═══════════════════════════════════════════════════════
function sendChat() {
  var inp = document.getElementById('chatInput');
  var msg = inp.value.trim();
  if (!msg) return;
  addMsg(msg, 'user');
  inp.value = '';
  sendToGroq(msg);
}

function quickChat(type) {
  var p = {
    en: { crop: 'Which crop should I grow?', yield: 'Predict my yield', disease: 'How to detect disease?', price: 'Show market prices', season: 'What to grow this season?' },
    kn: { crop: 'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield: 'ಇಳುವರಿ ಊಹಿಸಿ', disease: 'ರೋಗ ಪತ್ತೆ ಹೇಗೆ?', price: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', season: 'ಈ ಋತುವಿನಲ್ಲಿ ಏನು ಬೆಳೆಯಬೇಕು?' },
    hi: { crop: 'कौन सी फसल उगाएं?', yield: 'उपज का अनुमान', disease: 'रोग कैसे पहचानें?', price: 'बाजार मूल्य', season: 'इस मौसम में क्या उगाएं?' },
    ml: { crop: 'ഏത് വിള വളർത്തണം?', yield: 'വിളവ് പ്രവചിക്കുക', disease: 'രോഗം എങ്ങനെ കണ്ടെത്താം?', price: 'വിപണി വില', season: 'ഈ സീസണിൽ എന്ത്?' },
    ta: { crop: 'எந்த பயிர் பயிரிட வேண்டும்?', yield: 'விளைச்சல் கணிக்கவும்', disease: 'நோயை எப்படி கண்டறிவது?', price: 'சந்தை விலை', season: 'இந்த பருவத்தில் என்ன?' },
    te: { crop: 'ఏ పంట పండించాలి?', yield: 'దిగుబడి అంచనా', disease: 'వ్యాధిని ఎలా గుర్తించాలి?', price: 'ధరలు చూపించు', season: 'ఈ సీజన్‌లో ఏమి?' }
  };
  var msg = (p[currentLanguage] && p[currentLanguage][type]) ? p[currentLanguage][type] : p.en[type];
  document.getElementById('chatInput').value = msg;
  sendChat();
}

async function sendToGroq(userMsg) {
  var tid = addTyping();
  var inp = getInputs();
  var ranked = getAllRanked(inp);
  var top3 = ranked.slice(0, 3).map(function(c) { return lcn(c.k) + ' (' + c.score.toFixed(0) + '%)'; }).join(', ');
  var langMap = { en: 'English', kn: 'Kannada', hi: 'Hindi', ml: 'Malayalam', ta: 'Tamil', te: 'Telugu' };
  var sys = 'You are JeevanMitra AI, an expert Indian agricultural assistant.\nFarmer soil: N=' + inp.n + ' P=' + inp.p + ' K=' + inp.k + ' Temp=' + inp.temp + '°C Hum=' + inp.hum + '% pH=' + inp.ph + ' Rain=' + inp.rain + 'mm\nTop crops: ' + top3 + '\nRespond in ' + (langMap[currentLanguage] || 'English') + '. Be concise (2-4 sentences), practical, helpful.';
  
  try {
    var text = await callGroq(sys + '\n\nFarmer: ' + userMsg);
    removeTyping(tid);
    var clean = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '$1').replace(/#{1,3} /g, '').replace(/\n/g, '<br>');
    addMsg(clean, 'bot');
  } catch (err) {
    removeTyping(tid);
    addMsg(localReply(userMsg) + '<br><small style="opacity:0.5;">(Add Groq API key for full AI chat)</small>', 'bot');
  }
}

function localReply(msg) {
  var m = msg.toLowerCase();
  var l = currentLanguage;
  var inp = getInputs();
  var ranked = getAllRanked(inp);
  
  if (/crop|grow|plant|recommend|ಬೆಳ|फसल|வில|పంట|wheat|rice/.test(m)) {
    var a = ranked[0], b = ranked[1], c = ranked[2];
    var replies = {
      en: '🥇 <b>' + lcn(a.k) + '</b> (' + a.score.toFixed(0) + '%)<br>🥈 <b>' + lcn(b.k) + '</b> (' + b.score.toFixed(0) + '%)<br>🥉 <b>' + lcn(c.k) + '</b> (' + c.score.toFixed(0) + '%)',
      kn: '🥇 <b>' + lcn(a.k) + '</b> (' + a.score.toFixed(0) + '%)',
      hi: '🥇 <b>' + lcn(a.k) + '</b> (' + a.score.toFixed(0) + '%)',
      ml: '🥇 <b>' + lcn(a.k) + '</b>',
      ta: '🥇 <b>' + lcn(a.k) + '</b>',
      te: '🥇 <b>' + lcn(a.k) + '</b>'
    };
    return replies[l] || replies.en;
  }
  
  if (/disease|sick|spot|ರೋಗ|रोग|நோய|వ్యాధ/.test(m)) {
    return '🔬 Upload a leaf photo in the <b>Disease Detection</b> tab. I can identify Leaf Blight, Rust, Powdery Mildew & more!';
  }
  
  if (/price|market|cost|ಬೆಲ|मूल्य|விலை|ధర/.test(m)) {
    var top5 = Object.entries(marketPrices).slice(0, 5);
    var str = top5.map(function(item) { return '• ' + lcn(item[0]) + ': ₹' + item[1].price; }).join('<br>');
    return '💰 Current prices:<br>' + str;
  }
  
  var replies = {
    en: '🌿 <b>JeevanMitra AI</b> here! Ask about crops, yield, diseases, or prices. For voice chat, use the OmniDimension button.',
    kn: '🌿 ನಮಸ್ಕಾರ! ನಾನು ಜೀವನಮಿತ್ರ AI.',
    hi: '🌿 नमस्ते! मैं जीवनमित्र AI हूं।',
    ml: '🌿 നമസ്കാരം! ഞാൻ ജീവൻമിത്ര AI.',
    ta: '🌿 வணக்கம்! நான் ஜீவன்மித்ரா AI.',
    te: '🌿 నమస్కారం! నేను జీవన్‌మిత్ర AI.'
  };
  return replies[l] || replies.en;
}

// ═══════════════════════════════════════════════════════
// CHAT UI
// ═══════════════════════════════════════════════════════
function addMsg(text, sender) {
  var c = document.getElementById('chatMessages');
  var d = document.createElement('div');
  d.className = 'chat-msg ' + sender;
  var safe = sender === 'user' ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : text;
  d.innerHTML = '<div class="chat-avatar">' + (sender === 'bot' ? '🤖' : '👨‍🌾') + '</div><div class="chat-bubble">' + safe + '</div>';
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

function addTyping() {
  var c = document.getElementById('chatMessages');
  var id = 't' + Date.now();
  var d = document.createElement('div');
  d.id = id;
  d.className = 'chat-msg bot';
  d.innerHTML = '<div class="chat-avatar">🤖</div><div class="chat-bubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
  return id;
}

function removeTyping(id) {
  var el = document.getElementById(id);
  if (el) el.remove();
}

function toggleChat() {
  isChatVisible = !isChatVisible;
  document.getElementById('chatPanel').style.display = isChatVisible ? 'flex' : 'none';
  document.getElementById('mainContainer').classList.toggle('chat-hidden', !isChatVisible);
  document.getElementById('chatFab').innerHTML = isChatVisible ? '✕' : '💬';
}
