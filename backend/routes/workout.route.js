import express from 'express'
import { getWorkouts, createWorkout } from '../controllers/workout.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Protect all workout routes with authentication
router.use(authenticate)

router.get('/', getWorkouts)
router.post('/', createWorkout)

export default router;