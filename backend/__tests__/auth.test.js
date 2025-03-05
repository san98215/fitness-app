import request from 'supertest';
import app, { startServer } from '../server.js';
import { initializeTestDatabase, cleanupTestDatabase } from './setup.js';
import userService from '../services/user.service.js';

describe('Auth Endpoints', () => {
    let server;

    beforeAll(async () => {
        await initializeTestDatabase();
        server = await startServer();
    });

    afterAll(async () => {
        await cleanupTestDatabase();
        await server.close();
        // Add a small delay to allow connections to close
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    beforeEach(async () => {
        // Clear users before each test
        await userService.model.destroy({ where: {} });
    });

    describe('POST /auth/register', () => {
        const validUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!@#'
        };

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
            expect(res.body.message).toContain('already');
        });
    });

    describe('POST /auth/login', () => {
        const user = {
            username: 'logintest',
            email: 'login@example.com',
            password: 'Login123!@#'
        };

        beforeEach(async () => {
            // Create a user before each login test
            await request(app)
                .post('/auth/register')
                .send(user);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: user.email,
                    password: user.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe(user.email);
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: user.email,
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
                    password: user.password
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid credentials');
        });
    });

    describe('POST /auth/logout', () => {
        it('should clear the cookie on logout', async () => {
            // First register and login to get the cookie
            const user = {
                username: 'logouttest',
                email: 'logout@example.com',
                password: 'Logout123!@#'
            };

            await request(app)
                .post('/auth/register')
                .send(user);

            const loginRes = await request(app)
                .post('/auth/login')
                .send({
                    email: user.email,
                    password: user.password
                });

            const cookie = loginRes.headers['set-cookie'];

            const res = await request(app)
                .post('/auth/logout')
                .set('Cookie', cookie);

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