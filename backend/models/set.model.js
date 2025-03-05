import { Model, DataTypes } from 'sequelize';

export class Set extends Model {
    static initialize(sequelize) {
        Set.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            exerciseId: {
                type: DataTypes.UUID,
                allowNull: false
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
        }, {
            sequelize,
            modelName: 'Set'
        });
    }
}