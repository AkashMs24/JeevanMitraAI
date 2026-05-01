// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
let marketData = [];
let marketPrices = {};

// ═══════════════════════════════════════════════════════
// MARKET PRICES
// ═══════════════════════════════════════════════════════
function loadMarketPrices() {
  const base = {
    rice:      { base: 2200,  mkt: 'Kochi',      trend: 'up' },
    wheat:     { base: 2150,  mkt: 'Delhi',       trend: 'stable' },
    maize:     { base: 1900,  mkt: 'Mumbai',      trend: 'up' },
    cotton:    { base: 6500,  mkt: 'Ahmedabad',   trend: 'up' },
    sugarcane: { base: 350,   mkt: 'Pune',        trend: 'stable' },
    millet:    { base: 2800,  mkt: 'Bangalore',   trend: 'up' },
    banana:    { base: 2500,  mkt: 'Trivandrum',  trend: 'up' },
    potato:    { base: 1800,  mkt: 'Kolkata',     trend: 'stable' },
    groundnut: { base: 5500,  mkt: 'Chennai',     trend: 'up' },
    tomato:    { base: 1500,  mkt: 'Nasik',       trend: 'down' },
    onion:     { base: 2000,  mkt: 'Lasalgaon',   trend: 'stable' },
    soybean:   { base: 4200,  mkt: 'Indore',      trend: 'up' },
    chickpea:  { base: 5000,  mkt: 'Jaipur',      trend: 'stable' },
    jowar:     { base: 2600,  mkt: 'Solapur',     trend: 'stable' },
    mustard:   { base: 5200,  mkt: 'Jaipur',      trend: 'up' },
    turmeric:  { base: 8000,  mkt: 'Erode',       trend: 'up' },
    ginger:    { base: 10000, mkt: 'Cochin',      trend: 'up' },
    coconut:   { base: 2000,  mkt: 'Trivandrum',  trend: 'stable' },
    mango:     { base: 3500,  mkt: 'Ratnagiri',   trend: 'up' },
    papaya:    { base: 1200,  mkt: 'Pune',        trend: 'stable' }
  };
  
  const tm = {
    up:     { cls: 'trend-up',     icon: '📈' },
    down:   { cls: 'trend-down',   icon: '📉' },
    stable: { cls: 'trend-stable', icon: '➡️' }
  };
  
  marketPrices = {};
  marketData = [];
  
  Object.entries(base).forEach(([c, info]) => {
    const fl = Math.random() * 0.14 - 0.06;
    const price = Math.round(info.base * (1 + fl));
    const ch = (fl * 100).toFixed(1);
    const ti = tm[info.trend] || tm.stable;
    
    marketPrices[c] = {
      price,
      mkt: info.mkt,
      trend: info.trend,
      cls: ti.cls,
      icon: ti.icon,
      ch7: (ch > 0 ? '+' : '') + ch + '%'
    };
    
    marketData.push({
      c,
      price,
      trend: info.trend,
      mkt: info.mkt,
      cls: ti.cls,
      icon: ti.icon,
      ch7: (ch > 0 ? '+' : '') + ch + '%',
      season: CROP_DB[c]?.seasons.join('/')
    });
  });
  
  renderMarket(marketData);
  document.getElementById('market-date').textContent = new Date().toLocaleString();
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
  
  const s = [...marketData].sort((a, b) => {
    if (f === 'price') return b.price - a.price;
    if (f === 'trend') {
      const o = { up: 0, stable: 1, down: 2 };
      return (o[a.trend] || 1) - (o[b.trend] || 1);
    }
    return 0;
  });
  
  renderMarket(s);
}

// ═══════════════════════════════════════════════════════
// PRICE CHART
// ═══════════════════════════════════════════════════════
function drawChart() {
  const canvas = document.getElementById('price-chart');
  if (!canvas || !Object.keys(marketPrices).length) return;
  
  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth || 600;
  const h = 260;
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  
  const crops = Object.keys(marketPrices)
    .sort((a, b) => marketPrices[b].price - marketPrices[a].price)
    .slice(0, 12);
  
  const prices = crops.map(c => marketPrices[c].price);
  const mx = Math.max(...prices);
  
  const pd = { t: 24, r: 16, b: 48, l: 60 };
  const cW = w - pd.l - pd.r;
  const cH = h - pd.t - pd.b;
  const bW = Math.min(36, cW / crops.length - 6);
  
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pd.t + cH - (i / 4) * cH;
    ctx.beginPath();
    ctx.moveTo(pd.l, y);
    ctx.lineTo(w - pd.r, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('₹' + ((mx * i / 4) / 1000).toFixed(1) + 'k', pd.l - 5, y + 4);
  }
  
  // Bars
  crops.forEach((c, i) => {
    const x = pd.l + i * (cW / crops.length) + (cW / crops.length - bW) / 2;
    const bH = (prices[i] / mx) * cH;
    const y = pd.t + cH - bH;
    const trend = marketPrices[c].trend;
    
    const g = ctx.createLinearGradient(x, y, x, pd.t + cH);
    const c1 = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#f59e0b';
    const c2 = trend === 'up' ? '#16a34a' : trend === 'down' ? '#b91c1c' : '#d97706';
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, bW, bH, [3, 3, 0, 0]);
    } else {
      ctx.rect(x, y, bW, bH);
    }
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(x + bW / 2, pd.t + cH + 6);
    ctx.rotate(-0.5);
    ctx.fillText(CROP_DB[c].emoji + ' ' + cropNames.en[c].slice(0, 7), 0, 0);
    ctx.restore();
  });
}

// ═══════════════════════════════════════════════════════
// CROP CALENDAR
// ═══════════════════════════════════════════════════════
function renderCalendar() {
  const r = document.getElementById('cal-region').value;
  const d = calData[r];
  if (!d) return;
  
  let html = `<div style="margin-bottom:0.6rem;font-size:0.82rem;color:var(--text2);">📍 ${d.title}</div>
    <table class="cal-table">
      <thead><tr>
        <th>Crop</th>
        <th class="cal-sow">🌱 Sowing</th>
        <th class="cal-harv">🌾 Harvest</th>
        <th>Notes</th>
      </tr></thead>
      <tbody>`;
  
  d.crops.forEach(({ c, sow, harv }) => {
    const db = CROP_DB[c];
    html += `<tr>
      <td><strong>${db ? db.emoji : ''} ${lcn(c)}</strong></td>
      <td class="cal-sow">${sow}</td>
      <td class="cal-harv">${harv}</td>
      <td style="font-size:0.74rem;color:var(--text3);">${db ? db.seasons.join(', ') : ''}</td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  document.getElementById('calendar-area').innerHTML = html;
}
