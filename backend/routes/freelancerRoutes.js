const express = require('express');
const router = express.Router();
const FreelancerProfile = require('../models/FreelancerProfile');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all freelancer profiles with optional domain filter
// @route   GET /api/freelancers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { domain_id } = req.query;
        let query = {};

        if (domain_id) {
            query.domain = domain_id;
        }

        const profiles = await FreelancerProfile.find(query)
            .populate('user', 'full_name profile_image bio')
            .populate('domain', 'name');

        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get freelancer profile by user ID
// @route   GET /api/freelancers/user/:userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const profile = await FreelancerProfile.findOne({ user: req.params.userId })
            .populate('user', 'full_name profile_image bio email role')
            .populate('domain', 'name');

        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get current freelancer profile
// @route   GET /api/freelancers/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const profile = await FreelancerProfile.findOne({ user: req.user._id })
            .populate('user', 'full_name profile_image bio');
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create or update freelancer profile
// @route   POST /api/freelancers
// @access  Private
router.post('/', protect, async (req, res) => {
    const { domain_id, hourly_rate, skills, available } = req.body;

    const profileFields = {
        user: req.user._id,
        domain: domain_id,
        hourly_rate,
        skills,
        available
    };

    try {
        let profile = await FreelancerProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update
            profile = await FreelancerProfile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new FreelancerProfile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get portfolios for current freelancer
// @route   GET /api/freelancers/portfolio
// @access  Private
router.get('/portfolio', protect, async (req, res) => {
    try {
        const freelancer = await FreelancerProfile.findOne({ user: req.user._id });
        if (!freelancer) return res.json([]);

        const portfolios = await Portfolio.find({ freelancer: freelancer._id });
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get portfolios by freelancer ID (public)
// @route   GET /api/freelancers/portfolio/:freelancerId
// @access  Public
router.get('/portfolio/:freelancerId', async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ freelancer: req.params.freelancerId });
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Add portfolio item
// @route   POST /api/freelancers/portfolio
// @access  Private
router.post('/portfolio', protect, async (req, res) => {
    try {
        const freelancer = await FreelancerProfile.findOne({ user: req.user._id });
        if (!freelancer) {
            return res.status(404).json({ message: 'Freelancer profile not found' });
        }

        const newPortfolio = new Portfolio({
            freelancer: freelancer._id,
            ...req.body
        });

        const portfolio = await newPortfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete portfolio item
// @route   DELETE /api/freelancers/portfolio/:id
// @access  Private
router.delete('/portfolio/:id', protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        await portfolio.deleteOne();
        res.json({ message: 'Portfolio removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
