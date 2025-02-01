import dotenv from 'dotenv'

dotenv.config()

export const ENVS = {
    PORT: process.env.PORT || 3001,
    MONGO_URI: process.env.MONGO_URI,
    JWT_KEY: process.env.JWT_KEY,
    MODE: process.env.MODE,
    MOVIE_API_KEY: process.env.API_KEY
}

export default ENVS