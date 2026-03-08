import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';  
//import { getWeatherData } from './src/services/weatherService';
//import { getAiWeatherAdvice } from './src/services/aiService';
import { connectDB, sequelize } from './src/config/database';
import User from './src/models/user';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import weatherRoutes from './src/routes/weatherRoutes';
import { initCronJobs } from './src/services/cronService';


dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

sequelize.sync( { alter: true })
    .then(() => console.log('Database synced'))
    .catch((err) => console.error('Error syncing database:', err));

//middleware
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

// Routes 
app.use('/api/auth', authRoutes);   
app.use('/api/user', userRoutes);
app.use('/api/weather', weatherRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to WeatherMan API');
});

app.listen(port, async() => {
    console.log(`Server is running on port ${port}`);
    await connectDB();

    await User.sync({ alter: true });
    console.log('Database synced');

    initCronJobs();
});
export default app;