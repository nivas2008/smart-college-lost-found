const express = require('express');
const router = express.Router();
const { getAnalytics, getPublicStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.route('/analytics').get(protect, getAnalytics);
router.route('/public-stats').get(getPublicStats);

module.exports = router;
