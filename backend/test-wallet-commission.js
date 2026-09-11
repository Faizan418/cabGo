// test-wallet-commission.js
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const connectToDb = require('./db/db');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
const WalletTransaction = require('./models/walletTransaction.model');
const SystemSetting = require('./models/systemSetting.model');
const userService = require('./services/user.service');
const captainService = require('./services/captain.service');
const walletService = require('./services/wallet.service');
const fareService = require('./services/fare.service');
const rideService = require('./services/ride.service');

async function runTests() {
    console.log('🚀 ================= CABGO FINANCIAL & CORE TEST SUITE =================\n');

    await connectToDb();

    // Ensure clean test state
    const testTimestamp = Date.now();
    const testUserEmail = `testuser_${testTimestamp}@cabgo.test`;
    const testCaptainEmail = `testcaptain_${testTimestamp}@cabgo.test`;
    const testUserCnic = `35201-${String(testTimestamp).slice(-7)}-1`;
    const testCaptainCnic = `35202-${String(testTimestamp).slice(-7)}-2`;

    let passedTests = 0;
    let totalTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passedTests++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    try {
        // ================= TEST 1: System Settings Initialization =================
        console.log('📌 Test 1: System Settings & Configurable Commission / Fuel Engine');
        const settings = await SystemSetting.getSettings();
        assert(settings.commissionRate === 10, 'Default commission rate is 10%');
        assert(settings.promotionalFreeRides === 5, 'Default promotional free rides is 5');
        assert(settings.fuelPrice === 280, 'Default fuel price is 280 PKR/L');
        assert(settings.vehiclePricing.car.baseFare === 150, 'Car base fare is 150');

        // ================= TEST 2: User Registration with CNIC & Phone =================
        console.log('\n📌 Test 2: User Registration with CNIC & Phone Protection');
        const hashedPassword = await userModel.hashPassword('Pass1234');
        const user = await userService.createUser({
            firstname: 'Ahmad',
            lastname: 'Raza',
            email: testUserEmail,
            password: hashedPassword,
            phone: '+923001234567',
            cnic: testUserCnic
        });
        assert(user._id != null, 'User created with ID');
        assert(user.phone === '+923001234567', 'User phone stored correctly');

        // Verify CNIC is protected with select: false
        const userQueried = await userModel.findById(user._id);
        assert(userQueried.cnic === undefined, 'User CNIC is hidden by default (select: false)');

        // ================= TEST 3: Captain Two-Step Registration =================
        console.log('\n📌 Test 3: Captain Two-Step Registration & Pending Verification');
        const captainHashedPassword = await captainModel.hashPassword('CaptainPass123');
        const captain = await captainService.createCaptain({
            firstname: 'Usman',
            lastname: 'Ali',
            email: testCaptainEmail,
            password: captainHashedPassword,
            phone: '+923219876543',
            cnic: testCaptainCnic,
            drivingLicense: 'DL-LHR-98765',
            color: 'Silver',
            plate: 'LED-5555',
            capacity: 4,
            vehicleType: 'car',
            make: 'Toyota',
            model: 'Corolla GLI',
            year: 2022
        });

        assert(captain._id != null, 'Captain account created');
        assert(captain.verificationStatus === 'pending', 'Captain verification status defaults to "pending"');
        assert(captain.walletBalance === 0, 'Captain initial wallet balance is 0');
        assert(captain.walletReserve === 0, 'Captain initial wallet reserve is 0');
        assert(captain.completedRidesCount === 0, 'Captain initial completed rides count is 0');
        assert(captain.vehicle.make === 'Toyota', 'Vehicle make saved');

        // ================= TEST 4: Online Enforcement for Pending Captain =================
        console.log('\n📌 Test 4: Verification Gate (Pending Captain Cannot Go Online)');
        let onlineBlocked = false;
        try {
            await captainService.toggleAvailability(captain._id, 'active');
        } catch (err) {
            onlineBlocked = true;
        }
        assert(onlineBlocked, 'Pending captain is blocked from going online');

        // ================= TEST 5: Admin Approval =================
        console.log('\n📌 Test 5: Admin Approval Workflow');
        captain.verificationStatus = 'approved';
        await captain.save();
        const onlineCaptain = await captainService.toggleAvailability(captain._id, 'active');
        assert(onlineCaptain.status === 'active', 'Approved captain can now go online');

        // ================= TEST 6: Promotional First 5 Rides (0% Commission) =================
        console.log('\n📌 Test 6: Promotional Rule — First 5 Completed Rides at 0% Commission');
        
        for (let i = 1; i <= 5; i++) {
            // Create Ride
            const ride = await rideModel.create({
                user: user._id,
                pickup: 'Model Town Lahore',
                destination: 'Gulberg Lahore',
                fare: 1000,
                vehicleType: 'car',
                otp: '123456',
                status: 'pending'
            });

            // Accept ride (Should succeed even with 0 wallet balance because commission is 0 Rs)
            const acceptedRide = await rideService.confirmRide({
                rideId: ride._id,
                captain
            });
            assert(acceptedRide.reservedCommission === 0, `Ride ${i}: 0 commission reserved during promo`);

            // Start ride
            await rideService.startRide({ rideId: ride._id, otp: '123456', captain });

            // End ride (automatic commission deduction)
            const completedRide = await rideService.endRide({ rideId: ride._id, captain });
            assert(completedRide.commissionRate === 0, `Ride ${i}: Applied commission rate is 0%`);
            assert(completedRide.commissionAmount === 0, `Ride ${i}: Deducted commission amount is Rs. 0`);
            assert(completedRide.captainEarning === 1000, `Ride ${i}: Captain earning is full fare (Rs. 1000)`);
            assert(completedRide.commissionDeducted === true, `Ride ${i}: commissionDeducted flag marked true`);
        }

        const freshCaptainAfterPromo = await captainModel.findById(captain._id);
        assert(freshCaptainAfterPromo.completedRidesCount === 5, 'Captain completedRidesCount is now exactly 5');
        assert(freshCaptainAfterPromo.walletBalance === 0, 'Wallet balance is still 0 (no deductions occurred)');
        assert(freshCaptainAfterPromo.earnings === 5000, 'Captain total earnings recorded as Rs. 5000');

        const promoWalletInfo = await walletService.getWalletInfo(captain._id);
        assert(promoWalletInfo.freeRidesRemaining === 0, 'Promotional free rides remaining is now 0');
        assert(promoWalletInfo.isPromotionalActive === false, 'Promotional bonus is now inactive');

        // ================= TEST 7: Insufficient Wallet Balance Protection for Ride 6 =================
        console.log('\n📌 Test 7: Wallet Balance Protection for 6th Ride (10% Commission)');
        const ride6 = await rideModel.create({
            user: user._id,
            pickup: 'DHA Phase 5 Lahore',
            destination: 'Airport Lahore',
            fare: 1000,
            vehicleType: 'car',
            otp: '654321',
            status: 'pending'
        });

        let acceptanceBlocked = false;
        try {
            await rideService.confirmRide({
                rideId: ride6._id,
                captain
            });
        } catch (err) {
            acceptanceBlocked = true;
            assert(err.message.includes('Insufficient wallet balance'), 'Error message informs insufficient balance');
        }
        assert(acceptanceBlocked, 'Captain with 0 balance blocked from accepting ride with 10% commission');

        // ================= TEST 8: Prepaid Wallet Recharge =================
        console.log('\n📌 Test 8: Prepaid Wallet Recharge Architecture & Ledger');
        const rechargeResult = await walletService.rechargeWallet({
            captainId: captain._id,
            amount: 1000,
            paymentReference: 'TEST-PAY-001',
            provider: 'EasyPaisa Sandbox',
            description: 'Test recharge of Rs. 1000'
        });
        assert(rechargeResult.balanceAfter === 1000, 'Captain wallet balance is now Rs. 1000');

        const rechargeTx = await WalletTransaction.findOne({
            captain: captain._id,
            type: 'RECHARGE'
        });
        assert(rechargeTx != null, 'RECHARGE transaction record created in ledger');
        assert(rechargeTx.amount === 1000, 'Recharge transaction amount matches Rs. 1000');
        assert(rechargeTx.balanceBefore === 0, 'Ledger accurately records balanceBefore: 0');
        assert(rechargeTx.balanceAfter === 1000, 'Ledger accurately records balanceAfter: 1000');

        // ================= TEST 9: Commission Reservation & Cancellation Release =================
        console.log('\n📌 Test 9: Commission Reservation on Accept & Release on Cancellation');
        // Accept Ride 6 now that balance is 1000
        const acceptedRide6 = await rideService.confirmRide({
            rideId: ride6._id,
            captain
        });
        assert(acceptedRide6.reservedCommission === 100, 'Rs. 100 commission reserved for Ride 6 (10% of Rs. 1000)');

        const captainAfterReserve = await captainModel.findById(captain._id);
        assert(captainAfterReserve.walletBalance === 1000, 'Wallet balance remains 1000');
        assert(captainAfterReserve.walletReserve === 100, 'Wallet reserve incremented to 100');
        assert(captainAfterReserve.availableBalance === 900, 'Available balance is 900 (1000 - 100)');

        const reserveTx = await WalletTransaction.findOne({
            ride: ride6._id,
            type: 'RESERVE'
        });
        assert(reserveTx != null, 'RESERVE ledger entry created');

        // Cancel Ride 6 by User
        await rideService.cancelRide({
            rideId: ride6._id,
            cancelledBy: 'user',
            reason: 'Change of plans'
        });

        const captainAfterCancel = await captainModel.findById(captain._id);
        assert(captainAfterCancel.walletReserve === 0, 'Wallet reserve released back to 0 on cancellation');
        assert(captainAfterCancel.availableBalance === 1000, 'Available balance restored to 1000');

        const releaseTx = await WalletTransaction.findOne({
            ride: ride6._id,
            type: 'RELEASE'
        });
        assert(releaseTx != null, 'RELEASE ledger entry created');

        // ================= TEST 10: Successful Completion with 10% Commission Deduction =================
        console.log('\n📌 Test 10: Ride Completion & 10% Commission Deduction');
        const ride7 = await rideModel.create({
            user: user._id,
            pickup: 'Johar Town Lahore',
            destination: 'Mall of Lahore',
            fare: 1000,
            vehicleType: 'car',
            otp: '112233',
            status: 'pending'
        });

        await rideService.confirmRide({ rideId: ride7._id, captain });
        await rideService.startRide({ rideId: ride7._id, otp: '112233', captain });
        const completedRide7 = await rideService.endRide({ rideId: ride7._id, captain });

        assert(completedRide7.commissionRate === 10, 'Commission rate is 10%');
        assert(completedRide7.commissionAmount === 100, 'Commission amount is Rs. 100');
        assert(completedRide7.captainEarning === 900, 'Captain net earning is Rs. 900');

        const captainAfterRide7 = await captainModel.findById(captain._id);
        assert(captainAfterRide7.walletBalance === 900, 'Wallet balance deducted by 100 to Rs. 900');
        assert(captainAfterRide7.walletReserve === 0, 'Wallet reserve is 0');
        assert(captainAfterRide7.availableBalance === 900, 'Available balance is Rs. 900');

        const commissionTx = await WalletTransaction.findOne({
            ride: ride7._id,
            type: 'COMMISSION'
        });
        assert(commissionTx != null, 'COMMISSION ledger entry created');
        assert(commissionTx.amount === 100, 'COMMISSION ledger amount is Rs. 100');
        assert(commissionTx.balanceBefore === 1000, 'COMMISSION balanceBefore is 1000');
        assert(commissionTx.balanceAfter === 900, 'COMMISSION balanceAfter is 900');

        // ================= TEST 11: Idempotency & Duplicate Prevention =================
        console.log('\n📌 Test 11: Idempotency Guard (No Duplicate Deduction on Duplicate End/Confirm)');
        // Attempt duplicate endRide
        await rideService.endRide({ rideId: ride7._id, captain });
        // Attempt confirmCashPayment
        await rideService.confirmCashPayment({ rideId: ride7._id, captain });

        const captainAfterDuplicate = await captainModel.findById(captain._id);
        assert(captainAfterDuplicate.walletBalance === 900, 'Wallet balance STILL Rs. 900 (NO duplicate deduction)');

        const commissionTxCount = await WalletTransaction.countDocuments({
            ride: ride7._id,
            type: 'COMMISSION'
        });
        assert(commissionTxCount === 1, 'Exactly 1 COMMISSION transaction exists for ride7');

        // ================= TEST 12: Ledger Pagination =================
        console.log('\n📌 Test 12: Audit Ledger Retrieval');
        const transactionsPage = await walletService.getTransactions({
            captainId: captain._id,
            page: 1,
            limit: 10
        });
        assert(transactionsPage.transactions.length > 0, 'Transactions retrieved from ledger');
        assert(transactionsPage.pagination.total >= 7, 'Total transactions counted correctly in ledger');

        console.log('\n🎉 ================= ALL 12 TESTS PASSED PERFECTLY! =================\n');
        console.log(`Summary: ${passedTests} / ${totalTests} assertions passed.\n`);

        process.exit(0);

    } catch (err) {
        console.error('\n❌ TEST RUN FAILED:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

runTests();
