'use strict';

/* ── GLOBAL STATE ── */
window.currentLanguage = 'en';
window.isChatVisible = true;

/* ✅ DEFINE GLOBALS ONLY HERE (IMPORTANT) */
window.GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
window.MODELS = [
'llama-3.3-70b-versatile',
'llama-3.1-8b-instant',
'gemma2-9b-it',
'llama3-8b-8192'
];
window.VISION_MODELS = [
'meta-llama/llama-4-scout-17b-16e-instruct',
'llama-3.2-11b-vision-preview',
'llama-3.2-90b-vision-preview'
];

window.KEY_STORE = 'jeevanmitra_groq_key_v2';
window._groqKey = '';

/* ── UI HELPERS ── */
function updateSlider(id) {
const el = document.getElementById(id);
const dv = document.getElementById(id + '-value');
if (el && dv) {
dv.textContent =
parseFloat(el.value) % 1 !== 0
? parseFloat(el.value).toFixed(1)
: el.value;
}
}

function updateAllSliders() {
['n','p','k','temp','hum','ph','rain','yn','yp','yk','ya'].forEach(id => {
if (document.getElementById(id)) updateSlider(id);
});
}

function resetSliders() {
const defaults = {n:50,p:50,k:50,temp:25,hum:65,ph:6.5,rain:150};
Object.entries(defaults).forEach(([id,v]) => {
const el = document.getElementById(id);
if (el) {
el.value = v;
updateSlider(id);
}
});

document.getElementById('live-preview').innerHTML = '';
document.getElementById('crop-result-area').innerHTML = '';

if (typeof livePreviewCrop === 'function') livePreviewCrop();
toast('Sliders reset');
}

/* ── TAB SWITCH ── */
function switchTab(name) {
document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

document.getElementById(`tab-${name}`)?.classList.add('active');
document.querySelector(`.tab-btn[data-tab="${name}"]`)?.classList.add('active');

if (name === 'market') {
if (typeof loadMarketPrices === 'function') loadMarketPrices();
setTimeout(() => {
if (typeof drawChart === 'function') drawChart();
}, 300);
}

if (name === 'calendar' && typeof renderCalendar === 'function') {
renderCalendar();
}
}

/* ── TOAST ── */
function toast(msg) {
const el = document.getElementById('toast');
if (!el) return;

el.textContent = msg;
el.style.display = 'block';

clearTimeout(el._t);
el._t = setTimeout(() => el.style.display = 'none', 3000);
}

/* ── CHAT TOGGLE ── */
function toggleChat() {
window.isChatVisible = !window.isChatVisible;

document.getElementById('chatPanel').style.display =
window.isChatVisible ? 'flex' : 'none';

document.getElementById('mainContainer')
.classList.toggle('chat-hidden', !window.isChatVisible);

document.getElementById('chatFab').innerHTML =
window.isChatVisible ? '✕' : '💬';
}

/* ── SPEECH ── */
function speakText(text) {
if (!('speechSynthesis' in window)) return;

speechSynthesis.cancel();

const u = new SpeechSynthesisUtterance(
text.replace(/<[^>]+>/g, '')
);

u.lang = {
en:'en-IN', kn:'kn-IN', hi:'hi-IN',
ml:'ml-IN', ta:'ta-IN', te:'te-IN'
}[window.currentLanguage] || 'en-IN';

u.rate = 0.85;

const voices = speechSynthesis.getVoices();
const best =
voices.find(v => v.lang === u.lang) ||
voices.find(v => v.lang.startsWith(window.currentLanguage));

if (best) u.voice = best;

speechSynthesis.speak(u);
}

/* ── WEATHER AUTO FILL ── */
async function fillWeather() {
if (!navigator.geolocation) {
toast('❌ Geolocation not supported');
return;
}

toast('📍 Getting location…');

navigator.geolocation.getCurrentPosition(async pos => {
try {
const {latitude, longitude} = pos.coords;

```
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation`
  );

  const d = await r.json();

  document.getElementById('temp').value =
    Math.round(d.current?.temperature_2m || 25);

  document.getElementById('hum').value =
    Math.round(d.current?.relative_humidity_2m || 65);

  document.getElementById('rain').value =
    Math.round((d.current?.precipitation || 0) * 30 + 100);

  updateAllSliders();

  if (typeof livePreviewCrop === 'function') livePreviewCrop();

  toast('🌤️ Weather data filled!');
} catch {
  toast('❌ Weather API error');
}
```

}, () => toast('❌ Location denied'));
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {

const saved = localStorage.getItem(window.KEY_STORE);

if (saved) {
window._groqKey = saved;
updateApiBar(true);
} else {
updateApiBar(false);
setTimeout(showModal, 800);
}

updateAllSliders();

if (typeof loadMarketPrices === 'function') loadMarketPrices();
if (typeof applyTranslations === 'function') applyTranslations();
if (typeof livePreviewCrop === 'function') livePreviewCrop();
if (typeof predictYield === 'function') predictYield();
if (typeof renderCalendar === 'function') renderCalendar();

console.log('🌿 JeevanMitra AI Loaded Successfully');
});

/* ── EXPOSE FUNCTIONS ── */
window.switchTab = switchTab;
window.resetSliders = resetSliders;
window.toggleChat = toggleChat;
window.speakText = speakText;
window.fillWeather = fillWeather;
