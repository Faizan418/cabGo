// routes/ride.routes.js

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

// CREATE RIDE
router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }),
    body('destination').isString().isLength({ min: 3 }),
    body('vehicleType').isString().isIn(['auto', 'car', 'bike']),
    rideController.createRide
);

// GET FARE
router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    rideController.getFare
);

// CONFIRM RIDE
router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId(),
    rideController.confirmRide
);

// START RIDE
router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId(),
    query('otp').isLength({ min: 6, max: 6 }),
    rideController.startRide
);

// END RIDE
router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId(),
    rideController.endRide
);

// ARRIVE
router.post('/arrive',
    authMiddleware.authCaptain,
    body('rideId').isMongoId(),
    rideController.arriveRide
);

// CANCEL RIDE (User YA Captain)
router.post('/cancel',
    authMiddleware.authUserOrCaptain,
    body('rideId').isMongoId(),
    rideController.cancelRide
);

// CONFIRM CASH PAYMENT
router.post('/confirm-cash-payment',
    authMiddleware.authCaptain,
    body('rideId').isMongoId(),
    rideController.confirmCashPayment
);

module.exports = router;