const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardAnalytics);

module.exports = router;
