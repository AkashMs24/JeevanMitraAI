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
