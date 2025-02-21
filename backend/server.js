import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Routes
import authRoutes from './routes/auth.route.js'
import exerciseRoutes from './routes/exercise.route.js'
import workoutRoutes from './routes/workout.route.js'

import ENVS from './config/env.js'
import dbConnect from './config/db.js'


dotenv.config()

const app = express()
const PORT = ENVS.PORT

app.use(express.json()) // Middleware to parse JSON bodies
app.use(cookieParser()) // Middleware to parse cookies

// Define routes
app.use("/auth", authRoutes)
app.use("/exercises", exerciseRoutes)
app.use("/workouts", workoutRoutes)

app.listen(PORT, () => {
  console.log('Server running on port', PORT)
  dbConnect()
})

