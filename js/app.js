let currentLanguage = 'en';
let autoVoice = true;

const CROPS = {
    wheat: { name: 'Wheat', yield: 45, price: 2100 },
    rice: { name: 'Rice', yield: 52, price: 2900 },
    corn: { name: 'Corn', yield: 60, price: 1800 }
};

// INIT
window.addEventListener('load', () => {
    checkApiStatus();
    initVoices();
});

// TAB SWITCHING
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
}

// API STATUS
function checkApiStatus() {
    const hasKey = !!window.GROQ_API_KEY;
    const statusEl = document.getElementById('statusText');
    const apiDisplay = document.getElementById('apiDisplay');
    
    if (hasKey) {
        statusEl.textContent = '🤖 AI Ready';
        if (apiDisplay) apiDisplay.textContent = '✅ Connected';
    } else {
        statusEl.textContent = '⚠️ Setup Needed';
        if (apiDisplay) apiDisplay.textContent = '❌ Add Groq key';
    }
}

// LOCATION
function getLocation() {
    showLoading('Getting location...');
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude.toFixed(2);
            const lng = pos.coords.longitude.toFixed(2);
            document.getElementById('locText').textContent = `📍 ${lat}, ${lng}`;
            document.getElementById('locDisplay').textContent = `${lat}, ${lng}`;
            hideLoading();
            toast('✅ Location updated!');
        }, err => {
            hideLoading();
            toast('❌ Location failed');
        });
    }
}

// WEATHER
function getWeather() {
    showLoading('Fetching weather...');
    setTimeout(() => {
        const temp = Math.floor(Math.random() * 15 + 20);
        const humidity = Math.floor(Math.random() * 30 + 50);
        const rainfall = Math.floor(Math.random() * 30);
        
        document.getElementById('tempVal').textContent = temp + '°C';
        document.getElementById('humVal').textContent = humidity + '%';
        document.getElementById('rainVal').textContent = rainfall + 'mm';
        
        hideLoading();
        toast('✅ Weather updated!');
        updateRec();
    }, 1000);
}

// SOIL & RECOMMENDATIONS
function updateRec() {
    const n = parseInt(document.getElementById('nitrogen').value);
    const p = parseInt(document.getElementById('phosphorus').value);
    const k = parseInt(document.getElementById('potassium').value);
    const ph = parseFloat(document.getElementById('ph').value);
    
    document.getElementById('nVal').textContent = n;
    document.getElementById('pVal').textContent = p;
    document.getElementById('kVal').textContent = k;
    document.getElementById('phVal').textContent = ph;
    
    let html = '';
    for (const [key, crop] of Object.entries(CROPS)) {
        const score = Math.min(100, Math.round((n + p + k) / 6 + Math.random() * 20));
        html += `
            <div class="rec-item">
                <strong>${crop.name} - ${score}% Match</strong>
                <p>Yield: ${crop.yield}q/ha | Price: ₹${crop.price}</p>
            </div>
        `;
    }
    document.getElementById('recContainer').innerHTML = html;
    speakText('Crop recommendations updated');
}

// DISEASE DETECTION
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading('Analyzing...');
    setTimeout(() => {
        const diseases = [
            { name: 'Leaf Blight', severity: 'High', symptoms: 'Brown spots', treatment: 'Fungicide spray' },
            { name: 'Powdery Mildew', severity: 'Medium', symptoms: 'White powder', treatment: 'Sulfur spray' },
            { name: 'Healthy', severity: 'None', symptoms: 'No disease', treatment: 'Continue care' }
        ];
        const disease = diseases[Math.floor(Math.random() * diseases.length)];
        
        document.getElementById('diseaseResult').style.display = 'block';
        document.getElementById('diseaseName').textContent = disease.name;
        document.getElementById('severityBadge').textContent = disease.severity;
        document.getElementById('diseaseSymptoms').textContent = disease.symptoms;
        document.getElementById('diseaseTreatment').textContent = disease.treatment;
        
        hideLoading();
        toast('✅ Analysis done!');
        speakText(disease.name);
    }, 2000);
}

