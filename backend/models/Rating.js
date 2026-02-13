const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FreelancerProfile',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
