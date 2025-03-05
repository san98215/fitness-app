/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.jsx?$': ['babel-jest', { configFile: './config/babel.config.json' }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '**/backend/__tests__/**/*.test.js',
    ],
    setupFilesAfterEnv: ['./config/jest.setup.js'],
    testTimeout: 10000,
    verbose: true,
    forceExit: true,
    transformIgnorePatterns: [
        'node_modules/(?!(sequelize|pg|pg-hstore)/)'
    ],
    moduleFileExtensions: ['js', 'json'],
    rootDir: '..'
};

export default config; 