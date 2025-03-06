import request from 'supertest';
import app from '../server.js';
import { setupTestDatabase, clearTestDatabase, cleanupTestDatabase } from './setup.js';
import { User } from '../models/user.model.js';
import { Exercise } from '../models/exercise.model.js';
import workoutService from '../services/workout.service.js';
import exerciseService from '../services/exercise.service.js';

describe('Workout Endpoints', () => {
    let server;
    let authCookie;
    let testUser;

    const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!@#'
    };

    const validWorkout = {
        name: 'Monday Strength Training',
        duration: 60,
        notes: 'Focus on upper body'
    };

    const validExercise = {
        name: 'Bench Press',
        description: 'Barbell bench press',
        category: 'strength',
        muscleGroup: 'chest',
        equipment: 'barbell',
        difficulty: 'intermediate'
    };

    beforeAll(async () => {
        await setupTestDatabase();
        server = app.listen(0);
    });

    beforeEach(async () => {
        await clearTestDatabase();
        
        // Create a test user directly using the model (user service would be overkill here)
        testUser = await User.create(validUser);
        
        // Get authentication cookie
        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                email: validUser.email,
                password: validUser.password
            });
        
        console.log('Login response:', {
            status: loginRes.status,
            headers: loginRes.headers,
            body: loginRes.body
        });
        
        authCookie = loginRes.headers['set-cookie'];
    });

    afterAll(async () => {
        await server.close();
        await cleanupTestDatabase();
    });

    describe('GET /api/workouts', () => {
        it('should return empty array when no workouts exist', async () => {
            const res = await request(app)
                .get('/api/workouts')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.workouts)).toBe(true);
            expect(res.body.workouts).toHaveLength(0);
        });

        it('should return all workouts for authenticated user', async () => {
            // Create test workouts using the service
            await workoutService.createWorkout({ ...validWorkout, userId: testUser.id });
            await workoutService.createWorkout({ 
                name: 'Tuesday Cardio',
                duration: 45,
                notes: 'HIIT session',
                userId: testUser.id
            });

            const res = await request(app)
                .get('/api/workouts')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.workouts).toHaveLength(2);
            expect(res.body.workouts[0]).toHaveProperty('name');
            expect(res.body.workouts[0]).toHaveProperty('duration');
            expect(res.body.workouts[0]).toHaveProperty('notes');
            expect(res.body.workouts[0].userId).toBe(testUser.id);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/workouts');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('GET /api/workouts/:id', () => {
        let testWorkout;

        beforeEach(async () => {
            testWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: testUser.id
            });
        });

        it('should return a specific workout by id', async () => {
            const res = await request(app)
                .get(`/api/workouts/${testWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.workout.id).toBe(testWorkout.id);
            expect(res.body.workout.name).toBe(validWorkout.name);
            expect(res.body.workout.userId).toBe(testUser.id);
        });

        it('should return 404 for non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/workouts/${fakeId}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });

        it('should not return workout belonging to different user', async () => {
            // Create another user and their workout
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Test123!@#'
            });

            const otherWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .get(`/api/workouts/${otherWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');
        });
    });

    describe('POST /api/workouts', () => {
        it('should create a new workout', async () => {
            const res = await request(app)
                .post('/api/workouts')
                .set('Cookie', authCookie)
                .send(validWorkout);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.workout).toHaveProperty('id');
            expect(res.body.workout.name).toBe(validWorkout.name);
            expect(res.body.workout.duration).toBe(validWorkout.duration);
            expect(res.body.workout.userId).toBe(testUser.id);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/workouts')
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('name is required');
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/workouts')
                .send(validWorkout);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('PUT /api/workouts/:id', () => {
        let testWorkout;

        beforeEach(async () => {
            testWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: testUser.id
            });
        });

        it('should update an existing workout', async () => {
            const updates = {
                name: 'Updated Workout',
                duration: 90,
                notes: 'Updated notes'
            };

            const res = await request(app)
                .put(`/api/workouts/${testWorkout.id}`)
                .set('Cookie', authCookie)
                .send(updates);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.workout.name).toBe(updates.name);
            expect(res.body.workout.duration).toBe(updates.duration);
            expect(res.body.workout.notes).toBe(updates.notes);
        });

        it('should not update workout belonging to different user', async () => {
            // Create another user and their workout
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Test123!@#'
            });

            const otherWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .put(`/api/workouts/${otherWorkout.id}`)
                .set('Cookie', authCookie)
                .send({ name: 'Updated Workout' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');
        });

        it('should return 404 for non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .put(`/api/workouts/${fakeId}`)
                .set('Cookie', authCookie)
                .send({ name: 'Updated Workout' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });
    });

    describe('DELETE /api/workouts/:id', () => {
        let testWorkout;

        beforeEach(async () => {
            testWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: testUser.id
            });
        });

        it('should delete an existing workout', async () => {
            const res = await request(app)
                .delete(`/api/workouts/${testWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify workout is deleted
            const deletedWorkout = await workoutService.getWorkoutWithDetails(testWorkout.id);
            expect(deletedWorkout).toBeNull();
        });

        it('should not delete workout belonging to different user', async () => {
            // Create another user and their workout
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Test123!@#'
            });

            const otherWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .delete(`/api/workouts/${otherWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');

            // Verify workout still exists
            const workoutStillExists = await workoutService.getWorkoutWithDetails(otherWorkout.id);
            expect(workoutStillExists).not.toBeNull();
        });

        it('should return 404 for non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .delete(`/api/workouts/${fakeId}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });
    });

    describe('GET /api/workouts/recent', () => {
        beforeEach(async () => {
            // Create workouts with different dates
            const dates = [
                new Date(), // today
                new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            ];

            for (let i = 0; i < dates.length; i++) {
                await workoutService.createWorkout({
                    ...validWorkout,
                    name: `Workout ${i + 1}`,
                    date: dates[i],
                    userId: testUser.id
                });
            }
        });

        it('should return workouts from last 7 days', async () => {
            const res = await request(app)
                .get('/api/workouts/recent')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.workouts)).toBe(true);
            expect(res.body.workouts).toHaveLength(3); // Only workouts within 7 days
            
            // Verify all returned workouts are within last 7 days
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            res.body.workouts.forEach(workout => {
                expect(new Date(workout.date).getTime()).toBeGreaterThan(sevenDaysAgo.getTime());
            });
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/workouts/recent');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('GET /api/workouts/stats', () => {
        beforeEach(async () => {
            // Create workouts with different durations
            const workouts = [
                { ...validWorkout, duration: 30 },
                { ...validWorkout, duration: 45 },
                { ...validWorkout, duration: 60 },
                { ...validWorkout, duration: 90 }
            ];

            for (const workout of workouts) {
                await workoutService.createWorkout({
                    ...workout,
                    userId: testUser.id,
                    date: new Date() // All within last 30 days
                });
            }
        });

        it('should return workout statistics', async () => {
            const res = await request(app)
                .get('/api/workouts/stats')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.stats).toBeDefined();
            expect(res.body.stats).toEqual({
                totalWorkouts: 4,
                totalDuration: 225, // Sum of all durations
                averageDuration: 56, // Rounded average
                workoutsPerWeek: 0.93 // (4 workouts / 30 days) * 7 days, rounded to 2 decimals
            });
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/workouts/stats');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('POST /api/workouts/:id/exercises', () => {
        let testWorkout;
        let testExercise;

        beforeEach(async () => {
            testWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: testUser.id
            });
            testExercise = await exerciseService.create(validExercise);
        });

        it('should add exercise with sets to workout', async () => {
            const exerciseData = {
                exerciseId: testExercise.id,
                sets: [
                    { reps: 10, weight: 100, order: 1 },
                    { reps: 8, weight: 110, order: 2 }
                ]
            };

            const res = await request(app)
                .post(`/api/workouts/${testWorkout.id}/exercises`)
                .set('Cookie', authCookie)
                .send(exerciseData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.workout.exercises).toHaveLength(1);
            expect(res.body.workout.exercises[0].sets).toHaveLength(2);
            expect(res.body.workout.exercises[0].sets[0].reps).toBe(10);
            expect(res.body.workout.exercises[0].sets[1].weight).toBe(110);
        });

        it('should validate sets data', async () => {
            const exerciseData = {
                exerciseId: testExercise.id,
                sets: [{ reps: -1, weight: 0 }] // Invalid data
            };

            const res = await request(app)
                .post(`/api/workouts/${testWorkout.id}/exercises`)
                .set('Cookie', authCookie)
                .send(exerciseData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid sets data');
        });

        it('should not add exercise to non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const exerciseData = {
                exerciseId: testExercise.id,
                sets: [
                    { reps: 10, weight: 100, order: 1 },
                    { reps: 8, weight: 110, order: 2 }
                ]
            };

            const res = await request(app)
                .post(`/api/workouts/${fakeId}/exercises`)
                .set('Cookie', authCookie)
                .send(exerciseData);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });

        it('should not add exercise to workout belonging to different user', async () => {
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Test123!@#'
            });

            const otherWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: otherUser.id
            });

            const exerciseData = {
                exerciseId: testExercise.id,
                sets: [
                    { reps: 10, weight: 100, order: 1 },
                    { reps: 8, weight: 110, order: 2 }
                ]
            };

            const res = await request(app)
                .post(`/api/workouts/${otherWorkout.id}/exercises`)
                .set('Cookie', authCookie)
                .send(exerciseData);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');
        });

        it('should require authentication', async () => {
            const exerciseData = {
                exerciseId: testExercise.id,
                sets: [
                    { reps: 10, weight: 100, order: 1 },
                    { reps: 8, weight: 110, order: 2 }
                ]
            };

            const res = await request(app)
                .post(`/api/workouts/${testWorkout.id}/exercises`)
                .send(exerciseData);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('PUT /api/workouts/:id/exercises/:exerciseId/sets', () => {
        let testWorkout;
        let testExercise;
        let workoutExercise;

        beforeEach(async () => {
            testWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: testUser.id
            });
            testExercise = await exerciseService.create(validExercise);
            
            // Add exercise to workout with initial sets
            const exerciseData = {
                exerciseId: testExercise.id,
                sets: [
                    { reps: 10, weight: 100, order: 1 },
                    { reps: 8, weight: 110, order: 2 }
                ]
            };
            workoutExercise = await workoutService.addExercise(testWorkout.id, exerciseData);
        });

        it('should update sets for an exercise', async () => {
            const updatedSets = [
                { reps: 12, weight: 95, order: 1 },
                { reps: 10, weight: 105, order: 2 },
                { reps: 8, weight: 115, order: 3 }
            ];

            const res = await request(app)
                .put(`/api/workouts/${testWorkout.id}/exercises/${testExercise.id}/sets`)
                .set('Cookie', authCookie)
                .send({ sets: updatedSets });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.workout.exercises[0].sets).toHaveLength(3);
            expect(res.body.workout.exercises[0].sets[0].reps).toBe(12);
            expect(res.body.workout.exercises[0].sets[2].weight).toBe(115);
        });

        it('should not update sets for non-existent workout exercise', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const updatedSets = [
                { reps: 12, weight: 95, order: 1 }
            ];

            const res = await request(app)
                .put(`/api/workouts/${fakeId}/exercises/${testExercise.id}/sets`)
                .set('Cookie', authCookie)
                .send({ sets: updatedSets });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });

        it('should require authentication', async () => {
            const updatedSets = [
                { reps: 12, weight: 95, order: 1 }
            ];

            const res = await request(app)
                .put(`/api/workouts/${testWorkout.id}/exercises/${testExercise.id}/sets`)
                .send({ sets: updatedSets });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('DELETE /api/workouts/:id/exercises/:exerciseId', () => {
        let testWorkout;
        let testExercise;

        beforeEach(async () => {
            testWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: testUser.id
            });
            testExercise = await exerciseService.create(validExercise);
            
            // Add exercise to workout
            await workoutService.addExercise(testWorkout.id, {
                exerciseId: testExercise.id,
                sets: [{ reps: 10, weight: 100, order: 1 }]
            });
        });

        it('should remove exercise and its sets from workout', async () => {
            const res = await request(app)
                .delete(`/api/workouts/${testWorkout.id}/exercises/${testExercise.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            
            // Verify exercise was removed
            const updatedWorkout = await workoutService.getWorkoutWithDetails(testWorkout.id);
            expect(updatedWorkout.exercises).toHaveLength(0);
        });

        it('should not remove exercise from non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .delete(`/api/workouts/${fakeId}/exercises/${testExercise.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });

        it('should not remove exercise from workout belonging to different user', async () => {
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Test123!@#'
            });

            const otherWorkout = await workoutService.createWorkout({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .delete(`/api/workouts/${otherWorkout.id}/exercises/${testExercise.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .delete(`/api/workouts/${testWorkout.id}/exercises/${testExercise.id}`);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });
}); 