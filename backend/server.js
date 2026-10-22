// Faculty Anonymous Feedback & Performance Analytics System - Backend Server
// Express REST API with role-based authentication and privacy-preserving feedback

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', studentRoutes);          // /api/programs, /api/subjects, /api/faculty, /api/feedback
app.use('/api/faculty', facultyRoutes);  // /api/faculty/me, /api/faculty/me/performance
app.use('/api/admin', adminRoutes);      // /api/admin/dashboard, /api/admin/faculty, etc.

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Faculty Feedback API is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Faculty Anonymous Feedback & Analytics - Backend API');
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Health check:      http://localhost:${PORT}/api/health`);
  console.log('  Roles: student | faculty | admin');
  console.log('='.repeat(60));
});
