// JWT Authentication & Role-Based Authorization Middleware
// IMPORTANT: This enforces role access at the backend level, not just frontend.

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'faculty-feedback-demo-secret-key-2026';
const TOKEN_EXPIRY = '24h';

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Role-based access guard factory.
 * Usage: requireRole('admin'), requireRole('faculty'), requireRole('student')
 * Can accept multiple roles: requireRole('admin', 'faculty')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. This endpoint requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}.`
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, JWT_SECRET, TOKEN_EXPIRY };
