import express from 'express';
import { UploadYouOwnController } from '../controllers/uploadYouOwnController';

const router = express.Router();

/**
 * Upload custom jewelry images
 * POST /api/upload-you-own/upload
 */
router.post('/upload', UploadYouOwnController.uploadJewelry);

/**
 * Save customization details for jewelry
 * POST /api/upload-you-own/customize
 */
router.post('/customize', UploadYouOwnController.customizeJewelry);

/**
 * Get jewelry by user ID
 * GET /api/upload-you-own/user/:userId
 */
router.get('/user/:userId', UploadYouOwnController.getJewelryByUser);

/**
 * Get jewelry details by ID
 * GET /api/upload-you-own/:id
 */
router.get('/:id', UploadYouOwnController.getJewelryById);

/**
 * Process payment for jewelry
 * POST /api/upload-you-own/:id/payment
 */
router.post('/:id/payment', UploadYouOwnController.processPayment);

/**
 * Delete jewelry and associated images
 * DELETE /api/upload-you-own/:id
 */
router.delete('/:id', UploadYouOwnController.deleteJewelry);

/**
 * Admin routes
 */

/**
 * Cleanup orphaned images (admin function)
 * POST /api/upload-you-own/admin/cleanup
 */
router.post('/admin/cleanup', UploadYouOwnController.cleanupOrphanedImages);

/**
 * Get upload statistics (admin function)
 * GET /api/upload-you-own/admin/stats
 */
router.get('/admin/stats', UploadYouOwnController.getUploadStats);

export default router;
