import sequelize from '../../config/database.js';
import { User } from './user.model.js';
import { Workout } from './workout.model.js';
import { Exercise } from './exercise.model.js';
import { WorkoutExercise } from './workout-exercise.model.js';

// Initialize models
const models = {
    User,
    Workout,
    Exercise,
    WorkoutExercise
};

// Initialize each model
Object.values(models).forEach(model => {
    if (model.init) {
        model.init(model.schema, { 
            sequelize,
            ...model.options
        });
    }
});

// Define associations
Workout.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Workout, {
    foreignKey: 'userId',
    as: 'workouts'
});

Workout.belongsToMany(Exercise, {
    through: WorkoutExercise,
    as: 'exercises',
    foreignKey: 'workoutId'
});

Exercise.belongsToMany(Workout, {
    through: WorkoutExercise,
    as: 'workouts',
    foreignKey: 'exerciseId'
});

export {
    User,
    Workout,
    Exercise,
    WorkoutExercise
}; 