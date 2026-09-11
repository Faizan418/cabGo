// controllers/admin.controller.js

const SystemSetting = require('../models/systemSetting.model');
const Captain = require('../models/captain.model');

// Get System Settings
module.exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.getSettings();
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update System Settings
module.exports.updateSettings = async (req, res) => {
    try {
        const { commissionRate, promotionalFreeRides, fuelPrice, vehiclePricing } = req.body;

        const updateData = {};
        if (commissionRate !== undefined) updateData.commissionRate = Number(commissionRate);
        if (promotionalFreeRides !== undefined) updateData.promotionalFreeRides = Number(promotionalFreeRides);
        if (fuelPrice !== undefined) updateData.fuelPrice = Number(fuelPrice);
        if (vehiclePricing) updateData.vehiclePricing = vehiclePricing;

        const settings = await SystemSetting.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'System settings updated successfully',
            settings
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Captains (for admin monitoring & verification)
module.exports.getCaptains = async (req, res) => {
    try {
        const { status, verificationStatus, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;
        if (verificationStatus) query.verificationStatus = verificationStatus;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [captains, total] = await Promise.all([
            Captain.find(query)
                .select('+cnic') // Admins genuinely require CNIC for verification
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Captain.countDocuments(query)
        ]);

        res.status(200).json({
            captains,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Captain Verification Status (Approve / Reject)
module.exports.updateCaptainVerification = async (req, res) => {
    try {
        const { captainId } = req.params;
        const { verificationStatus } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(verificationStatus)) {
            return res.status(400).json({ message: 'Invalid verification status' });
        }

        const captain = await Captain.findByIdAndUpdate(
            captainId,
            { verificationStatus },
            { new: true }
        );

        if (!captain) {
            return res.status(404).json({ message: 'Captain not found' });
        }

        res.status(200).json({
            message: `Captain verification status updated to ${verificationStatus}`,
            captain
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
