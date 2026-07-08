class SoilAnalyzer {
    calculateHealthScore(soilData) {
        const { n, p, k, ph } = soilData;
        let score = 0;
        score += (n >= 40 && n <= 80) ? 25 : (n >= 20 && n < 40) ? 15 : (n > 80 && n <= 120) ? 18 : 8;
        score += (p >= 25 && p <= 50) ? 25 : (p >= 15 && p < 25) ? 15 : (p > 50 && p <= 80) ? 18 : 8;
        score += (k >= 30 && k <= 60) ? 25 : (k >= 15 && k < 30) ? 15 : (k > 60 && k <= 100) ? 18 : 8;
        score += (ph >= 6.0 && ph <= 7.5) ? 25 : (ph >= 5.5 && ph < 6.0) ? 15 : (ph > 7.5 && ph <= 8.5) ? 15 : 5;
        return Math.min(score, 100);
    }
    getRecommendations(soilData) {
        const recs = [];
        const { n, p, k, ph } = soilData;
        recs.push(n < 40 ? { icon: '⚠️', text: 'Nitrogen low — apply Urea (46-0-0) at 50-80 kg/ha', type: 'warn' } : n > 100 ? { icon: 'ℹ️', text: 'Nitrogen high — reduce fertilizer', type: 'info' } : { icon: '✅', text: 'Nitrogen is optimal', type: 'ok' });
        recs.push(p < 25 ? { icon: '⚠️', text: 'Phosphorus low — apply DAP/SSP at 40-60 kg/ha', type: 'warn' } : p > 60 ? { icon: 'ℹ️', text: 'Phosphorus adequate', type: 'info' } : { icon: '✅', text: 'Phosphorus is optimal', type: 'ok' });
        recs.push(k < 30 ? { icon: '⚠️', text: 'Potassium low — apply MOP (0-0-60) at 40-60 kg/ha', type: 'warn' } : { icon: '✅', text: 'Potassium is adequate', type: 'ok' });
        recs.push(ph < 5.5 ? { icon: '⚠️', text: 'Soil acidic — apply lime 2-4 tons/ha', type: 'warn' } : ph > 8.0 ? { icon: '⚠️', text: 'Soil alkaline — apply gypsum', type: 'warn' } : { icon: '✅', text: 'pH is optimal', type: 'ok' });
        return recs;
    }
}
const soilAnalyzer = new SoilAnalyzer();
function analyzeSoil() {
    const inputs = getInputs();
    const score = soilAnalyzer.calculateHealthScore(inputs);
    const recs = soilAnalyzer.getRecommendations(inputs);
    setSafeText('soilHealthScore', `${score}/100`);
    const bar = document.getElementById('scoreBar'); if (bar) bar.style.width = `${score}%`;
    const desc = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement';
    setSafeText('soilHealthDesc', desc);
    // Nutrient bars
    const chart = document.getElementById('soilNutrientChart');
    if (chart) {
        const nutrients = [
            { name: 'Nitrogen (N)', value: inputs.n, max: 200, opt: [40, 80] },
            { name: 'Phosphorus (P)', value: inputs.p, max: 150, opt: [25, 50] },
            { name: 'Potassium (K)', value: inputs.k, max: 200, opt: [30, 60] },
            { name: 'pH Level', value: inputs.ph, max: 9.5, opt: [6.0, 7.5] }
        ];
        let html = '';
        nutrients.forEach(n => {
            const pct = (n.value / n.max) * 100;
            const ok = n.value >= n.opt[0] && n.value <= n.opt[1];
            const color = ok ? 'var(--primary)' : n.value < n.opt[0] ? 'var(--danger)' : 'var(--accent)';
            html += `<div class="nutrient-bar"><div class="nutrient-header"><span>${n.name}</span><span style="color:${color}">${n.value}${n.name.includes('pH') ? '' : ' mg/kg'}</span></div><div class="nutrient-track"><div class="nutrient-fill" style="width:${pct}%;background:${color}"></div></div><div class="nutrient-hint">Optimal: ${n.opt[0]}–${n.opt[1]}${n.name.includes('pH') ? '' : ' mg/kg'}</div></div>`;
        });
        chart.innerHTML = html;
    }
    // Recs
    const rc = document.getElementById('soilRecommendations');
    if (rc) {
        rc.innerHTML = recs.map(r => `<div class="rec-item rec-${r.type}"><span style="font-size:20px">${r.icon}</span><span>${r.text}</span></div>`).join('');
    }
}
