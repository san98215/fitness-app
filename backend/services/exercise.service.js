import { Exercise } from '../models/exercise.model.js';

class ExerciseService {
    // Valid enum values
    static muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body', 'other'];
    static categories = ['strength', 'cardio', 'flexibility', 'balance', 'other'];
    static difficulties = ['beginner', 'intermediate', 'advanced'];

    async findAll(options = {}) {
        try {
            return await Exercise.findAll({
                order: [
                    ['muscleGroup', 'ASC'],
                    ['name', 'ASC']
                ],
                ...options
            });
        } catch (error) {
            console.error('Error in ExerciseService.findAll:', error);
            throw error;
        }
    }

    async findByMuscleGroup(muscleGroup) {
        try {
            // Validate muscle group
            if (!ExerciseService.muscleGroups.includes(muscleGroup)) {
                return [];
            }

            return await Exercise.findAll({
                where: { muscleGroup },
                order: [['name', 'ASC']]
            });
        } catch (error) {
            console.error('Error in ExerciseService.findByMuscleGroup:', error);
            throw error;
        }
    }

    async findByCategory(category) {
        try {
            // Validate category
            if (!ExerciseService.categories.includes(category)) {
                return [];
            }

            return await Exercise.findAll({
                where: { category },
                order: [['name', 'ASC']]
            });
        } catch (error) {
            console.error('Error in ExerciseService.findByCategory:', error);
            throw error;
        }
    }

    async create(exerciseData) {
        try {
            // Validate enum values
            if (!ExerciseService.muscleGroups.includes(exerciseData.muscleGroup)) {
                throw new Error('Invalid muscle group');
            }
            if (!ExerciseService.categories.includes(exerciseData.category)) {
                throw new Error('Invalid category');
            }
            if (exerciseData.difficulty && !ExerciseService.difficulties.includes(exerciseData.difficulty)) {
                throw new Error('Invalid difficulty level');
            }

            return await Exercise.create(exerciseData);
        } catch (error) {
            console.error('Error in ExerciseService.create:', error);
            throw error;
        }
    }

    async bulkCreate(exercisesData) {
        try {
            // Validate enum values for all exercises
            for (const exercise of exercisesData) {
                if (!ExerciseService.muscleGroups.includes(exercise.muscleGroup)) {
                    throw new Error('Invalid muscle group');
                }
                if (!ExerciseService.categories.includes(exercise.category)) {
                    throw new Error('Invalid category');
                }
                if (exercise.difficulty && !ExerciseService.difficulties.includes(exercise.difficulty)) {
                    throw new Error('Invalid difficulty level');
                }
            }

            return await Exercise.bulkCreate(exercisesData);
        } catch (error) {
            console.error('Error in ExerciseService.bulkCreate:', error);
            throw error;
        }
    }

    async update(id, exerciseData) {
        try {
            // Validate enum values if they are being updated
            if (exerciseData.muscleGroup && !ExerciseService.muscleGroups.includes(exerciseData.muscleGroup)) {
                throw new Error('Invalid muscle group');
            }
            if (exerciseData.category && !ExerciseService.categories.includes(exerciseData.category)) {
                throw new Error('Invalid category');
            }
            if (exerciseData.difficulty && !ExerciseService.difficulties.includes(exerciseData.difficulty)) {
                throw new Error('Invalid difficulty level');
            }

            const [updated] = await Exercise.update(exerciseData, {
                where: { id }
            });
            if (!updated) {
                throw new Error('Exercise not found');
            }
            return await Exercise.findByPk(id);
        } catch (error) {
            console.error('Error in ExerciseService.update:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const deleted = await Exercise.destroy({
                where: { id }
            });
            if (!deleted) {
                throw new Error('Exercise not found');
            }
            return deleted;
        } catch (error) {
            console.error('Error in ExerciseService.delete:', error);
            throw error;
        }
    }
}

export default new ExerciseService(); 