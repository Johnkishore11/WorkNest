const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        email,
        password: hashedPassword,
        full_name,
        role,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = router;
