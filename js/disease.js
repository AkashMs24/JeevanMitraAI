// ═══════════════════════════════════════════════════════
// DISEASE DETECTION
// ═══════════════════════════════════════════════════════

function previewImage(e) {
  const f = e.target.files[0];
  if (!f) return;
  
  const r = new FileReader();
  r.onload = ev => {
    document.getElementById('image-preview').innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;margin-top:0.7rem;">`;
  };
  r.readAsDataURL(f);
}

async function detectDisease() {
  const fi = document.getElementById('leaf-image');
  
  if (!fi.files[0]) {
    toast('❌ Please upload a leaf image first');
    return;
  }
  
  if (!_groqKey) {
    toast('❌ Please add your Groq API key first');
    showModal();
    return;
  }
  
  const f = fi.files[0];
  const r = new FileReader();
  
  r.onload = async e => {
    const b64 = e.target.result.split(',')[1];
    const ra = document.getElementById('disease-result-area');
    document.querySelector('#disease-results-card > p')?.style.setProperty('display', 'none');
    
    ra.innerHTML = `<div class="res-card res-info" style="text-align:center;">
      <div style="font-size:2rem;">🧠</div>
      <p style="font-weight:600;margin-top:0.4rem;">⚡ AI Analyzing Image…</p>
      <div class="progress" style="margin-top:0.6rem;">
        <div class="progress-fill" id="dp" style="width:0%;transition:width 2s"></div>
      </div>
      <p style="font-size:0.75rem;color:var(--text3);margin-top:0.4rem;">Extracting features · Classifying · Generating report</p>
    </div>`;
    
    setTimeout(() => {
      const dp = document.getElementById('dp');
      if (dp) dp.style.width = '85%';
    }, 100);
    
    const prompt = `You are an expert plant disease detection AI. Analyze this plant/leaf image and respond ONLY with a raw JSON object (no markdown, no backticks):\n{"disease":"healthy|leaf_blight|rust|powdery_mildew|bacterial_spot|downy_mildew|other","displayName":"Human readable name","confidence":85,"severity":"None|Mild|Moderate|Severe","symptoms":"1-2 sentences","cnnFeatures":["feature1","feature2","feature3"],"treatment":["step1","step2","step3","step4"],"isHealthy":false,"icon":"emoji"}`;
    
    try {
      const text = await callGroqVision(prompt, b64, 'image/jpeg');
      let res;
      try {
        res = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        res = {
          disease: 'unknown',
          displayName: 'Analysis Incomplete',
          confidence: 60,
          severity: 'Unknown',
          symptoms: 'Could not parse result. Try a clearer leaf photo.',
          cnnFeatures: ['Image received', 'Pattern extracted', 'Uncertain result'],
          treatment: ['Use a clearer photo', 'Ensure good lighting', 'Leaf should fill frame'],
          isHealthy: false,
          icon: '⚠️'
        };
      }
      renderDisease(res, ra);
    } catch (err) {
      ra.innerHTML = `<div class="res-card res-danger"><h3>❌ Analysis Failed</h3><p style="font-size:0.82rem;">${err.message}</p></div>`;
    }
  };
  
  r.readAsDataURL(f);
}

function renderDisease(res, ra) {
  const healthy = res.isHealthy || res.disease === 'healthy';
  const cls = healthy ? 'res-success' : res.severity === 'Severe' ? 'res-danger' : 'res-warning';
  const tx = res.treatment || treatments[res.disease] || treatments.healthy;
  
  ra.innerHTML = `
    <div class="res-card ${cls}">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.4rem;align-items:start;">
        <div>
          <h3>${res.icon || '🔬'} ${res.displayName}</h3>
          <p style="font-size:0.75rem;color:var(--text3);">Confidence: ${res.confidence}%</p>
        </div>
        <span style="background:${healthy ? 'var(--green)' : res.severity === 'Severe' ? 'var(--red)' : 'var(--amber)'};color:${healthy ? '#000' : '#fff'};font-size:0.72rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:20px;">
          ${res.severity} Severity
        </span>
      </div>
      <div class="conf-bar"><div class="conf-fill" style="width:${res.confidence}%"></div></div>
      <p style="font-size:0.8rem;margin-top:0.5rem;">${res.symptoms}</p>
      ${res.cnnFeatures?.length ? `<div class="tags" style="margin-top:0.4rem;">${res.cnnFeatures.map(f => `<span class="tag">${f}</span>`).join('')}</div>` : ''}
    </div>
    <div class="res-card res-info">
      <h3>🛡️ Treatment & Prevention</h3>
      <div style="font-size:0.81rem;">
        ${tx.map((s, i) => `<p style="margin:0.25rem 0;">${i + 1}. ${s}</p>`).join('')}
      </div>
    </div>`;
  
  speakText(`${res.displayName} detected with ${res.confidence} percent confidence. Severity: ${res.severity}.`);
}

function demoDisease(type) {
  const d = diseaseDB[type];
  const ra = document.getElementById('disease-result-area');
  document.querySelector('#disease-results-card > p')?.style.setProperty('display', 'none');
  
  renderDisease({
    displayName: d.name,
    icon: d.icon,
    confidence: d.confidence,
    severity: d.severity,
    symptoms: d.symptoms,
    cnnFeatures: ['Demo mode', 'Pattern simulation', 'Local classifier'],
    treatment: treatments[type],
    isHealthy: type === 'healthy'
  }, ra);
}
