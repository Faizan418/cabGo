// controllers/user.controller.js

const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, phone, cnic } = req.body;

    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
        return res.status(400).json({ message: 'User with this email already exists...' });
    }

    // Format CNIC standard XXXXX-XXXXXXX-X
    const cleanedCnic = (cnic || '').replace(/\D/g, '');
    const formattedCnic = cleanedCnic.length === 13 
        ? `${cleanedCnic.slice(0, 5)}-${cleanedCnic.slice(5, 12)}-${cleanedCnic.slice(12)}`
        : (cnic || '').trim();

    const isCnicAlreadyExist = await userModel.findOne({ cnic: formattedCnic });
    if (isCnicAlreadyExist) {
        return res.status(400).json({ message: 'User with this CNIC already exists...' });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        phone: (phone || '').trim(),
        cnic: formattedCnic
    });

    const token = user.generateAuthToken();

    res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
    res.status(200).json({ user: req.user });
};

module.exports.logoutUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || 
                     (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(400).json({ message: 'Token not found' });
        }

        // Blacklist the token
        await blacklistTokenModel.create({ token });

        // Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error("Logout error:", err.message);
        res.status(500).json({ message: 'Something went wrong during logout' });
    }
};


// Get User Ride History
module.exports.getRideHistory = async (req, res, next) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;

        const query = { user: req.user._id };

        // Filter by status (optional)
        if (status) {
            query.status = status;
        }

        const rides = await require('../models/ride.model').find(query)
            .populate('captain', 'fullname vehicle')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalRides = await require('../models/ride.model').countDocuments(query);

        res.status(200).json({
            rides,
            pagination: {
                total: totalRides,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalRides / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ================= PASSWORD RESET (USER) =================

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
            userType: 'user'
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
            userType: 'user'
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
            userType: 'user'
        });
        return res.status(200).json(result);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    }
};