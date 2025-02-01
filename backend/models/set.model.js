import mongoose from 'mongoose'

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
})

export const Set = mongoose.model('Set', setSchema)