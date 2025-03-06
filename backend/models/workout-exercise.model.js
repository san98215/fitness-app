import { Model, DataTypes } from 'sequelize';

export class WorkoutExercise extends Model {
    static schema = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        workoutId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'workouts',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        exerciseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'exercises',
                key: 'id'
            },
            onDelete: 'CASCADE'
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
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['id']
            }
        ]
    };
} 