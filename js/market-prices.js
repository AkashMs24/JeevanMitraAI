/**
 * Market Prices — LIVE DATA from data.gov.in
 * Fetches real mandi prices, falls back to reference data
 */

class MarketPricesService {
    constructor() {
        this.apiBase = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b405fcc2f43';
        this.apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        this.cache = null;
        this.cacheTime = null;
        this.CACHE_TTL = 30 * 60 * 1000;
    }

    async fetchLivePrices() {
        if (this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.CACHE_TTL)) return this.cache;

        try {
            // Fetch recent agricultural commodity prices — no filters, get everything
            const url = `${this.apiBase}?api-key=${this.apiKey}&format=json&limit=100&sort[created]=desc`;
            const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (!data?.records?.length) return this.getFallback();

            // Group by commodity, keep latest
            const latest = {};
            data.records.forEach(r => {
                const name = (r.commodity || r.commodity_name || '').trim();
                const price = parseFloat(r.arrivals || r.modal_price || r.min_price || 0);
                const market = r.market || r.market_yard || '';
                const state = r.state || '';
                const date = r.price_date || r.created || '';
                const minP = parseFloat(r.min_price || 0);
                const maxP = parseFloat(r.max_price || 0);

                if (!name || price <= 0 || latest[name]) return;

                let trend = 'stable';
                if (minP > 0 && maxP > 0) {
                    const mid = (minP + maxP) / 2;
                    if (price > mid * 1.05) trend = 'up';
                    else if (price < mid * 0.95) trend = 'down';
                }

                latest[name] = { name, price, minPrice: minP, maxPrice: maxP, market, state, date, trend, unit: '₹/qtl', live: true };
            });

            const result = Object.values(latest).sort((a, b) => b.price - a.price);
            if (result.length > 0) { this.cache = result; this.cacheTime = Date.now(); }
            return result.length > 0 ? result : this.getFallback();
        } catch (e) {
            console.warn('Market API error:', e.message);
            return this.getFallback();
        }
    }

    getFallback() {
        if (typeof CROP_DB === 'undefined') return [];
        return Object.entries(CROP_DB).map(([k, c]) => ({
            name: lcn(k), price: c.market || 0, minPrice: Math.round((c.market || 0) * 0.85),
            maxPrice: Math.round((c.market || 0) * 1.15), market: c.marketLoc || 'Mandi',
            state: '', date: '', trend: c.trend || 'stable', unit: '₹/qtl (ref)', live: false
        }));
    }

    getAllPrices() { return this.cache || this.getFallback(); }
}

const marketPricesService = new MarketPricesService();

async function loadMarketPrices() {
    const c = document.getElementById('marketPricesContainer');
    if (!c) return;
    c.innerHTML = `<p class="empty-state">${t('market_fetching')}</p>`;

    const prices = await marketPricesService.fetchLivePrices();
    if (!prices?.length) { c.innerHTML = '<p class="empty-state">No data</p>'; return; }

    const hasLive = prices.some(p => p.live);
    let html = hasLive
        ? `<div class="live-banner live">📡 ${t('market_live')} — ${prices.length} • ${new Date().toLocaleTimeString()}</div>`
        : `<div class="live-banner warn">${t('market_fallback')}</div>`;

    html += '<div class="price-grid">';
    prices.forEach(p => {
        const tc = p.trend === 'up' ? 'trend-up' : p.trend === 'down' ? 'trend-down' : 'trend-stable';
        const icon = p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️';
        const dt = p.date ? new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';
        html += `<div class="price-card">
            <div class="price-top"><span class="price-emoji">${getEmoji(p.name)}</span><div><div class="price-name">${p.name}</div><div class="price-loc">📍 ${p.market}${p.state ? ', ' + p.state : ''}</div></div></div>
            <div class="price-value ${tc}">₹${Math.round(p.price)}/qtl</div>
            ${p.minPrice ? `<div style="font-size:11px;color:var(--text2);margin-top:4px">Range: ₹${p.minPrice} – ₹${p.maxPrice}</div>` : ''}
            <div class="price-trend ${tc}">${icon} ${p.trend}${dt ? ` • ${dt}` : ''}</div>
            ${!p.live ? '<div style="font-size:10px;color:var(--text2);margin-top:4px">Reference</div>' : ''}
        </div>`;
    });
    c.innerHTML = html + '</div>';
}

function fetchMarketPrices() { loadMarketPrices(); showToast(t('market_loaded'), 'success'); }

function getEmoji(n) {
    n = n.toLowerCase();
    if (/rice|paddy/.test(n)) return '🍚'; if (/wheat/.test(n)) return '🌾'; if (/maize|corn/.test(n)) return '🌽';
    if (/cotton/.test(n)) return '☁️'; if (/sugar/.test(n)) return '🍬'; if (/groundnut|peanut/.test(n)) return '🥜';
    if (/soya/.test(n)) return '🫘'; if (/onion/.test(n)) return '🧅'; if (/potato/.test(n)) return '🥔';
    if (/tomato/.test(n)) return '🍅'; if (/tea/.test(n)) return '🍵'; if (/coffee/.test(n)) return '☕';
    if (/dal|lentil|tur|moong|chana/.test(n)) return '🫘'; if (/cardamom/.test(n)) return '🫚';
    return '🌾';
}
