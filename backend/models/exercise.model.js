import { Model, DataTypes } from 'sequelize';

export class Exercise extends Model {
    static schema = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM,
            values: ['strength', 'cardio', 'flexibility', 'balance', 'other'],
            defaultValue: 'other'
        },
        muscleGroup: {
            type: DataTypes.ENUM,
            values: [
                'chest',
                'back',
                'shoulders',
                'biceps',
                'triceps',
                'legs',
                'core',
                'full_body',
                'other'
            ],
            defaultValue: 'other'
        },
        equipment: {
            type: DataTypes.STRING,
            allowNull: true
        },
        difficulty: {
            type: DataTypes.ENUM,
            values: ['beginner', 'intermediate', 'advanced'],
            defaultValue: 'intermediate'
        }
    };

    static options = {
        modelName: 'Exercise',
        tableName: 'exercises',
        timestamps: true
    };
}