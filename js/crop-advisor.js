/**
 * AI-Powered Crop Advisor
 * Real-time crop recommendations using AI
 */

class CropAdvisor {
    constructor() {
        this.cropData = null;
        this.loadCropData();
    }

    /**
     * Load crop data from agricultural database
     */
    async loadCropData() {
        const cached = CacheManager.get('crop_database');
        if (cached) {
            this.cropData = cached;
            return;
        }

        // Fetch from public agriculture API or use embedded data
        this.cropData = await this.getDefaultCrops();
        CacheManager.set('crop_database', this.cropData, CONFIG.CACHE.CROP_DATA_TTL);
    }

    /**
     * Default crop data (can be replaced with API call)
     */
    async getDefaultCrops() {
        return {
            'rice': {
                emoji: '🍚',
                name: 'Rice',
                n_range: [40, 80],
                p_range: [20, 40],
                k_range: [30, 50],
                ph_range: [6.0, 7.0],
                temp_range: [20, 30],
                rainfall_range: [150, 250],
                season: 'Monsoon',
                duration: '120-150 days'
            },
            'wheat': {
                emoji: '🌾',
                name: 'Wheat',
                n_range: [60, 100],
                p_range: [25, 45],
                k_range: [40, 60],
                ph_range: [6.5, 7.5],
                temp_range: [15, 25],
                rainfall_range: [40, 100],
                season: 'Winter',
                duration: '120-140 days'
            },
            'maize': {
                emoji: '🌽',
                name: 'Maize',
                n_range: [80, 120],
                p_range: [30, 50],
                k_range: [50, 70],
                ph_range: [6.0, 7.5],
                temp_range: [20, 30],
                rainfall_range: [50, 150],
                season: 'Summer',
                duration: '90-120 days'
            },
            'cotton': {
                emoji: '🌾',
                name: 'Cotton',
                n_range: [60, 120],
                p_range: [20, 40],
                k_range: [30, 50],
                ph_range: [5.5, 7.5],
                temp_range: [21, 30],
                rainfall_range: [50, 100],
                season: 'Summer',
                duration: '180-210 days'
            },
            'sugarcane': {
                emoji: '🍯',
                name: 'Sugarcane',
                n_range: [100, 200],
                p_range: [30, 60],
                k_range: [80, 150],
                ph_range: [5.5, 8.0],
                temp_range: [21, 27],
                rainfall_range: [125, 250],
                season: 'Year-round',
                duration: '12 months'
            },
            'potato': {
                emoji: '🥔',
                name: 'Potato',
                n_range: [100, 150],
                p_range: [50, 100],
                k_range: [100, 150],
                ph_range: [5.5, 7.0],
                temp_range: [15, 20],
                rainfall_range: [50, 100],
                season: 'Winter',
                duration: '70-90 days'
            },
            'tomato': {
                emoji: '🍅',
                name: 'Tomato',
                n_range: [50, 100],
                p_range: [30, 50],
                k_range: [50, 100],
                ph_range: [6.0, 6.8],
                temp_range: [20, 30],
                rainfall_range: [50, 100],
                season: 'Summer',
                duration: '60-80 days'
            }
        };
    }

    /**
     * Score crop suitability (NO HARDCODING)
     */
    scoreCrop(crop, soilData) {
        let score = 0;
        let factors = [];

        // Nitrogen score
        if (soilData.nitrogen >= crop.n_range[0] && soilData.nitrogen <= crop.n_range[1]) {
            score += 20;
            factors.push('✅ Nitrogen optimal');
        } else if (soilData.nitrogen < crop.n_range[0]) {
            score += 10;
            factors.push('⚠️ Nitrogen low - add fertilizer');
        } else {
            score += 5;
            factors.push('⚠️ Nitrogen high - monitor');
        }

        // Phosphorus score
        if (soilData.phosphorus >= crop.p_range[0] && soilData.phosphorus <= crop.p_range[1]) {
            score += 20;
            factors.push('✅ Phosphorus optimal');
        } else {
            score += 10;
            factors.push('⚠️ Phosphorus needs adjustment');
        }

        // Potassium score
        if (soilData.potassium >= crop.k_range[0] && soilData.potassium <= crop.k_range[1]) {
            score += 20;
            factors.push('✅ Potassium optimal');
        } else {
            score += 10;
            factors.push('⚠️ Potassium needs adjustment');
        }

        // pH score
        if (soilData.ph >= crop.ph_range[0] && soilData.ph <= crop.ph_range[1]) {
            score += 20;
            factors.push('✅ pH optimal');
        } else {
            score += 10;
            factors.push('⚠️ pH adjustment needed');
        }

        // Temperature score
        if (soilData.temperature >= crop.temp_range[0] && soilData.temperature <= crop.temp_range[1]) {
            score += 20;
            factors.push('✅ Temperature suitable');
        } else {
            score += 10;
            factors.push('⚠️ Temperature marginal');
        }

        return { score, factors };
    }

