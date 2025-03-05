'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import { ENVS } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

// Create Sequelize instance
const sequelize = new Sequelize({
    database: process.env.NODE_ENV === 'test' ? `${ENVS.POSTGRES_DB}_test` : ENVS.POSTGRES_DB,
    username: ENVS.POSTGRES_USER,
    password: ENVS.POSTGRES_PASSWORD,
    host: ENVS.POSTGRES_HOST,
    port: ENVS.POSTGRES_PORT,
    dialect: 'postgres',
    logging: false
});

// Initialize models container
const models = {};

// Import all models
const modelFiles = fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            !file.includes('.test.js')
        );
    });

// Load models
for (const file of modelFiles) {
    const modelModule = await import(path.join(__dirname, file));
    const model = modelModule.default || modelModule[Object.keys(modelModule)[0]];
    if (model && model.initialize) {
        model.initialize(sequelize);
        models[model.name] = model;
    }
}

// Set up associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

export { sequelize };
export default models;
