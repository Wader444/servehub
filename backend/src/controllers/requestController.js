import pool from '../config/db.js';

// User requests a service
export const submitRequest = async (req, res, next) => {
  try {
    const { id: service_id } = req.params;
    const { request_notes } = req.body;
    const user_id = req.user.id;

    // Verify service exists and is active
    const [services] = await pool.query('SELECT title, status FROM services WHERE id = ?', [service_id]);
    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community service not found'
      });
    }

    if (services[0].status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This service is currently not accepting new requests'
      });
    }

    // Insert request
    const [result] = await pool.query(
      'INSERT INTO service_requests (user_id, service_id, request_notes, status) VALUES (?, ?, ?, ?)',
      [user_id, service_id, request_notes || null, 'PENDING']
    );

    // Create notification for user
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        user_id,
        'Service Request Submitted',
        `Your request for "${services[0].title}" has been submitted and is pending review.`,
        'INFO'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      requestId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Current user views their requests
export const getMyRequests = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [requests] = await pool.query(
      `SELECT sr.*, s.title AS service_title, s.location, s.service_date, c.name AS category_name
       FROM service_requests sr
       JOIN services s ON sr.service_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE sr.user_id = ?
       ORDER BY sr.requested_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    next(err);
  }
};

// Admin views all requests
export const getAllRequests = async (req, res, next) => {
  try {
    const { status, service_id } = req.query;

    let query = `
      SELECT sr.*, s.title AS service_title, s.location, s.service_date,
             u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone,
             c.name AS category_name
      FROM service_requests sr
      JOIN services s ON sr.service_id = s.id
      JOIN users u ON sr.user_id = u.id
      JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND sr.status = ?';
      params.push(status);
    }
    if (service_id) {
      query += ' AND sr.service_id = ?';
      params.push(service_id);
    }

    query += ' ORDER BY sr.requested_at DESC';

    const [requests] = await pool.query(query, params);

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    next(err);
  }
};

// Admin updates request status
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_feedback } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const [existing] = await pool.query(
      `SELECT sr.id, sr.user_id, s.title AS service_title
       FROM service_requests sr
       JOIN services s ON sr.service_id = s.id
       WHERE sr.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await pool.query(
      'UPDATE service_requests SET status = ?, admin_feedback = COALESCE(?, admin_feedback) WHERE id = ?',
      [status, admin_feedback, id]
    );

    // Notify user of update
    const notifType = status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ALERT' : 'INFO';
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        existing[0].user_id,
        `Service Request ${status}`,
        `Your request for "${existing[0].service_title}" has been updated to ${status}.${admin_feedback ? ` Note: ${admin_feedback}` : ''}`,
        notifType
      ]
    );

    res.json({
      success: true,
      message: `Request status updated to ${status}`
    });
  } catch (err) {
    next(err);
  }
};
