import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UploadYouOwnService, ICustomizationData } from '../services/uploadYouOwnService';
import { uploadMultipleJewelry, handleUploadError } from '../middleware/uploadYouOwn';

/**
 * Controller for handling custom jewelry upload functionality
 */
export class UploadYouOwnController {

  /**
   * Upload custom jewelry images
   * POST /api/upload-you-own/upload
   */
  static uploadJewelry = [
    uploadMultipleJewelry,
    handleUploadError,
    async (req: Request, res: Response) => {
      try {
        const { 
          sameAsImage, 
          modificationRequest, 
          description, 
          userId, 
          jewelryType = 'custom' 
        } = req.body;
        
        const files = req.files as Express.Multer.File[];
        
        const result = await UploadYouOwnService.uploadJewelry(
          files,
          userId,
          jewelryType,
          sameAsImage === 'true',
          modificationRequest,
          description
        );

        if (result.success) {
          res.status(201).json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (error) {
        console.error('Upload jewelry controller error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error during upload',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];

  /**
   * Save customization details for jewelry
   * POST /api/upload-you-own/customize
   */
  static customizeJewelry = [
    body('jewelryId').notEmpty().withMessage('Jewelry ID is required'),
    body('customization.metal').optional().isIn(['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold']),
    body('customization.goldKarat').optional().isIn(['10KT', '14KT', '18KT', '22KT']),
    body('customization.diamondShape').optional().isIn(['Round', 'Oval', 'Cushion', 'Pear', 'Princess', 'Emerald', 'Radiant', 'Heart', 'Marquise']),
    body('customization.engraving').optional().isLength({ max: 15 }).withMessage('Engraving must be 15 characters or less'),
    body('customization.modificationRequest').optional().isLength({ min: 15 }).withMessage('Modification request must be at least 15 characters'),
    body('customization.description').optional().isLength({ max: 500 }).withMessage('Description must be 500 characters or less'),
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

        const { jewelryId, customization } = req.body;
        
        const result = await UploadYouOwnService.saveCustomization(jewelryId, customization);
        
        if (result.success) {
          res.json(result);
        } else {
          res.status(404).json(result);
        }
      } catch (error) {
        console.error('Customize jewelry controller error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error during customization',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];

  /**
   * Get jewelry by user ID
   * GET /api/upload-you-own/user/:userId
   */
  static getJewelryByUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const result = await UploadYouOwnService.getJewelryByUser(userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get jewelry by user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching user jewelry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get jewelry details by ID
   * GET /api/upload-you-own/:id
   */
  static getJewelryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await UploadYouOwnService.getJewelryById(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Get jewelry by ID controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching jewelry details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Process payment for jewelry
   * POST /api/upload-you-own/:id/payment
   */
  static processPayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await UploadYouOwnService.processPayment(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Process payment controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during payment processing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete jewelry and associated images
   * DELETE /api/upload-you-own/:id
   */
  static deleteJewelry = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await UploadYouOwnService.deleteJewelry(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Delete jewelry controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during deletion',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Cleanup orphaned images (admin function)
   * POST /api/upload-you-own/admin/cleanup
   */
  static cleanupOrphanedImages = async (req: Request, res: Response) => {
    try {
      const result = await UploadYouOwnService.cleanupOrphanedImages();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Cleanup orphaned images controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during cleanup',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get upload statistics (admin function)
   * GET /api/upload-you-own/admin/stats
   */
  static getUploadStats = async (req: Request, res: Response) => {
    try {
      // This would require additional implementation
      res.json({
        success: true,
        message: 'Upload statistics retrieved successfully',
        data: {
          totalUploads: 0,
          totalUsers: 0,
          totalImages: 0,
          storageUsed: '0 MB'
        }
      });
    } catch (error) {
      console.error('Get upload stats controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
