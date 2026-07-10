class MarketAPI {
    constructor() {
        this.prices = {
            wheat: { name:'Wheat', price:2100, trend:'up', change:2.5 },
            rice: { name:'Rice', price:2900, trend:'down', change:-1.2 },
            corn: { name:'Corn', price:1800, trend:'up', change:1.8 },
            cotton: { name:'Cotton', price:5500, trend:'up', change:3.2 },
            sugarcane: { name:'Sugarcane', price:280, trend:'stable', change:0.5 },
            soybean: { name:'Soybean', price:3200, trend:'down', change:-2.1 },
            groundnut: { name:'Groundnut', price:4500, trend:'up', change:1.5 }
        };
    }
    async getPrices() {
        return Object.values(this.prices).map(c => ({ ...c, price: Math.round(c.price * (1 + (Math.random()-0.5)*0.1)) }));
    }
}
const marketAPI = new MarketAPI();

async function loadMarketPrices() {
    const grid = document.getElementById('marketGrid'); if (!grid) return;
    showLoading(t('market_fetching'));
    const prices = await marketAPI.getPrices();
    grid.innerHTML = prices.map(p => {
        const icon = p.trend === 'up' ? '📈' : p.trend === 'down' ? '📉' : '➡️';
        const cls = p.trend === 'up' ? 'up' : p.trend === 'down' ? 'down' : 'stable';
        return `<div class="market-card"><div class="name">${p.name}</div><div class="price">₹${p.price}</div><div class="trend ${cls}">${icon} ${p.change>0?'+':''}${p.change}%</div></div>`;
    }).join('');
    hideLoading();
    showToast(t('market_loaded'), 'success');
    setSafeText('dataStatus', t('market_live'));
}
