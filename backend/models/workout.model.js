import { Model, DataTypes } from 'sequelize';

export class Workout extends Model {
    static initialize(sequelize) {
        Workout.init({
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
            duration: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        }, {
            sequelize,
            modelName: 'Workout'
        });
    }
}