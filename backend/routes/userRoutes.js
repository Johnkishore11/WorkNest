const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.full_name = req.body.full_name || user.full_name;
            user.bio = req.body.bio || user.bio;
            user.profile_image = req.body.profile_image || user.profile_image;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                profile_image: updatedUser.profile_image,
                token: req.headers.authorization.split(' ')[1] // Keep existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
