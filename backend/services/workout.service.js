import BaseService from './base.service.js';
import { Workout } from '../models/workout.model.js';
import { Exercise } from '../models/exercise.model.js';
import { Set } from '../models/set.model.js';
import sequelize from '../../config/database.js';

class WorkoutService extends BaseService {
    constructor() {
        super(Workout);
    }

    async createWorkout(workoutData) {
        const transaction = await sequelize.transaction();
        try {
            const { exercises = [], ...workoutDetails } = workoutData;
            
            // Create workout
            const workout = await this.create(workoutDetails, { transaction });

            // Create exercises and their sets
            for (const exerciseData of exercises) {
                const { sets = [], ...exerciseDetails } = exerciseData;
                
                const exercise = await Exercise.create({
                    ...exerciseDetails,
                    workoutId: workout.id
                }, { transaction });

                if (sets.length > 0) {
                    await Set.bulkCreate(
                        sets.map(set => ({
                            ...set,
                            exerciseId: exercise.id
                        })),
                        { transaction }
                    );
                }
            }

            await transaction.commit();
            return this.getWorkoutWithDetails(workout.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getWorkoutWithDetails(workoutId) {
        try {
            return await this.findOne({
                where: { id: workoutId },
                include: [{
                    model: Exercise,
                    as: 'exercises',
                    include: [{
                        model: Set,
                        as: 'sets'
                    }]
                }]
            });
        } catch (error) {
            throw error;
        }
    }

    async getUserWorkouts(userId) {
        try {
            return await this.findAll({
                where: { userId },
                include: [{
                    model: Exercise,
                    as: 'exercises',
                    include: [{
                        model: Set,
                        as: 'sets'
                    }]
                }],
                order: [
                    ['date', 'DESC'],
                    ['exercises', 'order', 'ASC'],
                    ['exercises', 'sets', 'order', 'ASC']
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    async updateWorkout(workoutId, updateData) {
        const transaction = await sequelize.transaction();
        try {
            const { exercises = [], ...workoutDetails } = updateData;
            
            // Update workout details
            await this.update(workoutId, workoutDetails, { transaction });

            if (exercises.length > 0) {
                // Delete existing exercises and their sets (cascade will handle sets)
                await Exercise.destroy({
                    where: { workoutId },
                    transaction
                });

                // Create new exercises and their sets
                for (const exerciseData of exercises) {
                    const { sets = [], ...exerciseDetails } = exerciseData;
                    
                    const exercise = await Exercise.create({
                        ...exerciseDetails,
                        workoutId
                    }, { transaction });

                    if (sets.length > 0) {
                        await Set.bulkCreate(
                            sets.map(set => ({
                                ...set,
                                exerciseId: exercise.id
                            })),
                            { transaction }
                        );
                    }
                }
            }

            await transaction.commit();
            return this.getWorkoutWithDetails(workoutId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default new WorkoutService(); 