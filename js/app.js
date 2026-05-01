// ═══════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════
var _groqKey = '';
var isChatVisible = true;

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
  var k = document.getElementById('apiKeyInput').value.trim();
  if (!k.startsWith('gsk_') || k.length < 20) {
    alert('❌ Invalid key. Groq keys start with gsk_...');
    return;
  }
  _groqKey = k;
  localStorage.setItem(KEY_STORE, k);
  closeModal();
  updateApiBar(true);
  toast('✅ Groq AI connected! Chat and disease detection active.');
}

function updateApiBar(connected) {
  var bar = document.getElementById('apiBar');
  var txt = document.getElementById('apiBarText');
  bar.className = 'api-bar ' + (connected ? 'connected' : 'disconnected');
  txt.textContent = connected
    ? '⚡ Groq AI Connected — Chat & Disease Detection Ready'
    : '🔑 Click to enter your FREE Groq API key — needed for AI chat & disease detection';
}

// ═══════════════════════════════════════════════════════
// SPEECH SYNTHESIS (for disease results & crop recs)
// ═══════════════════════════════════════════════════════
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  var cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanText) return;
  var u = new SpeechSynthesisUtterance(cleanText);
  var langMap = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', ml: 'ml-IN', ta: 'ta-IN', te: 'te-IN' };
  u.lang = langMap[currentLanguage] || 'en-IN';
  u.rate = 0.85;
  u.volume = 1;
  var voices = window.speechSynthesis.getVoices();
  var best = voices.find(function(v) { return v.lang === u.lang; }) || voices.find(function(v) { return v.lang.startsWith(u.lang.split('-')[0]); });
  if (best) u.voice = best;
  window.speechSynthesis.speak(u);
}

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Load saved API key
  var saved = localStorage.getItem(KEY_STORE);
  if (saved) {
    _groqKey = saved;
    updateApiBar(true);
  } else {
    updateApiBar(false);
    setTimeout(showModal, 800);
  }
  
  // API modal events
  document.getElementById('apiKeyInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') saveKey();
  });
  document.getElementById('apiModal').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Initialize components
  updateAllSliders();
  loadMarketPrices();
  applyTranslations();
  livePreviewCrop();
  predictYield();
  renderCalendar();
  
  // Preload voices
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = function() {
      speechSynthesis.getVoices();
      console.log('🎤 Voices loaded: ' + speechSynthesis.getVoices().length);
    };
  }
  
  // Set welcome message
  var wEl = document.getElementById('welcome-message');
  if (wEl) wEl.textContent = t('chat_welcome');
  
  // Show chat panel by default
  document.getElementById('chatPanel').style.display = 'flex';
  
  console.log('🌿 JeevanMitra AI v2.0 — Groq Chat + OmniDimension Voice');
});

// Resize handler
window.addEventListener('resize', function() {
  if (document.getElementById('tab-market') && document.getElementById('tab-market').classList.contains('active')) {
    drawChart();
  }
});

// Expose globally
window.saveKey = saveKey;
window.closeModal = closeModal;
window.speakText = speakText;
