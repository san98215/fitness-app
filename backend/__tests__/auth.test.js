import request from 'supertest';
import app from '../server.js';
import { setupTestDatabase, clearTestDatabase, cleanupTestDatabase } from './setup.js';
import userService from '../services/user.service.js';

describe('Auth Endpoints', () => {
    let server;

    beforeAll(async () => {
        await setupTestDatabase();
        server = app.listen(0); // Use any available port
    });

    beforeEach(async () => {
        await clearTestDatabase();
        // Clear users before each test
        await userService.model.destroy({ where: {} });
    });

    afterAll(async () => {
        await server.close();
        await cleanupTestDatabase();
    });

    const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!@#'
    };

    describe('POST /auth/register', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send(validUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.username).toBe(validUser.username);
            expect(res.body.user.email).toBe(validUser.email);
            expect(res.body.user).not.toHaveProperty('password');
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should not create duplicate user', async () => {
            // First create a user
            await request(app)
                .post('/auth/register')
                .send(validUser);

            // Try to create the same user again
            const res = await request(app)
                .post('/auth/register')
                .send(validUser);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('already registered');
        });

        it('should not create user with invalid email', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    ...validUser,
                    email: 'invalid-email'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid email');
        });

        it('should not create user with weak password', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    ...validUser,
                    password: 'weak'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Password must be');
        });
    });

    describe('POST /auth/login', () => {
        let user;

        beforeEach(async () => {
            // Create a user before each test
            const res = await request(app)
                .post('/auth/register')
                .send(validUser);
            user = res.body.user;
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe(user.email);
            expect(res.body.user).not.toHaveProperty('password');
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: validUser.email,
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid credentials');
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: validUser.password
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid credentials');
        });
    });

    describe('POST /auth/logout', () => {
        let authCookie;

        beforeEach(async () => {
            // Create and login user before each test
            await request(app)
                .post('/auth/register')
                .send(validUser);

            const loginRes = await request(app)
                .post('/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            authCookie = loginRes.headers['set-cookie'];
        });

        it('should clear the cookie on logout', async () => {
            const res = await request(app)
                .post('/auth/logout')
                .set('Cookie', authCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie'][0]).toMatch(/jwt=;/);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/auth/logout');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Authentication required');
        });
    });
}); 