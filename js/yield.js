/**
 * yield.js — JeevanMitra AI
 * Crop yield prediction model with NPK and irrigation factors
 */

'use strict';

/* ── YIELD PROFILES ── */
const yProf = {
  rice:      {base:4.2,  nS:0.8, pS:0.5, kS:0.6, unit:'tons/ha',   peak:6.5},
  wheat:     {base:3.5,  nS:0.9, pS:0.6, kS:0.5, unit:'tons/ha',   peak:5.5},
  maize:     {base:4.8,  nS:1.0, pS:0.7, kS:0.7, unit:'tons/ha',   peak:8.0},
  cotton:    {base:1.8,  nS:0.6, pS:0.8, kS:0.9, unit:'tons/ha',   peak:3.5},
  sugarcane: {base:65,   nS:0.7, pS:0.5, kS:0.9, unit:'tons/ha',   peak:110},
  millet:    {base:2.0,  nS:0.5, pS:0.5, kS:0.4, unit:'tons/ha',   peak:3.5},
  banana:    {base:28,   nS:0.8, pS:0.6, kS:1.0, unit:'tons/ha',   peak:50},
  potato:    {base:20,   nS:0.7, pS:0.9, kS:0.8, unit:'tons/ha',   peak:40},
  groundnut: {base:2.2,  nS:0.3, pS:0.7, kS:0.5, unit:'tons/ha',   peak:3.8},
  tomato:    {base:25,   nS:0.8, pS:0.8, kS:0.9, unit:'tons/ha',   peak:60},
  onion:     {base:18,   nS:0.7, pS:0.7, kS:0.8, unit:'tons/ha',   peak:35},
  soybean:   {base:1.8,  nS:0.3, pS:0.7, kS:0.5, unit:'tons/ha',   peak:3.2},
  chickpea:  {base:1.2,  nS:0.3, pS:0.7, kS:0.4, unit:'tons/ha',   peak:2.2},
  jowar:     {base:2.0,  nS:0.6, pS:0.5, kS:0.5, unit:'tons/ha',   peak:3.5},
  mustard:   {base:1.5,  nS:0.8, pS:0.6, kS:0.4, unit:'tons/ha',   peak:2.5},
  turmeric:  {base:15,   nS:0.6, pS:0.7, kS:0.9, unit:'tons/ha',   peak:30},
  ginger:    {base:12,   nS:0.6, pS:0.6, kS:0.9, unit:'tons/ha',   peak:25},
  coconut:   {base:8000, nS:0.5, pS:0.5, kS:0.9, unit:'nuts/ha',   peak:15000},
  mango:     {base:8,    nS:0.5, pS:0.5, kS:0.6, unit:'tons/ha',   peak:20},
  papaya:    {base:30,   nS:0.7, pS:0.6, kS:0.8, unit:'tons/ha',   peak:75}
};

/* ── PREDICTION ENGINE ── */
function predictYield() {
  const crop = document.getElementById('yield-crop').value;
  const n    = +document.getElementById('yn').value;
  const p    = +document.getElementById('yp').value;
  const k    = +document.getElementById('yk').value;
  const area = +document.getElementById('ya').value || 1;
  const iF   = +document.getElementById('irrigation').value || 1.15;

  const pr = yProf[crop];
  if (!pr) return;

  const ts = pr.nS + pr.pS + pr.kS;
  const nF = Math.min(1, 0.4 + (n / 140) * 0.7) * pr.nS;
  const pF = Math.min(1, 0.4 + (p / 145) * 0.7) * pr.pS;
  const kF = Math.min(1, 0.4 + (k / 205) * 0.7) * pr.kS;

  const pred  = Math.min(pr.peak, pr.base * (0.6 + ((nF + pF + kF) / ts) * 0.8) * iF);
  const total = pred * area;
  const pct   = ((pred / pr.peak) * 100).toFixed(0);

  const db     = CROP_DB[crop];
  const isNuts = pr.unit === 'nuts/ha';
  const rev    = isNuts
    ? (total * (db.market / 100)).toLocaleString('en-IN')
    : (total * 10 * db.market).toLocaleString('en-IN');

  // Optimisation tips
  const tips = [];
  if (n < 60)   tips.push('⚠️ Increase nitrogen (e.g. Urea 45%)');
  if (p < 40)   tips.push('⚠️ Add phosphatic fertilizer (DAP)');
  if (k < 40)   tips.push('⚠️ Apply potash fertilizer (MOP)');
  if (iF < 1.15) tips.push('💧 Consider drip/sprinkler irrigation');
  if (!tips.length) tips.push('✅ Nutrient levels are well balanced!');

  const resArea = document.getElementById('yield-result-area');
  resArea.innerHTML = `
    <div class="res-card res-success">
      <h3>🌱 ${lcn(crop)} ${db.emoji} Yield Estimate</h3>
      <div style="font-size:2rem;font-weight:800;color:var(--green);margin:0.4rem 0;">
        ${isNuts ? Math.round(total).toLocaleString() : pred.toFixed(2)}
        <span style="font-size:0.85rem;font-weight:400;">${pr.unit}</span>
      </div>
      ${!isNuts ? `<p style="font-size:0.8rem;color:var(--text2);">Total for ${area} ha: <strong>${total.toFixed(2)} tons</strong></p>` : ''}
      <div style="margin-top:0.6rem;">
        <div style="font-size:0.73rem;color:var(--text3);margin-bottom:0.2rem;">Yield efficiency: ${pct}% of peak</div>
        <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
    </div>
    <div class="res-card res-info">
      <h3>💰 Revenue Estimate</h3>
      <p style="font-size:0.82rem;">
        Market: <strong>₹${db.market}${isNuts ? '/100 nuts' : '/quintal'}</strong> (${db.marketLoc})<br>
        Revenue: <strong>₹${rev}</strong><br>
        <span style="color:var(--text3);font-size:0.75rem;">Seasons: ${db.seasons.join(', ')}</span>
      </p>
    </div>
    <div class="res-card ${tips[0].includes('⚠️') || tips[0].includes('💧') ? 'res-warning' : 'res-success'}">
      <h3>${t('optimization_tips')}</h3>
      <div style="font-size:0.81rem;">${tips.map(tp => `<p style="margin:0.2rem 0;">${tp}</p>`).join('')}</div>
    </div>`;

  document.querySelector('#yield-results-card > p')?.style.setProperty('display','none');
}
