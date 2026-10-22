const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDashboard,
  getAllFaculty,
  getFacultyDetail,
  getAnalytics,
  getAnonymousFeedback,
  downloadCSV,
  getReportData,
  updateSettings,
  getSettings,
  addFaculty,
  deleteFaculty,
  addProgram,
  deleteProgram,
  addSubject,
  deleteSubject,
  getCatalog
} = require('../controllers/adminController');

// All admin routes require authentication with admin role
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', getDashboard);
router.get('/faculty', getAllFaculty);
router.get('/faculty/:id/detail', getFacultyDetail);
router.get('/analytics', getAnalytics);
router.get('/feedback', getAnonymousFeedback);
router.get('/reports/csv', downloadCSV);
router.get('/reports/json', getReportData);
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// Academic Catalog Management Routes
router.get('/catalog', getCatalog);
router.post('/faculty', addFaculty);
router.delete('/faculty/:id', deleteFaculty);
router.post('/programs', addProgram);
router.delete('/programs/:id', deleteProgram);
router.post('/subjects', addSubject);
router.delete('/subjects/:id', deleteSubject);

module.exports = router;
