const express = require('express');
const router = express.Router();
const { getBudget, createBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBudget).post(protect, createBudget);

module.exports = router;
