import cron from 'node-cron';
import Users from '../models/user';
import { getWeatherData } from './weatherService';
import { getAiWeatherAdvice } from './aiService';

const processBriefing = async (briefingTime: 'morning' | 'evening') => {
    console.log('Running daily briefing job...');

    try {
        const filter = briefingTime === 'morning' ? { morningAlert: true } : { eveningAlert: true };
        const users = await Users.findAll({ where: filter });

        for (const user of users) {
            const city = user.homeCity || 'Antipolo';
            const weatherData = await getWeatherData(city);
            const advice = await getAiWeatherAdvice(
                weatherData.temperature,
                weatherData.conditions,
                briefingTime === 'morning' ? 'morning' : 'evening'
            );

            console.log(`Briefing for ${user.username} (${city}):`);
            console.log(`Weather: ${weatherData.temperature}°C, ${weatherData.conditions}`);
            console.log(`AI Advice: ${advice}`);
        }
    } catch (error) {
        console.error('Error in daily briefing job:', error);
    }
};

export const initCronJobs = () => {
    // Morning briefing at 7:00 AM
    cron.schedule('0 7 * * *', () => {
        processBriefing('morning');
    });

    // Evening briefing at 8:00 PM
    cron.schedule('0 20 * * *', () => {
        processBriefing('evening');
    });

    cron.schedule('*/30 * * * *', async () => {
        console.log('Running sudden change alert job...');
        const users = await Users.findAll({ where: { alertOnSuddenChange: true } });

        for (const user of users) {
            const weatherData = await getWeatherData(user.homeCity || 'Antipolo');
            if (weatherData.conditions.toLowerCase().includes('rain')) {
                const advice = await getAiWeatherAdvice(
                    weatherData.temperature,
                    weatherData.conditions,
                    'suddenChange'
                );
                console.log(`Sudden change alert for ${user.username} (${user.homeCity}):`);
                console.log(`Weather: ${weatherData.temperature}°C, ${weatherData.conditions}`);
                console.log(`AI Advice: ${advice}`);
            }
        }
    });
}




        
