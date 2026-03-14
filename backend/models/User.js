const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    full_name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['freelancer', 'client'],
        required: true,
    },
    bio: {
        type: String,
    },
    profile_image: {
        type: String,
    },
    saved_freelancers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
