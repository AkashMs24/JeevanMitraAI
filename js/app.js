let currentLanguage = 'en';
let autoVoice = true;
let userLocation = getLocation();

// INIT
window.addEventListener('load', () => {
    checkApiStatus();
    initVoices();
    loadLanguage();
    updateRecommendations();
});

function checkApiStatus() {
    const statusEl = document.getElementById('statusText');
    const apiDisplay = document.getElementById('apiDisplay');
    const hasKey = groqAPI.isConfigured();
    
    if (hasKey) {
        statusEl.textContent = '🤖 AI Ready';
        statusEl.parentElement.style.color = '#10b981';
        if (apiDisplay) apiDisplay.textContent = '✅ Connected';
    } else {
        statusEl.textContent = '⚠️ Setup Needed';
        statusEl.parentElement.style.color = '#ef4444';
        if (apiDisplay) apiDisplay.textContent = '❌ Add GROQ_API_KEY to GitHub Secret';
    }
}

// TAB SWITCHING
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
}

// LOCATION
async function getLocationCoords() {
    showLoading(t('detectingLocation'));
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
            saveLocation(userLocation.lat, userLocation.lng);
            document.getElementById('locText').textContent = `📍 ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`;
            document.getElementById('locDisplay').textContent = `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`;
            hideLoading();
            toast('✅ Location updated!');
            getWeatherData();
        }, err => {
            hideLoading();
            toast('❌ Location failed');
        });
    }
}

// WEATHER
async function getWeatherData() {
    showLoading(t('fetchingWeather'));
    try {
        const weather = await weatherAPI.getWeather(userLocation.lat, userLocation.lng);
        document.getElementById('tempVal').textContent = weather.temp + '°C';
        document.getElementById('humVal').textContent = weather.humidity + '%';
        document.getElementById('rainVal').textContent = Math.round(weather.rainfall) + 'mm';
        hideLoading();
        toast('✅ Weather updated!');
        updateRecommendations();
    } catch (error) {
        hideLoading();
        toast('❌ Weather fetch failed');
    }
}

// SOIL & RECOMMENDATIONS
function updateRecommendations() {
    const n = parseInt(document.getElementById('nitrogen').value);
    const p = parseInt(document.getElementById('phosphorus').value);
    const k = parseInt(document.getElementById('potassium').value);
    const ph = parseFloat(document.getElementById('ph').value);
    
    document.getElementById('nVal').textContent = n;
    document.getElementById('pVal').textContent = p;
    document.getElementById('kVal').textContent = k;
    document.getElementById('phVal').textContent = ph;
    
    let html = '';
    const scores = [];
    
    for (const [key, crop] of Object.entries(CROPS_DATA)) {
        const score = getCropScore(key, n, p, k, ph);
        scores.push({ key, crop, score });
    }
    
    scores.sort((a, b) => b.score - a.score);
    
    scores.forEach(({ crop, score }) => {
        html += `
            <div class="rec-item">
                <strong>${crop.name} - ${score}% Match</strong>
                <p>Yield: ${crop.yield}q/ha | Price: ₹${crop.price}</p>
            </div>
        `;
    });
    
    document.getElementById('recContainer').innerHTML = html;
    speakText('Recommendations updated', currentLanguage);
}

// DISEASE DETECTION
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading(t('analyzing'));
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            if (groqAPI.isConfigured()) {
                const result = await groqAPI.diseaseAnalysis(reader.result);
                displayDisease(result);
            } else {
                displayDisease(getMockDisease());
            }
        } catch (error) {
            hideLoading();
            toast('❌ Analysis failed');
        }
    };
    reader.readAsDataURL(file);
}

function displayDisease(data) {
    document.getElementById('diseaseResult').style.display = 'block';
    document.getElementById('diseaseName').textContent = data.disease || 'Unknown';
    document.getElementById('severityBadge').textContent = data.severity || 'Low';
    document.getElementById('diseaseSymptoms').textContent = data.symptoms || '—';
    document.getElementById('diseaseTreatment').textContent = data.treatment || '—';
    hideLoading();
    toast('✅ Analysis complete!');
    speakText(data.disease, currentLanguage);
}

