// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
let _groqKey = '';
let isChatVisible = true;

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
    alert('Invalid key. Groq keys start with gsk_...');
    return;
  }
  _groqKey = k;
  localStorage.setItem(KEY_STORE, k);
  closeModal();
  updateApiBar(true);
  toast('Groq AI connected!');
}

function updateApiBar(connected) {
  const bar = document.getElementById('apiBar');
  const txt = document.getElementById('apiBarText');
  bar.className = 'api-bar ' + (connected ? 'connected' : 'disconnected');
  txt.textContent = connected
    ? 'Groq AI Connected — Chat & Disease Detection Ready'
    : 'Click to enter your FREE Groq API key';
}

// ═══════════════════════════════════════════════════════
// SPEECH (for disease/crop results only)
// ═══════════════════════════════════════════════════════
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanText) return;
  const u = new SpeechSynthesisUtterance(cleanText);
  const langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' };
  u.lang = langMap[currentLanguage] || 'en-IN';
  u.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  const best = voices.find(v => v.lang === u.lang) || voices.find(v => v.lang.startsWith(u.lang.split('-')[0]));
  if (best) u.voice = best;
  speechSynthesis.speak(u);
}

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(KEY_STORE);
  if (saved) {
    _groqKey = saved;
    updateApiBar(true);
  } else {
    updateApiBar(false);
    setTimeout(showModal, 800);
  }

  document.getElementById('apiKeyInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') saveKey();
  });
  document.getElementById('apiModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  updateAllSliders();
  loadMarketPrices();
  applyTranslations();
  livePreviewCrop();
  predictYield();
  renderCalendar();

  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      console.log('Voices loaded:', speechSynthesis.getVoices().length);
    };
  }

  const wEl = document.getElementById('welcome-message');
  if (wEl) wEl.textContent = t('chat_welcome');

  console.log('JeevanMitra AI v2.0 Ready');
});

window.addEventListener('resize', () => {
  if (document.getElementById('tab-market')?.classList.contains('active')) {
    drawChart();
  }
});

window.saveKey = saveKey;
window.closeModal = closeModal;
