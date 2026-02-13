const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FreelancerProfile',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image_url: {
        type: String,
    },
    project_link: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