    /**
     * Get crop recommendations with AI enhancement
     */
    async getRecommendations(soilData) {
        if (!this.cropData) await this.loadCropData();
        if (!groqAPI.isConfigured()) {
            showToast('❌ Please configure Groq API key in settings', 'error');
            return [];
        }

        showLoading('🤖 Getting AI recommendations...');

        try {
            // Score all crops
            const scores = {};
            Object.entries(this.cropData).forEach(([key, crop]) => {
                const result = this.scoreCrop(crop, soilData);
                scores[key] = {
                    ...crop,
                    score: result.score,
                    factors: result.factors
                };
            });

            // Sort by score
            const ranked = Object.values(scores).sort((a, b) => b.score - a.score);

            // Get AI insights for top 3
            const topCrops = ranked.slice(0, 3);
            const aiInsights = await this.getAIInsights(soilData, topCrops);

            hideLoading();
            return { ranked, aiInsights };
        } catch (error) {
            hideLoading();
            showToast(`❌ ${error.message}`, 'error');
            return [];
        }
    }

    /**
     * Get AI insights using Groq
     */
    async getAIInsights(soilData, topCrops) {
        const prompt = `Based on soil data: N=${soilData.nitrogen}, P=${soilData.phosphorus}, K=${soilData.potassium}, pH=${soilData.ph}, Temp=${soilData.temperature}°C, Humidity=${soilData.humidity}%

Top recommended crops: ${topCrops.map(c => c.name).join(', ')}

Provide:
1. Why these crops are best
2. Specific fertilizer recommendations
3. Irrigation schedule
4. Expected yield
5. Market price expectations

Keep response concise and actionable.`;

        return await groqAPI.chat(prompt);
    }
}

// Global instance
const cropAdvisor = new CropAdvisor();

// Get recommendations
async function getCropRecommendations() {
    const soilData = {
        nitrogen: parseFloat(document.getElementById('nitrogen').value),
        phosphorus: parseFloat(document.getElementById('phosphorus').value),
        potassium: parseFloat(document.getElementById('potassium').value),
        ph: parseFloat(document.getElementById('soilPH').value),
        temperature: parseFloat(document.getElementById('temperature')?.value || 25),
        humidity: parseFloat(document.getElementById('humidity')?.value || 65)
    };

    const result = await cropAdvisor.getRecommendations(soilData);
    
    if (result.ranked) {
        displayRecommendations(result.ranked, result.aiInsights);
    }
}

// Display recommendations
function displayRecommendations(crops, aiInsights) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    let html = '<div class="ai-insights"><h4>🤖 AI Analysis</h4><p>' + aiInsights + '</p></div>';
    html += '<div class="recommendations-grid">';

    crops.forEach((crop, index) => {
        const medal = ['🥇', '🥈', '🥉'][index] || '⭐';
        html += `
            <div class="recommendation-card">
                <div class="card-header">
                    <span class="medal">${medal}</span>
                    <span class="crop-emoji">${crop.emoji}</span>
                    <h3>${crop.name}</h3>
                </div>
                <div class="card-body">
                    <div class="score-badge">${crop.score}/100</div>
                    <p><strong>Factors:</strong></p>
                    <ul>${crop.factors.map(f => `<li>${f}</li>`).join('')}</ul>
                    <p><strong>Season:</strong> ${crop.season}</p>
                    <p><strong>Duration:</strong> ${crop.duration}</p>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Update preview when sliders change
function updatePreview() {
    document.getElementById('nitrogenVal').textContent = document.getElementById('nitrogen').value;
    document.getElementById('phosphorusVal').textContent = document.getElementById('phosphorus').value;
    document.getElementById('potassiumVal').textContent = document.getElementById('potassium').value;
    document.getElementById('phVal').textContent = parseFloat(document.getElementById('soilPH').value).toFixed(1);
}
