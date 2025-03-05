import { Model, DataTypes } from 'sequelize';

export class WorkoutExercise extends Model {
    static schema = {
        workoutId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'workouts',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        exerciseId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'exercises',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        sets: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        reps: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Weight in kilograms'
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Duration in seconds (for timed exercises)'
        },
        distance: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Distance in kilometers (for cardio exercises)'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    };

    static options = {
        modelName: 'WorkoutExercise',
        tableName: 'workout_exercises',
        timestamps: true
    };
} 