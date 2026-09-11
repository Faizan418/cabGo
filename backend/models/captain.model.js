// captain.model.js file code...

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname:{
        firstname: {
            type: String,
            required: true,
            minlength: [3, "First name must be at least 3 characters long"]
        },
        lastname: {
            type: String,
            minlength: [3, "Last name must be at least 3 characters long"]
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    socketId: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'unactive'],
        default: 'unactive'
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    cnic: {
        type: String,
        required: [true, 'CNIC is required'],
        unique: true,
        select: false,
        trim: true
    },
    drivingLicense: {
        type: String,
        required: [true, 'Driving license number is required'],
        trim: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    walletReserve: {
        type: Number,
        default: 0
    },
    completedRidesCount: {
        type: Number,
        default: 0
    },
    vehicle: {
        make: {
            type: String,
            default: ''
        },
        model: {
            type: String,
            default: ''
        },
        year: {
            type: Number
        },
        color: {
            type: String,
            required: true,
            minlength: [3, "Vehicle color must be at least 3 characters long"]
        },
        plate: {
            type: String,
            required: true,
            minlength: [3, "Vehicle plate must be at least 3 characters long"]
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, "Vehicle capacity must be at least 1"],
        },
        vehicleType: {
            type: String,
            enum: ['bike', 'car', 'auto'],
            required: true
        }
    },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            index: '2dsphere'
        }
    },

    earnings: {
        type: Number,
        default: 0
    },
    totalRides: {
        type: Number,
        default: 0
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

captainSchema.virtual('availableBalance').get(function() {
    return (this.walletBalance || 0) - (this.walletReserve || 0);
});

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
    return token;
} 

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const captainModel = mongoose.model('Captain', captainSchema);

module.exports = captainModel;