import axios from 'axios'
import ENVS from '../../config/env.js';

export const fetchExercise = async (url) => {
    const options = {
        headers: {
            accept: 'application/json',
        }
    }

    const res = await axios.get(url, options)

    if (res.status !== 200) {
        throw new Error('Failed to fetch data')
    }

    return res.data
}