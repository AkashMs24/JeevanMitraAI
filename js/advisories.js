class CropAdvisor {
    async getRecommendations(soilData) {
        if (!groqAPI.isConfigured()) { showToast('❌ Configure API key in Settings', 'error'); return { ranked: [], aiInsights: '' }; }
        showLoading('🤖 AI recommendations…');
        try {
            const ranked = getAllRanked(soilData);
            const aiInsights = await this.getAIInsights(soilData, ranked.slice(0, 5));
            hideLoading();
            return { ranked, aiInsights };
        } catch (e) { hideLoading(); showToast(`❌ ${e.message}`, 'error'); return { ranked: [], aiInsights: '' }; }
    }
    async getAIInsights(soilData, top) {
        const names = top.map(c => `${lcn(c.k)} (${c.score.toFixed(0)}%)`).join(', ');
        const prompt = `Soil: N=${soilData.n} P=${soilData.p} K=${soilData.k} pH=${soilData.ph} Temp=${soilData.temp}°C Hum=${soilData.hum}% Rain=${soilData.rain}mm Soil=${soilData.soilType}\nTop crops: ${names}\n\nProvide 4 concise paragraphs:\n1. Why these suit this soil\n2. Fertilizer schedule (NPK per ha)\n3. Irrigation tips\n4. Yield & risk outlook\nPractical for Indian farmer.`;
        return await groqAPI.chat(prompt);
    }
}
const cropAdvisor = new CropAdvisor();
async function getCropRecommendations() {
    const inputs = getInputs();
    const result = await cropAdvisor.getRecommendations(inputs);
    if (result.ranked?.length > 0) displayRecommendations(result.ranked, result.aiInsights);
}
function displayRecommendations(crops, aiInsights) {
    const c = document.getElementById('recommendationsContainer'); if (!c) return;
    let html = '';
    if (aiInsights) {
        html += `<div class="ai-box"><h4>🤖 AI Analysis</h4><p>${aiInsights.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p></div>`;
    }
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    html += '<div class="rec-grid">';
    crops.slice(0, 5).forEach((crop, i) => {
        const emoji = crop.crop?.emoji || '🌾';
        const name = lcn(crop.k);
        const season = crop.crop?.seasons?.join(', ') || '';
        const market = crop.crop?.market ? `₹${crop.crop.market}/qtl` : '';
        const marketLoc = crop.crop?.marketLoc || '';
        html += `<div class="rec-card"><div class="rec-head"><span class="rec-medal">${medals[i]}</span><span class="rec-emoji">${emoji}</span><h3>${name}</h3></div><div class="rec-badge">${crop.score.toFixed(0)}% Match</div><div class="rec-info">${season ? `<strong>Season:</strong> ${season}<br>` : ''}${market ? `<strong>Market:</strong> ${market} (${marketLoc})` : ''}</div></div>`;
    });
    html += '</div>';
    c.innerHTML = html;
}
function updatePreview() {
    setSafeText('nitrogenVal', document.getElementById('nitrogen')?.value || 0);
    setSafeText('phosphorusVal', document.getElementById('phosphorus')?.value || 0);
    setSafeText('potassiumVal', document.getElementById('potassium')?.value || 0);
    setSafeText('phVal', parseFloat(document.getElementById('soilPH')?.value || 6.5).toFixed(1));
}
