/**
 * app.js — JeevanMitra AI
 * Core state, UI utilities, API key management, voice input,
 * weather auto-fill, tab switching, random farm data
 */

'use strict';

/* ── GLOBAL STATE ── */
window.currentLanguage = 'en';
let isChatVisible = true;

const GROQ_API    = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS      = ['llama-3.3-70b-versatile','llama-3.1-8b-instant','gemma2-9b-it','llama3-8b-8192'];
const VISION_MODELS = ['meta-llama/llama-4-scout-17b-16e-instruct','llama-3.2-11b-vision-preview','llama-3.2-90b-vision-preview'];
const KEY_STORE   = 'jeevanmitra_groq_key_v2';

let _groqKey = '';

/* ═══════════════════════════════════════════════════════
   UI HELPERS
   ═══════════════════════════════════════════════════════ */

function updateSlider(id) {
  const el = document.getElementById(id);
  const dv = document.getElementById(id + '-value');
  if (el && dv) dv.textContent = parseFloat(el.value) % 1 !== 0 ? parseFloat(el.value).toFixed(1) : el.value;
}

function updateAllSliders() {
  ['n','p','k','temp','hum','ph','rain','yn','yp','yk','ya'].forEach(id => {
    const el = document.getElementById(id);
    if (el) updateSlider(id);
  });
}

function resetSliders() {
  const defaults = {n:50,p:50,k:50,temp:25,hum:65,ph:6.5,rain:150};
  Object.entries(defaults).forEach(([id,v]) => {
    const el = document.getElementById(id);
    if (el) { el.value = v; updateSlider(id); }
  });
  document.getElementById('live-preview').innerHTML = '';
  document.getElementById('crop-result-area').innerHTML = '';
  livePreviewCrop();
  toast('Sliders reset');
}

function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${name}"]`)?.classList.add('active');
  if (name === 'market')   { loadMarketPrices(); setTimeout(drawChart, 300); }
  if (name === 'calendar') { renderCalendar(); }
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display = 'none', 3000);
}

function toggleChat() {
  isChatVisible = !isChatVisible;
  document.getElementById('chatPanel').style.display = isChatVisible ? 'flex' : 'none';
  document.getElementById('mainContainer').classList.toggle('chat-hidden', !isChatVisible);
  document.getElementById('chatFab').innerHTML = isChatVisible ? '✕' : '💬';
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
  u.lang = {en:'en-IN',kn:'kn-IN',hi:'hi-IN',ml:'ml-IN',ta:'ta-IN',te:'te-IN'}[window.currentLanguage] || 'en-IN';
  u.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  const best = voices.find(v => v.lang === u.lang) || voices.find(v => v.lang.startsWith(window.currentLanguage)) || null;
  if (best) u.voice = best;
  speechSynthesis.speak(u);
}

/* ═══════════════════════════════════════════════════════
   VOICE INPUT
   ═══════════════════════════════════════════════════════ */

function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast(t('voice_not_supported')); return; }
  const rec = new SR();
  const langMap = {en:'en-IN',kn:'kn-IN',hi:'hi-IN',ml:'ml-IN',ta:'ta-IN',te:'te-IN'};
  rec.lang = langMap[window.currentLanguage] || 'en-IN';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
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
    if (e.error === 'not-allowed')          toast('❌ Microphone permission denied.');
    else if (e.error === 'no-speech')       toast('❌ No speech detected. Try again.');
    else if (e.error === 'language-not-supported') toast(`❌ ${window.currentLanguage} not supported. Try Chrome.`);
    else toast('❌ Voice error: ' + e.error);
  };
  rec.onend = () => btn.classList.remove('listening');
  setTimeout(() => { try { rec.stop(); } catch(e) {} }, 8000);
}

/* ═══════════════════════════════════════════════════════
   WEATHER AUTO-FILL
   ═══════════════════════════════════════════════════════ */

