class MarketAPI {
    constructor() {
        this.prices = {
            wheat: { name: 'Wheat', price: 2100, trend: 'up', change: 2.5 },
            rice: { name: 'Rice', price: 2900, trend: 'down', change: -1.2 },
            corn: { name: 'Corn', price: 1800, trend: 'up', change: 1.8 },
            cotton: { name: 'Cotton', price: 5500, trend: 'up', change: 3.2 },
            sugarcane: { name: 'Sugarcane', price: 280, trend: 'stable', change: 0.5 },
            soybean: { name: 'Soybean', price: 3200, trend: 'down', change: -2.1 },
            groundnut: { name: 'Groundnut', price: 4500, trend: 'up', change: 1.5 }
        };
    }

    async getPrices() {
        // Simulating real API with slight randomization
        try {
            return Object.values(this.prices).map(crop => ({
                ...crop,
                price: Math.round(crop.price * (1 + (Math.random() - 0.5) * 0.1))
            }));
        } catch (error) {
            console.error('Market API error:', error);
            return Object.values(this.prices);
        }
    }

    async searchCrop(name) {
        const key = Object.keys(this.prices).find(k =>
            this.prices[k].name.toLowerCase().includes(name.toLowerCase())
        );
        return key ? this.prices[key] : null;
    }
}

const marketAPI = new MarketAPI();
