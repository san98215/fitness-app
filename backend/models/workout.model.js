import { Model, DataTypes } from 'sequelize';

export class Workout extends Model {
    static schema = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER, // Duration in minutes
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        }
    };

    static options = {
        modelName: 'Workout',
        tableName: 'workouts',
        timestamps: true
    };
}