const mongoose = require('mongoose');

const connectionHistorySchema = new mongoose.Schema({
    connectionId: {
        type: String,
        required: true
    },
    initiatorId: {
        type: String,
        required: true
    },
    connectionType: {
        type: String,
        required: true
    },
    connectionStatus: {
        type: String,
        required: true
    },
    connectionDuration: {
        type: Number
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('ConnectionHistory', connectionHistorySchema);