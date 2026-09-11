// services/wallet.service.js
const Captain = require('../models/captain.model');
const WalletTransaction = require('../models/walletTransaction.model');
const SystemSetting = require('../models/systemSetting.model');

/**
 * Fetch captain wallet summary with promotional ride status
 */
async function getWalletInfo(captainId) {
    const captain = await Captain.findById(captainId);
    if (!captain) {
        throw new Error('Captain not found');
    }

    const settings = await SystemSetting.getSettings();
    const promotionalTotal = settings.promotionalFreeRides ?? 5;
    const completedRidesCount = captain.completedRidesCount || 0;
    const freeRidesRemaining = Math.max(0, promotionalTotal - completedRidesCount);
    const availableBalance = (captain.walletBalance || 0) - (captain.walletReserve || 0);

    return {
        walletBalance: captain.walletBalance || 0,
        walletReserve: captain.walletReserve || 0,
        availableBalance,
        completedRidesCount,
        freeRidesRemaining,
        promotionalTotal,
        commissionRate: settings.commissionRate || 10,
        isPromotionalActive: freeRidesRemaining > 0
    };
}

/**
 * Reserve expected commission when captain accepts a ride.
 */
async function reserveCommission({ captainId, rideId, expectedCommission }) {
    if (expectedCommission <= 0) {
        return { success: true, reserved: 0 };
    }

    const captain = await Captain.findById(captainId);
    if (!captain) {
        throw new Error('Captain not found');
    }

    const availableBalance = (captain.walletBalance || 0) - (captain.walletReserve || 0);
    if (availableBalance < expectedCommission) {
        const err = new Error(
            `Insufficient wallet balance to accept this ride. Required: Rs. ${expectedCommission}, Available: Rs. ${availableBalance}. Please recharge your CabGo wallet.`
        );
        err.code = 'INSUFFICIENT_BALANCE';
        err.statusCode = 400;
        throw err;
    }

    const balanceBefore = captain.walletBalance;
    const reserveBefore = captain.walletReserve || 0;
    const reserveAfter = reserveBefore + expectedCommission;

    captain.walletReserve = reserveAfter;
    await captain.save();

    const transaction = await WalletTransaction.create({
        captain: captainId,
        type: 'RESERVE',
        amount: expectedCommission,
        balanceBefore,
        balanceAfter: balanceBefore,
        reserveBefore,
        reserveAfter,
        ride: rideId,
        status: 'completed',
        description: `Reserved Rs. ${expectedCommission} commission for Ride #${rideId}`
    });

    return {
        success: true,
        reserved: expectedCommission,
        transactionId: transaction._id
    };
}

/**
 * Release reserved commission when ride is cancelled before completion.
 */
async function releaseReservation({ captainId, rideId, amount }) {
    if (!amount || amount <= 0) {
        return { success: true, released: 0 };
    }

    const captain = await Captain.findById(captainId);
    if (!captain) return { success: false };

    const balanceBefore = captain.walletBalance;
    const reserveBefore = captain.walletReserve || 0;
    const releaseAmount = Math.min(reserveBefore, amount);
    const reserveAfter = Math.max(0, reserveBefore - releaseAmount);

    captain.walletReserve = reserveAfter;
    await captain.save();

    const transaction = await WalletTransaction.create({
        captain: captainId,
        type: 'RELEASE',
        amount: releaseAmount,
        balanceBefore,
        balanceAfter: balanceBefore,
        reserveBefore,
        reserveAfter,
        ride: rideId,
        status: 'completed',
        description: `Released Rs. ${releaseAmount} reserved commission for cancelled Ride #${rideId}`
    });

    return {
        success: true,
        released: releaseAmount,
        transactionId: transaction._id
    };
}

/**
 * Deduct commission upon successful cash ride completion.
 * Protected by idempotency check.
 */
async function deductCommission({
    captainId,
    rideId,
    fare,
    commissionRate,
    commissionAmount,
    captainEarning,
    reservedAmount = 0
}) {
    const captain = await Captain.findById(captainId);
    if (!captain) {
        throw new Error('Captain not found');
    }

    const balanceBefore = captain.walletBalance || 0;
    const balanceAfter = balanceBefore - commissionAmount;
    const reserveBefore = captain.walletReserve || 0;
    const reserveAfter = Math.max(0, reserveBefore - reservedAmount);

    captain.walletBalance = balanceAfter;
    captain.walletReserve = reserveAfter;
    captain.completedRidesCount = (captain.completedRidesCount || 0) + 1;
    captain.totalRides = (captain.totalRides || 0) + 1;
    captain.earnings = (captain.earnings || 0) + captainEarning;

    await captain.save();

    const transaction = await WalletTransaction.create({
        captain: captainId,
        type: 'COMMISSION',
        amount: commissionAmount,
        balanceBefore,
        balanceAfter,
        reserveBefore,
        reserveAfter,
        ride: rideId,
        status: 'completed',
        description: commissionAmount === 0
            ? `Ride #${rideId} completed with Promotional 0% Commission (New Captain Bonus). Net: Rs. ${captainEarning}`
            : `Deducted Rs. ${commissionAmount} (${commissionRate}% commission) for Ride #${rideId}. Net: Rs. ${captainEarning}`
    });

    return {
        success: true,
        commissionAmount,
        captainEarning,
        balanceAfter,
        transaction
    };
}

/**
 * Recharge prepaid wallet balance with ledger record.
 */
async function rechargeWallet({
    captainId,
    amount,
    paymentReference = null,
    provider = 'Sandbox Gateway',
    description = ''
}) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
        const err = new Error('Minimum recharge amount is Rs. 100');
        err.statusCode = 400;
        throw err;
    }

    const captain = await Captain.findById(captainId);
    if (!captain) {
        const err = new Error('Captain not found');
        err.statusCode = 404;
        throw err;
    }

    const balanceBefore = captain.walletBalance || 0;
    const balanceAfter = balanceBefore + numAmount;
    const reserveCurrent = captain.walletReserve || 0;

    captain.walletBalance = balanceAfter;
    await captain.save();

    const ref = paymentReference || `RECH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await WalletTransaction.create({
        captain: captainId,
        type: 'RECHARGE',
        amount: numAmount,
        balanceBefore,
        balanceAfter,
        reserveBefore: reserveCurrent,
        reserveAfter: reserveCurrent,
        paymentReference: ref,
        paymentProvider: provider,
        status: 'completed',
        description: description || `Prepaid Wallet Recharge of Rs. ${numAmount} via ${provider}`
    });

    return {
        success: true,
        amount: numAmount,
        balanceBefore,
        balanceAfter,
        availableBalance: balanceAfter - reserveCurrent,
        transaction
    };
}

/**
 * Fetch paginated transactions for captain audit trail.
 */
async function getTransactions({ captainId, page = 1, limit = 15, type = null }) {
    const query = { captain: captainId };
    if (type) {
        query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
        WalletTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('ride', 'pickup destination fare status vehicleType'),
        WalletTransaction.countDocuments(query)
    ]);

    return {
        transactions,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        }
    };
}

module.exports = {
    getWalletInfo,
    reserveCommission,
    releaseReservation,
    deductCommission,
    rechargeWallet,
    getTransactions
};
