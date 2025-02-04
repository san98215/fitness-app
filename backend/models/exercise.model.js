import mongoose from 'mongoose'

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
    sets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Set'
    }]
})

export const Exercise = mongoose.model('Exercise', exerciseSchema)