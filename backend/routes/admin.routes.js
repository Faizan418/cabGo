// routes/admin.routes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Captain Verification & Management
router.get('/captains', adminController.getCaptains);
router.patch('/captains/:captainId/verification', adminController.updateCaptainVerification);

module.exports = router;
