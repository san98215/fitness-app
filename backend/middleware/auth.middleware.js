import jwt from 'jsonwebtoken';
import { ENVS } from '../../config/env.js';
import userService from '../services/user.service.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, ENVS.JWT_KEY);
        
        // Get user from token
        const user = await userService.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid authentication'
        });
    }
}; 