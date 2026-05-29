const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, updateTheme } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// All settings routes require authentication
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/theme', protect, updateTheme);

module.exports = router;
