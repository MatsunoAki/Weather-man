import { Sequelize } from 'sequelize';
import 'dotenv/config';

// The only thing this file does is set up the connection
const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  logging: false, 
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully via Docker!');
  } catch (error) {
    console.error('Database connection failed:', error instanceof Error ? error.message : String(error));
  }
};

export { sequelize, connectDB };