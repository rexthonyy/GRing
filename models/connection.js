const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    connectionId: {
        type: String,
        required: true
    },
    initiatorId: {
        type: String,
        required: true
    },
    contactId: {
        type: String,
        required: true
    },
    connectionStatus: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Connection', connectionSchema);