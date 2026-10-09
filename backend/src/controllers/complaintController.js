const db = require('../config/db');
const { sendComplaintStatusNotification } = require('../services/emailService');

/**
 * Gets configured overdue threshold in days
 */
const getOverdueDays = () => {
  const days = parseInt(process.env.OVERDUE_DAYS || '3', 10);
  return isNaN(days) || days < 1 ? 3 : days;
};

/**
 * Helper to enrich a complaint object with dynamic overdue calculations
 */
const enrichComplaintWithOverdue = (complaint) => {
  const overdueDays = getOverdueDays();
  const createdAtTime = new Date(complaint.created_at).getTime();
  const now = Date.now();
  const diffDays = (now - createdAtTime) / (1000 * 60 * 60 * 24);

  const is_overdue = complaint.status !== 'Resolved' && diffDays >= overdueDays;
  const days_open = Math.floor(diffDays);

  return {
    ...complaint,
    is_overdue,
    days_open,
    overdue_threshold_days: overdueDays
  };
};

/**
 * Resident: Create a new complaint
 */
const createComplaint = async (req, res, next) => {
  try {
    const { category, title, description } = req.body;
    const residentId = req.user.id;
    const photoUrl = req.fileUrl || null;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both category and description for the complaint.'
      });
    }

    const complaintTitle = (title && title.trim()) ? title.trim() : `${category} Issue`;

    // 1. Insert Complaint
    const insertResult = await db.query(
      `INSERT INTO complaints (
        resident_id, category, title, description, photo_url, status, priority, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'Open', 'Medium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [residentId, category, complaintTitle, description.trim(), photoUrl]
    );

    const complaint = insertResult.rows[0];

    // 2. Insert Initial History Record
    await db.query(
      `INSERT INTO complaint_history (complaint_id, previous_status, new_status, note, actor_id, created_at)
       VALUES ($1, NULL, 'Open', 'Complaint submitted by resident', $2, CURRENT_TIMESTAMP)`,
      [complaint.id, residentId]
    );

    const enriched = enrichComplaintWithOverdue(complaint);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint: enriched
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resident: Get all complaints filed by the authenticated resident
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const residentId = req.user.id;
    const { status, category, priority, search } = req.query;

    let queryText = `
      SELECT c.*, u.name as resident_name, u.email as resident_email, u.flat_number
      FROM complaints c
      JOIN users u ON c.resident_id = u.id
      WHERE c.resident_id = $1
    `;
    const params = [residentId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      queryText += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (category && category !== 'all') {
      queryText += ` AND c.category = $${paramIndex++}`;
      params.push(category);
    }

    if (priority && priority !== 'all') {
      queryText += ` AND c.priority = $${paramIndex++}`;
      params.push(priority);
    }

    if (search) {
      queryText += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY c.created_at DESC`;

    const result = await db.query(queryText, params);
    const complaints = result.rows.map(enrichComplaintWithOverdue);

    // Sort overdue complaints near the top if unresolved
    complaints.sort((a, b) => {
      if (a.is_overdue && !b.is_overdue) return -1;
      if (!a.is_overdue && b.is_overdue) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return res.status(200).json({
      success: true,
      data: {
        complaints,
        total: complaints.length,
        overdueCount: complaints.filter(c => c.is_overdue).length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single complaint details by ID (with chronological history and permissions)
 */
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complaintResult = await db.query(
      `SELECT c.*, u.name as resident_name, u.email as resident_email, u.phone as resident_phone, u.flat_number
       FROM complaints c
       JOIN users u ON c.resident_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Complaint #${id} not found`
      });
    }

    const complaint = complaintResult.rows[0];

    // Authorization check: Residents can only view their own complaints
    if (user.role !== 'admin' && complaint.resident_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own complaints'
      });
    }

    // Fetch chronological history
    const historyResult = await db.query(
      `SELECT ch.*, u.name as actor_name, u.role as actor_role
       FROM complaint_history ch
       LEFT JOIN users u ON ch.actor_id = u.id
       WHERE ch.complaint_id = $1
       ORDER BY ch.created_at ASC`,
      [id]
    );

    const enrichedComplaint = enrichComplaintWithOverdue(complaint);

    return res.status(200).json({
      success: true,
      data: {
        complaint: enrichedComplaint,
        history: historyResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all complaints with advanced filtering and overdue sorting
 */
const getAllComplaintsAdmin = async (req, res, next) => {
  try {
    const { status, category, priority, is_overdue, search, startDate, endDate } = req.query;

    let queryText = `
      SELECT c.*, u.name as resident_name, u.email as resident_email, u.phone as resident_phone, u.flat_number
      FROM complaints c
      JOIN users u ON c.resident_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      queryText += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (category && category !== 'all') {
      queryText += ` AND c.category = $${paramIndex++}`;
      params.push(category);
    }

    if (priority && priority !== 'all') {
      queryText += ` AND c.priority = $${paramIndex++}`;
      params.push(priority);
    }

    if (search) {
      queryText += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.flat_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND c.created_at >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND c.created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    queryText += ` ORDER BY c.created_at DESC`;

    const result = await db.query(queryText, params);
    let complaints = result.rows.map(enrichComplaintWithOverdue);

    // Apply overdue filter if specified
    if (is_overdue === 'true') {
      complaints = complaints.filter(c => c.is_overdue);
    } else if (is_overdue === 'false') {
      complaints = complaints.filter(c => !c.is_overdue);
    }

    // Sort overdue unresolved complaints to the top
    complaints.sort((a, b) => {
      if (a.is_overdue && !b.is_overdue) return -1;
      if (!a.is_overdue && b.is_overdue) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return res.status(200).json({
      success: true,
      data: {
        complaints,
        total: complaints.length,
        overdueCount: complaints.filter(c => c.is_overdue).length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update complaint status (Open -> In Progress -> Resolved) with audit note & email
 */
const updateComplaintStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminId = req.user.id;

    const allowedStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    // Fetch existing complaint
    const complaintResult = await db.query(
      `SELECT c.*, u.name as resident_name, u.email as resident_email
       FROM complaints c
       JOIN users u ON c.resident_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Complaint #${id} not found`
      });
    }

    const currentComplaint = complaintResult.rows[0];
    const previousStatus = currentComplaint.status;

    // Check resolved timestamp logic
    let resolvedAtClause = 'resolved_at';
    if (status === 'Resolved' && previousStatus !== 'Resolved') {
      resolvedAtClause = 'CURRENT_TIMESTAMP';
    } else if (status !== 'Resolved') {
      resolvedAtClause = 'NULL';
    }

    // Update complaint record
    const updateResult = await db.query(
      `UPDATE complaints
       SET status = $1,
           resolved_at = ${resolvedAtClause},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    const updatedComplaint = updateResult.rows[0];

    // Record in complaint_history audit trail
    await db.query(
      `INSERT INTO complaint_history (complaint_id, previous_status, new_status, note, actor_id, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [id, previousStatus, status, (note && note.trim()) ? note.trim() : null, adminId]
    );

    // Asynchronously dispatch notification email to resident
    sendComplaintStatusNotification({
      residentEmail: currentComplaint.resident_email,
      residentName: currentComplaint.resident_name,
      complaintId: id,
      category: currentComplaint.category,
      previousStatus,
      newStatus: status,
      note: note ? note.trim() : null
    }).catch(err => console.error('[Email Error in Status Update]:', err.message));

    // Fetch full updated history
    const historyResult = await db.query(
      `SELECT ch.*, u.name as actor_name, u.role as actor_role
       FROM complaint_history ch
       LEFT JOIN users u ON ch.actor_id = u.id
       WHERE ch.complaint_id = $1
       ORDER BY ch.created_at ASC`,
      [id]
    );

    const enriched = enrichComplaintWithOverdue(updatedComplaint);

    return res.status(200).json({
      success: true,
      message: `Complaint #${id} status updated to "${status}"`,
      data: {
        complaint: enriched,
        history: historyResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update complaint priority (Low, Medium, High)
 */
const updateComplaintPriorityAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const allowedPriorities = ['Low', 'Medium', 'High'];
    if (!priority || !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Allowed values: ${allowedPriorities.join(', ')}`
      });
    }

    const updateResult = await db.query(
      `UPDATE complaints
       SET priority = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [priority, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Complaint #${id} not found`
      });
    }

    const updated = enrichComplaintWithOverdue(updateResult.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Complaint #${id} priority updated to "${priority}"`,
      data: {
        complaint: updated
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get complaint status audit history
 */
const getComplaintHistoryAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const historyResult = await db.query(
      `SELECT ch.*, u.name as actor_name, u.role as actor_role
       FROM complaint_history ch
       LEFT JOIN users u ON ch.actor_id = u.id
       WHERE ch.complaint_id = $1
       ORDER BY ch.created_at ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        complaintId: parseInt(id, 10),
        history: historyResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaintsAdmin,
  updateComplaintStatusAdmin,
  updateComplaintPriorityAdmin,
  getComplaintHistoryAdmin,
  getOverdueDays,
  enrichComplaintWithOverdue
};
