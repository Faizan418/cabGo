// models/walletTransaction.model.js
const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['RECHARGE', 'COMMISSION', 'RESERVE', 'RELEASE', 'REFUND', 'ADJUSTMENT'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    reserveBefore: {
        type: Number,
        default: 0
    },
    reserveAfter: {
        type: Number,
        default: 0
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ride'
    },
    paymentReference: {
        type: String,
        default: null
    },
    paymentProvider: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'completed'
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

walletTransactionSchema.index({ captain: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
