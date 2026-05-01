/**
 * crop.js — JeevanMitra AI
 * Crop scoring engine, live preview, recommendations, soil meter
 */

'use strict';

/* ── READ SOIL INPUTS ── */
function getInputs() {
  return {
    n:    +document.getElementById('n').value,
    p:    +document.getElementById('p').value,
    k:    +document.getElementById('k').value,
    temp: +document.getElementById('temp').value,
    hum:  +document.getElementById('hum').value,
    ph:   +document.getElementById('ph').value,
    rain: +document.getElementById('rain').value
  };
}

/* ── SCORING ENGINE ── */
function scoreCrop(key, inp) {
  const db = CROP_DB[key];
  const params = [
    ['N',    inp.n,    db.N,    1.4],
    ['P',    inp.p,    db.P,    0.9],
    ['K',    inp.k,    db.K,    0.9],
    ['temp', inp.temp, db.temp, 2.0],
    ['hum',  inp.hum,  db.hum,  1.5],
    ['ph',   inp.ph,   db.ph,   1.8],
    ['rain', inp.rain, db.rain, 2.0]
  ];
  let tw = 0, ws = 0, matched = [], missed = [];
  params.forEach(([name, val, range, w]) => {
    const [iMin, iMax, aMin, aMax] = range;
    tw += w;
    let s;
    if      (val >= iMin && val <= iMax)  { s = 100; matched.push(name); }
    else if (val < aMin  || val > aMax)   { s = 0;   missed.push(name); }
    else if (val < iMin)                  { s = ((val - aMin) / (iMin - aMin)) * 70; }
    else                                  { s = 100 - ((val - iMax) / (aMax - iMax)) * 70; }
    ws += s * w;
  });
  let fs = ws / tw;
  const soil = document.getElementById('soil-type')?.value || 'any';
  if (soil !== 'any' && SOIL_BONUS[key]?.[soil]) fs = Math.min(100, fs + SOIL_BONUS[key][soil] * fs);
  return { score: fs, matched, missed };
}

function getAllRanked(inp) {
  return Object.keys(CROP_DB)
    .map(k => ({ k, ...scoreCrop(k, inp) }))
    .sort((a, b) => b.score - a.score);
}

/* ── LIVE PREVIEW (debounced) ── */
let _lvt;
function livePreviewCrop() {
  clearTimeout(_lvt);
  _lvt = setTimeout(() => {
    const inp   = getInputs();
    const top   = getAllRanked(inp)[0];
    const cls   = top.score > 70 ? 'res-success' : top.score > 45 ? 'res-warning' : 'res-danger';
    document.getElementById('live-preview').innerHTML =
      `<div class="res-card ${cls}" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;">
         <span style="font-size:0.83rem;font-weight:600;">${CROP_DB[top.k].emoji} Top match: <strong>${lcn(top.k)}</strong></span>
         <span style="font-weight:800;color:var(--green);">${top.score.toFixed(0)}%</span>
       </div>`;
  }, 80);
}

/* ── SOIL METER ── */
function soilMeter(label, val, min, max, unit = '') {
  const mid = (max - min) * 0.5 + min;
  const cls = val < mid * 0.5 ? 's-low' : val > mid * 1.5 ? 's-high' : 's-ok';
  const txt = val < mid * 0.5 ? 'Low' : val > mid * 1.5 ? 'High' : 'OK';
  return `<div class="soil-meter">
    <div class="m-label">${label}</div>
    <div class="m-val">${Number.isInteger(val) ? val : val.toFixed(1)}${unit}</div>
    <div class="m-status ${cls}">${txt}</div>
  </div>`;
}

/* ── FULL RECOMMENDATION ── */
function recommendCrop() {
  const btn = document.getElementById('recommendBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Analyzing…';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `🔮 <span data-i18n="get_recommendations">${t('get_recommendations')}</span>`;
  }, 700);

  const inp    = getInputs();
  const ranked = getAllRanked(inp);
  const top5   = ranked.slice(0, 5);
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];

  let html = `<p style="font-size:0.78rem;color:var(--text3);margin-bottom:0.6rem;">${t('top_crops')}</p>`;
  html += `<div class="soil-meters">
    ${soilMeter('N',    inp.n,    0,   140)}
    ${soilMeter('P',    inp.p,    5,   145)}
    ${soilMeter('K',    inp.k,    5,   205)}
    ${soilMeter('Temp', inp.temp, 8,   45, '°C')}
    ${soilMeter('Hum',  inp.hum,  14,  100, '%')}
    ${soilMeter('pH',   inp.ph,   3.5, 9.5)}
  </div>`;

  top5.forEach((crop, i) => {
    const db      = CROP_DB[crop.k];
    const factors = crop.matched.slice(0, 3).join(', ');
    const seasons = db.seasons.map(s => `<span class="s-tag">${s}</span>`).join(' ');
    html += `<div class="crop-card">
      <div class="crop-score">${crop.score.toFixed(0)}%</div>
      <h3>${medals[i]} ${lcn(crop.k)} ${db.emoji}</h3>
      <div class="conf-bar"><div class="conf-fill" style="width:${crop.score}%"></div></div>
      <div class="tags">
        ${factors ? `<span class="tag tag-green">✓ ${factors}</span>` : ''}
        <span class="tag">₹${db.market}/qtl</span>
        <span class="tag">${db.marketLoc}</span>
        ${seasons}
      </div>
      ${crop.missed.length ? `<p style="font-size:0.72rem;color:var(--amber);margin-top:0.4rem;">⚠️ Sub-optimal: ${crop.missed.join(', ')}</p>` : ''}
    </div>`;
  });

  const top = top5[0], db = CROP_DB[top.k];
  html += `<div class="res-card res-info" style="margin-top:0.6rem;font-size:0.8rem;">
    <strong>${t('why_recommendation')}</strong><br>
    • Temp ${inp.temp}°C → ideal ${db.temp[0]}–${db.temp[1]}°C<br>
    • Rainfall ${inp.rain}mm → ideal ${db.rain[0]}–${db.rain[1]}mm<br>
    • pH ${inp.ph} → ideal ${db.ph[0]}–${db.ph[1]}<br>
    • N ${inp.n} kg/ha → ideal ${db.N[0]}–${db.N[1]}
  </div>
  <div class="res-card res-warning" style="margin-top:0.4rem;font-size:0.79rem;">
    <strong>📋 All 20 crops ranked</strong>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.2rem;margin-top:0.35rem;">
      ${ranked.slice(0,12).map(c => `<span>${CROP_DB[c.k].emoji} ${lcn(c.k)}: <b>${c.score.toFixed(0)}%</b></span>`).join('')}
    </div>
  </div>`;

  document.getElementById('crop-result-area').innerHTML = html;
  document.querySelector('#crop-results-card > p[data-i18n]')?.style.setProperty('display','none');
  document.getElementById('crop-results-card').scrollIntoView({behavior:'smooth', block:'nearest'});
  speakText(`I recommend ${lcn(top.k)} with ${top.score.toFixed(0)} percent confidence.`);
}
