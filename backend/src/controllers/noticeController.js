const db = require('../config/db');
const { broadcastImportantNotice } = require('../services/emailService');

/**
 * Get all notices (Important notices pinned at top, then sorted by created_at DESC)
 */
const getAllNotices = async (req, res, next) => {
  try {
    const queryText = `
      SELECT n.*, u.name as author_name, u.role as author_role
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.is_important DESC, n.created_at DESC
    `;

    const result = await db.query(queryText);

    return res.status(200).json({
      success: true,
      data: {
        notices: result.rows,
        total: result.rows.length,
        importantCount: result.rows.filter(n => n.is_important).length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create a new society notice (broadcasts email if marked important)
 */
const createNoticeAdmin = async (req, res, next) => {
  try {
    const { title, content, is_important } = req.body;
    const adminId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the notice'
      });
    }

    const isImportantBool = Boolean(is_important === true || is_important === 'true' || is_important === 1);

    const insertResult = await db.query(
      `INSERT INTO notices (title, content, is_important, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [title.trim(), content.trim(), isImportantBool ? 1 : 0, adminId]
    );

    const notice = insertResult.rows[0];

    // If marked important, dispatch email announcement to all residents
    if (isImportantBool) {
      broadcastImportantNotice({
        title: notice.title,
        content: notice.content,
        noticeId: notice.id
      }).catch(err => console.error('[Email Error Broadcast]:', err.message));
    }

    return res.status(201).json({
      success: true,
      message: isImportantBool
        ? 'Important notice published and broadcast to residents successfully'
        : 'Notice posted successfully',
      data: {
        notice
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update an existing notice
 */
const updateNoticeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, is_important } = req.body;

    const existingResult = await db.query('SELECT * FROM notices WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Notice #${id} not found`
      });
    }

    const current = existingResult.rows[0];
    const newTitle = title ? title.trim() : current.title;
    const newContent = content ? content.trim() : current.content;
    const newImportant = is_important !== undefined
      ? (Boolean(is_important === true || is_important === 'true' || is_important === 1) ? 1 : 0)
      : current.is_important;

    const updateResult = await db.query(
      `UPDATE notices
       SET title = $1,
           content = $2,
           is_important = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [newTitle, newContent, newImportant, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: {
        notice: updateResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete a notice
 */
const deleteNoticeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM notices WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Notice #${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotices,
  createNoticeAdmin,
  updateNoticeAdmin,
  deleteNoticeAdmin
};