function fillWeather() {
  if (!navigator.geolocation) { toast('❌ Geolocation not supported'); return; }
  toast('📍 Getting location…');
  navigator.geolocation.getCurrentPosition(async pos => {
    const {latitude:lat, longitude:lon} = pos.coords;
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`);
      const d = await r.json();
      const temp = d.current?.temperature_2m || 25;
      const hum  = d.current?.relative_humidity_2m || 65;
      const prec = d.current?.precipitation || 0;
      document.getElementById('temp').value = Math.round(temp); updateSlider('temp');
      document.getElementById('hum').value  = Math.round(hum);  updateSlider('hum');
      document.getElementById('rain').value = Math.round(prec * 30 + 100); updateSlider('rain');
      livePreviewCrop();
      toast(t('weather_filled'));
    } catch { toast('❌ Weather API error'); }
  }, () => toast('❌ Location denied'));
}

/* Random farm preset */
function randomFarm() {
  const presets = [
    {n:80,p:45,k:40,temp:28,hum:75,ph:6.2,rain:200},
    {n:100,p:55,k:50,temp:20,hum:45,ph:7.0,rain:80},
    {n:30,p:60,k:50,temp:30,hum:45,ph:6.5,rain:65},
    {n:70,p:40,k:90,temp:25,hum:80,ph:6.0,rain:180},
    {n:50,p:80,k:60,temp:22,hum:70,ph:6.8,rain:130}
  ];
  const s = presets[Math.floor(Math.random() * presets.length)];
  Object.entries(s).forEach(([id,v]) => {
    const el = document.getElementById(id);
    if (el) { el.value = v; updateSlider(id); }
  });
  livePreviewCrop();
  toast('🎲 Random farm data loaded!');
}

/* ═══════════════════════════════════════════════════════
   GROQ API — Direct browser calls (no server needed)
   ═══════════════════════════════════════════════════════ */

async function callGroq(prompt) {
  if (!_groqKey) throw new Error('No API key. Click the status bar to add your free Groq key.');
  const msgs = [{role:'user', content:prompt}];
  for (const model of MODELS) {
    try {
      const r = await fetch(GROQ_API, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer ' + _groqKey},
        body: JSON.stringify({model, messages:msgs, max_tokens:1024, temperature:0.7})
      });
      if (r.status === 429 || r.status === 503) { continue; }
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch(e) {
      if (e.message.includes('429') || e.message.includes('503')) continue;
      throw e;
    }
  }
  throw new Error('All models rate-limited. Please wait 30 seconds.');
}

async function callGroqVision(prompt, b64, mime = 'image/jpeg') {
  if (!_groqKey) throw new Error('No API key. Click the status bar to add your free Groq key.');
  const msgs = [{role:'user', content:[
    {type:'image_url', image_url:{url:`data:${mime};base64,${b64}`}},
    {type:'text', text:prompt}
  ]}];
  for (const model of VISION_MODELS) {
    try {
      const r = await fetch(GROQ_API, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer ' + _groqKey},
        body: JSON.stringify({model, messages:msgs, max_tokens:1024, temperature:0.2})
      });
      if (r.status === 429 || r.status === 503) { continue; }
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.choices[0].message.content;
    } catch(e) {
      if (e.message.includes('429') || e.message.includes('503')) continue;
      throw e;
    }
  }
  throw new Error('Vision analysis failed. Check API key or try again.');
}

/* ═══════════════════════════════════════════════════════
   API KEY MANAGEMENT
   ═══════════════════════════════════════════════════════ */

function showModal()  { document.getElementById('apiModal').style.display = 'flex'; setTimeout(() => document.getElementById('apiKeyInput').focus(), 100); }
function closeModal() { document.getElementById('apiModal').style.display = 'none'; }

function saveKey() {
  const k = document.getElementById('apiKeyInput').value.trim();
  if (!k.startsWith('gsk_') || k.length < 20) { alert('❌ Invalid key. Groq keys start with gsk_...'); return; }
  _groqKey = k;
  localStorage.setItem(KEY_STORE, k);
  closeModal();
  updateApiBar(true);
  toast('✅ Groq AI connected! Full AI mode active.');
}

function updateApiBar(connected) {
  const bar = document.getElementById('apiBar');
  const txt = document.getElementById('apiBarText');
  bar.className = 'api-bar ' + (connected ? 'connected' : 'disconnected');
  txt.textContent = connected
    ? '⚡ Groq AI Connected — Direct API, No Server Needed  (click to change key)'
    : '🔑 Click to enter your FREE Groq API key — works directly in browser, no server needed';
}

/* ═══════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Restore saved API key
  const saved = localStorage.getItem(KEY_STORE);
  if (saved) { _groqKey = saved; updateApiBar(true); }
  else { updateApiBar(false); setTimeout(showModal, 800); }

  // Event bindings
  document.getElementById('apiKeyInput').addEventListener('keypress', e => { if (e.key === 'Enter') saveKey(); });
  document.getElementById('apiModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

  // Initial renders
  updateAllSliders();
  loadMarketPrices();
  applyTranslations();
  livePreviewCrop();
  predictYield();
  renderCalendar();

  const wEl = document.getElementById('welcome-message');
  if (wEl) wEl.textContent = t('chat_welcome');

  // Preload voices for speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  console.log('🌿 JeevanMitra AI v2.0 — Standalone, No Server, Direct Groq API');
});

window.addEventListener('resize', () => {
  if (document.getElementById('tab-market')?.classList.contains('active')) drawChart();
});

// Expose to HTML onclick handlers
window.saveKey   = saveKey;
window.closeModal = closeModal;
