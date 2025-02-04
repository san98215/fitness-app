import { Workout } from '../models/workout.model.js'

export async function getWorkouts(req, res) {
    try {
        const workouts = await Workout.find({}).populate('exercises')
        res.status(200).json(workouts)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Create a completely new workout, updating current workout will be different route
export async function createWorkout(req, res) {
    try {
        const { date, duration, exercises } = req.body

        const workout = new Workout({
            date,
            duration,
            exercises
        })

        await workout.save()

        res.status(201).json({
            success: true,
            message: 'Workout created successfully',
            workout: {...workout._doc}
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            succes: false,
            message: 'Internal server error'
        })
    }
}