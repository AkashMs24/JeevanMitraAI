# 🌿 JeevanMitra AI — Smart Farming Companion

<div align="center">

![JeevanMitra AI Banner](https://img.shields.io/badge/🌿_JeevanMitra_AI-Smart_Farming_Companion-1a6b3a?style=for-the-badge)

[![🏆 Hackathon Winner](https://img.shields.io/badge/🏆-Hackathon_Winner-FFD700?style=flat-square)](.)
[![Live Demo](https://img.shields.io/badge/🚀-Live_Demo-1a6b3a?style=flat-square)](https://YOUR_USERNAME.github.io/JeevanMitraAI)
[![Languages](https://img.shields.io/badge/🌍-6_Languages-blue?style=flat-square)](.)
[![Crops](https://img.shields.io/badge/🌾-20_Crops-green?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**An AI-powered agricultural intelligence platform for Indian farmers.**  
Built with CNN-based disease detection, Graph Whisper AI chat, and real-time crop intelligence — in 6 regional languages.

[🚀 Live Demo](https://YOUR_USERNAME.github.io/JeevanMitraAI) · [📖 How It Works](#how-it-works) · [🛠️ Tech Stack](#tech-stack) · [🚀 Getting Started](#getting-started)

</div>

---

## 🏆 Hackathon Achievement

> Built and won a hackathon with this project — a full-stack AI platform for precision agriculture serving Indian farmers across language barriers, built as a single deployable web application.

---

## 📸 Screenshots

> *(Add your screenshots here — drag & drop into GitHub after upload)*

| Crop Recommendation | Disease Detection | Market Prices |
|---|---|---|
| ![Crop](assets/screenshots/crop.png) | ![Disease](assets/screenshots/disease.png) | ![Market](assets/screenshots/market.png) |

---

## ✨ Features

### 🌾 Crop Recommendation Engine
- Inputs: **N, P, K** (soil nutrients), Temperature, Humidity, Soil pH, Rainfall, Soil Type
- Scores all **20 crops** using a weighted multi-factor algorithm
- Displays **Top 5 matches** with confidence scores and match/miss factor breakdown
- Live preview updates as you adjust sliders
- Soil health meters with status indicators (Low / OK / High)

### 🧠 CNN-Based Disease Detection
- Upload a **leaf image** → AI classifies disease via vision model
- Returns: disease name, confidence %, severity level, symptoms, treatment steps
- **CNN feature extraction** pipeline: pattern recognition → classification → report
- Supports: Leaf Blight, Rust, Powdery Mildew, Bacterial Spot, Downy Mildew, Healthy
- Demo mode for offline/testing use

### 📊 Yield Prediction
- Regression model using NPK values + irrigation level + land area
- Covers **20 crops**: Rice, Wheat, Maize, Cotton, Sugarcane, Banana, Potato, Turmeric, Ginger, Coconut, Mango, and more
- Outputs estimated yield in tonnes + revenue projection in ₹

### 💰 Live Market Price Tracker
- Real-time simulated mandi prices for all 20 crops
- Trend indicators: ↑ Up · ↓ Down · → Stable
- Sortable table (price, name, trend)
- **Canvas-based price chart** with historical trend visualization
- Source: major mandis (Kochi, Delhi, Erode, Cochin, Lasalgaon, etc.)

### 📅 Crop Calendar
- Month-wise planting/harvesting schedule for all 20 crops
- Filter by crop or month
- Color-coded sowing vs. harvest periods

### 🤖 Graph Whisper AI Chat Assistant
- Powered by **Groq LLaMA** (fast inference)
- Context-aware: answers questions about Indian farming, soil, weather, pests
- **Voice input** (Web Speech API) + **text-to-speech output**
- Quick-action buttons for common farming queries
- Supports conversation history

### 🌍 6-Language Support
Full UI + AI responses in:

| Language | Script |
|----------|--------|
| English | Latin |
| हिन्दी (Hindi) | Devanagari |
| മലയാളം (Malayalam) | Malayalam |
| ಕನ್ನಡ (Kannada) | Kannada |
| தமிழ் (Tamil) | Tamil |
| తెలుగు (Telugu) | Telugu |

---

## 🛠️ Tech Stack

```
Frontend          → Vanilla HTML5, CSS3, JavaScript (ES6+)
AI / LLM          → Groq API (LLaMA 3.1) — Graph Whisper chat
Vision AI         → Groq Vision — CNN disease detection pipeline
Charts            → HTML5 Canvas API (custom price chart renderer)
Voice             → Web Speech API (Speech Recognition + Synthesis)
Multilingual      → Custom i18n engine with 6-language JSON store
Crop Intelligence → Rule-based scoring engine (20 crops × 8 parameters)
Deployment        → GitHub Pages (zero-config, free)
```

---

## 🧠 How It Works

### Crop Recommendation Algorithm
```
Input: {N, P, K, Temperature, Humidity, pH, Rainfall, SoilType}
  ↓
For each crop in CROP_DB (20 crops):
  score = Σ weighted_factor_match(input, crop_requirements)
  matchedFactors = [...], missedFactors = [...]
  ↓
rankAllCrops() → sort by score descending
  ↓
Output: Top 5 crops with confidence % + why/why-not breakdown
```

### Disease Detection Pipeline (CNN)
```
Image Upload → FileReader (base64)
  ↓
Groq Vision API call with structured JSON prompt
  ↓
CNN feature extraction: ["lesion pattern", "color distribution", "edge texture"]
  ↓
Classification: disease type + severity + confidence %
  ↓
Treatment plan generation → voice readout (TTS)
```

### Yield Prediction Model
```
Inputs: crop, N, P, K, area (ha), irrigation_factor
  ↓
base_yield = CROP_DB[crop].yieldRange (kg/ha)
npk_factor = f(N, P, K) — weighted nutrient contribution
irr_factor = {rain_fed: 1.0, partial: 1.15, full: 1.3}
  ↓
predicted_yield = base_yield × npk_factor × irr_factor × area
revenue_estimate = predicted_yield × market_price
```

---

## 🚀 Getting Started

### Option 1: Just open it (no setup)
```bash
git clone https://github.com/YOUR_USERNAME/JeevanMitraAI.git
cd JeevanMitraAI
open index.html    # macOS
# or double-click index.html on Windows/Linux
```

Crop recommendation, yield prediction, market prices, and crop calendar work **immediately** — no API key needed.

### Option 2: Enable AI features (Groq API)
1. Get a **free** Groq API key at [console.groq.com](https://console.groq.com) (takes 1 minute)
2. Open the app → click the yellow bar at the top → paste your key (`gsk_...`)
3. Disease Detection + AI Chat are now fully active

### Option 3: Deploy live (GitHub Pages)
```bash
# After pushing to GitHub:
# Settings → Pages → Source: main branch / root → Save
# Live in ~60 seconds at: https://YOUR_USERNAME.github.io/JeevanMitraAI
```

---

## 📁 Project Structure

```
JeevanMitraAI/
│
├── index.html          # Main app shell — HTML structure only
├── style.css           # All styling — CSS variables, responsive, animations
├── script.js           # All logic — AI, crop engine, chart, i18n, voice
│
├── assets/
│   └── screenshots/    # Add app screenshots here for README
│
└── README.md           # This file
```

---

## 🌾 Supported Crops

| # | Crop | | # | Crop |
|---|------|-|---|------|
| 1 | 🌾 Rice | | 11 | 🧅 Onion |
| 2 | 🌿 Wheat | | 12 | 🫘 Soybean |
| 3 | 🌽 Maize | | 13 | 🫛 Chickpea (Chana) |
| 4 | 🪴 Cotton | | 14 | 🌾 Jowar (Sorghum) |
| 5 | 🌱 Sugarcane | | 15 | 🌻 Mustard |
| 6 | 🌾 Millet (Bajra) | | 16 | 🟡 Turmeric |
| 7 | 🍌 Banana | | 17 | 🫚 Ginger |
| 8 | 🥔 Potato | | 18 | 🥥 Coconut |
| 9 | 🥜 Groundnut | | 19 | 🥭 Mango |
| 10 | 🍅 Tomato | | 20 | 🍈 Papaya |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Your Name**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/YOUR_PROFILE)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat-square&logo=github)](https://github.com/YOUR_USERNAME)

---

<div align="center">

Made with ❤️ for Indian farmers · 🏆 Hackathon Winner

*"Technology that speaks the farmer's language"*

</div>
