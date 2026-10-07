import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistrations
} from '../controllers/eventController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', (req, res, next) => {
  // Optional auth to attach user registration state if logged in
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => getEventById(req, res, next));
  }
  getEventById(req, res, next);
});

// Authenticated user event registration
router.post('/:id/register', verifyToken, registerForEvent);
router.get('/user/my-registrations', verifyToken, getMyRegistrations);

// Admin moderation
router.post('/', verifyToken, authorizeRoles('ADMIN'), createEvent);
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), updateEvent);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteEvent);

export default router;
