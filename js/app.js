// STATE
let currentLanguage = 'en';
let autoVoice = true;
let userLocation = { lat: 13.1939, lng: 77.5941 }; // Bangalore default
let userWeather = { temp: 28, humidity: 65, rainfall: 0 };
let soilParams = { n: 50, p: 50, k: 50, ph: 6.5 };

// TRANSLATIONS
const translations = {
    en: {
        loading: 'Loading...',
        cropAdvisor: 'Crop Advisor',
        getRecommendations: 'Get Recommendations',
        analyzeSoil: 'Analyze Soil'
    },
    kn: { loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', cropAdvisor: 'ಬೆಳೆ ಸಲಹೆ' },
    hi: { loading: 'लोड हो रहा है...', cropAdvisor: 'फसल सलाहकार' },
    ml: { loading: 'ലോഡ് ചെയ്യുകയാണ്...', cropAdvisor: 'വിള ഉപദേശകൻ' },
    ta: { loading: 'வெளியேறுகிறது...', cropAdvisor: 'பயிர் ஆலோசகர்' },
    te: { loading: 'లోడ్ చేస్తున్నారు...', cropAdvisor: 'సంస్కృత సలహాదారుడు' }
};

const CROPS = {
    wheat: { name: 'Wheat', yield: 45, price: 2100, season: 'Winter' },
    rice: { name: 'Rice', yield: 52, price: 2900, season: 'Monsoon' },
    corn: { name: 'Corn', yield: 60, price: 1800, season: 'Summer' },
    cotton: { name: 'Cotton', yield: 18, price: 5500, season: 'Summer' },
    sugarcane: { name: 'Sugarcane', yield: 70, price: 280, season: 'Year-round' }
};

// ═══ INIT ═══
window.addEventListener('DOMContentLoaded', () => {
    checkApiStatus();
    initVoices();
    loadSettings();
});

// ═══ TAB SWITCHING ═══
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item')?.classList.add('active');
}

// ═══ API STATUS ═══
function checkApiStatus() {
    const hasKey = !!window.GROQ_API_KEY;
    const statusEl = document.getElementById('statusText');
    const apiDisplay = document.getElementById('apiDisplay');
    
    if (hasKey) {
        statusEl.textContent = '🤖 AI Ready';
        statusEl.parentElement.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        if (apiDisplay) apiDisplay.textContent = '✅ Connected via GitHub Secret';
    } else {
        statusEl.textContent = '⚠️ Setup Needed';
        statusEl.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        if (apiDisplay) apiDisplay.textContent = '❌ Add Groq API key to GitHub Secret';
    }
}

// ═══ LOCATION ═══
function getLocation() {
    showLoading('Detecting location...');
    
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            updateLocationDisplay();
            hideLoading();
            toast('📍 Location updated!');
        }, err => {
            console.warn(err);
            hideLoading();
            toast('❌ Location failed');
        });
    } else {
        hideLoading();
        toast('❌ Geolocation not supported');
    }
}

function updateLocationDisplay() {
    const loc = document.getElementById('locText');
    const locDisplay = document.getElementById('locDisplay');
    if (loc) loc.textContent = `📍 ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`;
    if (locDisplay) locDisplay.textContent = `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`;
}

// ═══ WEATHER ═══
function getWeather() {
    showLoading('Fetching weather...');
    
    // Mock weather data (replace with real API)
    const mockWeather = {
        temp: Math.floor(Math.random() * 35 + 15),
        humidity: Math.floor(Math.random() * 40 + 40),
        rainfall: Math.floor(Math.random() * 50)
    };
    
    userWeather = mockWeather;
    
    document.getElementById('tempVal').textContent = mockWeather.temp + '°C';
    document.getElementById('humVal').textContent = mockWeather.humidity + '%';
    document.getElementById('rainVal').textContent = mockWeather.rainfall + 'mm';
    
    hideLoading();
    toast('🌤️ Weather updated!');
    updateRecommendations();
}

// ═══ SOIL PARAMETERS ═══
function updateRecommendations() {
    soilParams = {
        n: parseInt(document.getElementById('nitrogen').value),
        p: parseInt(document.getElementById('phosphorus').value),
        k: parseInt(document.getElementById('potassium').value),
        ph: parseFloat(document.getElementById('ph').value)
    };
    
    document.getElementById('nVal').textContent = soilParams.n;
    document.getElementById('pVal').textContent = soilParams.p;
    document.getElementById('kVal').textContent = soilParams.k;
    document.getElementById('phVal').textContent = soilParams.ph;
    
    generateCropRecommendations();
}

