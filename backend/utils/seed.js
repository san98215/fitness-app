import { Exercise } from '../models/exercise.model.js';
import sequelize from '../../config/database.js';
import '../models/index.js';  // Import models to ensure they are initialized
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transformExerciseData = (rawExercises) => {
    const muscleGroupMap = {
        'abdominals': 'core',
        'biceps': 'biceps',
        'triceps': 'triceps',
        'chest': 'chest',
        'lats': 'back',
        'middle back': 'back',
        'lower back': 'back',
        'quadriceps': 'legs',
        'hamstrings': 'legs',
        'calves': 'legs',
        'shoulders': 'shoulders',
        'traps': 'back',
        'forearms': 'other'
    };

    const categoryMap = {
        'strength': 'strength',
        'stretching': 'flexibility',
        'cardio': 'cardio',
        'powerlifting': 'strength',
        'olympic weightlifting': 'strength',
        'strongman': 'strength',
        'plyometrics': 'cardio'
    };

    const difficultyMap = {
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'expert': 'advanced'
    };

    return rawExercises.map(exercise => ({
        name: exercise.name,
        description: exercise.instructions ? exercise.instructions.join(' ') : '',
        category: categoryMap[exercise.category?.toLowerCase()] || 'other',
        muscleGroup: muscleGroupMap[exercise.primaryMuscles?.[0]?.toLowerCase()] || 'other',
        equipment: exercise.equipment?.toLowerCase() || 'none',
        difficulty: difficultyMap[exercise.level?.toLowerCase()] || 'intermediate'
    }));
};

const seedExercises = async () => {
    try {
        // Check if exercises already exist
        const existingCount = await Exercise.count();
        if (existingCount > 0) {
            console.log('Exercises already seeded, skipping...');
            return;
        }

        // Read exercises data from JSON file
        const rawExercisesData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/exercises.json'),
                'utf8'
            )
        );

        // Transform the data to match our model
        const transformedExercises = transformExerciseData(rawExercisesData);

        // Create exercises from the transformed data
        await Exercise.bulkCreate(transformedExercises);
        console.log('Successfully seeded exercises');
    } catch (error) {
        console.error('Error seeding exercises:', error);
        throw error;
    }
};

const seed = async () => {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Force sync database to drop and recreate all tables
        await sequelize.sync({ force: true });
        console.log('Database synchronized.');

        // Run seeders
        await seedExercises();
        
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed(); 