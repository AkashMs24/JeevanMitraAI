class WeatherAPI {
    constructor() {
        this.endpoint = CONFIG.WEATHER_API.endpoint;
    }

    async getWeather(lat, lng) {
        try {
            // Using weatherapi.com free tier
            const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=demo&q=${lat},${lng}`
            );

            if (!response.ok) {
                // Return mock data if API fails
                return this.getMockWeather();
            }

            const data = await response.json();
            return {
                temp: Math.round(data.current.temp_c),
                humidity: data.current.humidity,
                rainfall: data.current.precip_mm,
                condition: data.current.condition.text
            };
        } catch (error) {
            console.warn('Weather API failed, using mock data:', error);
            return this.getMockWeather();
        }
    }

    async getForecast(lat, lng) {
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=demo&q=${lat},${lng}&days=7`
            );

            if (!response.ok) {
                return this.getMockForecast();
            }

            const data = await response.json();
            return data.forecast.forecastday.map(day => ({
                date: day.date,
                maxTemp: Math.round(day.day.maxtemp_c),
                minTemp: Math.round(day.day.mintemp_c),
                condition: day.day.condition.text,
                rainfall: day.day.totalprecip_mm
            }));
        } catch (error) {
            console.warn('Forecast API failed, using mock data:', error);
            return this.getMockForecast();
        }
    }

    getMockWeather() {
        return {
            temp: Math.floor(Math.random() * 15 + 20),
            humidity: Math.floor(Math.random() * 30 + 50),
            rainfall: Math.floor(Math.random() * 30),
            condition: 'Partly Cloudy'
        };
    }

    getMockForecast() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map((day, i) => ({
            date: day,
            maxTemp: Math.floor(Math.random() * 10 + 28),
            minTemp: Math.floor(Math.random() * 10 + 18),
            condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
            rainfall: Math.floor(Math.random() * 20)
        }));
    }
}

const weatherAPI = new WeatherAPI();
