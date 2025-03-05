import { Sequelize } from 'sequelize';
import { ENVS } from './env.js';

const dbName = process.env.NODE_ENV === 'test' ? `${ENVS.POSTGRES_DB}_test` : ENVS.POSTGRES_DB;

const sequelize = new Sequelize(dbName, ENVS.POSTGRES_USER, ENVS.POSTGRES_PASSWORD, {
    host: ENVS.POSTGRES_HOST,
    port: ENVS.POSTGRES_PORT,
    dialect: 'postgres',
    logging: ENVS.MODE === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL database');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error.message);
        throw error;
    }
};

export default sequelize; 