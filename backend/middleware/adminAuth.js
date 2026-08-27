const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Admin Authentication & Authorization Middleware
 * Verifies JWT token, ensures role is ADMIN, and validates active account status.
 */
async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication token required. Please sign in as an administrator.' 
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
    }

    // Role check: Only ADMIN role is authorized
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden: Access denied. Administrator privileges required.' 
      });
    }

    // Database check: verify admin exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Admin account not found.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, error: 'Admin account is currently disabled. Please contact support.' });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (err) {
    console.error('Admin Auth Middleware Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during authorization.' });
  }
}

module.exports = {
  requireAdminAuth
};
