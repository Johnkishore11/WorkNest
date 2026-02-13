const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    domain: {
        type: String, // Storing domain name or ID as string for simplicity, or ref to Domain model
    },
    hourly_rate: {
        type: Number,
    },
    skills: {
        type: [String],
    },
    available: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
