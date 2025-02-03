import { Workout } from '../models/workout.model.js'

export async function getWorkouts(req, res) {
    try {
        const workouts = await Workout.find({}).populate('exercises')
        console.log(workouts)
        res.status(200).json(workouts)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}