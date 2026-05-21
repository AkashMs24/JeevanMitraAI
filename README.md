<div align="center">

# JeevanMitra AI

### Smart Farming Companion for Indian Farmers

[![Live App](https://img.shields.io/badge/Live%20App-GitHub%20Pages-2d6a4f?style=flat-square&logo=github&logoColor=white)](https://akashms24.github.io/JeevanMitraAI/)
[![Hackathon](https://img.shields.io/badge/FUSIONX%202026-Best%20AI%20Innovation%20for%20Social%20Impact-gold?style=flat-square)](https://akashms24.github.io/JeevanMitraAI/)
![AI](https://img.shields.io/badge/AI-Groq%20LLM-purple?style=flat-square)
![Languages](https://img.shields.io/badge/Languages-6%20Indian-brightgreen?style=flat-square)

</div>

---

## What this is

A browser-based AI farming companion built in 48 hours for the FUSIONX 2026
hackathon — won **Best AI Innovation for Social Impact.**

No backend. No install. No cost. Works on a ₹2000 phone.

---

## The problem

India's 150 million smallholder farmers make daily decisions — which crop to
plant, when to sell, how to treat disease outbreaks — with little to no
data-driven support. Most AI tools require English, stable internet, and
structured inputs. Farmers have none of these.

---

## What it does

| Feature | Description |
|---|---|
| Crop Advisor | Enter soil nutrients, rainfall, pH — get AI crop recommendation |
| Yield Forecaster | Predict harvest in tons/hectare before planting |
| Disease Detection | Upload leaf photo — get instant diagnosis and treatment |
| Live Market Prices | Real-time prices for 20+ crops across major Indian markets |
| Crop Calendar | Region-specific sowing and harvest guides |
| Voice Interface | Ask questions naturally by speaking |
| Multi-language | English · ಕನ್ನಡ · हिंदी · മലയാളം · தமிழ் · తెలుగు |

---

## Why it works without a backend

- Groq API key is held in the user's browser — no server, no data leak
- All crop data and logic runs client-side in JavaScript
- Hosted on GitHub Pages — $0/month, global CDN, 100% uptime
- Works on slow 2G connections — lightweight and serverless

---

## Stack

`HTML5` `CSS3` `Vanilla JavaScript` `Groq API (Mixtral 8x7B)` `Chart.js`
`Web Speech API` `GitHub Pages`

---

## Quick start

**Use it directly — no setup needed:**

1. Open [akashms24.github.io/JeevanMitraAI](https://akashms24.github.io/JeevanMitraAI/)
2. Get a free Groq API key at [console.groq.com](https://console.groq.com)
3. Enter your key in the top bar and start

**Run locally:**

```bash
git clone https://github.com/akashms24/JeevanMitraAI.git
cd JeevanMitraAI
python3 -m http.server 8080
```

No npm. No build step. Just open and go.

---

## Project structure
JeevanMitraAI/
├── css/
│   └── style.css        # All styles and responsive design
├── data/
│   └── cropsData.js     # Crop database, market prices, calendar data
├── js/
│   └── app.js           # Core logic, Groq AI integration, voice interface
└── index.html           # Main entry point

---

## What's next

- Weather API integration + pest prediction
- Offline PWA for remote areas with no internet
- WhatsApp bot integration
- Government mandi board price API

---

## Related projects

- [FarmVoice AI](https://github.com/AkashMs24/FarmVoice-AI) — NLP + Random
Forest + SHAP crop advisory (Python)
- [Fraud Detection System](https://github.com/AkashMs24/Cost-Sensitive-Real-Time-Fraud-Detection-Decision-System) — XGBoost + SHAP + FastAPI
- [Decision Intelligence System](https://github.com/AkashMs24/Decisioniq-ai-business-intelligence) — ML + LLM business platform

---

<div align="center">

Built by **Akash M S** · Presidency University, Bengaluru
[LinkedIn](https://www.linkedin.com/in/akash-m-s-414a21297) ·
[GitHub](https://github.com/AkashMs24) · ms29akash@gmail.com

*FUSIONX 2026 — Best AI Innovation for Social Impact*

</div>
