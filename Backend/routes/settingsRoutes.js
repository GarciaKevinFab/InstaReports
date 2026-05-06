import express from 'express';
import { getSettings, updateSettings, removeLogo } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import imageUpload from '../middleware/imageUploadMiddleware.js';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, admin, imageUpload.single('logo'), updateSettings);
router.delete('/logo', protect, admin, removeLogo);

export default router;
