'use strict';

/* ── GLOBAL STATE ── */
let marketData = [];
let marketPrices = {};

/* ── SAFE NAME HELPER (FIX FOR lcn ERROR) ── */
function getCropName(key) {
if (window.cropNames?.[window.currentLanguage]?.[key]) {
return window.cropNames[window.currentLanguage][key];
}
return window.cropNames?.en?.[key] || key;
}

/* ── LOAD MARKET DATA ── */
function loadMarketPrices() {
if (!window.CROP_DB) return;

const base = {
rice:2200, wheat:2150, maize:1900, cotton:6500,
sugarcane:350, millet:2800, banana:2500, potato:1800,
groundnut:5500, tomato:1500, onion:2000, soybean:4200
};

marketData = [];
marketPrices = {};

Object.keys(base).forEach(crop => {
const fluctuation = Math.random() * 0.2 - 0.1;
const price = Math.round(base[crop] * (1 + fluctuation));

```
const trend = fluctuation > 0 ? 'up' : (fluctuation < -0.05 ? 'down' : 'stable');

marketPrices[crop] = { price, trend };

marketData.push({
  crop,
  price,
  trend
});
```

});

renderMarket(marketData);

const dateEl = document.getElementById('market-date');
if (dateEl) dateEl.textContent = new Date().toLocaleString();

setTimeout(drawChart, 200);
}

/* ── RENDER TABLE ── */
function renderMarket(data) {
const table = document.getElementById('price-table-body');
if (!table) return;

table.innerHTML = '';

data.forEach(item => {
const db = window.CROP_DB[item.crop] || {};

```
const trendIcon =
  item.trend === 'up' ? '📈' :
  item.trend === 'down' ? '📉' : '➡️';

table.innerHTML += `
  <tr>
    <td>${db.emoji || '🌱'} ${getCropName(item.crop)}</td>
    <td>₹${item.price}</td>
    <td>${db.marketLoc || '-'}</td>
    <td>${trendIcon} ${item.trend.toUpperCase()}</td>
  </tr>
`;
```

});
}

/* ── SORTING ── */
function sortMarketBy(type) {
if (!marketData.length) return;

let sorted = [...marketData];

if (type === 'price') {
sorted.sort((a, b) => b.price - a.price);
} else if (type === 'trend') {
const order = { up: 0, stable: 1, down: 2 };
sorted.sort((a, b) => order[a.trend] - order[b.trend]);
}

renderMarket(sorted);
}

/* ── SIMPLE CHART ── */
function drawChart() {
const canvas = document.getElementById('price-chart');
if (!canvas || !marketData.length) return;

const ctx = canvas.getContext('2d');
const width = canvas.parentElement.clientWidth || 600;
const height = 250;

canvas.width = width;
canvas.height = height;

ctx.clearRect(0, 0, width, height);

const maxPrice = Math.max(...marketData.map(d => d.price));
const barWidth = width / marketData.length;

marketData.forEach((item, i) => {
const barHeight = (item.price / maxPrice) * (height - 40);

```
ctx.fillStyle =
  item.trend === 'up' ? '#22c55e' :
  item.trend === 'down' ? '#ef4444' : '#f59e0b';

ctx.fillRect(
  i * barWidth + 10,
  height - barHeight,
  barWidth - 20,
  barHeight
);

ctx.fillStyle = '#fff';
ctx.font = '10px sans-serif';
ctx.fillText(
  getCropName(item.crop).slice(0, 6),
  i * barWidth + 10,
  height - 5
);
```

});
}

/* ── EXPOSE ── */
window.loadMarketPrices = loadMarketPrices;
window.sortMarketBy = sortMarketBy;
window.drawChart = drawChart;
