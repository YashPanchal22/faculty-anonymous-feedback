const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getPrograms,
  getSemesters,
  getSubjects,
  getFacultyForSubject,
  submitFeedback
} = require('../controllers/studentController');

// All student routes require authentication with student role
// (Programs/semesters/subjects also available to other roles for reference)
router.get('/programs', authenticate, getPrograms);
router.get('/semesters', authenticate, getSemesters);
router.get('/subjects', authenticate, getSubjects);
router.get('/faculty', authenticate, getFacultyForSubject);

// Feedback submission - student only
router.post('/feedback', authenticate, requireRole('student'), submitFeedback);

module.exports = router;