function getMockDisease() {
    const diseases = [
        { disease: 'Leaf Blight', severity: 'High', symptoms: 'Brown spots on leaves', treatment: 'Apply fungicide' },
        { disease: 'Powdery Mildew', severity: 'Medium', symptoms: 'White powder coating', treatment: 'Sulfur spray' },
        { disease: 'Healthy Leaf', severity: 'None', symptoms: 'No disease detected', treatment: 'Continue care' }
    ];
    return diseases[Math.floor(Math.random() * diseases.length)];
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
    showLoading(t('analyzing'));
    setTimeout(() => {
        const n = parseInt(document.getElementById('nitrogen').value);
        const p = parseInt(document.getElementById('phosphorus').value);
        const k = parseInt(document.getElementById('potassium').value);
        const score = Math.round((n + p + k) / 6);
        
        document.getElementById('scoreCircle').textContent = score + '%';
        document.getElementById('scoreFill').style.width = score + '%';
        
        let desc = '';
        if (score < 30) desc = '⚠️ Poor - needs fertilization';
        else if (score < 60) desc = '🟡 Average - balanced nutrients needed';
        else if (score < 80) desc = '🟢 Good - well-balanced';
        else desc = '✅ Excellent - optimal conditions';
        
        document.getElementById('scoreDesc').textContent = desc;
        document.getElementById('soilRec').innerHTML = `
            <div class="rec-item">
                <strong>🧪 Soil Health Assessment</strong>
                <p>${desc}</p>
            </div>
        `;
        
        hideLoading();
        toast('✅ Analysis complete!');
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
    
    const cropData = CROPS_DATA[crop];
    const yieldVal = cropData.yield * area;
    const revenue = yieldVal * cropData.price;
    
    document.getElementById('yieldResult').innerHTML = `
        <div class="rec-item">
            <strong>📊 ${cropData.name} Yield Prediction</strong>
            <p>Expected Yield: <strong>${yieldVal} quintals</strong></p>
            <p>Revenue: <strong>₹${(revenue / 100000).toFixed(2)} lakhs</strong></p>
            <p>Season: ${cropData.season}</p>
        </div>
    `;
    
    speakText(`${cropData.name}: ${yieldVal} quintals`, currentLanguage);
}

// MARKET PRICES
async function fetchMarkets() {
    showLoading('Fetching prices...');
    try {
        const prices = await marketAPI.getPrices();
        let html = '';
        
        prices.forEach(p => {
            const trendIcon = p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️';
            html += `
                <div class="market-card">
                    <div class="name">${p.name}</div>
                    <div class="price">₹${p.price}</div>
                    <div class="trend">${trendIcon} ${p.change > 0 ? '+' : ''}${p.change}%</div>
                </div>
            `;
        });
        
        document.getElementById('marketGrid').innerHTML = html;
        hideLoading();
        toast('✅ Prices updated!');
    } catch (error) {
        hideLoading();
        toast('❌ Failed to fetch prices');
    }
}

// FORECAST
async function loadForecast() {
    showLoading('Loading forecast...');
    try {
        const forecast = await weatherAPI.getForecast(userLocation.lat, userLocation.lng);
        let html = '';
        
        forecast.forEach(day => {
            html += `
                <div class="market-card">
                    <div class="name">${day.date}</div>
                    <div class="price">${day.maxTemp}°C</div>
                    <div class="trend">${day.condition}</div>
                </div>
            `;
        });
        
        document.getElementById('forecastGrid').innerHTML = html;
        hideLoading();
        toast('✅ Forecast loaded!');
    } catch (error) {
        hideLoading();
        toast('❌ Failed to load forecast');
    }
}

// ADVISORY
function loadAdvisory() {
    showLoading('Loading...');
    setTimeout(() => {
        const advisories = [
            '🚨 Pest alert: Army worms detected in nearby regions',
            '💧 Irrigation: Schedule irrigation for this week',
            '🌾 Harvest: Best time is 9-10 AM for quality grains',
            '📢 Subsidy: Government scheme available for organic farming'
        ];
        
        let html = '';
        advisories.forEach(adv => {
            html += `<div class="rec-item"><p>${adv}</p></div>`;
        });
        
        document.getElementById('advisoryContainer').innerHTML = html;
        hideLoading();
        toast('✅ Advisories loaded!');
    }, 1000);
}

// CHAT
function toggleChat() {
    const panel = document.getElementById('chatPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    addMessage(msg, 'user');
    input.value = '';
    
    showLoading('Thinking...');
    try {
        const response = await chatManager.sendMessage(msg);
        hideLoading();
        addMessage(response, 'bot');
        speakText(response, currentLanguage);
    } catch (error) {
        hideLoading();
        const fallback = chatManager.getFallbackResponse(msg);
        addMessage(fallback, 'bot');
        speakText(fallback, currentLanguage);
    }
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

// LANGUAGE
function changeLanguage(lang) {
    currentLanguage = lang;
    saveLanguage(lang);
    document.getElementById('langSelect').value = lang;
    toast('Language changed!');
}

function loadLanguage() {
    const saved = getLanguage();
    currentLanguage = saved;
    document.getElementById('langSelect').value = saved;
}

// SETTINGS
function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
    checkApiStatus();
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
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
