const express = require('express');
const { body } = require('express-validator');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaintsAdmin,
  updateComplaintStatusAdmin,
  updateComplaintPriorityAdmin,
  getComplaintHistoryAdmin
} = require('../controllers/complaintController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload, processPhotoUpload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation for creating complaint
const createComplaintValidation = [
  body('category').notEmpty().withMessage('Complaint category is required'),
  body('description').trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters long')
];

// Resident Routes
router.post(
  '/',
  authenticateToken,
  upload.single('photo'),
  processPhotoUpload,
  validate(createComplaintValidation),
  createComplaint
);

router.get('/my', authenticateToken, getMyComplaints);

// Specific ID route (Authorized resident or admin)
router.get('/:id', authenticateToken, getComplaintById);

// Admin Complaint Management Routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllComplaintsAdmin);
router.patch('/admin/:id/status', authenticateToken, requireAdmin, updateComplaintStatusAdmin);
router.patch('/admin/:id/priority', authenticateToken, requireAdmin, updateComplaintPriorityAdmin);
router.get('/admin/:id/history', authenticateToken, requireAdmin, getComplaintHistoryAdmin);

router.default = router;
router.router = router;
module.exports = router;
