import pool from '../config/db.js';

// Get volunteer opportunities (upcoming events requiring volunteers)
export const getOpportunities = async (req, res, next) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT e.*, c.name AS category_name, c.icon_name AS category_icon
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE e.status = 'UPCOMING' AND e.available_volunteer_slots > 0
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' AND (c.name = ? OR c.id = ?)';
      params.push(category, category);
    }

    query += ' ORDER BY e.event_date ASC';

    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      opportunities: events
    });
  } catch (err) {
    next(err);
  }
};

// Volunteer applies for an opportunity
export const applyForOpportunity = async (req, res, next) => {
  try {
    const { id: event_id } = req.params;
    const { motivation } = req.body;
    const user_id = req.user.id;

    // Check event exists
    const [events] = await pool.query('SELECT title, available_volunteer_slots FROM events WHERE id = ?', [event_id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (events[0].available_volunteer_slots <= 0) {
      return res.status(400).json({ success: false, message: 'All volunteer positions for this event are filled' });
    }

    // Check duplicate
    const [existing] = await pool.query(
      'SELECT id, status FROM volunteer_applications WHERE user_id = ? AND event_id = ?',
      [user_id, event_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied for this volunteer opportunity' });
    }

    const [result] = await pool.query(
      'INSERT INTO volunteer_applications (user_id, event_id, motivation, status) VALUES (?, ?, ?, ?)',
      [user_id, event_id, motivation || null, 'PENDING']
    );

    // Send confirmation notification
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        user_id,
        'Volunteer Application Submitted',
        `Your application to volunteer for "${events[0].title}" has been submitted for admin approval.`,
        'INFO'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Volunteer views own applications
export const getMyApplications = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [applications] = await pool.query(
      `SELECT va.*, e.title AS event_title, e.location, e.event_date, e.start_time, c.name AS category_name
       FROM volunteer_applications va
       JOIN events e ON va.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       WHERE va.user_id = ?
       ORDER BY va.applied_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// Volunteer views own logged hours history
export const getMyHours = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [hours] = await pool.query(
      `SELECT vh.*, e.title AS event_title, u.full_name AS verified_by_name
       FROM volunteer_hours vh
       JOIN events e ON vh.event_id = e.id
       JOIN users u ON vh.verified_by = u.id
       WHERE vh.volunteer_id = ?
       ORDER BY vh.activity_date DESC`,
      [user_id]
    );

    const [profile] = await pool.query(
      'SELECT completed_activities, total_hours, impact_score FROM volunteer_profiles WHERE user_id = ?',
      [user_id]
    );

    res.json({
      success: true,
      stats: profile[0] || { completed_activities: 0, total_hours: 0, impact_score: 0 },
      hours
    });
  } catch (err) {
    next(err);
  }
};

// Admin gets all volunteer applications
export const getAdminApplications = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT va.*, u.full_name AS volunteer_name, u.email AS volunteer_email, u.phone AS volunteer_phone,
             vp.skills, vp.availability, vp.impact_score,
             e.title AS event_title, e.event_date
      FROM volunteer_applications va
      JOIN users u ON va.user_id = u.id
      LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
      JOIN events e ON va.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND va.status = ?';
      params.push(status);
    }

    query += ' ORDER BY va.applied_at DESC';

    const [applications] = await pool.query(query, params);

    res.json({
      success: true,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// Admin updates volunteer application status (Approve/Reject)
export const updateApplicationStatus = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    await connection.beginTransaction();

    const [apps] = await connection.query(
      `SELECT va.*, e.title AS event_title, e.available_volunteer_slots
       FROM volunteer_applications va
       JOIN events e ON va.event_id = e.id
       WHERE va.id = ? FOR UPDATE`,
      [id]
    );

    if (apps.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = apps[0];

    // Update status
    await connection.query(
      'UPDATE volunteer_applications SET status = ?, admin_remarks = COALESCE(?, admin_remarks) WHERE id = ?',
      [status, admin_remarks, id]
    );

    // If approved, decrement available volunteer slots
    if (status === 'APPROVED' && application.status !== 'APPROVED') {
      await connection.query(
        'UPDATE events SET available_volunteer_slots = GREATEST(available_volunteer_slots - 1, 0) WHERE id = ?',
        [application.event_id]
      );
    }

    // Create notification for volunteer
    await connection.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        application.user_id,
        `Volunteer Application ${status}`,
        `Your application for "${application.event_title}" was ${status.toLowerCase()}.${admin_remarks ? ` Remarks: ${admin_remarks}` : ''}`,
        status === 'APPROVED' ? 'SUCCESS' : 'ALERT'
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Volunteer application ${status.toLowerCase()} successfully`
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

// Admin logs completed hours and recalculates Standout Impact Score
export const logVolunteerHours = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { volunteer_id, event_id, hours_logged, activity_date, notes } = req.body;
    const adminId = req.user.id;

    if (!volunteer_id || !event_id || !hours_logged || !activity_date) {
      return res.status(400).json({ success: false, message: 'Please provide volunteer, event, hours, and date' });
    }

    const numericHours = parseFloat(hours_logged);
    if (isNaN(numericHours) || numericHours <= 0) {
      return res.status(400).json({ success: false, message: 'Hours logged must be a positive number' });
    }

    await connection.beginTransaction();

    // 1. Insert hours log
    await connection.query(
      'INSERT INTO volunteer_hours (volunteer_id, event_id, hours_logged, activity_date, notes, verified_by) VALUES (?, ?, ?, ?, ?, ?)',
      [volunteer_id, event_id, numericHours, activity_date, notes || null, adminId]
    );

    // 2. Fetch all verified hours and distinct completed activities for volunteer
    const [hoursSum] = await connection.query(
      'SELECT COALESCE(SUM(hours_logged), 0) AS total_hours, COUNT(id) AS completed_activities FROM volunteer_hours WHERE volunteer_id = ?',
      [volunteer_id]
    );

    const totalHours = Math.round(parseFloat(hoursSum[0].total_hours));
    const completedActivities = parseInt(hoursSum[0].completed_activities, 10);

    // Rule-Based Standout Formula:
    // Impact Score = completed activities * 10 + volunteer hours * 2
    const impactScore = (completedActivities * 10) + (totalHours * 2);

    // 3. Upsert volunteer profile with new score
    await connection.query(
      `INSERT INTO volunteer_profiles (user_id, completed_activities, total_hours, impact_score)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       completed_activities = VALUES(completed_activities),
       total_hours = VALUES(total_hours),
       impact_score = VALUES(impact_score)`,
      [volunteer_id, completedActivities, totalHours, impactScore]
    );

    // 4. Notify volunteer
    await connection.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        volunteer_id,
        'Volunteer Hours Logged & Impact Score Updated!',
        `Admin logged ${numericHours} hours. Your new Impact Score is ${impactScore} points!`,
        'SUCCESS'
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Volunteer hours verified and Impact Score updated',
      stats: {
        completed_activities: completedActivities,
        total_hours: totalHours,
        impact_score: impactScore
      }
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};
