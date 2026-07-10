class CropAdvisor {
    async getRecommendations(soilData) {
        if (!groqAPI.isConfigured()) { showToast('❌ Configure API key', 'error'); return { ranked: [], aiInsights: '' }; }
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
        const langName = { en:'English', kn:'Kannada', hi:'Hindi', ml:'Malayalam', ta:'Tamil', te:'Telugu' }[currentLanguage] || 'English';
        return await groqAPI.chat(`Soil: N=${soilData.n} P=${soilData.p} K=${soilData.k} pH=${soilData.ph} Temp=${soilData.temp}°C Hum=${soilData.hum}% Rain=${soilData.rain}mm\nTop crops: ${names}\n\nRespond in ${langName}. 3 practical paragraphs: 1) Why these crops 2) Fertilizer plan 3) Tips to improve.`);
    }
}
const cropAdvisor = new CropAdvisor();

async function getCropRecommendations() {
    const inputs = getInputs();
    const result = await cropAdvisor.getRecommendations(inputs);
    if (result.ranked?.length > 0) {
        displayRecommendations(result.ranked, result.aiInsights);
        const top3 = result.ranked.slice(0, 3).map(c => `${lcn(c.k)} ${c.score.toFixed(0)} percent`).join(', ');
        speakText(`Your top crops are: ${top3}`, currentLanguage);
    }
}

function displayRecommendations(crops, aiInsights) {
    const c = document.getElementById('recommendationsContainer'); if (!c) return;
    let html = '';
    if (aiInsights) html += `<div class="ai-box"><h4>${t('ai_analysis') || '🤖 AI Analysis'}</h4><p>${aiInsights.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p></div>`;
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    html += '<div class="rec-grid">';
    crops.slice(0, 5).forEach((crop, i) => {
        const emoji = crop.crop?.emoji || '🌾';
        const name = lcn(crop.k);
        const season = crop.crop?.seasons?.join(', ') || '';
        const market = crop.crop?.market ? `₹${crop.crop.market}/qtl` : '';
        html += `<div class="rec-card"><div class="rec-head"><span class="rec-medal">${medals[i]}</span><span class="rec-emoji">${emoji}</span><h3>${name}</h3></div><div class="rec-badge">${crop.score.toFixed(0)}% Match</div><div class="rec-info">${season ? `<strong>Season:</strong> ${season}<br>` : ''}${market ? `<strong>Price:</strong> ${market}` : ''}</div></div>`;
    });
    c.innerHTML = html + '</div>';
}

function updatePreview() {
    setSafeText('nitrogenVal', document.getElementById('nitrogen')?.value || 0);
    setSafeText('phosphorusVal', document.getElementById('phosphorus')?.value || 0);
    setSafeText('potassiumVal', document.getElementById('potassium')?.value || 0);
    setSafeText('phVal', parseFloat(document.getElementById('soilPH')?.value || 6.5).toFixed(1));
}
