import { fetchExercise } from "../services/exercisedb.js"

export async function getExercies(req, res) {
    try {
        const exercises = await fetchExercise('https://wger.de/api/v2/exercisebaseinfo/?language=english')
        res.status(200).json(exercises)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function searchExercises(req, res) {
    try {
        const exercises = await fetchExercise(`https://wger.de/api/v2/exercise/search/?language=english&term=${req.params.term}`)
        res.status(200).json(exercises)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}