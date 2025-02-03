import mongoose from 'mongoose'

const workoutSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    exercises: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
    }],
})

export const Workout = mongoose.model('Workout', workoutSchema)