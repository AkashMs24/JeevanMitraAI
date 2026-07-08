class YieldPredictor {
    calculateYield(cropKey, area, soilData) {
        if (typeof yProf === 'undefined' || !yProf[cropKey]) return null;
        const profile = yProf[cropKey];
        const crop = typeof CROP_DB !== 'undefined' ? CROP_DB[cropKey] : null;
        if (!crop) return null;
        const { n, p, k } = soilData;
        const nN = Math.min(1, n / ((crop.N[0] + crop.N[1]) / 2));
        const pN = Math.min(1, p / ((crop.P[0] + crop.P[1]) / 2));
        const kN = Math.min(1, k / ((crop.K[0] + crop.K[1]) / 2));
        const factor = (nN * profile.nS + pN * profile.pS + kN * profile.kS) / (profile.nS + profile.pS + profile.kS);
        const yieldPerHa = profile.base + (profile.peak - profile.base) * factor * 0.85;
        const totalYield = yieldPerHa * area;
        const marketPrice = crop.market || 0;
        return {
            cropKey, yieldPerHa: Math.round(yieldPerHa * 100) / 100,
            totalYield: Math.round(totalYield * 100) / 100,
            unit: profile.unit, area, marketPrice, peakYield: profile.peak,
            confidence: Math.round(factor * 85 + 15)
        };
    }
    async getAIPrediction(cropKey, area, soilData, calc) {
        if (!groqAPI.isConfigured()) return null;
        return await groqAPI.chat(`Predict yield for ${lcn(cropKey)} on ${area}ha. Soil: N=${soilData.n} P=${soilData.p} K=${soilData.k} pH=${soilData.ph}. Calc: ${calc.yieldPerHa} ${calc.unit}. Price: ₹${calc.marketPrice}/qtl.\nProvide: 1) Yield range 2) Revenue 3) Risk factors 4) 3 tips to improve.`);
    }
}
const yieldPredictorInst = new YieldPredictor();
function populateYieldCropSelect() {
    const sel = document.getElementById('yieldCropSelect'); if (!sel || typeof CROP_DB === 'undefined') return;
    sel.innerHTML = '<option value="">Select Crop…</option>';
    Object.entries(CROP_DB).forEach(([k, c]) => { sel.innerHTML += `<option value="${k}">${c.emoji} ${lcn(k)}</option>`; });
}
async function updateYieldPredictor() {
    const cropKey = document.getElementById('yieldCropSelect')?.value;
    const area = parseFloat(document.getElementById('farmArea')?.value || 1);
    const container = document.getElementById('yieldPredictionResults'); if (!container) return;
    if (!cropKey) { container.innerHTML = '<p class="empty-state">Select a crop above</p>'; return; }
    showLoading('📊 Calculating…');
    const soilData = getInputs();
    const result = yieldPredictorInst.calculateYield(cropKey, area, soilData);
    if (!result) { hideLoading(); container.innerHTML = '<p style="color:var(--danger)">Cannot calculate for this crop</p>'; return; }
    let aiTips = null;
    try { aiTips = await yieldPredictorInst.getAIPrediction(cropKey, area, soilData, result); } catch {}
    hideLoading();
    const crop = CROP_DB[cropKey];
    let html = `<div class="yield-card">
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:20px;"><span style="font-size:40px">${crop.emoji}</span><h3>${lcn(cropKey)}</h3></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div class="yield-stat green"><div class="yield-label">Yield / Ha</div><div class="yield-number green">${result.yieldPerHa}</div><div class="yield-unit">${result.unit}</div></div>
            <div class="yield-stat blue"><div class="yield-label">Total (${result.area} ha)</div><div class="yield-number blue">${result.totalYield}</div><div class="yield-unit">${result.unit}</div></div>
            <div class="yield-stat amber"><div class="yield-label">Market Price</div><div class="yield-number amber">₹${result.marketPrice}</div><div class="yield-unit">per quintal</div></div>
            <div class="yield-stat purple"><div class="yield-label">AI Confidence</div><div class="yield-number purple">${result.confidence}%</div></div>
        </div>
        <div class="yield-bar"><div class="yield-bar-fill" style="width:${(result.yieldPerHa / result.peakYield) * 100}%"></div></div>
        <div style="font-size:12px;color:var(--text2)">Peak potential: ${result.peakYield} ${result.unit}</div>
    </div>`;
    if (aiTips) html += `<div class="ai-box" style="margin-top:20px"><h4>🤖 Yield Tips</h4><p>${aiTips.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p></div>`;
    container.innerHTML = html;
}
