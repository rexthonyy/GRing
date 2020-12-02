const mongoose = require('mongoose');

const connectedUserSchema = new mongoose.Schema({
    connectionId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ConnectedUser', connectedUserSchema);