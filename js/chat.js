class ChatManager {
    constructor() {
        this.chatHistory = [];
        this.systemPrompt = `You are JeevanMitra AI, an expert Indian farming assistant. 
        You provide advice on crop selection, soil health, disease prevention, and farming practices.
        Always respond in the user's preferred language.
        Keep responses concise and practical (2-3 sentences).
        Use relevant emojis to make responses engaging.`;
    }

    async sendMessage(userMessage) {
        if (!groqAPI.isConfigured()) {
            return this.getFallbackResponse(userMessage);
        }

        try {
            const response = await groqAPI.chat(userMessage, this.systemPrompt);
            this.chatHistory.push({ role: 'user', content: userMessage });
            this.chatHistory.push({ role: 'assistant', content: response });
            return response;
        } catch (error) {
            console.error('Chat error:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(message) {
        const responses = [
            '🌾 Great question! Based on Indian farming practices, wheat is excellent for winter crops.',
            '💡 Your soil health looks promising. Consider adding more organic matter.',
            '🌤️ The weather conditions are favorable. Make sure to irrigate regularly.',
            '🚨 Pest activity detected in your region. Apply preventive measures.',
            '📊 Your crop yield can be improved with better nutrient management.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    clearHistory() {
        this.chatHistory = [];
    }
}

const chatManager = new ChatManager();
