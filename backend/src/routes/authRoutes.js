const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public mappings
router.post('/register', register);
router.post('/login', login);
router.get('/refresh', refresh);
router.post('/logout', protect, logout);

// Protected mappings
router.get('/me', protect, getMe);

module.exports = router;
