import { Router } from 'express';
import {
  submitRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
} from '../controllers/requestController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Current user routes
router.get('/my', verifyToken, getMyRequests);
router.post('/service/:id', verifyToken, submitRequest);

// Admin moderation routes
router.get('/', verifyToken, authorizeRoles('ADMIN'), getAllRequests);
router.patch('/:id/status', verifyToken, authorizeRoles('ADMIN'), updateRequestStatus);

export default router;
