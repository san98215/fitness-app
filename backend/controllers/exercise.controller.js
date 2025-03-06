import exerciseService from '../services/exercise.service.js';

// Get all exercises
export const getExercises = async (req, res) => {
    try {
        const exercises = await exerciseService.findAll();
        res.status(200).json({
            success: true,
            exercises
        });
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exercises'
        });
    }
};

// Get exercises by muscle group
export const getExercisesByMuscleGroup = async (req, res) => {
    try {
        const { muscleGroup } = req.params;
        const exercises = await exerciseService.findByMuscleGroup(muscleGroup);

        if (!exercises.length) {
            return res.status(404).json({
                success: false,
                message: 'No exercises found for this muscle group'
            });
        }
        
        res.status(200).json({
            success: true,
            exercises
        });
    } catch (error) {
        console.error('Error fetching exercises by muscle group:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exercises'
        });
    }
};

// Get exercises by category
export const getExercisesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const exercises = await exerciseService.findByCategory(category);

        if (!exercises.length) {
            return res.status(404).json({
                success: false,
                message: 'No exercises found for this category'
            });
        }
        
        res.status(200).json({
            success: true,
            exercises
        });
    } catch (error) {
        console.error('Error fetching exercises by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exercises'
        });
    }
};