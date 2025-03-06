import BaseService from './base.service.js';
import { Workout } from '../models/workout.model.js';
import { Exercise } from '../models/exercise.model.js';
import { WorkoutExercise } from '../models/workout-exercise.model.js';
import { Set } from '../models/set.model.js';

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
                    model: WorkoutExercise,
                    as: 'workoutExercise',
                    attributes: ['id', 'order', 'notes']
                }
            }, {
                model: WorkoutExercise,
                as: 'workoutExercises',
                include: [{
                    model: Exercise,
                    as: 'exercise'
                }, {
                    model: Set,
                    as: 'sets',
                    order: [['order', 'ASC']]
                }]
            }]
        }).then(workout => {
            if (!workout) return null;

            // Restructure the response to match the expected format
            workout = workout.toJSON();
            workout.exercises = workout.exercises.map(exercise => {
                const workoutExercise = workout.workoutExercises.find(we => we.exerciseId === exercise.id);
                if (workoutExercise) {
                    exercise.workoutExercise = {
                        id: workoutExercise.id,
                        order: workoutExercise.order,
                        notes: workoutExercise.notes
                    };
                    exercise.sets = workoutExercise.sets;
                }
                return exercise;
            });
            delete workout.workoutExercises;
            return workout;
        });
    }

    async getUserWorkouts(userId) {
        return await Workout.findAll({
            where: { userId },
            order: [['date', 'DESC']],
            include: [{
                model: Exercise,
                as: 'exercises',
                through: {
                    model: WorkoutExercise,
                    as: 'workoutExercise',
                    attributes: ['id', 'order', 'notes']
                }
            }, {
                model: WorkoutExercise,
                as: 'workoutExercises',
                include: [{
                    model: Exercise,
                    as: 'exercise'
                }, {
                    model: Set,
                    as: 'sets',
                    order: [['order', 'ASC']]
                }]
            }]
        }).then(workouts => {
            // Restructure each workout to match the expected format
            return workouts.map(workout => {
                workout = workout.toJSON();
                workout.exercises = workout.exercises.map(exercise => {
                    const workoutExercise = workout.workoutExercises.find(we => we.exerciseId === exercise.id);
                    if (workoutExercise) {
                        exercise.workoutExercise = {
                            id: workoutExercise.id,
                            order: workoutExercise.order,
                            notes: workoutExercise.notes
                        };
                        exercise.sets = workoutExercise.sets;
                    }
                    return exercise;
                });
                delete workout.workoutExercises;
                return workout;
            });
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
            // Remove existing exercises and their sets
            const workoutExercises = await WorkoutExercise.findAll({
                where: { workoutId }
            });
            
            for (const we of workoutExercises) {
                await Set.destroy({ where: { workoutExerciseId: we.id } });
            }
            await workout.setExercises([]);
            
            // Add new exercises with sets
            await this.addExercises(workoutId, updateData.exercises);
        }

        return this.getWorkoutWithDetails(workoutId);
    }

    async delete(workoutId) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        // Delete associated sets and workout exercises
        const workoutExercises = await WorkoutExercise.findAll({
            where: { workoutId }
        });
        
        for (const we of workoutExercises) {
            await Set.destroy({ where: { workoutExerciseId: we.id } });
        }

        await workout.destroy();
    }

    async findById(workoutId) {
        return await Workout.findByPk(workoutId);
    }

    async findAll(options) {
        return await Workout.findAll({
            ...options,
            include: [{
                model: Exercise,
                as: 'exercises',
                through: {
                    model: WorkoutExercise,
                    as: 'workoutExercise',
                    attributes: ['id', 'order', 'notes']
                },
                include: [{
                    model: WorkoutExercise,
                    as: 'workoutExercises',
                    required: false,
                    include: [{
                        model: Set,
                        as: 'sets',
                        order: [['order', 'ASC']]
                    }]
                }]
            }]
        });
    }

    async addExercise(workoutId, exerciseData) {
        const workout = await Workout.findByPk(workoutId);
        
        if (!workout) {
            throw new Error('Workout not found');
        }

        const { exerciseId, sets } = exerciseData;

        // Validate sets data
        if (!Array.isArray(sets) || sets.some(set => !set.reps || set.reps <= 0 || !set.weight || set.weight <= 0)) {
            throw new Error('Invalid sets data');
        }

        // Create workout exercise
        const workoutExercise = await WorkoutExercise.create({
            workoutId,
            exerciseId,
            order: (await WorkoutExercise.count({ where: { workoutId } })) + 1
        });

        // Create sets
        await Promise.all(sets.map(set => 
            Set.create({
                ...set,
                workoutExerciseId: workoutExercise.id
            })
        ));

        return this.getWorkoutWithDetails(workoutId);
    }

    async addExercises(workoutId, exercises) {
        for (const exercise of exercises) {
            await this.addExercise(workoutId, exercise);
        }
    }

    async removeExercise(workoutId, exerciseId) {
        const workoutExercise = await WorkoutExercise.findOne({
            where: { workoutId, exerciseId }
        });
        
        if (!workoutExercise) {
            throw new Error('Exercise not found in workout');
        }

        // Delete associated sets
        await Set.destroy({
            where: { workoutExerciseId: workoutExercise.id }
        });

        // Delete workout exercise
        await workoutExercise.destroy();
    }

    async updateSets(workoutId, exerciseId, setsData) {
        const workoutExercise = await WorkoutExercise.findOne({
            where: { workoutId, exerciseId }
        });

        if (!workoutExercise) {
            throw new Error('Exercise not found in workout');
        }

        // Validate sets data
        if (!Array.isArray(setsData) || setsData.some(set => !set.reps || set.reps <= 0 || !set.weight || set.weight <= 0)) {
            throw new Error('Invalid sets data');
        }

        // Delete existing sets
        await Set.destroy({
            where: { workoutExerciseId: workoutExercise.id }
        });

        // Create new sets
        await Promise.all(setsData.map(set => 
            Set.create({
                ...set,
                workoutExerciseId: workoutExercise.id
            })
        ));

        return this.getWorkoutWithDetails(workoutId);
    }
}

export default new WorkoutService(); 