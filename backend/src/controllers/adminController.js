import pool from '../config/db.js';

// Public summary statistics for landing page and civic counters
export const getPublicStats = async (req, res, next) => {
  try {
    const [[{ total_volunteers }]] = await pool.query(
      "SELECT COUNT(*) AS total_volunteers FROM users WHERE role = 'VOLUNTEER'"
    );

    const [[{ total_services }]] = await pool.query(
      "SELECT COUNT(*) AS total_services FROM services WHERE status = 'ACTIVE'"
    );

    const [[{ total_events }]] = await pool.query(
      "SELECT COUNT(*) AS total_events FROM events WHERE status != 'CANCELLED'"
    );

    const [[{ total_hours }]] = await pool.query(
      'SELECT COALESCE(SUM(hours_logged), 0) AS total_hours FROM volunteer_hours'
    );

    res.json({
      success: true,
      stats: {
        total_volunteers: parseInt(total_volunteers, 10),
        total_services: parseInt(total_services, 10),
        total_events: parseInt(total_events, 10),
        total_hours: Math.round(parseFloat(total_hours))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Admin comprehensive dashboard metrics & chart data for Recharts
export const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Overall counts
    const [[counts]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'VOLUNTEER') AS total_volunteers,
        (SELECT COUNT(*) FROM services) AS total_services,
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'PENDING') AS pending_requests,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'COMPLETED') AS completed_requests,
        (SELECT COUNT(*) FROM volunteer_applications WHERE status = 'PENDING') AS pending_volunteer_apps,
        (SELECT COALESCE(SUM(hours_logged), 0) FROM volunteer_hours) AS total_hours_logged
    `);

    // 2. Requests by Status (for Recharts Pie/Donut Chart)
    const [requestsByStatus] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM service_requests
      GROUP BY status
    `);

    // 3. Services by Category (for Recharts Bar Chart)
    const [servicesByCategory] = await pool.query(`
      SELECT c.name AS category, COUNT(s.id) AS count
      FROM categories c
      LEFT JOIN services s ON c.id = s.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);

    // 4. Events by Category
    const [eventsByCategory] = await pool.query(`
      SELECT c.name AS category, COUNT(e.id) AS count
      FROM categories c
      LEFT JOIN events e ON c.id = e.category_id
      GROUP BY c.id, c.name
    `);

    // 5. Recent Activity Logs
    const [recentRequests] = await pool.query(`
      SELECT sr.id, sr.requested_at, sr.status, s.title AS service_title, u.full_name AS user_name
      FROM service_requests sr
      JOIN services s ON sr.service_id = s.id
      JOIN users u ON sr.user_id = u.id
      ORDER BY sr.requested_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      metrics: {
        total_users: parseInt(counts.total_users, 10),
        total_volunteers: parseInt(counts.total_volunteers, 10),
        total_services: parseInt(counts.total_services, 10),
        total_events: parseInt(counts.total_events, 10),
        pending_requests: parseInt(counts.pending_requests, 10),
        completed_requests: parseInt(counts.completed_requests, 10),
        pending_volunteer_apps: parseInt(counts.pending_volunteer_apps, 10),
        total_hours_logged: Math.round(parseFloat(counts.total_hours_logged))
      },
      charts: {
        requestsByStatus,
        servicesByCategory,
        eventsByCategory
      },
      recentRequests
    });
  } catch (err) {
    next(err);
  }
};

// Admin list and manage all users
export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let query = `
      SELECT u.id, u.full_name, u.email, u.role, u.phone, u.created_at,
             vp.impact_score, vp.total_hours, vp.completed_activities
      FROM users u
      LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'All') {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY u.created_at DESC';

    const [users] = await pool.query(query, params);

    res.json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
};

// User Notifications
export const getNotifications = async (req, res, next) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );

    res.json({
      success: true,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
