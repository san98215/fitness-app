import { Sequelize } from 'sequelize';
import { ENVS } from '../../config/env.js';
import { User } from '../models/user.model.js';
import { Workout } from '../models/workout.model.js';
import { Exercise } from '../models/exercise.model.js';
import { Set } from '../models/set.model.js';

class DatabaseService {
    constructor() {
        this.sequelize = null;
        this.isInitialized = false;
    }

    async initializeDatabase() {
        try {
            // Set database name based on environment
            const dbName = process.env.NODE_ENV === 'test' 
                ? `${ENVS.POSTGRES_DB}_test`
                : ENVS.POSTGRES_DB;

            this.sequelize = new Sequelize({
                database: dbName,
                username: ENVS.POSTGRES_USER,
                password: ENVS.POSTGRES_PASSWORD,
                host: ENVS.POSTGRES_HOST,
                port: ENVS.POSTGRES_PORT,
                dialect: 'postgres',
                logging: false
            });

            // Test the connection
            await this.sequelize.authenticate();
            console.log('Database connection established successfully.');

            // Initialize all models
            User.initialize(this.sequelize);
            Workout.initialize(this.sequelize);
            Exercise.initialize(this.sequelize);
            Set.initialize(this.sequelize);

            // Define relationships after all models are initialized
            this.defineRelationships();

            // Sync database
            await this.sequelize.sync();
            
            this.isInitialized = true;
            console.log('Database synchronized successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    }

    async cleanup() {
        if (this.sequelize) {
            await this.sequelize.close();
            this.isInitialized = false;
            console.log('Database connection closed.');
        }
    }

    getSequelize() {
        if (!this.isInitialized) {
            throw new Error('Database not initialized. Call initializeDatabase() first.');
        }
        return this.sequelize;
    }

    defineRelationships() {
        // User -> Workouts (One-to-Many)
        User.hasMany(Workout, {
            foreignKey: 'userId',
            as: 'workouts',
            onDelete: 'CASCADE'
        });
        Workout.belongsTo(User, {
            foreignKey: 'userId',
            as: 'user'
        });

        // Workout -> Exercises (One-to-Many)
        Workout.hasMany(Exercise, {
            foreignKey: 'workoutId',
            as: 'exercises',
            onDelete: 'CASCADE'
        });
        Exercise.belongsTo(Workout, {
            foreignKey: 'workoutId',
            as: 'workout'
        });

        // Exercise -> Sets (One-to-Many)
        Exercise.hasMany(Set, {
            foreignKey: 'exerciseId',
            as: 'sets',
            onDelete: 'CASCADE'
        });
        Set.belongsTo(Exercise, {
            foreignKey: 'exerciseId',
            as: 'exercise'
        });
    }
}

// Create and export a singleton instance
const databaseService = new DatabaseService();
export default databaseService; 