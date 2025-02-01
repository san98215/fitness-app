import mongoose from 'mongoose'
import { ENVS } from './env.js'

export const dbConnect = async () => {
    try {
        const connection = await mongoose.connect(ENVS.MONGO_URI)
        console.log('Connected to MongoDB', connection.connection.host)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message)
        process.exit(1)
    }
}

export default dbConnect