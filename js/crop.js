'use strict';

/* ── LIVE PREVIEW ── */
function livePreviewCrop() {
const preview = document.getElementById('live-preview');
if (!preview) return;

const n = +document.getElementById('n').value;
const p = +document.getElementById('p').value;
const k = +document.getElementById('k').value;
const temp = +document.getElementById('temp').value;
const hum = +document.getElementById('hum').value;
const ph = +document.getElementById('ph').value;
const rain = +document.getElementById('rain').value;

preview.innerHTML = `     <div class="res-card res-info">       <h3>📊 Input Summary</h3>       <p style="font-size:0.8rem;">
        N:${n} | P:${p} | K:${k}<br>
        Temp:${temp}°C | Hum:${hum}%<br>
        pH:${ph} | Rain:${rain}mm       </p>     </div>
  `;
}

/* ── CROP RECOMMENDATION ── */
function recommendCrop() {
if (!window.CROP_DB) {
console.error('CROP_DB not found');
return;
}

const n = +document.getElementById('n').value;
const p = +document.getElementById('p').value;
const k = +document.getElementById('k').value;
const temp = +document.getElementById('temp').value;
const hum = +document.getElementById('hum').value;
const ph = +document.getElementById('ph').value;
const rain = +document.getElementById('rain').value;

const results = [];

Object.entries(window.CROP_DB).forEach(([crop, data]) => {
let score = 0;

```
// NPK scoring
score += 1 - Math.abs(n - data.n) / 150;
score += 1 - Math.abs(p - data.p) / 150;
score += 1 - Math.abs(k - data.k) / 150;

// Weather scoring
score += (temp >= data.temp[0] && temp <= data.temp[1]) ? 1 : 0;
score += (hum >= data.humidity[0] && hum <= data.humidity[1]) ? 1 : 0;
score += (ph >= data.ph[0] && ph <= data.ph[1]) ? 1 : 0;
score += (rain >= data.rainfall[0] && rain <= data.rainfall[1]) ? 1 : 0;

results.push({ crop, score });
```

});

// Sort top 5
results.sort((a, b) => b.score - a.score);
const top = results.slice(0, 5);

renderCropResults(top);
}

/* ── RENDER RESULTS ── */
function renderCropResults(list) {
const area = document.getElementById('crop-result-area');
if (!area) return;

area.innerHTML = '';

list.forEach(item => {
const c = window.CROP_DB[item.crop];

```
area.innerHTML += `
  <div class="res-card res-success">
    <h3>${c.emoji} ${item.crop.toUpperCase()}</h3>
    <p style="font-size:0.8rem;">
      Score: ${item.score.toFixed(2)}<br>
      Seasons: ${c.seasons.join(', ')}<br>
      Market: ₹${c.market} (${c.marketLoc})
    </p>
  </div>
`;
```

});
}

/* ── EXPOSE ── */
window.recommendCrop = recommendCrop;
window.livePreviewCrop = livePreviewCrop;
