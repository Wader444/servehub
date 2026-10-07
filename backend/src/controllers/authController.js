import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    process.env.JWT_SECRET || 'servehub_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, role = 'USER', phone, address, skills, interests, availability } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const assignedRole = ['USER', 'VOLUNTEER'].includes(role) ? role : 'USER';

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name.trim(), email.trim().toLowerCase(), password_hash, assignedRole, phone || null, address || null]
    );

    const userId = result.insertId;

    // If volunteer, create volunteer profile
    if (assignedRole === 'VOLUNTEER') {
      await pool.query(
        'INSERT INTO volunteer_profiles (user_id, skills, interests, availability) VALUES (?, ?, ?, ?)',
        [userId, skills || 'General volunteering', interests || 'Community support', availability || 'Weekends']
      );
    }

    const userObj = {
      id: userId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      phone: phone || null,
      address: address || null
    };

    const token = generateToken(userObj);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userObj = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    };

    const token = generateToken(userObj);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.phone, u.address, u.created_at,
              vp.skills, vp.interests, vp.availability, vp.completed_activities, vp.total_hours, vp.impact_score
       FROM users u
       LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { full_name, phone, address, skills, interests, availability } = req.body;

    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
      [full_name, phone, address, req.user.id]
    );

    if (req.user.role === 'VOLUNTEER' && (skills || interests || availability)) {
      await pool.query(
        `INSERT INTO volunteer_profiles (user_id, skills, interests, availability)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         skills = COALESCE(VALUES(skills), skills),
         interests = COALESCE(VALUES(interests), interests),
         availability = COALESCE(VALUES(availability), availability)`,
        [req.user.id, skills, interests, availability]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    next(err);
  }
};
