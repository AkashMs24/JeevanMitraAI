/**
 * Real-Time Farming Advisories
 */

async function getAdvisories(location, crops, weatherData) {
    const prompt = `Generate real-time farming advisories for:
- Location: ${location}
- Crops: ${crops.join(', ')}
- Weather: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity, ${weatherData.rainfall}mm rain

Include:
1. Pest/disease alerts
2. Irrigation advice
3. Spraying schedule
4. Market tips`;

    return await groqAPI.chat(prompt);
}
