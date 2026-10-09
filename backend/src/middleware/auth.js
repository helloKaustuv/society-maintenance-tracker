const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'society-maintenance-secret-key-change-in-production-2026';

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing or malformed'
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token. Please log in again.'
        });
      }

      // Fetch user from DB to ensure user exists and is active
      const userResult = await db.query(
        'SELECT id, name, email, role, phone, flat_number FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User account no longer exists'
        });
      }

      req.user = userResult.rows[0];
      next();
    });
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed'
    });
  }
};

/**
 * Middleware to enforce role-based access control
 * @param  {...string} allowedRoles - e.g. 'admin', 'resident'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s)`
      });
    }

    next();
  };
};

const requireAdmin = requireRole('admin');
const requireResident = requireRole('resident');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireResident,
  JWT_SECRET
};
