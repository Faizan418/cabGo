// models/passwordReset.model.js

const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    userType: {
        type: String,
        enum: ['user', 'captain'],
        required: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    otpExpiresAt: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    lastRequestedAt: {
        type: Date,
        default: Date.now
    },
    resetTokenHash: {
        type: String,
        default: null
    },
    resetTokenExpiresAt: {
        type: Date,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // MongoDB TTL index: auto delete document 15 minutes after createdAt
    }
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
