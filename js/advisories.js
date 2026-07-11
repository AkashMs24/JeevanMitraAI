class AdvisoryService {
    generateLocal(weatherData, soilData) {
        const advs = [];
        const temp = weatherData?.temperature || soilData?.temp || 25;
        const hum = weatherData?.humidity || soilData?.hum || 65;
        const rain = weatherData?.rainfall || soilData?.rain || 0;
        if (temp > 35) advs.push({ priority:'high', icon:'🔥', title:'Heat Alert', text:'Temperature >35°C. Increase irrigation, provide shade.' });
        else if (temp < 10) advs.push({ priority:'high', icon:'❄️', title:'Frost Warning', text:'Low temps may damage crops. Cover sensitive plants.' });
        if (hum > 85) advs.push({ priority:'med', icon:'💧', title:'High Humidity', text:'Disease risk elevated. Monitor for fungal infections.' });
        if (rain > 50) advs.push({ priority:'high', icon:'🌧️', title:'Heavy Rain', text:'Ensure drainage. Delay spraying operations.' });
        else if (rain === 0 && temp > 30) advs.push({ priority:'med', icon:'🏜️', title:'Irrigation Needed', text:'No rain + high heat. Schedule immediate irrigation.' });
        const sd = soilData || getInputs();
        if (sd.ph < 5.5) advs.push({ priority:'med', icon:'🧪', title:'Soil pH Low', text:'Apply agricultural lime (2-4 tons/ha).' });
        if (sd.n < 30) advs.push({ priority:'med', icon:'🌱', title:'Low Nitrogen', text:'Apply urea top-dress immediately.' });
        const month = new Date().getMonth();
        if (month >= 5 && month <= 9) advs.push({ priority:'low', icon:'📅', title:'Kharif Season', text:'Monsoon active — prepare for sowing.' });
        else if (month >= 10 || month <= 2) advs.push({ priority:'low', icon:'📅', title:'Rabi Season', text:'Time for wheat, mustard, rabi crops.' });
        else advs.push({ priority:'low', icon:'📅', title:'Summer', text:'Cotton, millet, pulses — ensure water.' });
        return advs;
    }
    async getAIAdvisories(location, weatherData) {
        if (!groqAPI.isConfigured()) return null;
        const langName = { en:'English', kn:'Kannada', hi:'Hindi', ml:'Malayalam', ta:'Tamil', te:'Telugu' }[currentLanguage] || currentLanguage;
        return await groqAPI.chat(`3-4 concise farming advisories for ${location || 'India'}. Temp: ${weatherData?.temperature || 'N/A'}°C, Humidity: ${weatherData?.humidity || 'N/A'}%, Rain: ${weatherData?.rainfall || 'N/A'}mm. Include pest alerts, irrigation, spraying, market tips. 1-2 sentences each. Respond in ${langName}.`);
    }
}
const advisoryService = new AdvisoryService();
async function loadAdvisories() {
    const container = document.getElementById('advisoriesContainer'); if (!container) return;
    showLoading('📢 Loading…');
    let weatherData = null;
    try { const c = await weatherService.getCoordinates(); const w = await weatherService.fetchWeather(c.latitude, c.longitude); weatherData = w?.current; } catch {}
    const soilData = getInputs();
    const local = advisoryService.generateLocal(weatherData, soilData);
    let aiText = null;
    try { const loc = document.getElementById('locationStatus')?.textContent || 'India'; aiText = await advisoryService.getAIAdvisories(loc, weatherData); } catch {}
    hideLoading();
    let html = local.map(a => `<div class="adv-card adv-${a.priority}"><span class="adv-icon">${a.icon}</span><div><div class="adv-title">${a.title}<span class="adv-badge">${a.priority.toUpperCase()}</span></div><div class="adv-text">${a.text}</div></div></div>`).join('');
    if (aiText) html += `<div class="ai-box" style="margin-top:16px"><h4>🤖 AI Advisories</h4><p>${aiText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p></div>`;
    container.innerHTML = html || '<p class="empty-state">No advisories</p>';
}
