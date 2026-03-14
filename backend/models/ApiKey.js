const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    apiKey: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
