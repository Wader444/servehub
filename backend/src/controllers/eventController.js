import pool from '../config/db.js';

// Get events with search and filters
export const getEvents = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    let query = `
      SELECT e.*, c.name AS category_name, c.icon_name AS category_icon, u.full_name AS created_by_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    } else {
      query += " AND e.status != 'CANCELLED'";
    }

    if (category && category !== 'All') {
      query += ' AND (c.name = ? OR c.id = ?)';
      params.push(category, category);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY e.event_date ASC, e.start_time ASC';

    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    next(err);
  }
};

// Get single event by ID (and check if req.user is registered)
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const [events] = await pool.query(
      `SELECT e.*, c.name AS category_name, c.icon_name AS category_icon, u.full_name AS created_by_name
       FROM events e
       JOIN categories c ON e.category_id = c.id
       JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community event not found'
      });
    }

    let isRegistered = false;
    let registrationStatus = null;
    let hasAppliedAsVolunteer = false;

    if (userId) {
      const [reg] = await pool.query(
        'SELECT status FROM event_registrations WHERE event_id = ? AND user_id = ?',
        [id, userId]
      );
      if (reg.length > 0) {
        isRegistered = true;
        registrationStatus = reg[0].status;
      }

      const [volApp] = await pool.query(
        'SELECT status FROM volunteer_applications WHERE event_id = ? AND user_id = ?',
        [id, userId]
      );
      if (volApp.length > 0) {
        hasAppliedAsVolunteer = true;
      }
    }

    res.json({
      success: true,
      event: events[0],
      userState: {
        isRegistered,
        registrationStatus,
        hasAppliedAsVolunteer
      }
    });
  } catch (err) {
    next(err);
  }
};

// Create new event (Admin only)
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category_id,
      location,
      event_date,
      start_time,
      end_time,
      capacity,
      required_volunteers = 5
    } = req.body;

    if (!title || !description || !category_id || !location || !event_date || !start_time || !end_time || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details'
      });
    }

    const available_slots = capacity;
    const available_volunteer_slots = required_volunteers;

    const [result] = await pool.query(
      `INSERT INTO events (title, description, category_id, location, event_date, start_time, end_time, capacity, available_slots, required_volunteers, available_volunteer_slots, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        category_id,
        location.trim(),
        event_date,
        start_time,
        end_time,
        capacity,
        available_slots,
        required_volunteers,
        available_volunteer_slots,
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Register for event using MySQL Transaction
export const registerForEvent = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id: event_id } = req.params;
    const user_id = req.user.id;

    // START TRANSACTION
    await connection.beginTransaction();

    // 1. Lock and check event row
    const [events] = await connection.query(
      'SELECT id, title, event_date, available_slots, status FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = events[0];

    // 2. Check if event is open
    if (event.status !== 'UPCOMING') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'This event is not open for registration' });
    }

    // 3. Check date has not passed
    const today = new Date().toISOString().split('T')[0];
    const eventDate = new Date(event.event_date).toISOString().split('T')[0];
    if (eventDate < today) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Cannot register for an event that has already passed' });
    }

    // 4. Check available capacity
    if (event.available_slots <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Sorry, this event has reached maximum capacity' });
    }

    // 5. Check duplicate registration
    const [existing] = await connection.query(
      'SELECT id, status FROM event_registrations WHERE user_id = ? AND event_id = ?',
      [user_id, event_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    // 6. Insert registration
    await connection.query(
      'INSERT INTO event_registrations (user_id, event_id, status) VALUES (?, ?, ?)',
      [user_id, event_id, 'CONFIRMED']
    );

    // 7. Decrement available slots
    await connection.query(
      'UPDATE events SET available_slots = available_slots - 1 WHERE id = ?',
      [event_id]
    );

    // 8. Create user notification
    await connection.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        user_id,
        'Event Registration Confirmed',
        `Your seat for "${event.title}" is confirmed! See you on ${eventDate}.`,
        'SUCCESS'
      ]
    );

    // COMMIT TRANSACTION
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully!'
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

// Get current user's registered events
export const getMyRegistrations = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [registrations] = await pool.query(
      `SELECT er.id AS registration_id, er.status AS registration_status, er.registered_at,
              e.*, c.name AS category_name
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       WHERE er.user_id = ?
       ORDER BY e.event_date ASC`,
      [user_id]
    );

    res.json({
      success: true,
      registrations
    });
  } catch (err) {
    next(err);
  }
};

// Update event (Admin only)
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, location, event_date, start_time, end_time, capacity, status } = req.body;

    await pool.query(
      `UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        location = COALESCE(?, location),
        event_date = COALESCE(?, event_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        capacity = COALESCE(?, capacity),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [title, description, category_id, location, event_date, start_time, end_time, capacity, status, id]
    );

    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Delete event (Admin only)
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};
