// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
let _groqKey = '';

// ═══════════════════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════════════════
function showModal() {
  document.getElementById('apiModal').style.display = 'flex';
  setTimeout(() => document.getElementById('apiKeyInput').focus(), 100);
}

function closeModal() {
  document.getElementById('apiModal').style.display = 'none';
}

function saveKey() {
  const k = document.getElementById('apiKeyInput').value.trim();
  if (!k.startsWith('gsk_') || k.length < 20) {
    alert('❌ Invalid key. Groq keys start with gsk_...');
    return;
  }
  _groqKey = k;
  localStorage.setItem(KEY_STORE, k);
  closeModal();
  updateApiBar(true);
  toast('✅ Groq AI connected! Disease detection active.');
}

function updateApiBar(connected) {
  const bar = document.getElementById('apiBar');
  const txt = document.getElementById('apiBarText');
  bar.className = 'api-bar ' + (connected ? 'connected' : 'disconnected');
  txt.textContent = connected
    ? '⚡ Groq AI Connected — Disease Detection Ready  (click to change key)'
    : '🔑 Click to enter your FREE Groq API key — needed for disease detection';
}

// ═══════════════════════════════════════════════════════
// GROQ API — DIRECT (no server needed)
// ═══════════════════════════════════════════════════════
async function callGroq(prompt) {
  if (!_groqKey) throw new Error('No API key. Click the status bar to add your free Groq key.');
  const msgs = [{ role: 'user', content: prompt }];
  for (const model of MODELS) {
    try {
      const r = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _groqKey },
        body: JSON.stringify({ model, messages: msgs, max_tokens: 1024, temperature: 0.7 })
      });
      if (r.status === 429 || r.status === 503) { continue; }
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
  if (!_groqKey) throw new Error('No API key. Click the status bar to add your free Groq key.');
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
      if (r.status === 429 || r.status === 503) { continue; }
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
// SPEECH SYNTHESIS
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Load saved API key
  const saved = localStorage.getItem(KEY_STORE);
  if (saved) {
    _groqKey = saved;
    updateApiBar(true);
  } else {
    updateApiBar(false);
    setTimeout(showModal, 800);
  }
  
  // API modal event listeners
  document.getElementById('apiKeyInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') saveKey();
  });
  document.getElementById('apiModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Initialize all components
  updateAllSliders();
  loadMarketPrices();
  applyTranslations();
  livePreviewCrop();
  predictYield();
  renderCalendar();
  
  // Preload voices for speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
  
  console.log('🌿 JeevanMitra AI v2.0 — OmniDimension Voice Agent Integrated');
});

// ═══════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  if (document.getElementById('tab-market')?.classList.contains('active')) {
    drawChart();
  }
});

// ═══════════════════════════════════════════════════════
// EXPOSE TO GLOBAL SCOPE
// ═══════════════════════════════════════════════════════
window.saveKey = saveKey;
window.closeModal = closeModal;
