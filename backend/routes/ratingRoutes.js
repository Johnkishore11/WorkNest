const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a rating
// @route   POST /api/ratings
// @access  Private
router.post('/', protect, async (req, res) => {
    const { freelancer_id, rating, comment } = req.body;

    try {
        // Check if rating already exists
        const existingRating = await Rating.findOne({
            client: req.user._id,
            freelancer: freelancer_id
        });

        if (existingRating) {
            // Update existing
            existingRating.rating = rating;
            existingRating.comment = comment;
            const updatedRating = await existingRating.save();
            return res.json(updatedRating);
        }

        const newRating = new Rating({
            client: req.user._id,
            freelancer: freelancer_id,
            rating,
            comment
        });

        const savedRating = await newRating.save();
        res.status(201).json(savedRating);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get ratings for a freelancer
// @route   GET /api/ratings/:freelancerId
// @access  Public
router.get('/:freelancerId', async (req, res) => {
    try {
        const ratings = await Rating.find({ freelancer: req.params.freelancerId })
            .populate('client', 'full_name profile_image')
            .sort({ createdAt: -1 });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get a specific rating by client and freelancer
// @route   GET /api/ratings/check/:freelancerId
// @access  Private
router.get('/check/:freelancerId', protect, async (req, res) => {
    try {
        const rating = await Rating.findOne({
            client: req.user._id,
            freelancer: req.params.freelancerId
        });
        res.json(rating || null);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