function generateCropRecommendations() {
    const container = document.getElementById('recContainer');
    let html = '';
    
    for (const [key, crop] of Object.entries(CROPS)) {
        const score = calculateScore(key);
        const match = Math.round(score);
        
        html += `
            <div class="rec-item">
                <strong>${crop.name} - ${match}% Match</strong>
                <p>Yield: ${crop.yield}q/ha | Price: ₹${crop.price}/unit | Season: ${crop.season}</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
    speakRecommendations();
}

function calculateScore(cropType) {
    const { n, p, k, ph } = soilParams;
    let score = 50;
    
    // Simple scoring logic
    if (ph >= 6 && ph <= 8) score += 15;
    if (n > 40) score += 10;
    if (p > 40) score += 10;
    if (k > 40) score += 10;
    
    return Math.min(100, score);
}

// ═══ SOIL ANALYSIS ═══
function analyzeSoil() {
    showLoading('Analyzing soil...');
    
    const score = Math.round((soilParams.n + soilParams.p + soilParams.k) / 6);
    document.getElementById('scoreCircle').textContent = score + '%';
    document.getElementById('scoreFill').style.width = score + '%';
    
    let desc = '';
    if (score < 30) desc = '⚠️ Poor soil health - needs fertilization';
    else if (score < 60) desc = '🟡 Average soil health - balanced nutrients needed';
    else if (score < 80) desc = '🟢 Good soil health - well-balanced';
    else desc = '✅ Excellent soil health - optimal for crops';
    
    document.getElementById('scoreDesc').textContent = desc;
    
    const recommendations = document.getElementById('soilRec');
    recommendations.innerHTML = `
        <div class="rec-item">
            <strong>🧪 Soil Recommendation</strong>
            <p>NPK levels are ${score > 70 ? 'optimal' : 'need attention'}. Consider adding ${
                soilParams.n < 60 ? 'nitrogen ' : ''
            }${soilParams.p < 60 ? 'phosphorus ' : ''}${
                soilParams.k < 60 ? 'potassium' : ''
            } for better yield.</p>
        </div>
    `;
    
    hideLoading();
    toast('✅ Soil analysis complete!');
}

// ═══ DISEASE DETECTION ═══
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading('Analyzing image...');
    
    const reader = new FileReader();
    reader.onload = () => {
        // Mock disease detection
        const mockDiseases = [
            { name: 'Leaf Blight', severity: 'High', symptoms: 'Brown spots on leaves', treatment: 'Apply fungicide', prevention: 'Improve drainage' },
            { name: 'Powdery Mildew', severity: 'Medium', symptoms: 'White powder on leaves', treatment: 'Sulfur spray', prevention: 'Reduce humidity' },
            { name: 'Healthy Leaf', severity: 'None', symptoms: 'Plant is healthy', treatment: 'No action needed', prevention: 'Continue current care' }
        ];
        
        const disease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
        
        document.getElementById('diseaseResult').style.display = 'block';
        document.getElementById('diseaseName').textContent = disease.name;
        document.getElementById('severityBadge').textContent = disease.severity;
        document.getElementById('diseaseSymptoms').textContent = disease.symptoms;
        document.getElementById('diseaseTreatment').textContent = disease.treatment;
        document.getElementById('diseasePrevention').textContent = disease.prevention;
        
        hideLoading();
        toast('🔬 Analysis complete!');
        speakText(`Disease detected: ${disease.name}. ${disease.symptoms}.`);
    };
    reader.readAsDataURL(file);
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length) {
        document.getElementById('imageInput').files = files;
        handleImageUpload({ target: { files } });
    }
}

function resetDisease() {
    document.getElementById('diseaseResult').style.display = 'none';
    document.getElementById('imageInput').value = '';
}

// ═══ YIELD PREDICTION ═══
function predictYield() {
    const cropSelect = document.getElementById('cropSelect');
    const farmArea = parseFloat(document.getElementById('farmArea').value) || 1;
    const crop = cropSelect.value;
    
    if (!crop) {
        document.getElementById('yieldResult').innerHTML = '<p class="empty">Select a crop to predict</p>';
        return;
    }
    
    const cropData = CROPS[crop];
    const totalYield = cropData.yield * farmArea;
    const revenue = totalYield * cropData.price;
    
    document.getElementById('yieldResult').innerHTML = `
        <div class="rec-item">
            <strong>📊 ${cropData.name} Prediction</strong>
            <p>Expected Yield: <strong>${totalYield.toFixed(1)} quintals</strong></p>
            <p>Estimated Revenue: <strong>₹${(revenue / 100000).toFixed(2)} lakhs</strong></p>
            <p>Best Season: ${cropData.season}</p>
        </div>
    `;
    
    speakText(`${cropData.name} yield prediction: ${totalYield} quintals, revenue ${revenue} rupees`);
}

// ═══ MARKET PRICES ═══
function fetchMarkets() {
    showLoading('Fetching market prices...');
    
    const mockMarkets = [
        { name: 'Wheat', price: 2100, trend: 'up' },
        { name: 'Rice', price: 2900, trend: 'down' },
        { name: 'Cotton', price: 5500, trend: 'up' },
        { name: 'Sugarcane', price: 280, trend: 'stable' },
        { name: 'Corn', price: 1800, trend: 'up' },
        { name: 'Soybean', price: 3200, trend: 'down' }
    ];
    
    let html = '';
    mockMarkets.forEach(m => {
        const trendIcon = m.trend === 'up' ? '📈' : m.trend === 'down' ? '📉' : '➡️';
        html += `
            <div class="market-card">
                <div class="name">${m.name}</div>
                <div class="price">₹${m.price}</div>
                <div class="trend">${trendIcon} ${m.trend}</div>
            </div>
        `;
    });
    
    document.getElementById('marketGrid').innerHTML = html;
    hideLoading();
    toast('💰 Prices updated!');
}

// ═══ FORECAST ═══
function loadForecast() {
    showLoading('Loading forecast...');
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let html = '';
    
    days.forEach((day, i) => {
        const temp = Math.floor(Math.random() * 10 + 25);
        const condition = ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)];
        const icon = condition === 'Sunny' ? '☀️' : condition === 'Cloudy' ? '⛅' : '🌧️';
        
        html += `
            <div class="market-card">
                <div class="name">${day}</div>
                <div class="price">${temp}°C</div>
                <div class="trend">${icon} ${condition}</div>
            </div>
        `;
    });
    
    document.getElementById('forecastGrid').innerHTML = html;
    hideLoading();
}

// ═══ ADVISORY ═══
function loadAdvisory() {
    showLoading('Loading advisories...');
    
    const advisories = [
        '🚨 Alert: Pest attack reported in nearby regions. Use recommended pesticides.',
        '💧 Reminder: Irrigation scheduled for this week. Check water availability.',
        '🌾 Tip: Harvest wheat at 9-10 AM for better grain quality.',
        '📢 Notice: Government subsidy available for organic farming this season.'
    ];
    
    let html = '';
    advisories.forEach(adv => {
        html += `<div class="rec-item"><p>${adv}</p></div>`;
    });
    
    document.getElementById('advisoryContainer').innerHTML = html;
    hideLoading();
}

// ═══ CHAT ═══
function toggleChat() {
    const panel = document.getElementById('chatPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    addMessage(msg, 'user');
    input.value = '';
    
    // Mock AI response
    setTimeout(() => {
        const responses = [
            'Great question! Based on your soil parameters, I recommend growing wheat this season.',
            'Your soil health is good. Consider adding more potassium for better yield.',
            'The weather looks favorable for crop growth. Make sure to irrigate regularly.',
            'I see a potential pest risk in your region. Apply preventive measures now.'
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        addMessage(response, 'bot');
        speakText(response);
    }, 500);
}

function addMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerHTML = `<div class="msg-bubble">${sender === 'bot' ? '🤖 ' : '👨‍🌾 '} ${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// ═══ VOICE ═══
let voicesLoaded = false;

function initVoices() {
    if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        voicesLoaded = voices.length > 0;
    }
}

function toggleVoice() {
    autoVoice = !autoVoice;
    document.getElementById('voiceToggle').textContent = autoVoice ? '🔊' : '🔇';
    toast(autoVoice ? '🔊 Voice ON' : '🔇 Voice OFF');
}

function speakText(text) {
    if (!autoVoice || !('speechSynthesis' in window)) return;
    
    const clean = text.replace(/<[^>]+>/g, '').replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    try {
        speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn('Speech failed:', e);
    }
}

function speakRecommendations() {
    if (!autoVoice) return;
    const items = document.querySelectorAll('.rec-item strong');
    if (items.length) {
        speakText('Here are crop recommendations: ' + items[0].textContent);
    }
}

// ═══ LANGUAGE ═══
function changeLanguage(lang) {
    currentLanguage = lang;
    toast('Language changed!');
}

// ═══ SETTINGS ═══
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
    updateLocationDisplay();
    checkApiStatus();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function clearData() {
    localStorage.clear();
    toast('✅ Cache cleared!');
}

function loadSettings() {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
        userLocation = JSON.parse(saved);
        updateLocationDisplay();
    } else {
        getLocation();
    }
}

// ═══ UI HELPERS ═══
function showLoading(text = 'Loading...') {
    document.getElementById('loadingOverlay').style.display = 'flex';
    document.getElementById('loadingText').textContent = text;
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}

// Save location on change
window.addEventListener('beforeunload', () => {
    localStorage.setItem('userLocation', JSON.stringify(userLocation));
});
