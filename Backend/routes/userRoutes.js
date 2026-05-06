import express from 'express';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getMyProfile,
    updateMyProfile,
    removeMySignature,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import imageUpload from '../middleware/imageUploadMiddleware.js';

const router = express.Router();

router.route('/me').get(protect, getMyProfile).put(protect, imageUpload.single('signature'), updateMyProfile);
router.delete('/me/signature', protect, removeMySignature);

router.route('/').get(protect, admin, getUsers).post(protect, admin, createUser);
router.route('/:id').put(protect, admin, updateUser).delete(protect, admin, deleteUser);

export default router;
