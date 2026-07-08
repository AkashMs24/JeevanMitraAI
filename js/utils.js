/**
 * Utility Functions
 */

// Cache Management
class CacheManager {
    static set(key, value, ttl) {
        const data = {
            value: value,
            expires: Date.now() + ttl
        };
        localStorage.setItem(CONFIG.STORAGE_KEYS.CACHE_PREFIX + key, JSON.stringify(data));
    }

    static get(key) {
        const item = localStorage.getItem(CONFIG.STORAGE_KEYS.CACHE_PREFIX + key);
        if (!item) return null;
        
        const data = JSON.parse(item);
        if (Date.now() > data.expires) {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CACHE_PREFIX + key);
            return null;
        }
        return data.value;
    }

    static clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CONFIG.STORAGE_KEYS.CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    }
}

// Loading UI
function showLoading(text = 'Processing with AI...') {
    const spinner = document.getElementById('loadingSpinner');
    const text_el = document.getElementById('loadingText');
    if (spinner) {
        spinner.style.display = 'flex';
        text_el.textContent = text;
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected tab
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) {
        tabEl.classList.add('active');
    }

    // Mark button as active
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
}

// Modal Management
function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'block';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

// API Key Management
function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    if (!input) return;

    const key = input.value.trim();
    if (!key) {
        showToast('❌ Please enter an API key', 'error');
        return;
    }

    try {
        groqAPI.setApiKey(key);
        showToast('✅ API key saved successfully!', 'success');
        input.value = '';
        closeSettings();
    } catch (error) {
        showToast(`❌ ${error.message}`, 'error');
    }
}

function clearApiKey() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
    document.getElementById('apiKeyInput').value = '';
    updateApiStatus(false);
    showToast('🗑️ API key cleared', 'info');
}

function clearCache() {
    CacheManager.clear();
    showToast('✅ Cache cleared', 'success');
}

function exportData() {
    const data = {
        preferences: localStorage.getItem(CONFIG.STORAGE_KEYS.PREFERENCES),
        location: localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jeevanmitra-data.json';
    a.click();
}

// Get coordinates from user
function getLocation() {
    if (!navigator.geolocation) {
        showToast('❌ Geolocation not supported', 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            localStorage.setItem(CONFIG.STORAGE_KEYS.LOCATION, JSON.stringify({ latitude, longitude }));
            document.getElementById('locationDisplay').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            showToast('✅ Location updated', 'success');
        },
        (error) => {
            showToast(`❌ ${error.message}`, 'error');
        }
    );
}

// Format values
function formatValue(value, unit) {
    return `${parseFloat(value).toFixed(1)} ${unit}`;
}

// Image to Base64
async function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Fetch with retry
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (i < retries - 1) await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}
