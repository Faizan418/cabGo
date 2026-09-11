// user.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middlewares');


router.post('/register', [
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long...'),
    body('email').isEmail().withMessage('Please enter a valid email address...'),
    body('phone').trim().notEmpty().withMessage('Phone number is required...'),
    body('cnic').trim().matches(/^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/).withMessage('Valid Pakistani CNIC (13 digits) is required...'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long...')
], 
    userController.registerUser
);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address...'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long...')
], 
    userController.loginUser
);

router.get('/profile', authMiddleware.authUser, userController.getUserProfile);
router.get('/ride-history', authMiddleware.authUser, userController.getRideHistory);
router.get('/logout', authMiddleware.authUser, userController.logoutUser);

// Password Reset Routes (User)
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email address...')
], userController.forgotPassword);

router.post('/verify-reset-otp', [
    body('email').isEmail().withMessage('Please enter a valid email address...'),
    body('otp').isLength({ min: 5, max: 5 }).isNumeric().withMessage('OTP must be exactly 5 numeric digits...')
], userController.verifyResetOtp);

router.post('/reset-password', [
    body('resetToken').isString().notEmpty().withMessage('Reset token is required...'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long...')
], userController.resetPassword);

module.exports = router;