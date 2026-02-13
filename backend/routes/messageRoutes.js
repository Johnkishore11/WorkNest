const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
router.get('/unread', protect, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            read: false,
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get all messages for current user
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ receiver: req.user._id }, { sender: req.user._id }]
        })
            .populate('sender', 'full_name profile_image')
            .populate('receiver', 'full_name profile_image')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
    const { receiver_id, subject, message } = req.body;

    try {
        const newMessage = new Message({
            sender: req.user._id,
            receiver: receiver_id,
            subject,
            message,
        });

        const createdMessage = await newMessage.save();
        // Populate sender details for immediate return
        await createdMessage.populate('sender', 'full_name profile_image');
        await createdMessage.populate('receiver', 'full_name profile_image');

        res.status(201).json(createdMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            // Check if user is the receiver
            if (message.receiver.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            message.read = true;
            const updatedMessage = await message.save();
            res.json(updatedMessage);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
