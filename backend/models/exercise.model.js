import { Model, DataTypes } from 'sequelize';

export class Exercise extends Model {
    static initialize(sequelize) {
        Exercise.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            workoutId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
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
        }, {
            sequelize,
            modelName: 'Exercise'
        });
    }
}