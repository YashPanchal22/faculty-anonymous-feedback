const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getMyProfile, getMyPerformance } = require('../controllers/facultyController');

// Faculty routes - restricted to faculty role only
router.get('/me', authenticate, requireRole('faculty'), getMyProfile);
router.get('/me/performance', authenticate, requireRole('faculty'), getMyPerformance);

module.exports = router;
