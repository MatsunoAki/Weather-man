import axios from 'axios';

const getWeatherData = async (city: string) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await axios.get(url);
        return {
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            conditions: response.data.weather[0].main,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching weather data:', message);
        throw new Error('Failed to fetch weather data');
    }
};

export { getWeatherData };
