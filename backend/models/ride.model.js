// models/ride.model.js

const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain',
    },

    pickup: { type: String, required: true },
    pickupCoords: {
        lat: { type: Number },
        lng: { type: Number }
    },

    destination: { type: String, required: true },
    destinationCoords: {
        lat: { type: Number },
        lng: { type: Number }
    },

    vehicleType: {
        type: String,
        enum: ['bike', 'car', 'auto'],
        required: true
    },
    
    fare: { type: Number, required: true },


    status: {
        type: String,
        enum: ['pending', 'accepted', 'arriving', 'arrived', 'ongoing', 'completed', 'cancelled'],
        default: 'pending',
    },

    cancelledBy: {
        type: String,
        enum: ['user', 'captain', null],
        default: null
    },

    cancellationReason: {
        type: String,
        default: ''
    },

    duration: { type: Number },
    distance: { type: Number },

    otp: {
        type: String,
        select: false,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        default: 'cash'
    },

    // Financial & Commission Ledger Snapshot
    commissionRate: {
        type: Number,
        default: 0
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    captainEarning: {
        type: Number,
        default: 0
    },
    reservedCommission: {
        type: Number,
        default: 0
    },
    commissionDeducted: {
        type: Boolean,
        default: false
    },
    walletTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WalletTransaction'
    }

}, { timestamps: true });

module.exports = mongoose.model('ride', rideSchema);