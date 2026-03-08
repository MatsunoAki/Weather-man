import { Router } from 'express';
import { getWeatherData } from '../services/weatherService'; // Import your service
import { authMiddleware } from '../middleware/authMiddleware';
import { getAiWeatherAdvice } from '../services/aiService'; // Import AI service

const router = Router();

router.get('/:city', authMiddleware, async (req, res) => {
    try {
        const { city } = req.params;
        if (typeof city !== 'string') {
            res.status(400).json({ message: "City parameter must be a string" });
            return;
        }
        const data = await getWeatherData(city); 
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching weather from service" });
    }
});

router.get('/:city/advice', authMiddleware, async (req, res) => {
    try {
        const { city } = req.params;
                if (typeof city !== 'string') {
            res.status(400).json({ message: "City parameter must be a string" });
            return;
        }
        const weatherData = await getWeatherData(city);

        const advice = await getAiWeatherAdvice(
            weatherData.temperature,
            weatherData.conditions,
            city
        );
        res.json({ city, advice });
    } catch (error) {
        res.status(500).json({ message: "Error fetching AI weather advice" });
    }
});

export default router;