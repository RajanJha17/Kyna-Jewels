import express from 'express';
import { UploadYouOwnController } from '../controllers/uploadYouOwnController';

const router = express.Router();

/**
 * Complete Upload You Own process - Single comprehensive route
 * POST /api/upload-you-own/complete
 * Handles both image uploads and image URLs with full customization data
 */
router.post('/complete', UploadYouOwnController.completeUploadYouOwn);

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
