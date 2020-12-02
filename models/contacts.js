const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    contactId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Contact', contactSchema);