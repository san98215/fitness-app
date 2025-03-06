import workoutService from '../services/workout.service.js';
import { Op } from 'sequelize';

// Get all workouts for the authenticated user
export const getWorkouts = async (req, res) => {
    try {
        const workouts = await workoutService.getUserWorkouts(req.user.id);
        res.status(200).json({
            success: true,
            workouts
        });
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching workouts'
        });
    }
};

// Get a specific workout by ID
export const getWorkoutById = async (req, res) => {
    try {
        const workout = await workoutService.getWorkoutWithDetails(req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Check if workout belongs to authenticated user
        if (workout.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'not authorized'
            });
        }

        res.status(200).json({
            success: true,
            workout
        });
    } catch (error) {
        console.error('Error fetching workout:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching workout'
        });
    }
};

// Create a new workout
export const createWorkout = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.name) {
            return res.status(400).json({
                success: false,
                message: 'name is required'
            });
        }

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
        console.error('Error creating workout:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating workout'
        });
    }
};

// Update an existing workout
export const updateWorkout = async (req, res) => {
    try {
        const workout = await workoutService.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Check if workout belongs to authenticated user
        if (workout.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'not authorized'
            });
        }

        const updatedWorkout = await workoutService.updateWorkout(req.params.id, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Workout updated successfully',
            workout: updatedWorkout
        });
    } catch (error) {
        console.error('Error updating workout:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating workout'
        });
    }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
    try {
        const workout = await workoutService.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Check if workout belongs to authenticated user
        if (workout.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'not authorized'
            });
        }

        await workoutService.delete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Workout deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting workout'
        });
    }
};

// Get recent workouts (last 7 days)
export const getRecentWorkouts = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const workouts = await workoutService.findAll({
            where: {
                userId: req.user.id,
                date: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            order: [['date', 'DESC']],
            include: ['exercises']
        });

        res.status(200).json({
            success: true,
            workouts
        });
    } catch (error) {
        console.error('Error fetching recent workouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent workouts'
        });
    }
};

// Get workout statistics
export const getWorkoutStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const workouts = await workoutService.findAll({
            where: {
                userId: req.user.id,
                date: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Calculate statistics
        const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
        const stats = {
            totalWorkouts: workouts.length,
            totalDuration,
            averageDuration: workouts.length ? Math.round(totalDuration / workouts.length) : 0,
            workoutsPerWeek: Math.round((workouts.length / 30) * 7 * 100) / 100
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching workout stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching workout statistics'
        });
    }
};

// Add exercise to workout
export const addExerciseToWorkout = async (req, res) => {
    try {
        const workout = await workoutService.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Check if workout belongs to authenticated user
        if (workout.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'not authorized'
            });
        }

        // Validate sets data
        if (!req.body.sets || !Array.isArray(req.body.sets) || req.body.sets.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sets data'
            });
        }

        const updatedWorkout = await workoutService.addExercise(req.params.id, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Exercise added successfully',
            workout: updatedWorkout
        });
    } catch (error) {
        // Only log unexpected errors
        if (error.message !== 'Invalid sets data') {
            console.error('Error adding exercise to workout:', error);
        }
        
        if (error.message === 'Invalid sets data') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding exercise to workout'
        });
    }
};

// Update sets for an exercise in a workout
export const updateSets = async (req, res) => {
    try {
        const workout = await workoutService.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Check if workout belongs to authenticated user
        if (workout.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'not authorized'
            });
        }

        // Validate sets data
        if (!req.body.sets || !Array.isArray(req.body.sets) || req.body.sets.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sets data'
            });
        }

        const updatedWorkout = await workoutService.updateSets(
            req.params.id,
            req.params.exerciseId,
            req.body.sets
        );
        
        res.status(200).json({
            success: true,
            message: 'Sets updated successfully',
            workout: updatedWorkout
        });
    } catch (error) {
        console.error('Error updating sets:', error);
        if (error.message === 'Exercise not found in workout') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Invalid sets data') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating sets'
        });
    }
};

// Remove exercise from workout
export const removeExerciseFromWorkout = async (req, res) => {
    try {
        const workout = await workoutService.findById(req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Check if workout belongs to authenticated user
        if (workout.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'not authorized'
            });
        }

        await workoutService.removeExercise(req.params.id, req.params.exerciseId);
        
        res.status(200).json({
            success: true,
            message: 'Exercise removed successfully'
        });
    } catch (error) {
        console.error('Error removing exercise:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing exercise'
        });
    }
};