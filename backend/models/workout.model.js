import mongoose, { set } from 'mongoose'

const setSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    reps: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, { _id: false })

const exerciseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    index: {
        type: Number,
    },
    name: {
        type: String,
    },
    notes: {
        type: String,
    },
    sets: [setSchema]
}, { _id: false })

const workoutSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    exercises: [exerciseSchema],
})

export const Workout = mongoose.model('Workout', workoutSchema)