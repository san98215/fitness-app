import bcryptjs from 'bcryptjs'

import { User } from '../models/user.model.js'
import { generateToken } from '../utils/generateToken.js'

async function validateRegister(req, res) {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all fields'
        })
    }

    // Use regex to validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email'
        })
    }

    // Assert password has at least one number, one special character, and one capital letter
    const pswdRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!pswdRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters w/at least one number, one special character, and one uppercase letter'
        })
    }

    if (await User.findOne({ email: email })) {
        return res.status(400).json({
            success: false,
            message: 'An account with this email already exists'
        })
    }

    if (await User.findOne({ username: username })) {
        return res.status(400).json({
            success: false,
            message: 'An account with this username already exists'
        })
    }
}

// Registration w/jwt token functionality
export async function register(req, res) {
    try {
        const { username, email, password } = req.body

        validateRegister(req, res)
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const user = new User({ username, email, password: hashedPassword })
        generateToken(user._id, res)
        await user.save()

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { ...user._doc, password: null }
        })
    } catch (error) {
        console.log('Error registering user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields'
            })
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        if (!await bcryptjs.compare(password, user.password)) {
            return res.status(404).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        generateToken(user._id, res)
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user: { ...user._doc, password: null }
        })
    } catch (error) {
        console.log('Error logging in user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("nflix-clone")
        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        })
    } catch (error) {
        console.log('Error logging out user:', error.message)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}