import express from 'express'
import { register, login, logout } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.post('/logout', authenticate, logout)

export default router;