const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, sendOtp, generateCaptcha } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.get('/security-check', generateCaptcha);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
