import express from 'express';
import {
    createReport,
    getReports,
    updateReport,
    deleteReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Middleware para manejo de archivos

const router = express.Router();

// Crear y obtener reportes
router
    .route('/')
    .post(protect, upload.single('file'), createReport) // Soporta subida de un archivo
    .get(protect, getReports);

// Actualizar y eliminar reportes
router
    .route('/:id')
    .put(protect, upload.single('file'), updateReport) // Soporta actualización con archivo
    .delete(protect, deleteReport);

export default router;
