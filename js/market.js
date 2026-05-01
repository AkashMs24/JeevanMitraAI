// Market Prices Module
let marketData = [];
let marketPrices = {};

function loadMarketPrices() {
  const base = {
    rice:{base:2200,mkt:'Kochi',trend:'up'}, wheat:{base:2150,mkt:'Delhi',trend:'stable'},
    maize:{base:1900,mkt:'Mumbai',trend:'up'}, cotton:{base:6500,mkt:'Ahmedabad',trend:'up'},
    sugarcane:{base:350,mkt:'Pune',trend:'stable'}, millet:{base:2800,mkt:'Bangalore',trend:'up'},
    banana:{base:2500,mkt:'Trivandrum',trend:'up'}, potato:{base:1800,mkt:'Kolkata',trend:'stable'},
    groundnut:{base:5500,mkt:'Chennai',trend:'up'}, tomato:{base:1500,mkt:'Nasik',trend:'down'},
    onion:{base:2000,mkt:'Lasalgaon',trend:'stable'}, soybean:{base:4200,mkt:'Indore',trend:'up'},
    chickpea:{base:5000,mkt:'Jaipur',trend:'stable'}, jowar:{base:2600,mkt:'Solapur',trend:'stable'},
    mustard:{base:5200,mkt:'Jaipur',trend:'up'}, turmeric:{base:8000,mkt:'Erode',trend:'up'},
    ginger:{base:10000,mkt:'Cochin',trend:'up'}, coconut:{base:2000,mkt:'Trivandrum',trend:'stable'},
    mango:{base:3500,mkt:'Ratnagiri',trend:'up'}, papaya:{base:1200,mkt:'Pune',trend:'stable'}
  };
  const tm = { up:{cls:'trend-up',icon:'📈'}, down:{cls:'trend-down',icon:'📉'}, stable:{cls:'trend-stable',icon:'➡️'} };
  marketPrices = {};
  marketData = [];
  Object.entries(base).forEach(([c, info]) => {
    const fl = Math.random() * 0.14 - 0.06;
    const price = Math.round(info.base * (1 + fl));
    const ch = (fl * 100).toFixed(1);
    const ti = tm[info.trend] || tm.stable;
    marketPrices[c] = { price, mkt: info.mkt, trend: info.trend, cls: ti.cls, icon: ti.icon, ch7: (ch > 0 ? '+' : '') + ch + '%' };
    marketData.push({ c, price, trend: info.trend, mkt: info.mkt, cls: ti.cls, icon: ti.icon, ch7: (ch > 0 ? '+' : '') + ch + '%', season: CROP_DB[c]?.seasons.join('/') });
  });
  renderMarket(marketData);
  const dateEl = document.getElementById('market-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleString();
  setTimeout(drawChart, 200);
}

function renderMarket(data) {
  const tb = document.getElementById('price-table-body');
  if (!tb) return;
  tb.innerHTML = '';
  data.forEach(({ c, price, mkt, cls, icon, ch7, season }) => {
    tb.innerHTML += `<tr>
      <td><strong>${CROP_DB[c].emoji} ${lcn(c)}</strong> <small style="color:var(--text3)">(${cropNames.en[c]})</small></td>
      <td><strong>₹${price.toLocaleString()}</strong></td>
      <td>${mkt}</td>
      <td class="${cls}">${icon} ${marketPrices[c].trend.toUpperCase()}</td>
      <td class="${cls}">${ch7}</td>
      <td style="color:var(--text3);font-size:0.75rem;">${season || '-'}</td>
    </tr>`;
  });
}

function sortMarketBy(f) {
  if (!marketData.length) return;
  const sorted = [...marketData].sort((a, b) => {
    if (f === 'price') return b.price - a.price;
    if (f === 'trend') { const order = { up: 0, stable: 1, down: 2 }; return (order[a.trend] || 1) - (order[b.trend] || 1); }
    return 0;
  });
  renderMarket(sorted);
}

function drawChart() {
  const canvas = document.getElementById('price-chart');
  if (!canvas || !Object.keys(marketPrices).length) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth || 600, h = 260;
  canvas.width = w; canvas.height = h; ctx.clearRect(0, 0, w, h);
  const crops = Object.keys(marketPrices).sort((a, b) => marketPrices[b].price - marketPrices[a].price).slice(0, 12);
  const prices = crops.map(c => marketPrices[c].price);
  const mx = Math.max(...prices);
  const pad = { t: 24, r: 16, b: 48, l: 60 };
  const cW = w - pad.l - pad.r, cH = h - pad.t - pad.b;
  const barW = Math.min(36, cW / crops.length - 6);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + cH - (i / 4) * cH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px monospace'; ctx.textAlign = 'right';
    ctx.fillText('₹' + ((mx * i / 4) / 1000).toFixed(1) + 'k', pad.l - 5, y + 4);
  }
  crops.forEach((c, i) => {
    const x = pad.l + i * (cW / crops.length) + (cW / crops.length - barW) / 2;
    const barH = (prices[i] / mx) * cH;
    const y = pad.t + cH - barH;
    const trend = marketPrices[c].trend;
    const grad = ctx.createLinearGradient(x, y, x, pad.t + cH);
    const c1 = trend === 'up' ? '#22c55e' : (trend === 'down' ? '#ef4444' : '#f59e0b');
    const c2 = trend === 'up' ? '#16a34a' : (trend === 'down' ? '#b91c1c' : '#d97706');
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.save(); ctx.translate(x + barW / 2, pad.t + cH + 6); ctx.rotate(-0.5);
    ctx.fillText(CROP_DB[c].emoji + ' ' + cropNames.en[c].slice(0, 7), 0, 0);
    ctx.restore();
  });
}
