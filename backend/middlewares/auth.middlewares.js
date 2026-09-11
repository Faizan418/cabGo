// middlewares/auth.middlewares.js

const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklistToken.model');
const captainModel = require('../models/captain.model');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        if (!captain) {
            return res.status(401).json({ message: 'Captain not found' });
        }

        req.captain = captain;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// 🔥 User YA Captain — dono ke liye (Cancel Ride ke liye)
module.exports.authUserOrCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Pehle user check
        const user = await userModel.findById(decoded._id);
        if (user) {
            req.user = user;
            return next();
        }

        // Phir captain check
        const captain = await captainModel.findById(decoded._id);
        if (captain) {
            req.captain = captain;
            return next();
        }

        return res.status(401).json({ message: 'Invalid token.' });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

