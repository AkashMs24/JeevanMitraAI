# 🌿 JeevanMitra AI – Smart Farming Companion

**JeevanMitra AI** is a cutting-edge, browser‑based agricultural assistant that leverages **Groq’s ultra‑fast LLM and vision models** to help farmers and agronomists make data‑driven decisions. No server setup required – runs entirely in your browser with a single HTML file and external modules.

![License](https://img.shields.io/badge/license-MIT-green)
![Groq AI](https://img.shields.io/badge/Powered%20by-Groq-22c55e)
![Multilingual](https://img.shields.io/badge/Multilingual-6%20Languages-blue)

---

## ✨ Key Features

| Module | Description |
|--------|-------------|
| 🌾 **Crop Advisor** | Recommends the best crops based on soil nutrients (N, P, K), temperature, humidity, pH, rainfall, and soil type. Real‑time scoring with visual confidence bars. |
| 📊 **Yield Forecast** | Predicts expected yield (tons/ha or nuts/ha) for 20+ crops using nutrient‑response models and irrigation level. Also estimates revenue based on market prices. |
| 🔬 **Disease Detection** | Upload a leaf image and let Groq vision models identify diseases (blight, rust, mildew, bacterial spot) with severity, symptoms, and treatment recommendations. |
| 💰 **Market Prices** | Displays current (simulated) market prices for all crops with trends and 7‑day change. Sort by price or trend. Interactive price chart. |
| 📅 **Crop Calendar** | Sowing and harvest guide for 8 Indian regions (Karnataka, Maharashtra, Tamil Nadu, etc.) with crop‑specific seasons. |
| 🤖 **AI Chat Assistant** | Ask natural language questions about crops, diseases, yield, or prices. Powered by Groq’s LLM (Llama 3.3 / Gemma 2). Supports voice input in 6 languages. |
| 🌐 **Multilingual UI** | Complete interface in English, ಕನ್ನಡ, हिंदी, മലയാളം, தமிழ், తెలుగు. Speech recognition works in all these languages. |
| 🎤 **Voice Input** | Click the microphone button and speak your query – hands‑free operation. |
| ☁️ **Auto Weather Fill** | Fetches live temperature, humidity & rainfall using your geolocation (Open‑Meteo API). |
| 🔑 **BYO API Key** | Bring your own **free** Groq API key – no credit card required. Key stored locally. |

---

## 🚀 Live Demo

You can try JeevanMitra AI instantly by opening `index.html` in a modern browser (Chrome, Edge, Firefox).

> **Note**: For full AI features (chat & vision disease detection), obtain a free Groq API key from [console.groq.com](https://console.groq.com). The app works in demo mode without a key (local crop recommendations, yield prediction, market prices, calendar – all functional).

---

## 📁 Project Structure
JeevanMitraAI/
├── index.html # Main application (UI + core logic)
├── README.md # This file
├── assets/
│ └── images/ # Logos, favicon, screenshots
│ ├── logo.svg
│ ├── favicon.ico
│ └── hero-bg.jpg
├── data/
│ └── cropsData.js # Crop database, translations, yield profiles, calendar
└── js/
├── chat.js # Groq API integration, voice, chat UI└── market.js # Market price simulation & chart


---

## 🔧 Setup & Installation

1. **Clone or download** the repository.
2. **Open `index.html`** in your browser – that’s it! No build step, no server.
3. **(Optional) Get a Groq API key**:
   - Go to [console.groq.com](https://console.groq.com) and sign up (free).
   - Navigate to **API Keys** → **Create Key**.
   - Copy the key (starts with `gsk_`).
   - Click the yellow bar in the app and paste your key. The app will remember it.

4. **For voice input**: Allow microphone access when prompted.

---

## 🧠 How It Works (Technical Overview)

### Crop Recommendation Engine
- Each crop has ideal ranges for N, P, K, temperature, humidity, pH, and rainfall.
- The app computes a weighted score (0–100) based on how close the user’s inputs fall within those ranges.
- Soil type bonuses (e.g., black soil for cotton) increase the score.
- Top 5 crops are displayed with match percentage, missing factors, and seasonal tags.

### Yield Prediction
- Uses a linear nutrient‑response model: yield = baseYield × (1 + nutrient factors) × irrigation factor.
- Each crop has specific sensitivity to N, P, and K derived from agronomic research.
- Revenue is calculated using the crop’s market price (₹/quintal or ₹/100 nuts).

### Groq AI Integration
- **Chat**: Sends farmer’s question + current soil data + top crop recommendations as context. Groq’s low‑latency models (Llama 3.3 70B, Gemma 2 9B) generate concise, helpful answers in the selected language.
- **Vision**: Uploaded leaf image is base64‑encoded and sent to a vision model (Llama 3.2 Vision). The model returns a structured JSON with disease name, confidence, severity, symptoms, and treatment.

### Multilingual & Voice
- UI text is stored in a JSON translation object. Dynamic swapping via `setLanguage()`.
- Web Speech API is configured with Indian locale codes (`en-IN`, `kn-IN`, etc.) for accurate voice recognition.

---

## 🌟 Why This Project Stands Out

- **Zero‑dependency architecture** – No npm, no frameworks, no backend. Pure HTML/CSS/JS.
- **Real AI in the browser** – Uses Groq’s public API directly (CORS‑enabled). No proxy required.
- **Designed for rural India** – Works offline in demo mode, supports 6 major Indian languages, and runs on low‑end devices.
- **Practical for farmers** – Provides actionable insights: which crop to plant, expected yield, disease treatment, best selling market.
- **Portfolio‑ready** – Clean dark mode UI, responsive layout, interactive charts, and smooth animations.

---

## 📸 Screenshots

> *(Add actual screenshots in `assets/images/` and reference them here)*

| Crop Advisor | Disease Detection | Market Prices |
|--------------|-------------------|----------------|
| ![Crop Advisor](./assets/images/screenshot-crop.png) | ![Disease](./assets/images/screenshot-disease.png) | ![Market](./assets/images/screenshot-market.png) |

---

## 🛠️ Customization & Extension

- **Add a new crop**: Edit `CROP_DB` in `data/cropsData.js`. Provide ideal ranges, emoji, market price, and soil bonus.
- **Add a new language**: Extend the `i18n` object in `index.html` and the `cropNames` object in `cropsData.js`.
- **Use a different LLM**: Modify `MODELS` array in `chat.js` (supports any Groq‑compatible model).
- **Integrate real market API**: Replace `loadMarketPrices()` with a fetch to a public commodity price API (e.g., data.gov.in).

---

## 🙏 Acknowledgements

- **Groq** – For providing blazing‑fast, free inference APIs.
- **Open‑Meteo** – For free weather data.
- **Font Awesome** (conceptual) – For icons (emojis used instead for simplicity).
- **All contributors** – Farmers, agronomists, and open‑source community.

---

## 📄 License

MIT License – free to use, modify, and distribute for agricultural and educational purposes.

---

## 📞 Contact & Support

For issues or suggestions, please open a GitHub issue or contact the maintainer.

**Empower Indian farming with AI – JeevanMitra AI 🌱**
