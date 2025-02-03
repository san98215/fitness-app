import express from 'express'

import { getWorkouts } from '../controllers/workout.controller.js'

const router = express.Router()

router.get('/', getWorkouts)
router.post('/', getWorkouts)

export default router;