import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UploadYouOwnService } from '../services/uploadYouOwnService';
import { uploadMultipleJewelry, handleUploadError } from '../middleware/uploadYouOwn';

/**
 * Controller for handling custom jewelry upload functionality
 */
export class UploadYouOwnController {

  /**
   * Complete Upload You Own process - Single comprehensive route
   * POST /api/upload-you-own/complete
   * Handles both image uploads and image URLs with full customization data
   */
  static completeUploadYouOwn = [
    // Handle file uploads (optional - only if images are provided)
    (req: Request, res: Response, next: any) => {
      // Check if files are being uploaded
      if (req.body.images && typeof req.body.images === 'string') {
        // If images is a string, it means image URLs are provided, skip multer
        return next();
      }
      // If images are files, use multer
      return uploadMultipleJewelry(req, res, next);
    },
    handleUploadError,
    async (req: Request, res: Response) => {
      try {
        const {
          // User information
          userId,
          jewelryType = 'custom',
          
          // Image data (either files or URLs)
          images, // Can be files or array of URLs
          imageUrls, // Alternative field for URLs
          
          // Customization data
          sameAsImage = false,
          metal,
          metalColor,
          goldKarat,
          diamondShape,
          diamondSize,
          diamondColor,
          diamondClarity,
          ringSize,
          engraving,
          modificationRequest,
          description,
          
          // Additional options
          priority = 'normal',
          estimatedDelivery,
          specialInstructions
        } = req.body;

        // Validate required fields
        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'User ID is required'
          });
        }

        // Validate images - must have either uploaded files or image URLs
        const uploadedFiles = req.files as Express.Multer.File[];
        let finalImageUrls: string[] = [];
        let imageSources: Array<{ url: string; source: 'cloudinary' | 'external_url' }> = [];

        if (uploadedFiles && uploadedFiles.length > 0) {
          // Images were uploaded via files - Cloudinary URLs
          finalImageUrls = uploadedFiles.map(file => file.path);
          imageSources = uploadedFiles.map(file => ({
            url: file.path,
            source: 'cloudinary' as const
          }));
        } else if (images && typeof images === 'string') {
          // Single image URL provided
          finalImageUrls = [images];
          imageSources = [{ url: images, source: 'external_url' as const }];
        } else if (Array.isArray(images)) {
          // Multiple image URLs provided
          finalImageUrls = images;
          imageSources = images.map(url => ({ url, source: 'external_url' as const }));
        } else if (imageUrls) {
          // Alternative field for image URLs
          const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
          finalImageUrls = urls;
          imageSources = urls.map(url => ({ url, source: 'external_url' as const }));
        } else {
          return res.status(400).json({
            success: false,
            message: 'Either upload images or provide image URLs'
          });
        }

        if (finalImageUrls.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'At least one image is required'
          });
        }

        // Validate image URLs if provided (not uploaded files)
        if (!uploadedFiles || uploadedFiles.length === 0) {
          const urlPattern = /^https?:\/\/.+/;
          for (const url of finalImageUrls) {
            if (!urlPattern.test(url)) {
              return res.status(400).json({
                success: false,
                message: `Invalid image URL: ${url}`
              });
            }
          }
        }

        // Prepare customization data
        const customizationData: any = {
          sameAsImage: sameAsImage === 'true' || sameAsImage === true,
          metal,
          metalColor,
          goldKarat,
          diamondShape,
          diamondSize,
          diamondColor,
          diamondClarity,
          ringSize,
          engraving,
          modificationRequest,
          description,
          priority,
          estimatedDelivery,
          specialInstructions
        };

        // Remove undefined values
        Object.keys(customizationData).forEach(key => {
          if (customizationData[key] === undefined || customizationData[key] === '') {
            delete customizationData[key];
          }
        });

        // Create complete jewelry data
        const jewelryData = {
          userId,
          jewelryType,
          images: finalImageUrls.map((url, index) => ({
            url,
            publicId: uploadedFiles && uploadedFiles[index] ? uploadedFiles[index].filename : `url-${Date.now()}-${index}`,
            userId,
            uploadedAt: new Date(),
            source: uploadedFiles && uploadedFiles[index] ? 'upload' : 'url'
          })),
          customization: customizationData,
          status: 'payment_pending' as const, // Ready for payment
          createdAt: new Date()
        };

        // Save to database using the service
        const result = await UploadYouOwnService.createCompleteJewelry(jewelryData);

        if (result.success) {
          res.status(201).json({
            success: true,
            message: 'Custom jewelry created successfully',
            data: {
              jewelryId: result.data?.jewelryId,
              userId: result.data?.userId,
              jewelryType: result.data?.jewelryType,
              images: result.data?.images,
              customization: result.data?.customization,
              status: result.data?.status,
              createdAt: result.data?.createdAt,
              imageSources: imageSources
            }
          });
        } else {
          res.status(400).json(result);
        }

      } catch (error) {
        console.error('Complete upload you own error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error during upload',
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
   * Admin routes
   */

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
      const result = await UploadYouOwnService.getUploadStats();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
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