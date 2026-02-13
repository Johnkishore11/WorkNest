const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

// @desc    Get all domains
// @route   GET /api/domains
// @access  Public
router.get('/', async (req, res) => {
    try {
        const domains = await Domain.find().sort({ name: 1 });
        res.json(domains);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get domain by ID
// @route   GET /api/domains/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.id);
        if (!domain) return res.status(404).json({ message: 'Domain not found' });
        res.json(domain);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a domain (for seeding/admin)
// @route   POST /api/domains
// @access  Public (should be protected in prod)
router.post('/', async (req, res) => {
    try {
        const domain = await Domain.create(req.body);
        res.status(201).json(domain);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
