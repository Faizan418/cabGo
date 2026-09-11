// controllers/captain.controller.js

const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, phone, cnic, drivingLicense, vehicle } = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({ email });
    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain with this email already exists...' });
    }

    // Format CNIC standard XXXXX-XXXXXXX-X
    const cleanedCnic = (cnic || '').replace(/\D/g, '');
    const formattedCnic = cleanedCnic.length === 13 
        ? `${cleanedCnic.slice(0, 5)}-${cleanedCnic.slice(5, 12)}-${cleanedCnic.slice(12)}`
        : (cnic || '').trim();

    const isCnicAlreadyExist = await captainModel.findOne({ cnic: formattedCnic });
    if (isCnicAlreadyExist) {
        return res.status(400).json({ message: 'Captain with this CNIC already exists...' });
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        phone: (phone || '').trim(),
        cnic: formattedCnic,
        drivingLicense: (drivingLicense || '').trim(),
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year ? Number(vehicle.year) : undefined
    });

    const token = captain.generateAuthToken();

    res.status(201).json({
        token,
        captain,
        message: 'Registration submitted successfully. Your account is pending verification.'
    });
};

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');

    if (!captain) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = captain.generateAuthToken();

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({ token, captain });
};

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
    try {
        const token = req.cookies.token || 
                     (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (token) {
            await blacklistTokenModel.create({ token });
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Logout failed' });
    }
};

// 🔥 Naya Function
module.exports.toggleAvailability = async (req, res) => {
    try {
        const { status } = req.body;   // active or unactive

        const captain = await captainService.toggleAvailability(req.captain._id, status);

        res.status(200).json({ 
            message: `Captain is now ${status}`,
            captain 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get Captain's Current Ride
module.exports.getCurrentRide = async (req, res, next) => {
    try {
        const ride = await require('../models/ride.model').findOne({
            captain: req.captain._id,
            status: { $in: ['accepted', 'arriving', 'arrived', 'ongoing'] }
        })
        .populate('user')
        .populate('captain')
        .select('+otp');

        if (!ride) {
            return res.status(200).json({ 
                message: "No active ride found",
                ride: null 
            });
        }

        res.status(200).json({ ride });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Get Captain Earnings
// Get filtered earnings
module.exports.getEarnings = async (req, res) => {
    try {
        const { period = 'today' } = req.query;
        const rideModel = require('../models/ride.model');

        const now = new Date();
        let startDate, endDate;

        // Day start helper (local midnight)
        const startOfDay = (d) => {
            const x = new Date(d);
            x.setHours(0, 0, 0, 0);
            return x;
        };

        const endOfDay = (d) => {
            const x = new Date(d);
            x.setHours(23, 59, 59, 999);
            return x;
        };

        if (period === 'today') {
            startDate = startOfDay(now);
            endDate = endOfDay(now);
        } else if (period === 'yesterday') {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            startDate = startOfDay(y);
            endDate = endOfDay(y);
        } else if (period === 'week') {
            const w = new Date(now);
            const day = w.getDay(); // 0 Sun
            const diff = day === 0 ? 6 : day - 1; // Monday start
            w.setDate(w.getDate() - diff);
            startDate = startOfDay(w);
            endDate = endOfDay(now);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = endOfDay(now);
        } else if (period === 'previous_month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        } else {
            startDate = startOfDay(now);
            endDate = endOfDay(now);
        }

        const rides = await rideModel.find({
            captain: req.captain._id,
            status: 'completed',
            paymentStatus: 'paid',
            updatedAt: { $gte: startDate, $lte: endDate }
        });

        const totalEarnings = rides.reduce((sum, r) => sum + (r.fare || 0), 0);
        const totalRides = rides.length;

        res.status(200).json({
            period,
            totalEarnings,
            totalRides,
            startDate,
            endDate
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= PASSWORD RESET (CAPTAIN) =================

const passwordResetService = require('../services/passwordReset.service');

module.exports.forgotPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const result = await passwordResetService.sendResetOtp({
            email,
            userType: 'captain'
        });
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message,
            waitSeconds: err.waitSeconds
        });
    }
};

module.exports.verifyResetOtp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, otp } = req.body;
        const result = await passwordResetService.verifyResetOtp({
            email,
            otp,
            userType: 'captain'
        });
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message,
            remainingAttempts: err.remainingAttempts
        });
    }
};

module.exports.resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { resetToken, newPassword, confirmPassword } = req.body;
        const result = await passwordResetService.resetPassword({
            resetToken,
            newPassword,
            confirmPassword,
            userType: 'captain'
        });
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    }
};

// ================= CAPTAIN WALLET & LEDGER =================

const walletService = require('../services/wallet.service');

// Get Captain Wallet Info
module.exports.getCaptainWallet = async (req, res) => {
    try {
        const wallet = await walletService.getWalletInfo(req.captain._id);
        res.status(200).json(wallet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Captain Wallet Ledger Transactions
module.exports.getWalletTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 15, type } = req.query;
        const result = await walletService.getTransactions({
            captainId: req.captain._id,
            page,
            limit,
            type
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create Recharge Intent
module.exports.createRechargeIntent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { amount } = req.body;
        if (Number(amount) < 100) {
            return res.status(400).json({ message: 'Minimum recharge amount is Rs. 100' });
        }

        const paymentReference = `CABGO-WAL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        res.status(200).json({
            message: 'Recharge payment intent created',
            paymentReference,
            amount: Number(amount),
            provider: 'Sandbox Gateway',
            currency: 'PKR',
            status: 'intent_created'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Confirm Recharge
module.exports.confirmRecharge = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { amount, paymentReference, provider } = req.body;

        const result = await walletService.rechargeWallet({
            captainId: req.captain._id,
            amount: Number(amount),
            paymentReference,
            provider: provider || 'Direct Transfer / Card',
            description: `Prepaid wallet recharge of Rs. ${amount}`
        });

        res.status(200).json({
            message: 'Wallet recharge successful',
            ...result
        });
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json({ message: err.message });
    }
};