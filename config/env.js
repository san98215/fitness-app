import dotenv from 'dotenv'

dotenv.config()

export const ENVS = {
    PORT: process.env.PORT || 3001,
    JWT_KEY: process.env.JWT_KEY,
    MODE: process.env.MODE || 'development',
    MOVIE_API_KEY: process.env.API_KEY,
    POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
    POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
    POSTGRES_DB: process.env.POSTGRES_DB || 'fitness_app',
    POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
}

export default ENVS