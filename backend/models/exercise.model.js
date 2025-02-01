import mongoose from 'mongoose'

const exerciseSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Set'
    }]
})

export const Exercise = mongoose.model('Exercise', exerciseSchema)