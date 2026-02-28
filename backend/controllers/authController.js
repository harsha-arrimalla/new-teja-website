const User = require('../models/User');
const { generateToken } = require('../config/generateToken');

// Password strength validation
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('one special character');
    return errors;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Validate password strength
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                message: `Password must contain ${passwordErrors.join(', ')}`,
            });
        }

        // Sanitize name (strip HTML tags)
        const sanitizedName = name.replace(/<[^>]*>/g, '').trim();
        if (sanitizedName.length < 2 || sanitizedName.length > 50) {
            return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name: sanitizedName,
            email: email.toLowerCase().trim(),
            password,
        });

        if (user) {
            // Set httpOnly cookie
            const token = generateToken(user._id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token, // also return in body for backward compat
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (user && (await user.matchPassword(password))) {
            // Set httpOnly cookie
            const token = generateToken(user._id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token, // also return in body for backward compat
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile (via token)
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
