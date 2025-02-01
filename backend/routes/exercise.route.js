import express from 'express'
import { getExercies, searchExercises } from '../controllers/exercise.controller.js'

const router = express.Router()

router.get('/', getExercies)
router.get('/:term', searchExercises)

export default router;