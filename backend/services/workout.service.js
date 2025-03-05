import BaseService from './base.service.js';
import { Workout } from '../models/workout.model.js';
import { Exercise } from '../models/exercise.model.js';
import { Set } from '../models/set.model.js';
import sequelize from '../../config/database.js';
import { Op } from 'sequelize';

class WorkoutService extends BaseService {
    constructor() {
        super(Workout);
    }

    async createWorkout(workoutData) {
        const workout = await Workout.create(workoutData);

        // If exercises are included in the workout data, add them
        if (workoutData.exercises && workoutData.exercises.length > 0) {
            await this.addExercises(workout.id, workoutData.exercises);
        }

        return this.getWorkoutWithDetails(workout.id);
    }

    async getWorkoutWithDetails(workoutId) {
        return await Workout.findByPk(workoutId, {
            include: [{
                model: Exercise,
                as: 'exercises',
                through: {
                    attributes: ['sets', 'reps', 'weight']
                }
            }]
        });
    }

    async getUserWorkouts(userId) {
        return await Workout.findAll({
            where: { userId },
            order: [['date', 'DESC']],
            include: ['exercises']
        });
    }

    async updateWorkout(workoutId, updateData) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        // Update basic workout details
        await workout.update(updateData);

        // If exercises are included in the update data, update them
        if (updateData.exercises) {
            // Remove existing exercises
            await workout.setExercises([]);
            // Add new exercises
            await this.addExercises(workoutId, updateData.exercises);
        }

        return this.getWorkoutWithDetails(workoutId);
    }

    async delete(workoutId) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        await workout.destroy();
    }

    async findById(workoutId) {
        return await Workout.findByPk(workoutId);
    }

    async findAll(options) {
        return await Workout.findAll(options);
    }

    async addExercise(workoutId, exerciseData) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        const { exerciseId, sets, reps, weight } = exerciseData;
        await workout.addExercise(exerciseId, {
            through: { sets, reps, weight }
        });

        return this.getWorkoutWithDetails(workoutId);
    }

    async addExercises(workoutId, exercises) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        for (const exercise of exercises) {
            const { exerciseId, sets, reps, weight } = exercise;
            await workout.addExercise(exerciseId, {
                through: { sets, reps, weight }
            });
        }
    }

    async removeExercise(workoutId, exerciseId) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        await workout.removeExercise(exerciseId);
    }
}

export default new WorkoutService(); 