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

// @desc    Get saved freelancers
// @route   GET /api/users/saved
// @access  Private
router.get('/saved/list', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('saved_freelancers', '-password');
        if (user) {
            res.json(user.saved_freelancers);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Save a freelancer
// @route   POST /api/users/save/:freelancerId
// @access  Private
router.post('/save/:freelancerId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const freelancerToSave = await User.findById(req.params.freelancerId);

        if (!freelancerToSave || freelancerToSave.role !== 'freelancer') {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        if (user.saved_freelancers.includes(req.params.freelancerId)) {
            return res.status(400).json({ message: 'Freelancer already saved' });
        }

        user.saved_freelancers.push(req.params.freelancerId);
        await user.save();

        res.json({ message: 'Freelancer saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Unsave a freelancer
// @route   DELETE /api/users/save/:freelancerId
// @access  Private
router.delete('/save/:freelancerId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.saved_freelancers = user.saved_freelancers.filter(
            id => id.toString() !== req.params.freelancerId
        );

        await user.save();
        res.json({ message: 'Freelancer removed from saved list' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
