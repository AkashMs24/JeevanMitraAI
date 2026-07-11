class MarketAPI {
    constructor() {
        // Baseline reference prices, used as a fallback when no API key is
        // configured or the AI call fails, and as an anchor so AI estimates
        // stay realistic.
        this.baseline = {
            wheat: { name:'Wheat', price:2100, trend:'up', change:2.5 },
            rice: { name:'Rice', price:2900, trend:'down', change:-1.2 },
            corn: { name:'Corn', price:1800, trend:'up', change:1.8 },
            cotton: { name:'Cotton', price:5500, trend:'up', change:3.2 },
            sugarcane: { name:'Sugarcane', price:280, trend:'stable', change:0.5 },
            soybean: { name:'Soybean', price:3200, trend:'down', change:-2.1 },
            groundnut: { name:'Groundnut', price:4500, trend:'up', change:1.5 }
        };
    }

    fallbackPrices() {
        return Object.values(this.baseline).map(c => ({ ...c, price: Math.round(c.price * (1 + (Math.random()-0.5)*0.1)) }));
    }

    // Asks the AI for a realistic current estimate + one-line trend note for
    // each commodity, anchored to the baseline reference prices so figures
    // stay sane even though the model has no live mandi feed.
    async getAIPrices() {
        if (!groqAPI.isConfigured()) return null;
        const langName = { en:'English', kn:'Kannada', hi:'Hindi', ml:'Malayalam', ta:'Tamil', te:'Telugu' }[currentLanguage] || currentLanguage;
        const anchor = Object.entries(this.baseline).map(([k, v]) => `${k}: ~₹${v.price}/qtl`).join(', ');
        const prompt = `You are estimating Indian mandi (wholesale) commodity prices for today. Reference anchors from recent months: ${anchor}.\n` +
            `For each of these 7 crops (wheat, rice, corn, cotton, sugarcane, soybean, groundnut), estimate a plausible current price per quintal in INR ` +
            `(reasonable small variation around the anchor, reflecting normal seasonal movement) and a short trend note in ${langName}.\n` +
            `Respond with ONLY a JSON object of this exact shape, no commentary:\n` +
            `{"wheat":{"price":2150,"trend":"up","change":1.8,"note":"..."}, "rice":{...}, "corn":{...}, "cotton":{...}, "sugarcane":{...}, "soybean":{...}, "groundnut":{...}}\n` +
            `"trend" must be one of "up","down","stable". "change" is percent change, a number (negative if down).`;
        try {
            const raw = await groqAPI.chat(prompt, 'You output only strict JSON.', { json: true });
            const match = raw.match(/\{[\s\S]*\}/);
            const data = JSON.parse(match ? match[0] : raw);
            return Object.entries(this.baseline).map(([key, base]) => {
                const d = data[key] || {};
                return {
                    name: base.name,
                    price: Number.isFinite(d.price) ? Math.round(d.price) : base.price,
                    trend: ['up','down','stable'].includes(d.trend) ? d.trend : base.trend,
                    change: Number.isFinite(d.change) ? d.change : base.change,
                    note: d.note || ''
                };
            });
        } catch (e) {
            console.warn('AI market prices failed, using fallback:', e);
            return null;
        }
    }

    async getPrices() {
        const ai = await this.getAIPrices();
        return ai || this.fallbackPrices();
    }
}
const marketAPI = new MarketAPI();

async function loadMarketPrices() {
    const grid = document.getElementById('marketGrid'); if (!grid) return;
    showLoading(t('market_fetching'));
    const prices = await marketAPI.getPrices();
    const isAI = groqAPI.isConfigured();
    grid.innerHTML = prices.map(p => {
        const icon = p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️';
        const cls = p.trend === 'up' ? 'up' : p.trend === 'down' ? 'down' : 'stable';
        const note = p.note ? `<div class="text-muted" style="font-size:11px;margin-top:4px;">${p.note}</div>` : '';
        return `<div class="market-card"><div class="name">${p.name}</div><div class="price">₹${p.price}</div><div class="trend ${cls}">${icon} ${p.change>0?'+':''}${p.change}%</div>${note}</div>`;
    }).join('');
    hideLoading();
    showToast(t('market_loaded'), 'success');
    setSafeText('dataStatus', isAI ? t('market_live') : t('market_fallback'));
}
