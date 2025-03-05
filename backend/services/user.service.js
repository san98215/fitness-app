import BaseService from './base.service.js';
import { User } from '../models/user.model.js';

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    async createUser(userData) {
        try {
            const { password, ...otherData } = userData;
            
            return await this.create({
                ...otherData,
                password
            });
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return await this.findOne({ where: { email } });
        } catch (error) {
            throw error;
        }
    }

    async findByUsername(username) {
        try {
            return await this.findOne({ where: { username } });
        } catch (error) {
            throw error;
        }
    }

    async validatePassword(user, password) {
        try {
            return await user.comparePassword(password);
        } catch (error) {
            throw error;
        }
    }

    async getUserWithWorkouts(userId) {
        try {
            return await this.findOne({
                where: { id: userId },
                include: [{
                    association: 'workouts',
                    include: [{
                        association: 'exercises',
                        include: ['sets']
                    }]
                }]
            });
        } catch (error) {
            throw error;
        }
    }
}

export default new UserService(); 