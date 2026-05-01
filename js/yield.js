'use strict';

/* ── GLOBAL SAFE YIELD DATA ── */
window.yProf = window.yProf || {
rice:      { base:4.2,  nS:0.8, pS:0.5, kS:0.6, unit:'tons/ha', peak:6.5 },
wheat:     { base:3.5,  nS:0.9, pS:0.6, kS:0.5, unit:'tons/ha', peak:5.5 },
maize:     { base:4.8,  nS:1.0, pS:0.7, kS:0.7, unit:'tons/ha', peak:8.0 },
cotton:    { base:1.8,  nS:0.6, pS:0.8, kS:0.9, unit:'tons/ha', peak:3.5 },
sugarcane: { base:65,   nS:0.7, pS:0.5, kS:0.9, unit:'tons/ha', peak:110 },
millet:    { base:2.0,  nS:0.5, pS:0.5, kS:0.4, unit:'tons/ha', peak:3.5 },
banana:    { base:28,   nS:0.8, pS:0.6, kS:1.0, unit:'tons/ha', peak:50 },
potato:    { base:20,   nS:0.7, pS:0.9, kS:0.8, unit:'tons/ha', peak:40 },
tomato:    { base:25,   nS:0.8, pS:0.8, kS:0.9, unit:'tons/ha', peak:60 }
};

/* ── MAIN FUNCTION ── */
function predictYield() {
const crop = document.getElementById('yield-crop')?.value;
if (!crop || !window.yProf[crop]) return;

const n    = +document.getElementById('yn').value;
const p    = +document.getElementById('yp').value;
const k    = +document.getElementById('yk').value;
const area = +document.getElementById('ya').value || 1;
const irrigation = +document.getElementById('irrigation')?.value || 1.1;

const pr = window.yProf[crop];

/* ── SIMPLE MODEL ── */
const npkFactor =
(n / 100) * pr.nS +
(p / 100) * pr.pS +
(k / 100) * pr.kS;

let yieldPerHa = pr.base * (0.6 + npkFactor) * irrigation;

// Cap at peak
yieldPerHa = Math.min(yieldPerHa, pr.peak);

const totalYield = yieldPerHa * area;

/* ── UI RENDER ── */
const result = document.getElementById('yield-result-area');
if (!result) return;

result.innerHTML = ` <div class="res-card res-success"> <h3>🌾 ${crop.toUpperCase()} Yield</h3> <p style="font-size:1.4rem;font-weight:700;color:var(--green);">
${yieldPerHa.toFixed(2)} ${pr.unit} </p> <p style="font-size:0.8rem;">
Total for ${area} ha: <strong>${totalYield.toFixed(2)}</strong> </p> </div>

```
<div class="res-card res-info">
  <h3>📊 Input Summary</h3>
  <p style="font-size:0.8rem;">
    N:${n} | P:${p} | K:${k}<br>
    Irrigation Factor: ${irrigation}
  </p>
</div>
```

`;

if (typeof speakText === 'function') {
speakText(`${crop} yield is approximately ${yieldPerHa.toFixed(1)} tons per hectare`);
}
}

/* ── EXPOSE ── */
window.predictYield = predictYield;
