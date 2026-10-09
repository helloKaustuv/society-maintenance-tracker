const db = require('../config/db');
const { getOverdueDays, enrichComplaintWithOverdue } = require('./complaintController');

/**
 * Admin: Get comprehensive dashboard statistics and metrics
 */
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const overdueDays = getOverdueDays();

    // 1. Fetch all complaints to calculate dynamic stats accurately
    const complaintsResult = await db.query(`
      SELECT c.*, u.name as resident_name, u.flat_number
      FROM complaints c
      JOIN users u ON c.resident_id = u.id
      ORDER BY c.created_at DESC
    `);

    const allComplaints = complaintsResult.rows.map(enrichComplaintWithOverdue);

    // Metric Summary Counters
    const totalComplaints = allComplaints.length;
    const openComplaints = allComplaints.filter(c => c.status === 'Open').length;
    const inProgressComplaints = allComplaints.filter(c => c.status === 'In Progress').length;
    const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved').length;
    const overdueComplaints = allComplaints.filter(c => c.is_overdue).length;

    // Breakdown by Category
    const categoryMap = {};
    allComplaints.forEach(c => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });
    const byCategory = Object.keys(categoryMap).map(category => ({
      category,
      count: categoryMap[category]
    })).sort((a, b) => b.count - a.count);

    // Breakdown by Priority
    const priorityMap = { High: 0, Medium: 0, Low: 0 };
    allComplaints.forEach(c => {
      if (priorityMap[c.priority] !== undefined) {
        priorityMap[c.priority]++;
      } else {
        priorityMap[c.priority] = 1;
      }
    });
    const byPriority = Object.keys(priorityMap).map(priority => ({
      priority,
      count: priorityMap[priority]
    }));

    // Breakdown by Status
    const byStatus = [
      { status: 'Open', count: openComplaints, color: '#3b82f6' },
      { status: 'In Progress', count: inProgressComplaints, color: '#f59e0b' },
      { status: 'Resolved', count: resolvedComplaints, color: '#10b981' }
    ];

    // Top Overdue Complaints
    const overdueList = allComplaints
      .filter(c => c.is_overdue)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // oldest first
      .slice(0, 5);

    // Recent Activity Audit Feed (Latest 8 history items)
    const recentHistoryResult = await db.query(`
      SELECT ch.*, c.title as complaint_title, c.category, u.name as actor_name, u.role as actor_role
      FROM complaint_history ch
      JOIN complaints c ON ch.complaint_id = c.id
      LEFT JOIN users u ON ch.actor_id = u.id
      ORDER BY ch.created_at DESC
      LIMIT 8
    `);

    // Society Summary counts
    const residentCountRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'resident'");
    const totalResidents = parseInt(residentCountRes.rows[0].count, 10) || 0;

    const noticeCountRes = await db.query("SELECT COUNT(*) as count FROM notices");
    const totalNotices = parseInt(noticeCountRes.rows[0].count, 10) || 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalComplaints,
          openComplaints,
          inProgressComplaints,
          resolvedComplaints,
          overdueComplaints,
          overdueDaysThreshold: overdueDays,
          totalResidents,
          totalNotices
        },
        byStatus,
        byCategory,
        byPriority,
        overdueList,
        recentActivity: recentHistoryResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats
};
