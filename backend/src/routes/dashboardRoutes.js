const express = require('express');
const { getAdminDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin Dashboard stats endpoint
router.get('/', authenticateToken, requireAdmin, getAdminDashboardStats);

module.exports = router;
