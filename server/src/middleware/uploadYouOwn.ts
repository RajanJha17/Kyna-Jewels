import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

/**
 * Enhanced upload middleware for custom jewelry uploads with user-specific organization
 */
const uploadYouOwnStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req: any, file: any) => {
    const userId = req.body.userId || 'anonymous';
    const jewelryType = req.body.jewelryType || 'custom';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    return {
      folder: `kyna-jewels/upload-you-own/${jewelryType}/user-${userId}`,
      public_id: `${jewelryType}-${timestamp}-${randomId}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { 
          width: 800, 
          height: 600, 
          crop: 'limit',
          quality: 'auto:good',
          format: 'auto'
        }
      ],
      tags: [`user-${userId}`, 'upload-you-own', 'custom-jewelry', jewelryType],
      resource_type: 'image'
    } as any;
  }
});

/**
 * Enhanced multer configuration for custom jewelry uploads
 */
const uploadYouOwn = multer({
  storage: uploadYouOwnStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Enhanced file type validation
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WEBP files are allowed for jewelry uploads'));
    }
  }
});

/**
 * Single file upload middleware
 */
export const uploadSingleJewelry = uploadYouOwn.single('image');

/**
 * Multiple files upload middleware
 */
export const uploadMultipleJewelry = uploadYouOwn.array('images', 10);

/**
 * Fields upload middleware for mixed content
 */
export const uploadJewelryFields = uploadYouOwn.fields([
  { name: 'images', maxCount: 10 },
  { name: 'reference', maxCount: 1 }
]);

/**
 * Error handling middleware for upload errors
 */
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB per file.',
          error: error.message
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.',
          error: error.message
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
          error: error.message
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Upload error occurred.',
          error: error.message
        });
    }
  }
  
  if (error.message.includes('Only JPEG, JPG, PNG, and WEBP files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, JPG, PNG, and WEBP files are allowed.',
      error: error.message
    });
  }
  
  next(error);
};

export default uploadYouOwn;
