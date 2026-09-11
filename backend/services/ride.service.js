// services/ride.service.js

const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const fareService = require('./fare.service');
const walletService = require('./wallet.service');
const captainModel = require('../models/captain.model');
const SystemSetting = require('../models/systemSetting.model');
const crypto = require('crypto');

// GET FARE
async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const calculated = await fareService.calculateFares(pickup, destination);
    return {
        ...calculated.fares,
        distanceTime: calculated.distanceTime,
        breakdowns: calculated.breakdowns,
        fuelPrice: calculated.fuelPrice
    };
}

module.exports.getFare = getFare;

// Generate OTP
function getOtp(num) {
    return crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
}

// Create Ride
module.exports.createRide = async ({ 
    user, 
    pickup, 
    destination, 
    vehicleType,
    pickupCoords,
    destinationCoords 
}) => {
    const fare = await getFare(pickup, destination);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType],
        vehicleType: vehicleType,
        pickupCoords: {
            lat: pickupCoords.lat,
            lng: pickupCoords.lng
        },
        destinationCoords: {
            lat: destinationCoords.lat,
            lng: destinationCoords.lng
        },
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash'
    });

    return ride;
};

// Confirm Ride (Captain accepts ride)
module.exports.confirmRide = async ({ rideId, captain }) => {
    // 1. Fetch fresh captain record
    const freshCaptain = await captainModel.findById(captain._id);
    if (!freshCaptain) {
        throw new Error('Captain account not found');
    }

    // 2. Verification status check
    if (freshCaptain.verificationStatus !== 'approved') {
        const err = new Error(
            'Your account verification is pending approval. You cannot accept rides until verified by an administrator.'
        );
        err.statusCode = 403;
        throw err;
    }

    // 3. Find ride
    const ride = await rideModel.findById(rideId);
    if (!ride) {
        throw new Error('Ride not found');
    }
    if (ride.status !== 'pending') {
        throw new Error('Ride is no longer available');
    }

    // 4. Calculate expected commission & check promotional free rides
    const settings = await SystemSetting.getSettings();
    const promotionalTotal = settings.promotionalFreeRides ?? 5;
    const isPromo = (freshCaptain.completedRidesCount || 0) < promotionalTotal;
    const applicableRate = isPromo ? 0 : (settings.commissionRate || 10);
    const expectedCommission = isPromo ? 0 : Math.round(ride.fare * applicableRate / 100);

    // 5. Reserve commission from wallet if applicable
    if (expectedCommission > 0) {
        await walletService.reserveCommission({
            captainId: freshCaptain._id,
            rideId: ride._id,
            expectedCommission
        });
    }

    // 6. Update ride status
    ride.status = 'accepted';
    ride.captain = freshCaptain._id;
    ride.reservedCommission = expectedCommission;
    ride.commissionRate = applicableRate;
    await ride.save();

    const populatedRide = await rideModel.findById(rideId)
        .populate('user')
        .populate('captain');

    return populatedRide;
};

// Start Ride
module.exports.startRide = async ({ rideId, otp, captain }) => {
    const ride = await rideModel.findById(rideId)
        .populate('user')
        .populate('captain')
        .select('+otp');

    if (!ride) throw new Error('Ride not found');
    if (ride.otp !== otp) throw new Error('Invalid OTP');

    ride.status = 'ongoing';
    await ride.save();

    return ride;
};

// End Ride (With automatic commission deduction and idempotency)
module.exports.endRide = async ({ rideId, captain }) => {
    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user');

    if (!ride) throw new Error('Ride not found');

    if (ride.status === 'cancelled') {
        throw new Error('Ride was already cancelled');
    }

    // Idempotency: If already completed and commission deducted, return existing record
    if (ride.status === 'completed' && ride.commissionDeducted) {
        return ride;
    }

    // Fetch fresh captain for accurate promotional counter & balance
    const freshCaptain = await captainModel.findById(captain._id);
    const settings = await SystemSetting.getSettings();
    const promotionalTotal = settings.promotionalFreeRides ?? 5;
    const isPromo = (freshCaptain.completedRidesCount || 0) < promotionalTotal;
    const commissionRate = isPromo ? 0 : (settings.commissionRate || 10);
    const commissionAmount = isPromo ? 0 : Math.round(ride.fare * commissionRate / 100);
    const captainEarning = ride.fare - commissionAmount;

    // Deduct commission from prepaid wallet (or log 0% promotional record)
    const deductionResult = await walletService.deductCommission({
        captainId: freshCaptain._id,
        rideId: ride._id,
        fare: ride.fare,
        commissionRate,
        commissionAmount,
        captainEarning,
        reservedAmount: ride.reservedCommission || 0
    });

    // Save immutable financial snapshot to ride
    ride.status = 'completed';
    ride.paymentStatus = 'pending';
    ride.commissionRate = commissionRate;
    ride.commissionAmount = commissionAmount;
    ride.captainEarning = captainEarning;
    ride.reservedCommission = 0;
    ride.commissionDeducted = true;
    ride.walletTransaction = deductionResult.transaction._id;
    await ride.save();

    return ride;
};

// Cancel Ride (Releases reservation if held)
module.exports.cancelRide = async ({ rideId, cancelledBy, reason = '' }) => {
    const ride = await rideModel.findById(rideId)
        .populate('user')
        .populate('captain');

    if (!ride) throw new Error('Ride not found');

    if (ride.status === 'completed' || ride.status === 'cancelled') {
        throw new Error('Ride cannot be cancelled now');
    }

    // Release reserved commission if held and not yet deducted
    if (ride.reservedCommission > 0 && !ride.commissionDeducted && ride.captain) {
        const captainId = ride.captain._id || ride.captain;
        await walletService.releaseReservation({
            captainId,
            rideId: ride._id,
            amount: ride.reservedCommission
        });
        ride.reservedCommission = 0;
    }

    ride.status = 'cancelled';
    ride.cancelledBy = cancelledBy;
    ride.cancellationReason = reason;
    await ride.save();

    return ride;
};

// Confirm Cash Payment by Captain
module.exports.confirmCashPayment = async ({ rideId, captain }) => {
    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id,
        status: 'completed'
    }).populate('user');

    if (!ride) throw new Error('Ride not found or not completed yet');

    // Safety fallback: Ensure commission is deducted if endRide was bypassed
    if (!ride.commissionDeducted) {
        const freshCaptain = await captainModel.findById(captain._id);
        const settings = await SystemSetting.getSettings();
        const promotionalTotal = settings.promotionalFreeRides ?? 5;
        const isPromo = (freshCaptain.completedRidesCount || 0) < promotionalTotal;
        const commissionRate = isPromo ? 0 : (settings.commissionRate || 10);
        const commissionAmount = isPromo ? 0 : Math.round(ride.fare * commissionRate / 100);
        const captainEarning = ride.fare - commissionAmount;

        const deductionResult = await walletService.deductCommission({
            captainId: freshCaptain._id,
            rideId: ride._id,
            fare: ride.fare,
            commissionRate,
            commissionAmount,
            captainEarning,
            reservedAmount: ride.reservedCommission || 0
        });

        ride.commissionRate = commissionRate;
        ride.commissionAmount = commissionAmount;
        ride.captainEarning = captainEarning;
        ride.reservedCommission = 0;
        ride.commissionDeducted = true;
        ride.walletTransaction = deductionResult.transaction._id;
    }

    ride.paymentStatus = 'paid';
    await ride.save();

    return ride;
};