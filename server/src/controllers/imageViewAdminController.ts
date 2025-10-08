import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ImageViewService } from '../services/imageViewService';
import ImageViewConfig from '../models/imageViewConfigModel';

/**
 * Admin controller for managing image view configurations
 */
export class ImageViewAdminController {

  /**
   * GET /api/admin/image-views
   * Get all image view configurations
   */
  static getAllViews = async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      
      let views;
      if (category) {
        views = await ImageViewService.getViewsForCategory(category as string);
      } else {
        views = await ImageViewConfig.find().sort({ order: 1 });
      }

      res.json({
        success: true,
        message: 'Image views retrieved successfully',
        data: views
      });
    } catch (error) {
      console.error('Error fetching image views:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch image views',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/admin/image-views/:viewType
   * Get specific image view configuration
   */
  static getView = async (req: Request, res: Response) => {
    try {
      const { viewType } = req.params;
      
      const view = await ImageViewConfig.findOne({ viewType: viewType.toUpperCase() });
      
      if (!view) {
        return res.status(404).json({
          success: false,
          message: 'Image view not found'
        });
      }

      res.json({
        success: true,
        message: 'Image view retrieved successfully',
        data: view
      });
    } catch (error) {
      console.error('Error fetching image view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch image view',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/admin/image-views
   * Create new image view configuration
   */
  static createView = [
    body('viewType').notEmpty().withMessage('View type is required'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    body('category').isIn(['rings', 'bracelets', 'pendants', 'earrings', 'all']).withMessage('Invalid category'),
    body('order').isInt({ min: 0 }).withMessage('Order must be a positive integer'),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
          });
        }

        const { viewType, displayName, description, category, order, isThumbnail } = req.body;

        // Check if view type already exists
        const existingView = await ImageViewConfig.findOne({ viewType: viewType.toUpperCase() });
        if (existingView) {
          return res.status(400).json({
            success: false,
            message: 'View type already exists'
          });
        }

        const newView = await ImageViewService.addView({
          viewType: viewType.toUpperCase(),
          displayName,
          description,
          category,
          order,
          isThumbnail: isThumbnail || false
        });

        res.status(201).json({
          success: true,
          message: 'Image view created successfully',
          data: newView
        });
      } catch (error) {
        console.error('Error creating image view:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create image view',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];

  /**
   * PUT /api/admin/image-views/:viewType
   * Update image view configuration
   */
  static updateView = [
    body('displayName').optional().notEmpty().withMessage('Display name cannot be empty'),
    body('category').optional().isIn(['rings', 'bracelets', 'pendants', 'earrings', 'all']).withMessage('Invalid category'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer'),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
          });
        }

        const { viewType } = req.params;
        const updateData = req.body;

        const updatedView = await ImageViewService.updateView(viewType.toUpperCase(), updateData);
        
        if (!updatedView) {
          return res.status(404).json({
            success: false,
            message: 'Image view not found'
          });
        }

        res.json({
          success: true,
          message: 'Image view updated successfully',
          data: updatedView
        });
      } catch (error) {
        console.error('Error updating image view:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update image view',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];

  /**
   * DELETE /api/admin/image-views/:viewType
   * Delete image view configuration (soft delete)
   */
  static deleteView = async (req: Request, res: Response) => {
    try {
      const { viewType } = req.params;

      const deleted = await ImageViewService.deleteView(viewType.toUpperCase());
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Image view not found'
        });
      }

      res.json({
        success: true,
        message: 'Image view deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image view',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/admin/image-views/initialize
   * Initialize default image views
   */
  static initializeDefaultViews = async (req: Request, res: Response) => {
    try {
      await ImageViewService.initializeDefaultViews();

      res.json({
        success: true,
        message: 'Default image views initialized successfully'
      });
    } catch (error) {
      console.error('Error initializing default views:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize default views',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/admin/image-views/category/:category
   * Get views for specific category
   */
  static getViewsByCategory = async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      
      const views = await ImageViewService.getViewsForCategory(category);

      res.json({
        success: true,
        message: `Image views for ${category} retrieved successfully`,
        data: views
      });
    } catch (error) {
      console.error('Error fetching views by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch views by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/admin/image-views/main
   * Get main view (GP)
   */
  static getMainView = async (req: Request, res: Response) => {
    try {
      const mainView = await ImageViewService.getMainView();

      res.json({
        success: true,
        message: 'Main view retrieved successfully',
        data: mainView
      });
    } catch (error) {
      console.error('Error fetching main view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch main view',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
