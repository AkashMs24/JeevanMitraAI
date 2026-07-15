# 🌿 JeevanMitra AI — Smart Farming 2.0

**AI-powered agricultural assistant with multilingual voice support, disease detection, and yield prediction.**

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)


https://akashms24.github.io/JeevanMitraAI/


---

## ✨ Features

- **🤖 Intelligent Crop Advisor** — AI-powered crop recommendations based on soil parameters
- **🔬 AI Disease Detection** — Upload leaf images for instant disease diagnosis
- **📊 Yield Prediction** — ML forecasting with revenue estimation
- **💰 Live Market Prices** — Real-time mandi prices across India
- **⛅ Weather Integration** — 7-day agricultural forecast
- **🎤 Multilingual Voice** — Auto-speak responses in 6 Indian languages (EN, KN, HI, ML, TA, TE)
- **📱 Fully Responsive** — Optimized for mobile, tablet, desktop
- **🌙 Dark Brutalist UI** — Minimal, no-nonsense design with neon green accents
- **🔐 Secure API** — Groq API key managed via GitHub Secrets

---

## 🚀 Quick Deploy (GitHub Pages)

### Prerequisites
- GitHub account with repo access
- Groq API key from [console.groq.com](https://console.groq.com)

### Step 1: Add GitHub Secret

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. **Name:** `GROQ_API_KEY`
4. **Value:** `gsk_your_actual_key_here`
5. Click **Add secret** ✅

### Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` (or `master`)
4. **Folder:** `/ (root)`
5. Click **Save**

### Step 3: Push Code

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/JeevanMitraAI.git
cd JeevanMitraAI

# Copy all files from this guide into your repo
# Ensure you have these files/folders:
# - index.html
# - css/main.css
# - js/api.js, chat.js, (and other existing .js files)
# - data/cropsData.js
# - .github/workflows/deploy.yml

# Commit and push
git add .
git commit -m "🚀 JeevanMitra AI with GitHub Pages deployment"
git push origin main
```

### Step 4: GitHub Actions Deploys Automatically

1. Go to **Actions** tab
2. Watch **"Build & Deploy to GitHub Pages"** workflow run
3. Once ✅ passed, your site is live!

**Your live URL:** `https://USERNAME.github.io/JeevanMitraAI`

---

## 📁 Project Structure
