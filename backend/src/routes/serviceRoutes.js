import { Router } from 'express';
import {
  getCategories,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin only routes
router.post('/', verifyToken, authorizeRoles('ADMIN'), createService);
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), updateService);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteService);

export default router;
