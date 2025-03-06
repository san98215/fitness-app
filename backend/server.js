import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

// Routes
import authRoutes from './routes/auth.route.js'
import workoutRoutes from './routes/workout.route.js'
import exerciseRoutes from './routes/exercise.route.js'

import { ENVS } from '../config/env.js'
import DatabaseService from './services/database.service.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json()) // Middleware to parse JSON bodies
app.use(cookieParser()) // Middleware to parse cookies

// Define routes
app.use("/auth", authRoutes)
app.use("/api/workouts", workoutRoutes)
app.use("/api/exercises", exerciseRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// Start server function
export const startServer = async () => {
    try {
        // Initialize database
        await DatabaseService.initializeDatabase()
        
        // Start server
        const server = app.listen(ENVS.PORT, () => {
            console.log(`Server running on port ${ENVS.PORT}`)
        })
        return server
    } catch (error) {
        console.error('Failed to start server:', error)
        throw error
    }
}

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
    startServer().catch(error => {
        console.error('Server startup failed:', error)
        process.exit(1)
    })
}

export default app

