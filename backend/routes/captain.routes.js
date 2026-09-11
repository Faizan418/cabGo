// routes/captain.routes.js

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const captainController = require('../controllers/captain.controller'); 
const authMiddleware = require('../middlewares/auth.middlewares');

router.post('/register', [
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long...'),
    body('email').isEmail().withMessage('Please enter a valid email address...'),
    body('phone').trim().notEmpty().withMessage('Phone number is required...'),
    body('cnic').trim().matches(/^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/).withMessage('Valid Pakistani CNIC (13 digits) is required...'),
    body('drivingLicense').trim().notEmpty().withMessage('Driving license number is required...'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long...'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Vehicle color must be at least 3 characters long...'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Vehicle plate must be at least 3 characters long...'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Vehicle capacity must be at least 1...'),
    body('vehicle.vehicleType').isIn(['bike', 'car', 'auto']).withMessage('Vehicle type must be either bike, car, or auto...')
],
    captainController.registerCaptain
);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address...'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long...')
], 
    captainController.loginCaptain
);

router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile); 
router.get('/current-ride', authMiddleware.authCaptain, captainController.getCurrentRide);
router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain);
router.get('/earnings', authMiddleware.authCaptain, captainController.getEarnings);

// Captain Online/Offline
router.patch('/toggle-availability', 
    authMiddleware.authCaptain,
    body('status').isIn(['active', 'unactive']).withMessage('Status must be active or unactive'),
    captainController.toggleAvailability
);

// Wallet Endpoints
router.get('/wallet', authMiddleware.authCaptain, captainController.getCaptainWallet);
router.get('/wallet/transactions', authMiddleware.authCaptain, captainController.getWalletTransactions);
router.post('/wallet/recharge/create-intent', 
    authMiddleware.authCaptain,
    body('amount').isNumeric().withMessage('Recharge amount must be a number'),
    captainController.createRechargeIntent
);
router.post('/wallet/recharge/confirm',
    authMiddleware.authCaptain,
    body('amount').isNumeric().withMessage('Recharge amount must be a number'),
    captainController.confirmRecharge
);

// Password Reset Routes (Captain)
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email address...')
], captainController.forgotPassword);

router.post('/verify-reset-otp', [
    body('email').isEmail().withMessage('Please enter a valid email address...'),
    body('otp').isLength({ min: 5, max: 5 }).isNumeric().withMessage('OTP must be exactly 5 numeric digits...')
], captainController.verifyResetOtp);

router.post('/reset-password', [
    body('resetToken').isString().notEmpty().withMessage('Reset token is required...'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long...')
], captainController.resetPassword);

module.exports = router;