import { Sequelize } from 'sequelize';
import { ENVS } from '../../config/env.js';
import DatabaseService from '../services/database.service.js';

// Create test database connection without specifying database name
const sequelize = new Sequelize({
    host: ENVS.POSTGRES_HOST,
    port: ENVS.POSTGRES_PORT,
    username: ENVS.POSTGRES_USER,
    password: ENVS.POSTGRES_PASSWORD,
    dialect: 'postgres',
    logging: false
});

// Function to initialize test database
export const initializeTestDatabase = async () => {
    try {
        // Create test database if it doesn't exist
        await sequelize.query(`CREATE DATABASE ${ENVS.POSTGRES_DB}_test`);
    } catch (error) {
        // Ignore error if database already exists
        if (error.original?.code !== '42P04') {
            console.error('Error creating test database:', error);
            throw error;
        }
    } finally {
        await sequelize.close();
    }

    // Initialize database with models
    await DatabaseService.initializeDatabase();
};

// Function to clean up test database
export const cleanupTestDatabase = async () => {
    try {
        // Get all models
        const models = DatabaseService.getSequelize().models;
        
        // Truncate all tables
        for (const model of Object.values(models)) {
            await model.destroy({ where: {}, force: true });
        }

        // Close the connection
        await DatabaseService.cleanup();
    } catch (error) {
        console.error('Error cleaning up test database:', error);
        throw error;
    }
}; 