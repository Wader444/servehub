import { Router } from 'express';
import {
  getPublicStats,
  getAdminDashboard,
  getAdminUsers,
  getNotifications,
  markNotificationRead
} from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public platform statistics
router.get('/stats/summary', getPublicStats);

// User notification endpoints
router.get('/notifications', verifyToken, getNotifications);
router.patch('/notifications/:id/read', verifyToken, markNotificationRead);

// Admin dashboard & user management
router.get('/dashboard', verifyToken, authorizeRoles('ADMIN'), getAdminDashboard);
router.get('/users', verifyToken, authorizeRoles('ADMIN'), getAdminUsers);

export default router;
