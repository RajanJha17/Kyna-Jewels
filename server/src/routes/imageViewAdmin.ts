import express from 'express';
import { ImageViewAdminController } from '../controllers/imageViewAdminController';

const router = express.Router();

/**
 * Admin routes for managing image view configurations
 */

/**
 * GET /api/admin/image-views
 * Get all image view configurations
 */
router.get('/', ImageViewAdminController.getAllViews);

/**
 * GET /api/admin/image-views/category/:category
 * Get views for specific category
 */
router.get('/category/:category', ImageViewAdminController.getViewsByCategory);

/**
 * GET /api/admin/image-views/main
 * Get main view (GP)
 */
router.get('/main', ImageViewAdminController.getMainView);

/**
 * GET /api/admin/image-views/:viewType
 * Get specific image view configuration
 */
router.get('/:viewType', ImageViewAdminController.getView);

/**
 * POST /api/admin/image-views
 * Create new image view configuration
 */
router.post('/', ImageViewAdminController.createView);

/**
 * POST /api/admin/image-views/initialize
 * Initialize default image views
 */
router.post('/initialize', ImageViewAdminController.initializeDefaultViews);

/**
 * PUT /api/admin/image-views/:viewType
 * Update image view configuration
 */
router.put('/:viewType', ImageViewAdminController.updateView);

/**
 * DELETE /api/admin/image-views/:viewType
 * Delete image view configuration (soft delete)
 */
router.delete('/:viewType', ImageViewAdminController.deleteView);

export default router;
