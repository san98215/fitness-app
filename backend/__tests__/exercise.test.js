import request from 'supertest';
import app from '../server.js';
import sequelize from '../../config/database.js';
import { Exercise } from '../models/exercise.model.js';
import exerciseService from '../services/exercise.service.js';

describe('Exercise Endpoints', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Clean database before tests
    });

    beforeEach(async () => {
        // Clear exercises before each test
        await Exercise.destroy({ where: {} });
        
        // Create test exercises using the service
        await exerciseService.bulkCreate([
            {
                name: 'Bench Press',
                description: 'A compound exercise that primarily targets the chest muscles',
                category: 'strength',
                muscleGroup: 'chest',
                equipment: 'barbell',
                difficulty: 'intermediate'
            },
            {
                name: 'Squat',
                description: 'A compound exercise that primarily targets the leg muscles',
                category: 'strength',
                muscleGroup: 'legs',
                equipment: 'barbell',
                difficulty: 'intermediate'
            },
            {
                name: 'Push-ups',
                description: 'A bodyweight exercise that targets the chest and triceps',
                category: 'other',
                muscleGroup: 'chest',
                equipment: 'none',
                difficulty: 'beginner'
            }
        ]);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/exercises', () => {
        it('should return all exercises', async () => {
            const res = await request(app)
                .get('/api/exercises')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.exercises).toHaveLength(3);
            expect(res.body.exercises[0]).toHaveProperty('name');
            expect(res.body.exercises[0]).toHaveProperty('description');
            expect(res.body.exercises[0]).toHaveProperty('category');
            expect(res.body.exercises[0]).toHaveProperty('muscleGroup');
        });

        it('should return exercises ordered by muscle group and name', async () => {
            const res = await request(app)
                .get('/api/exercises')
                .expect(200);

            const exercises = res.body.exercises;
            expect(exercises[0].muscleGroup).toBe('chest');
            expect(exercises[1].muscleGroup).toBe('chest');
            expect(exercises[2].muscleGroup).toBe('legs');
            
            // Check that exercises within same muscle group are ordered by name
            const chestExercises = exercises.filter(e => e.muscleGroup === 'chest');
            expect(chestExercises[0].name).toBe('Bench Press');
            expect(chestExercises[1].name).toBe('Push-ups');
        });
    });

    describe('GET /api/exercises/muscle-group/:muscleGroup', () => {
        it('should return exercises for a specific muscle group', async () => {
            const res = await request(app)
                .get('/api/exercises/muscle-group/chest')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.exercises).toHaveLength(2);
            expect(res.body.exercises[0].muscleGroup).toBe('chest');
            expect(res.body.exercises[1].muscleGroup).toBe('chest');
        });

        it('should return 404 for non-existent muscle group', async () => {
            const res = await request(app)
                .get('/api/exercises/muscle-group/nonexistent')
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('No exercises found for this muscle group');
        });
    });

    describe('GET /api/exercises/category/:category', () => {
        it('should return exercises for a specific category', async () => {
            const res = await request(app)
                .get('/api/exercises/category/strength')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.exercises).toHaveLength(2);
            expect(res.body.exercises[0].category).toBe('strength');
            expect(res.body.exercises[1].category).toBe('strength');
        });

        it('should return 404 for non-existent category', async () => {
            const res = await request(app)
                .get('/api/exercises/category/nonexistent')
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('No exercises found for this category');
        });
    });
}); 