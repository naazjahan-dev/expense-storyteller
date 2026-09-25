const express = require('express');
const router = express.Router();
const { getStorytellingInsights, getFullFinancialStory } = require('../controllers/aiStoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStorytellingInsights);
router.get('/story', protect, getFullFinancialStory);

module.exports = router;
