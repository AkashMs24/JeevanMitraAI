'use strict';

/* ── GLOBAL SAFE DB ── */
window.diseaseDB = window.diseaseDB || {
healthy: {
name: 'Healthy Plant',
icon: '✅',
symptoms: 'No visible issues. Plant is healthy.',
severity: 'None',
confidence: 95
},
leaf_blight: {
name: 'Leaf Blight',
icon: '⚠️',
symptoms: 'Brown spots, yellowing edges.',
severity: 'Moderate',
confidence: 87
},
rust: {
name: 'Rust Disease',
icon: '🔴',
symptoms: 'Rust-colored spots under leaves.',
severity: 'Moderate',
confidence: 82
}
};

/* ── IMAGE PREVIEW ── */
function previewImage(e) {
const file = e.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = ev => {
const box = document.getElementById('image-preview');
if (box) {
box.innerHTML = `         <img src="${ev.target.result}" 
             style="max-width:100%;max-height:200px;border-radius:8px;">
      `;
}
};
reader.readAsDataURL(file);
}

/* ── MAIN DETECTION ── */
async function detectDisease() {
const input = document.getElementById('leaf-image');
const file = input?.files?.[0];

if (!file) {
toast('❌ Upload an image first');
return;
}

const resultArea = document.getElementById('disease-result-area');

/* ── DEMO MODE ── */
if (!window._groqKey) {
const demo = Object.values(window.diseaseDB)[
Math.floor(Math.random() * 3)
];
renderDisease(demo, resultArea);
return;
}

/* ── REAL API CALL ── */
const reader = new FileReader();

reader.onload = async e => {
const base64 = e.target.result.split(',')[1];

```
try {
  const response = await fetch(window.GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window._groqKey}`
    },
    body: JSON.stringify({
      model: window.VISION_MODELS[0],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify plant disease' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) throw new Error('API failed');

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  renderDisease({
    name: 'Detected Issue',
    icon: '🔬',
    symptoms: text,
    severity: 'Moderate',
    confidence: 80
  }, resultArea);

} catch (err) {
  renderError(err.message, resultArea);
}
```

};

reader.readAsDataURL(file);
}

/* ── RENDER RESULT ── */
function renderDisease(res, area) {
if (!area) return;

area.innerHTML = `     <div class="res-card res-warning">       <h3>${res.icon} ${res.name}</h3>       <p style="font-size:0.8rem;">
        ${res.symptoms}<br><br>
        Severity: ${res.severity}<br>
        Confidence: ${res.confidence}%       </p>     </div>
  `;

if (typeof speakText === 'function') {
speakText(`${res.name} detected`);
}
}

/* ── ERROR ── */
function renderError(msg, area) {
if (!area) return;

area.innerHTML = `     <div class="res-card res-danger">       <h3>❌ Detection Failed</h3>       <p>${msg}</p>     </div>
  `;
}

/* ── DEMO BUTTON ── */
function demoDisease(type = 'healthy') {
const d = window.diseaseDB[type] || window.diseaseDB.healthy;
renderDisease(d, document.getElementById('disease-result-area'));
}

/* ── EXPOSE ── */
window.detectDisease = detectDisease;
window.previewImage = previewImage;
window.demoDisease = demoDisease;
