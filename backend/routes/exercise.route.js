import express from 'express'
import {
    getExercises,
    getExercisesByMuscleGroup,
    getExercisesByCategory
} from '../controllers/exercise.controller.js'

const router = express.Router()

// Get all exercises
router.get('/', getExercises)

// Get exercises by muscle group
router.get('/muscle-group/:muscleGroup', getExercisesByMuscleGroup)

// Get exercises by category
router.get('/category/:category', getExercisesByCategory)

export default router;