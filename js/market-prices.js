/**
 * Real-Time Market Price Data
 */

class MarketPrices {
    async fetchPrices(crop, market) {
        try {
            // Try NITI Aayog Agricultural Market Data
            const response = await fetchWithRetry(
                'https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b405fcc2f43?api-key=579b464db66ec23bdd000001&format=json&filters[commodity]=' + crop
            );
            
            return await response.json();
        } catch (error) {
            // Fallback: Get from AI
            const prompt = `What are current market prices for ${crop} in ${market}?`;
            return await groqAPI.chat(prompt);
        }
    }
}

const marketPrices = new MarketPrices();
