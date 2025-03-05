import jwt from 'jsonwebtoken'
import { ENVS } from '../../config/env.js'

// Generate token and store it in a cookie
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, ENVS.JWT_KEY, {
        expiresIn: '30d'
    })

    res.cookie('jwt', token, {
        httpOnly: true,                     // Prevents JS from accessing the cookie (XSS protection)
        sameSite: 'strict',                 // CSRF protection
        secure: ENVS.MODE === 'production', // HTTPS only in production
        maxAge: 30 * 24 * 60 * 60 * 1000    // 30 days in milliseconds
    })

    return token
}