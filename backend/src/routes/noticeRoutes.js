const express = require('express');
const { body } = require('express-validator');
const {
  getAllNotices,
  createNoticeAdmin,
  updateNoticeAdmin,
  deleteNoticeAdmin
} = require('../controllers/noticeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const noticeValidation = [
  body('title').trim().notEmpty().withMessage('Notice title is required'),
  body('content').trim().notEmpty().withMessage('Notice content is required')
];

// Public / Authenticated view
router.get('/', authenticateToken, getAllNotices);

// Admin Routes
router.post('/', authenticateToken, requireAdmin, validate(noticeValidation), createNoticeAdmin);
router.patch('/:id', authenticateToken, requireAdmin, updateNoticeAdmin);
router.delete('/:id', authenticateToken, requireAdmin, deleteNoticeAdmin);

router.default = router;
router.router = router;
module.exports = router;
