/**
 * Market Prices — LIVE DATA
 * Fetches real-time mandi prices from data.gov.in API
 * Falls back to cropsData.js reference prices if API fails
 */
class MarketPricesService {
    constructor() {
        this.apiEndpoint = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b405fcc2f43';
        this.apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        this.cache = null;
        this.cacheTime = null;
        this.CACHE_TTL = 30 * 60 * 1000; // 30 min cache
    }
    /**
     * Fetch LIVE mandi prices from data.gov.in
     */
    async fetchLivePrices() {
        if (this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.CACHE_TTL)) {
            return this.cache;
        }
        try {
            const params = new URLSearchParams({
                'api-key': this.apiKey,
                'format': 'json',
                'limit': 200,
                'sort[created]': 'desc',
                'filters[commodity]': 'Rice,Wheat,Maize,Cotton,Sugarcane,Groundnut,Soyabean,Bajra,Jowar,Barley,Ragi,Tur Dal,Moong Dal,Chana,Onion,Potato,Tomato,Tea,Coffee,Cardamom'
            });
            const url = `${this.apiEndpoint}?${params.toString()}`;
            const res = await fetchWithRetry(url, {}, 2);
            const data = await res.json();
            if (!data?.records?.length) return this.getFallbackPrices();
            const latestPrices = {};
            data.records.forEach(record => {
                const commodity = record.commodity?.trim();
                const price = parseFloat(record.arrivals || record.modal_price || record.min_price || 0);
                const market = record.market || record.market_yard || 'Mandi';
                const state = record.state || '';
                const date = record.price_date || record.created || '';
                const minP = parseFloat(record.min_price || 0);
                const maxP = parseFloat(record.max_price || 0);
                if (commodity && price > 0 && !latestPrices[commodity]) {
                    let trend = 'stable';
                    if (minP > 0 && maxP > 0) {
                        const mid = (minP + maxP) / 2;
                        if (price > mid * 1.05) trend = 'up';
                        else if (price < mid * 0.95) trend = 'down';
                    }
                    latestPrices[commodity] = {
                        name: commodity, price, minPrice: minP, maxPrice: maxP,
                        market, state, date, trend, unit: '₹/qtl', live: true
                    };
                }
            });
            const result = Object.values(latestPrices);
            if (result.length > 0) { this.cache = result; this.cacheTime = Date.now(); return result; }
            return this.getFallbackPrices();
        } catch (e) {
            console.warn('Live market API failed:', e.message);
            return this.getFallbackPrices();
        }
    }
    getFallbackPrices() {
        if (typeof CROP_DB === 'undefined') return [];
        return Object.entries(CROP_DB).map(([key, crop]) => ({
            name: lcn(key), commodity: key, price: crop.market || 0,
            minPrice: Math.round((crop.market || 0) * 0.85),
            maxPrice: Math.round((crop.market || 0) * 1.15),
            market: crop.marketLoc || 'Mandi', state: '', date: '',
            trend: crop.trend || 'stable', unit: '₹/qtl (ref)', live: false
        }));
    }
    getAllPrices() { return this.cache || this.getFallbackPrices(); }
}
const marketPricesService = new MarketPricesService();
async function loadMarketPrices() {
    const container = document.getElementById('marketPricesContainer');
    if (!container) return;
    container.innerHTML = '<p class="empty-state">📡 Fetching live mandi prices…</p>';
    const prices = await marketPricesService.fetchLivePrices();
    if (!prices?.length) { container.innerHTML = '<p class="empty-state">No data available</p>'; return; }
    const hasLive = prices.some(p => p.live);
    let html = hasLive
        ? `<div style="margin-bottom:16px;padding:10px 16px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;font-size:13px;color:var(--primary);">📡 Live from <b>data.gov.in</b> — ${prices.length} commodities • ${new Date().toLocaleTimeString()}</div>`
        : `<div style="margin-bottom:16px;padding:10px 16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;font-size:13px;color:var(--accent);">⚠️ Reference prices — live API unavailable. Retry later.</div>`;
    html += '<div class="price-grid">';
    prices.forEach(p => {
        const tc = p.trend === 'up' ? 'trend-up' : p.trend === 'down' ? 'trend-down' : 'trend-stable';
        const icon = p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️';
        const dateStr = p.date ? new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';
        html += `<div class="price-card">
            <div class="price-top"><span class="price-emoji">${getEmoji(p.name)}</span><div><div class="price-name">${p.name}</div><div class="price-loc">📍 ${p.market}${p.state ? ', ' + p.state : ''}</div></div></div>
            <div class="price-value ${tc}">₹${Math.round(p.price)}/qtl</div>
            ${p.minPrice ? `<div style="font-size:11px;color:var(--text2);margin-top:4px">Range: ₹${p.minPrice} – ₹${p.maxPrice}</div>` : ''}
            <div class="price-trend ${tc}">${icon} ${p.trend}${dateStr ? ` • ${dateStr}` : ''}</div>
            ${!p.live ? '<div style="font-size:10px;color:var(--text2);margin-top:4px">Reference price</div>' : ''}
        </div>`;
    });
    container.innerHTML = html + '</div>';
}
function fetchMarketPrices() { loadMarketPrices(); showToast('📡 Fetching live data…', 'info'); }
function getEmoji(name) {
    const n = name.toLowerCase();
    if (/rice|paddy/.test(n)) return '🍚';
    if (/wheat/.test(n)) return '🌾';
    if (/maize|corn/.test(n)) return '🌽';
    if (/cotton/.test(n)) return '☁️';
    if (/sugar/.test(n)) return '🍬';
    if (/groundnut|peanut/.test(n)) return '🥜';
    if (/soya/.test(n)) return '🫘';
    if (/onion/.test(n)) return '🧅';
    if (/potato/.test(n)) return '🥔';
    if (/tomato/.test(n)) return '🍅';
    if (/tea/.test(n)) return '🍵';
    if (/coffee/.test(n)) return '☕';
    if (/dal|lentil|tur|moong|chana/.test(n)) return '🫘';
    if (/cardamom/.test(n)) return '🫚';
    return '🌾';
}
