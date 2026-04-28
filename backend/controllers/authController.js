const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserByUsername } = require('../models/userModel');

/**
 * POST /api/auth/register
 * Register a new user.
 */
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // --- Validation ---
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Username, email, and password are required.'
            });
        }

        if (username.length > 50) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Username must be 50 characters or fewer.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Password must be at least 6 characters.'
            });
        }

        // Check for existing user
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                data: null,
                message: 'Email is already registered.'
            });
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                data: null,
                message: 'Username is already taken.'
            });
        }

        // Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await createUser(username, email, passwordHash);

        // Generate token for immediate login after registration
        const token = jwt.sign(
            { id: result.insertId, username, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            data: {
                token,
                user: { id: result.insertId, username, email }
            },
            message: 'Registration successful.'
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error during registration.'
        });
    }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- Validation ---
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Email and password are required.'
            });
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid email or password.'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'Invalid email or password.'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            },
            message: 'Login successful.'
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            message: 'Internal server error during login.'
        });
    }
};

module.exports = { register, login };
