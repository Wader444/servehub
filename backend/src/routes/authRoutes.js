import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Authenticated user endpoints
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);

export default router;
