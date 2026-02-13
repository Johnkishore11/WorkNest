const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    icon: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Domain', domainSchema);
