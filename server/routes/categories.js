import express from 'express';
import { getCategories, getCategoriesByType } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Category routes
router.get('/', getCategories);
router.get('/:type', getCategoriesByType);

export default router;