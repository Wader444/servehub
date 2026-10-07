import { Router } from 'express';
import {
  getOpportunities,
  applyForOpportunity,
  getMyApplications,
  getMyHours,
  getAdminApplications,
  updateApplicationStatus,
  logVolunteerHours
} from '../controllers/volunteerController.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Volunteer desk endpoints
router.get('/opportunities', verifyToken, authorizeRoles('VOLUNTEER', 'ADMIN'), getOpportunities);
router.post('/opportunities/:id/apply', verifyToken, authorizeRoles('VOLUNTEER'), applyForOpportunity);
router.get('/applications', verifyToken, authorizeRoles('VOLUNTEER'), getMyApplications);
router.get('/hours', verifyToken, authorizeRoles('VOLUNTEER'), getMyHours);

// Admin moderation endpoints
router.get('/admin/applications', verifyToken, authorizeRoles('ADMIN'), getAdminApplications);
router.patch('/admin/applications/:id', verifyToken, authorizeRoles('ADMIN'), updateApplicationStatus);
router.post('/admin/hours', verifyToken, authorizeRoles('ADMIN'), logVolunteerHours);

export default router;
