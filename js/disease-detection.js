class DiseaseDetector {
    async analyzeImage(file) {
        showLoading('🔬 AI vision analysis…');
        try {
            const base64 = await imageToBase64(file);
            const mimeType = file.type || 'image/jpeg';
            const langName = { en:'English', kn:'Kannada', hi:'Hindi', ml:'Malayalam', ta:'Tamil', te:'Telugu' }[currentLanguage] || currentLanguage;
            const prompt = `Analyze this crop leaf image for disease/pest symptoms. Respond in ${langName} (keep the disease name recognizable). ` +
                `Return ONLY this JSON, no extra text: {"disease":"name","confidence":"%","severity":"low/medium/high","symptoms":"...","treatment":"...","prevention":"...","urgency":"immediate/soon/optional"}`;
            const response = await groqAPI.analyzeImage(base64, prompt, mimeType);
            let data;
            try { const m = response.match(/\{[\s\S]*\}/); data = m ? JSON.parse(m[0]) : JSON.parse(response); }
            catch { data = { disease: 'Analysis Complete', confidence: 'N/A', severity: 'medium', symptoms: response.substring(0, 500), treatment: 'Consult local expert.', prevention: 'Maintain crop nutrition.', urgency: 'soon' }; }
            hideLoading();
            return data;
        } catch (e) { hideLoading(); showToast(`❌ ${e.message}`, 'error'); throw e; }
    }
}
const diseaseDetector = new DiseaseDetector();
function handleImageUpload(event) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!groqAPI.isConfigured()) { showToast('❌ Configure API key', 'error'); return; }
    diseaseDetector.analyzeImage(file).then(d => displayDiseaseResult(d)).catch(() => {});
}
function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
        const inp = document.getElementById('diseaseImageInput'); if (inp) inp.files = event.dataTransfer.files;
        handleImageUpload({ target: { files: [file] } });
    }
}
function displayDiseaseResult(data) {
    const up = document.getElementById('imageUploadArea'), res = document.getElementById('diseaseResultContainer');
    if (up) up.style.display = 'none'; if (res) res.style.display = 'block';
    setSafeText('diseaseName', data.disease || '—');
    setSafeText('diseaseSymptoms', data.symptoms || '—');
    setSafeText('diseaseTreatment', data.treatment || '—');
    setSafeText('diseasePrevention', data.prevention || '—');
    const sev = document.getElementById('severityLevel');
    if (sev) {
        const s = (data.severity || 'low').toLowerCase();
        sev.textContent = `Severity: ${(data.severity || '—').toUpperCase()}`;
        sev.className = `severity-badge ${s === 'high' ? 'sev-high' : s === 'medium' ? 'sev-med' : 'sev-low'}`;
    }
    speakText(data.disease, currentLanguage);
}
function resetDiseaseUpload() {
    const up = document.getElementById('imageUploadArea'), res = document.getElementById('diseaseResultContainer');
    if (up) up.style.display = ''; if (res) res.style.display = 'none';
    const inp = document.getElementById('diseaseImageInput'); if (inp) inp.value = '';
}
