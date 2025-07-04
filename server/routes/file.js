import express from 'express';
import { uploadFile, getFile } from '../controllers/file.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Add authentication to file routes
router.post('/upload', authenticateUser, uploadFile);
router.get('/:id', authenticateUser, getFile);

export default router;
