import sequelize from '../../config/database.js';
import { User } from './user.model.js';
import { Workout } from './workout.model.js';
import { Exercise } from './exercise.model.js';
import { WorkoutExercise } from './workout-exercise.model.js';
import { Set } from './set.model.js';

// Initialize models
User.init(User.schema, { sequelize, ...User.options });
Workout.init(Workout.schema, { sequelize, ...Workout.options });
Exercise.init(Exercise.schema, { sequelize, ...Exercise.options });
WorkoutExercise.init(WorkoutExercise.schema, { sequelize, ...WorkoutExercise.options });
Set.init(Set.schema, { sequelize, ...Set.options });

// Define associations
Workout.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Workout, {
    foreignKey: 'userId',
    as: 'workouts'
});

// Workout-Exercise associations
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

// WorkoutExercise associations
Workout.hasMany(WorkoutExercise, {
    foreignKey: 'workoutId',
    as: 'workoutExercises'
});

WorkoutExercise.belongsTo(Workout, {
    foreignKey: 'workoutId',
    as: 'workout'
});

Exercise.hasMany(WorkoutExercise, {
    foreignKey: 'exerciseId',
    as: 'workoutExercises'
});

WorkoutExercise.belongsTo(Exercise, {
    foreignKey: 'exerciseId',
    as: 'exercise'
});

// Set associations
WorkoutExercise.hasMany(Set, {
    foreignKey: 'workoutExerciseId',
    as: 'sets'
});

Set.belongsTo(WorkoutExercise, {
    foreignKey: 'workoutExerciseId',
    as: 'workoutExercise'
});

// Export models
export {
    User,
    Workout,
    Exercise,
    WorkoutExercise,
    Set
}; 