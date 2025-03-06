import { Model, DataTypes } from 'sequelize';

export class Set extends Model {
    static schema = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        workoutExerciseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'workout_exercises',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        reps: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER,  // Duration in seconds
            allowNull: true
        },
        distance: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    static options = {
        modelName: 'Set',
        tableName: 'sets',
        timestamps: true
    };

    static initialize(sequelize) {
        Set.init(Set.schema, Set.options);
    }
}