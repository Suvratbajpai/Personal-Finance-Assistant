import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { requireAuth, requireNoAuth } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/register', requireNoAuth, register);
router.post('/login', requireNoAuth, login);
router.post('/logout', requireAuth, logout);
router.get('/me', getCurrentUser);

export default router;