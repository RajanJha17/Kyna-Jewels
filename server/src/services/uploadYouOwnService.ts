import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary';
import Ring, { IRing, RingStatus, ICustomization, JewelryType } from '../models/Ring';

/**
 * Interface for upload response
 */
export interface IUploadResponse {
  success: boolean;
  message: string;
  data?: {
    jewelryId: string;
    userId: string;
    images: string[];
    jewelryType: string;
    sameAsImage: boolean;
    status: RingStatus;
  };
  error?: string;
}

/**
 * Interface for customization data
 */
export interface ICustomizationData {
  jewelryType?: string;
  metal?: string;
  metalColor?: string;
  goldKarat?: string;
  diamondShape?: string;
  diamondSize?: string;
  diamondColor?: string;
  diamondClarity?: string;
  ringSize?: string;
  engraving?: string;
  modificationRequest?: string;
  description?: string;
}

/**
 * Service class for handling custom jewelry uploads
 */
export class UploadYouOwnService {
  
  /**
   * Upload custom jewelry images
   */
  static async uploadJewelry(
    files: Express.Multer.File[],
    userId: string,
    jewelryType: string = 'custom',
    sameAsImage: boolean = false,
    modificationRequest?: string,
    description?: string
  ): Promise<IUploadResponse> {
    try {
      if (!files || files.length < 2) {
        return {
          success: false,
          message: 'At least 2 images are required for custom jewelry'
        };
      }

      // Generate userId if not provided (for demo purposes)
      const currentUserId = userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Process uploaded files with user information
      const imageData = files.map(file => ({
        url: file.path,
        publicId: file.filename,
        userId: currentUserId,
        uploadedAt: new Date()
      }));

      const jewelryData: any = {
        userId: currentUserId,
        images: imageData,
        jewelryType: jewelryType as JewelryType,
        sameAsImage: sameAsImage,
        status: sameAsImage ? RingStatus.PAYMENT_PENDING : RingStatus.CUSTOMIZED
      };

      // Add modification request and description if provided
      if (modificationRequest) {
        jewelryData.customization = {
          modificationRequest,
          description
        };
      }

      const jewelry = new Ring(jewelryData);
      await jewelry.save();

      return {
        success: true,
        message: 'Jewelry images uploaded successfully',
        data: {
          jewelryId: jewelry._id.toString(),
          userId: jewelry.userId,
          images: jewelry.images.map(img => img.url),
          jewelryType: jewelryType,
          sameAsImage: jewelry.sameAsImage,
          status: jewelry.status
        }
      };
    } catch (error) {
      console.error('Upload jewelry error:', error);
      return {
        success: false,
        message: 'Error uploading jewelry images',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Save customization details for jewelry
   */
  static async saveCustomization(
    jewelryId: string,
    customization: ICustomizationData
  ): Promise<IUploadResponse> {
    try {
      const jewelry = await Ring.findById(jewelryId);
      if (!jewelry) {
        return {
          success: false,
          message: 'Jewelry not found'
        };
      }

      // Update customization data
      jewelry.customization = { ...jewelry.customization, ...customization };
      jewelry.status = RingStatus.PAYMENT_PENDING;
      await jewelry.save();

      return {
        success: true,
        message: 'Customization saved successfully',
        data: {
          jewelryId: jewelry._id.toString(),
          userId: jewelry.userId,
          images: jewelry.images.map(img => img.url),
          jewelryType: (jewelry as any).jewelryType || 'custom',
          sameAsImage: jewelry.sameAsImage,
          status: jewelry.status
        }
      };
    } catch (error) {
      console.error('Save customization error:', error);
      return {
        success: false,
        message: 'Error saving customization',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get jewelry by user ID
   */
  static async getJewelryByUser(userId: string): Promise<{ success: boolean; message: string; data?: IRing[]; error?: string }> {
    try {
      const jewelry = await Ring.find({ userId })
        .sort({ createdAt: -1 });
      
      return {
        success: true,
        message: 'Jewelry retrieved successfully',
        data: jewelry
      };
    } catch (error) {
      console.error('Get jewelry by user error:', error);
      return {
        success: false,
        message: 'Error fetching user jewelry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get jewelry details by ID
   */
  static async getJewelryById(jewelryId: string): Promise<IUploadResponse> {
    try {
      const jewelry = await Ring.findById(jewelryId);
      if (!jewelry) {
        return {
          success: false,
          message: 'Jewelry not found'
        };
      }

      return {
        success: true,
        message: 'Jewelry details retrieved successfully',
        data: {
          jewelryId: jewelry._id.toString(),
          userId: jewelry.userId,
          images: jewelry.images.map(img => img.url),
          jewelryType: (jewelry as any).jewelryType || 'custom',
          sameAsImage: jewelry.sameAsImage,
          status: jewelry.status
        }
      };
    } catch (error) {
      console.error('Get jewelry by ID error:', error);
      return {
        success: false,
        message: 'Error fetching jewelry details',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process payment for jewelry
   */
  static async processPayment(jewelryId: string): Promise<IUploadResponse> {
    try {
      const jewelry = await Ring.findById(jewelryId);
      if (!jewelry) {
        return {
          success: false,
          message: 'Jewelry not found'
        };
      }

      // Update jewelry status to completed
      jewelry.status = RingStatus.COMPLETED;
      await jewelry.save();

      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          jewelryId: jewelry._id.toString(),
          userId: jewelry.userId,
          images: jewelry.images.map(img => img.url),
          jewelryType: (jewelry as any).jewelryType || 'custom',
          sameAsImage: jewelry.sameAsImage,
          status: jewelry.status
        }
      };
    } catch (error) {
      console.error('Process payment error:', error);
      return {
        success: false,
        message: 'Error processing payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete jewelry and associated images
   */
  static async deleteJewelry(jewelryId: string): Promise<IUploadResponse> {
    try {
      const jewelry = await Ring.findById(jewelryId);
      if (!jewelry) {
        return {
          success: false,
          message: 'Jewelry not found'
        };
      }

      // Delete images from Cloudinary
      for (const image of jewelry.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (cloudinaryError) {
          console.warn(`Failed to delete image ${image.publicId}:`, cloudinaryError);
        }
      }

      // Delete jewelry from database
      await Ring.findByIdAndDelete(jewelryId);

      return {
        success: true,
        message: 'Jewelry deleted successfully'
      };
    } catch (error) {
      console.error('Delete jewelry error:', error);
      return {
        success: false,
        message: 'Error deleting jewelry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cleanup orphaned images (admin function)
   */
  static async cleanupOrphanedImages(): Promise<{ success: boolean; message: string; deletedCount?: number }> {
    try {
      // This would require additional implementation to find orphaned images
      // For now, return a placeholder response
      return {
        success: true,
        message: 'Cleanup completed (placeholder)',
        deletedCount: 0
      };
    } catch (error) {
      console.error('Cleanup orphaned images error:', error);
      return {
        success: false,
        message: 'Error during cleanup',
      };
    }
  }
}
