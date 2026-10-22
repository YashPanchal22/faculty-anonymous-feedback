// Auth Controller - Login and Self-Service Password Reset
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET, TOKEN_EXPIRY } = require('../middleware/auth');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Temporary in-memory store for password reset OTPs
const resetCodes = new Map();

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
  }

  // Create JWT payload - minimal info
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name
  };

  // Add faculty-specific fields
  if (user.role === 'faculty' && user.facultyId) {
    payload.facultyId = user.facultyId;
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      ...(user.role === 'faculty' ? { facultyId: user.facultyId } : {}),
      ...(user.role === 'student' ? { program: user.program, semester: user.semester } : {})
    }
  });
}

// POST /api/auth/forgot-password - Request password reset code
function forgotPassword(req, res) {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username.trim());

  if (!user) {
    return res.status(404).json({ error: 'No account found with this username.' });
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(user.username, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
  });

  res.json({
    success: true,
    message: `Verification code generated for ${user.name} (${user.role.toUpperCase()}).`,
    verificationCode: code,
    role: user.role,
    name: user.name
  });
}

// POST /api/auth/reset-password - Verify code and update password
function resetPassword(req, res) {
  const { username, code, newPassword } = req.body;

  if (!username || !code || !newPassword) {
    return res.status(400).json({ error: 'Username, verification code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const stored = resetCodes.get(username.trim());
  if (!stored) {
    return res.status(400).json({ error: 'No active reset request found. Please request a new code.' });
  }

  if (Date.now() > stored.expiresAt) {
    resetCodes.delete(username.trim());
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  if (stored.code !== code.trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === username.trim());
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  users[userIndex].password = newPassword.trim();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  resetCodes.delete(username.trim());

  res.json({
    success: true,
    message: 'Password successfully updated! You can now sign in with your new password.'
  });
}

module.exports = { login, forgotPassword, resetPassword };
