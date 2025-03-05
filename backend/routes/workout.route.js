import express from 'express'
import { 
    getWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getRecentWorkouts,
    getWorkoutStats,
    addExerciseToWorkout,
    removeExerciseFromWorkout
} from '../controllers/workout.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Protect all workout routes with authentication
router.use(authenticate)

// Core CRUD routes
router.get('/', getWorkouts)
router.get('/:id', getWorkoutById)
router.post('/', createWorkout)
router.put('/:id', updateWorkout)
router.delete('/:id', deleteWorkout)

// Additional functionality routes
router.get('/stats/recent', getRecentWorkouts)
router.get('/stats/summary', getWorkoutStats)
router.post('/:id/exercises', addExerciseToWorkout)
router.delete('/:id/exercises/:exerciseId', removeExerciseFromWorkout)

export default router;