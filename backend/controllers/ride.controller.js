// controllers/ride.controller.js

const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);

        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType,
            pickupCoords: pickupCoordinates,
            destinationCoords: destinationCoordinates
        });

        res.status(201).json(ride);

        const captainsInRadius = await mapService.getCaptainInTheRadius(
            pickupCoordinates.lat,
            pickupCoordinates.lng,
            2000,
            vehicleType
        );

        const rideWithUser = await rideModel.findById(ride._id).populate('user');

        captainsInRadius.forEach(captain => {
            if (captain.socketId) {
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideWithUser
                });
            }
        });

        console.log(`📢 ${captainsInRadius.length} captains notified for new ride`);

    } catch (err) {
        console.error("Create Ride Error:", err.message);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.confirmRide = async (req, res) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ message: "RideId is required" });
        }

        const ride = await rideService.confirmRide({
            rideId,
            captain: req.captain
        });

        const rideWithUser = await rideModel
            .findById(ride._id)
            .populate('user')
            .populate('captain')
            .select('+otp');

        if (rideWithUser.user?.socketId) {
            sendMessageToSocketId(rideWithUser.user.socketId, {
                event: 'ride-confirmed',
                data: rideWithUser
            });
        }

        return res.status(200).json(rideWithUser);

    } catch (err) {
        console.error("Confirm Ride Error:", err.message);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        const rideWithUser = await rideModel.findById(ride._id)
            .populate('user')
            .populate('captain');

        if (rideWithUser.user?.socketId) {
            sendMessageToSocketId(rideWithUser.user.socketId, {
                event: 'ride-started',
                data: rideWithUser
            });
        }

        return res.status(200).json(rideWithUser);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({
            rideId,
            captain: req.captain
        });

        if (ride.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-completed-cash',
                data: {
                    rideId: ride._id,
                    fare: ride.fare,
                    message: `Ride completed. Please pay ₹${ride.fare} in cash to the captain.`
                }
            });
        }

        return res.status(200).json({
            message: "Ride ended successfully. Cash payment pending.",
            ride,
            paymentInfo: {
                amount: ride.fare,
                method: "cash",
                status: "pending"
            }
        });

    } catch (err) {
        console.error("End Ride Error:", err.message);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.arriveRide = async (req, res) => {
    try {
        const { rideId } = req.body;

        const ride = await rideModel.findByIdAndUpdate(
            rideId,
            { status: "arrived" },
            { new: true }
        ).populate("user").populate("captain");

        if (ride?.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: "captain-arrived",
                data: ride
            });
        }

        res.status(200).json(ride);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cancel Ride
module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, reason } = req.body;
    let cancelledBy;

    try {
        if (req.user) {
            cancelledBy = 'user';

            const ownRide = await rideModel.findOne({ _id: rideId, user: req.user._id });
            if (!ownRide) {
                return res.status(403).json({ message: "You can only cancel your own ride" });
            }
        } else if (req.captain) {
            cancelledBy = 'captain';

            const ownRide = await rideModel.findOne({ _id: rideId, captain: req.captain._id });
            if (!ownRide) {
                return res.status(403).json({ message: "You can only cancel rides you accepted" });
            }
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const ride = await rideService.cancelRide({
            rideId,
            cancelledBy,
            reason
        });

        // Accepted ride: notify the other party
        if (cancelledBy === 'user' && ride.captain?.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'ride-cancelled',
                data: {
                    rideId: ride._id,
                    cancelledBy,
                    reason: reason || 'Cancelled by user'
                }
            });
        }

        if (cancelledBy === 'captain' && ride.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-cancelled',
                data: {
                    rideId: ride._id,
                    cancelledBy,
                    reason: reason || 'Cancelled by captain'
                }
            });
        }

        // 🔥 Pending ride cancel → nearby same vehicle captains se request hatao
        if (cancelledBy === 'user' && !ride.captain) {
            try {
                const lat = ride.pickupCoords?.lat;
                const lng = ride.pickupCoords?.lng;
                const vehicleType = ride.vehicleType;

                if (lat && lng) {
                    const captains = await mapService.getCaptainInTheRadius(
                        lat,
                        lng,
                        2000,
                        vehicleType
                    );

                    captains.forEach((captain) => {
                        if (captain.socketId) {
                            sendMessageToSocketId(captain.socketId, {
                                event: 'ride-cancelled',
                                data: {
                                    rideId: ride._id,
                                    cancelledBy: 'user',
                                    reason: reason || 'Cancelled by user'
                                }
                            });
                        }
                    });

                    console.log(`🚫 Cancel notified to ${captains.length} captains`);
                }
            } catch (notifyErr) {
                console.log('Cancel notify captains error:', notifyErr.message);
            }
        }

        return res.status(200).json({
            message: 'Ride cancelled successfully',
            ride
        });

    } catch (err) {
        console.error("Cancel Ride Error:", err.message);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.confirmCashPayment = async (req, res) => {
    try {
        const { rideId } = req.body;

        const ride = await rideService.confirmCashPayment({
            rideId,
            captain: req.captain
        });

        if (ride.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'cash-payment-confirmed',
                data: {
                    rideId: ride._id,
                    message: 'Captain has confirmed cash payment. Ride completed successfully.'
                }
            });
        }

        res.status(200).json({
            message: "Cash payment confirmed successfully",
            ride
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};