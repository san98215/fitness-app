import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Routes
import authRoutes from './routes/auth.route.js'
import exerciseRoutes from './routes/exercise.route.js'

import ENVS from './config/env.js'
import dbConnect from './config/db.js'


dotenv.config()

const app = express()
const PORT = ENVS.PORT

app.use(express.json()) // Middleware to parse JSON bodies
app.use(cookieParser()) // Middleware to parse cookies

// Define routes
app.use("/auth", authRoutes)
app.use("/exercise", exerciseRoutes)
// app.use("/movies", mediaRoutes)
// app.use("/tv", mediaRoutes)

app.listen(PORT, () => {
  console.log('Server running on port', PORT)
  dbConnect()
})

