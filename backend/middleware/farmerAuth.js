const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

/**
 * Farmer Authentication Middleware
 * Verifies JWT token and verifies farmer account is active.
 */
async function requireFarmerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication token required. Please sign in.' 
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

    // Role check: If admin token is passed, reject for farmer routes
    if (decoded.role === 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Farmer account required.' });
    }

    const farmer = await Farmer.findById(decoded.id);
    if (!farmer) {
      return res.status(401).json({ success: false, error: 'Farmer account not found.' });
    }

    if (!farmer.isActive) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account disabled. Please contact Krishi Vaani administration.' 
      });
    }

    req.farmer = farmer;
    req.farmerId = farmer.id;
    next();
  } catch (err) {
    console.error('Farmer Auth Middleware Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during authorization.' });
  }
}

/**
 * Optional Farmer Auth Middleware
 * Attaches req.farmerId if valid farmer JWT is present, without throwing error if missing
 */
function optionalFarmerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id && decoded.role !== 'ADMIN') {
        req.farmerId = decoded.id;
      }
    }
  } catch (e) {
    // Ignore invalid/expired token in optional mode
  }
  next();
}

module.exports = {
  requireFarmerAuth,
  optionalFarmerAuth
};