function handleDrop(event) {
    event.preventDefault();
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

// SOIL ANALYSIS
function analyzeSoil() {
    showLoading('Analyzing...');
    setTimeout(() => {
        const n = parseInt(document.getElementById('nitrogen').value);
        const p = parseInt(document.getElementById('phosphorus').value);
        const k = parseInt(document.getElementById('potassium').value);
        const score = Math.round((n + p + k) / 6);
        
        document.getElementById('scoreCircle').textContent = score + '%';
        document.getElementById('scoreFill').style.width = score + '%';
        
        let desc = '';
        if (score < 30) desc = '⚠️ Poor - needs fertilization';
        else if (score < 60) desc = '🟡 Average - balanced needed';
        else if (score < 80) desc = '🟢 Good - well-balanced';
        else desc = '✅ Excellent - optimal';
        
        document.getElementById('scoreDesc').textContent = desc;
        document.getElementById('soilRec').innerHTML = `
            <div class="rec-item">
                <strong>🧪 Recommendation</strong>
                <p>${desc}</p>
            </div>
        `;
        
        hideLoading();
        toast('✅ Analysis done!');
    }, 1500);
}

// YIELD PREDICTION
function predictYield() {
    const crop = document.getElementById('cropSelect').value;
    const area = parseFloat(document.getElementById('farmArea').value) || 1;
    
    if (!crop) {
        document.getElementById('yieldResult').innerHTML = '<p class="empty">Select a crop</p>';
        return;
    }
    
    const cropData = CROPS[crop];
    const yield_val = cropData.yield * area;
    const revenue = yield_val * cropData.price;
    
    document.getElementById('yieldResult').innerHTML = `
        <div class="rec-item">
            <strong>📊 ${cropData.name}</strong>
            <p>Yield: <strong>${yield_val} quintals</strong></p>
            <p>Revenue: <strong>₹${(revenue / 100000).toFixed(2)} lakhs</strong></p>
        </div>
    `;
    
    speakText(`${cropData.name}: ${yield_val} quintals`);
}

// MARKET PRICES
function fetchMarkets() {
    showLoading('Fetching prices...');
    setTimeout(() => {
        const markets = [
            { name: 'Wheat', price: 2100, trend: '📈' },
            { name: 'Rice', price: 2900, trend: '📉' },
            { name: 'Cotton', price: 5500, trend: '📈' },
            { name: 'Corn', price: 1800, trend: '📈' }
        ];
        
        let html = '';
        markets.forEach(m => {
            html += `
                <div class="market-card">
                    <div class="name">${m.name}</div>
                    <div class="price">₹${m.price}</div>
                    <div class="trend">${m.trend}</div>
                </div>
            `;
        });
        
        document.getElementById('marketGrid').innerHTML = html;
        hideLoading();
        toast('✅ Prices updated!');
    }, 1500);
}

// FORECAST
function loadForecast() {
    showLoading('Loading...');
    setTimeout(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let html = '';
        
        days.forEach(day => {
            const temp = Math.floor(Math.random() * 10 + 24);
            const conditions = ['☀️ Sunny', '⛅ Cloudy', '🌧️ Rainy'];
            const condition = conditions[Math.floor(Math.random() * 3)];
            
            html += `
                <div class="market-card">
                    <div class="name">${day}</div>
                    <div class="price">${temp}°C</div>
                    <div class="trend">${condition}</div>
                </div>
            `;
        });
        
        document.getElementById('forecastGrid').innerHTML = html;
        hideLoading();
        toast('✅ Forecast loaded!');
    }, 1500);
}

// ADVISORY
function loadAdvisory() {
    showLoading('Loading...');
    setTimeout(() => {
        const advisories = [
            '🚨 Pest alert in nearby regions',
            '💧 Irrigation scheduled',
            '🌾 Best harvest time is 9-10 AM',
            '📢 Subsidy available'
        ];
        
        let html = '';
        advisories.forEach(adv => {
            html += `<div class="rec-item"><p>${adv}</p></div>`;
        });
        
        document.getElementById('advisoryContainer').innerHTML = html;
        hideLoading();
        toast('✅ Loaded!');
    }, 1500);
}

// CHAT
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
    
    setTimeout(() => {
        const responses = [
            '🌾 Wheat would be perfect for your soil!',
            '💡 Your soil looks great. Add more potassium.',
            '🌤️ Weather is favorable. Irrigate regularly.',
            '🚨 Pest risk detected. Apply preventive measures.'
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
    div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// VOICE
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
    try {
        speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn('Speech failed:', e);
    }
}

// SETTINGS
function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
    checkApiStatus();
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
}

function changeLanguage(lang) {
    currentLanguage = lang;
    toast('Language changed!');
}

// HELPERS
function showLoading(text = 'Loading...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}
