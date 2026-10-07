import pool from '../config/db.js';

// Get all categories
export const getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
};

// Get all services with optional search and filters
export const getServices = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    let query = `
      SELECT s.*, c.name AS category_name, c.icon_name AS category_icon, u.full_name AS created_by_name
      FROM services s
      JOIN categories c ON s.category_id = c.id
      JOIN users u ON s.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    } else {
      query += " AND s.status != 'INACTIVE'";
    }

    if (category && category !== 'All') {
      query += ' AND (c.name = ? OR c.id = ?)';
      params.push(category, category);
    }

    if (search) {
      query += ' AND (s.title LIKE ? OR s.description LIKE ? OR s.location LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.service_date ASC';

    const [services] = await pool.query(query, params);

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (err) {
    next(err);
  }
};

// Get single service by ID
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [services] = await pool.query(
      `SELECT s.*, c.name AS category_name, c.icon_name AS category_icon, u.full_name AS created_by_name
       FROM services s
       JOIN categories c ON s.category_id = c.id
       JOIN users u ON s.created_by = u.id
       WHERE s.id = ?`,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community service not found'
      });
    }

    res.json({
      success: true,
      service: services[0]
    });
  } catch (err) {
    next(err);
  }
};

// Create new service (Admin only)
export const createService = async (req, res, next) => {
  try {
    const { title, description, category_id, location, service_date, max_participants = 50, status = 'ACTIVE' } = req.body;

    if (!title || !description || !category_id || !location || !service_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required service fields'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO services (title, description, category_id, location, service_date, max_participants, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description.trim(), category_id, location.trim(), service_date, max_participants, status, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Community service created successfully',
      serviceId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// Update service (Admin only)
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, location, service_date, max_participants, status } = req.body;

    const [existing] = await pool.query('SELECT id FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community service not found'
      });
    }

    await pool.query(
      `UPDATE services SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        location = COALESCE(?, location),
        service_date = COALESCE(?, service_date),
        max_participants = COALESCE(?, max_participants),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [title, description, category_id, location, service_date, max_participants, status, id]
    );

    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Delete service (Admin only)
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
