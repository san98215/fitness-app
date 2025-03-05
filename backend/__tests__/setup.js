import DatabaseService from '../services/database.service.js';
import sequelize from '../../config/database.js';

export const setupTestDatabase = async () => {
    try {
        // Initialize database with force sync to ensure clean state
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Force sync all models (this will drop and recreate all tables)
        await sequelize.sync({ force: true });
        console.log('Database models synchronized successfully.');
    } catch (error) {
        console.error('Error setting up test database:', error);
        throw error;
    }
};

export const clearTestDatabase = async () => {
    try {
        // Get all models
        const models = sequelize.models;

        // Truncate all tables with RESTART IDENTITY
        for (const model of Object.values(models)) {
            await model.destroy({ 
                where: {}, 
                force: true,
                truncate: true,
                cascade: true
            });
        }
    } catch (error) {
        console.error('Error clearing test database:', error);
        throw error;
    }
};

export const cleanupTestDatabase = async () => {
    try {
        await sequelize.close();
    } catch (error) {
        console.error('Error cleaning up test database:', error);
        throw error;
    }
}; 