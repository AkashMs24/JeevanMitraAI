class GroqAPI {
    constructor() {
        this.apiKey = window.GROQ_API_KEY || '';
        this.endpoint = CONFIG.GROQ_API.endpoint;
        this.models = CONFIG.GROQ_API.models;
    }

    isConfigured() {
        return this.apiKey && this.apiKey.length > 0;
    }

    async chat(message, systemPrompt = null) {
        if (!this.isConfigured()) {
            throw new Error('API key not configured. Add GROQ_API_KEY to GitHub Secret.');
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: message });

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.models[0],
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 1
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API Error');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Groq API Error:', error);
            throw error;
        }
    }

    async diseaseAnalysis(imageBase64) {
        if (!this.isConfigured()) {
            throw new Error('API key not configured');
        }

        const systemPrompt = `You are an expert agricultural pathologist. Analyze the crop image and identify diseases. 
        Respond in JSON format: {
            "disease": "name",
            "severity": "High/Medium/Low",
            "symptoms": "description",
            "treatment": "treatment steps",
            "confidence": 0-100
        }`;

        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analyze this crop image for diseases.' },
                    { type: 'image_url', image_url: { url: imageBase64 } }
                ]
            }
        ];

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llava-15b-preview',
                    messages: messages,
                    temperature: 0.3,
                    max_tokens: 512
                })
            });

            if (!response.ok) {
                throw new Error('Disease analysis failed');
            }

            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Disease Analysis Error:', error);
            throw error;
        }
    }
}

const groqAPI = new GroqAPI();
