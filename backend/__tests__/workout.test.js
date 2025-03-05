import request from 'supertest';
import app from '../server.js';
import { setupTestDatabase, clearTestDatabase, cleanupTestDatabase } from './setup.js';
import { User } from '../models/user.model.js';
import { Workout } from '../models/workout.model.js';

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

    beforeAll(async () => {
        await setupTestDatabase();
        server = app.listen(0);
    });

    beforeEach(async () => {
        await clearTestDatabase();
        
        // Create a test user directly using the model
        testUser = await User.create(validUser);
        
        // Get authentication cookie
        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                email: validUser.email,
                password: validUser.password
            });
        
        authCookie = loginRes.headers['set-cookie'];
    });

    afterAll(async () => {
        await server.close();
        await cleanupTestDatabase();
    });

    describe('GET /workouts', () => {
        it('should return empty array when no workouts exist', async () => {
            const res = await request(app)
                .get('/workouts')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.workouts)).toBe(true);
            expect(res.body.workouts).toHaveLength(0);
        });

        it('should return all workouts for authenticated user', async () => {
            // Create test workouts
            await Workout.create({ ...validWorkout, userId: testUser.id });
            await Workout.create({ 
                name: 'Tuesday Cardio',
                duration: 45,
                notes: 'HIIT session',
                userId: testUser.id
            });

            const res = await request(app)
                .get('/workouts')
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
                .get('/workouts');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('GET /workouts/:id', () => {
        let testWorkout;

        beforeEach(async () => {
            testWorkout = await Workout.create({
                ...validWorkout,
                userId: testUser.id
            });
        });

        it('should return a specific workout by id', async () => {
            const res = await request(app)
                .get(`/workouts/${testWorkout.id}`)
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
                .get(`/workouts/${fakeId}`)
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

            const otherWorkout = await Workout.create({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .get(`/workouts/${otherWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');
        });
    });

    describe('POST /workouts', () => {
        it('should create a new workout', async () => {
            const res = await request(app)
                .post('/workouts')
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
                .post('/workouts')
                .set('Cookie', authCookie)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('name is required');
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/workouts')
                .send(validWorkout);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });

    describe('PUT /workouts/:id', () => {
        let testWorkout;

        beforeEach(async () => {
            testWorkout = await Workout.create({
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
                .put(`/workouts/${testWorkout.id}`)
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

            const otherWorkout = await Workout.create({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .put(`/workouts/${otherWorkout.id}`)
                .set('Cookie', authCookie)
                .send({ name: 'Updated Workout' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');
        });

        it('should return 404 for non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .put(`/workouts/${fakeId}`)
                .set('Cookie', authCookie)
                .send({ name: 'Updated Workout' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });
    });

    describe('DELETE /workouts/:id', () => {
        let testWorkout;

        beforeEach(async () => {
            testWorkout = await Workout.create({
                ...validWorkout,
                userId: testUser.id
            });
        });

        it('should delete an existing workout', async () => {
            const res = await request(app)
                .delete(`/workouts/${testWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify workout is deleted
            const deletedWorkout = await Workout.findByPk(testWorkout.id);
            expect(deletedWorkout).toBeNull();
        });

        it('should not delete workout belonging to different user', async () => {
            // Create another user and their workout
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Test123!@#'
            });

            const otherWorkout = await Workout.create({
                ...validWorkout,
                userId: otherUser.id
            });

            const res = await request(app)
                .delete(`/workouts/${otherWorkout.id}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not authorized');

            // Verify workout still exists
            const workoutStillExists = await Workout.findByPk(otherWorkout.id);
            expect(workoutStillExists).not.toBeNull();
        });

        it('should return 404 for non-existent workout', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .delete(`/workouts/${fakeId}`)
                .set('Cookie', authCookie);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Workout not found');
        });
    });
}); 