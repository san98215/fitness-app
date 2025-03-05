import sequelize from '../../config/database.js';
import '../models/index.js';

class DatabaseService {
    static async initializeDatabase() {
        try {
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
            
            // Sync all models
            await sequelize.sync({ alter: true });
            console.log('Database models synchronized successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    }

    static async closeDatabase() {
        try {
            await sequelize.close();
            console.log('Database connection closed successfully.');
        } catch (error) {
            console.error('Error closing database connection:', error);
            throw error;
        }
    }
}

export default DatabaseService; 