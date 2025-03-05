import workoutService from '../services/workout.service.js';

export const getWorkouts = async (req, res) => {
    try {
        const workouts = await workoutService.getUserWorkouts(req.user.id);
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a completely new workout, updating current workout will be different route
export const createWorkout = async (req, res) => {
    try {
        const workoutData = {
            ...req.body,
            userId: req.user.id
        };
        const workout = await workoutService.createWorkout(workoutData);
        res.status(201).json({
            success: true,
            message: 'Workout created successfully',
            workout
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};