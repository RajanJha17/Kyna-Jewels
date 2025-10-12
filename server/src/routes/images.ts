import { Router } from 'express';
import { body, param } from 'express-validator';
import ImageController from '../controllers/imageController';

const router = Router();
const imageController = new ImageController();

/**
 * @route   POST /api/images/from-url
 * @desc    Parse image URL and return all views of the same product
 * @access  Public
 */
router.post('/from-url', 
  [
    body('imageUrl')
      .notEmpty()
      .withMessage('Image URL is required')
      .isURL()
      .withMessage('Invalid image URL format')
  ],
  imageController.getImagesFromUrl
);

/**
 * @route   POST /api/images/with-attributes
 * @desc    Generate custom images with updated attributes for the same SKU
 * @access  Public
 */
router.post('/with-attributes',
  [
    body('sku')
      .notEmpty()
      .withMessage('SKU is required')
      .isLength({ min: 2 })
      .withMessage('SKU must be at least 2 characters'),
    body('attributes')
      .isObject()
      .withMessage('Attributes must be an object')
  ],
  imageController.getImagesWithAttributes
);

/**
 * @route   GET /api/images/:sku/customization-options
 * @desc    Get available customization options for a specific SKU
 * @access  Public
 */
router.get('/:sku/customization-options',
  [
    param('sku')
      .notEmpty()
      .withMessage('SKU is required')
      .isLength({ min: 2 })
      .withMessage('SKU must be at least 2 characters')
  ],
  imageController.getCustomizationOptions
);

export default router;
