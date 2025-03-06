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
    removeExerciseFromWorkout,
    updateSets
} from '../controllers/workout.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticate)

// Routes that need to be matched before /:id
router.get('/recent', getRecentWorkouts)
router.get('/stats', getWorkoutStats)

// Core CRUD routes
router.get('/', getWorkouts)
router.post('/', createWorkout)

// Parameterized routes
router.get('/:id', getWorkoutById)
router.put('/:id', updateWorkout)
router.delete('/:id', deleteWorkout)

// Exercise management
router.post('/:id/exercises', addExerciseToWorkout)
router.delete('/:id/exercises/:exerciseId', removeExerciseFromWorkout)
router.put('/:id/exercises/:exerciseId/sets', updateSets)

export default router;