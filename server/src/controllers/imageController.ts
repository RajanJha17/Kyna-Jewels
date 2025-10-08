import { Request, Response } from 'express';
import ImageUrlParser, { ParsedImageInfo } from '../services/imageUrlParser';

export class ImageController {
  private imageUrlParser: ImageUrlParser;

  constructor() {
    this.imageUrlParser = new ImageUrlParser();
  }

  /**
   * Parse image URL and return all views of the same product
   * POST /api/images/from-url
   */
  public getImagesFromUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'Image URL is required'
        });
        return;
      }

      // Parse the image URL
      const parsedInfo: ParsedImageInfo = this.imageUrlParser.parseImageUrl(imageUrl);
      
      // Generate all views for the same SKU with same attributes
      const allImages = await this.imageUrlParser.generateAllViews(
        parsedInfo.sku, 
        parsedInfo.attributes
      );

      res.status(200).json({
        success: true,
        data: {
          productInfo: {
            sku: parsedInfo.sku,
            category: parsedInfo.category,
            folder: parsedInfo.folder,
            currentAttributes: parsedInfo.attributes
          },
          allImages: {
            main: allImages.main,
            sub: allImages.sub
          },
          totalViews: allImages.sub.length + 1
        },
        message: 'Images parsed and generated successfully'
      });

    } catch (error) {
      console.error('Error in getImagesFromUrl:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to parse image URL and generate views',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Generate custom images with updated attributes for the same SKU
   * POST /api/images/with-attributes
   */
  public getImagesWithAttributes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sku, attributes } = req.body;

      if (!sku) {
        res.status(400).json({
          success: false,
          message: 'SKU is required'
        });
        return;
      }

      if (!attributes || typeof attributes !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Attributes object is required'
        });
        return;
      }

      // Generate all views with updated attributes
      const customImages = await this.imageUrlParser.generateCustomImages(sku, attributes);

      res.status(200).json({
        success: true,
        data: {
          productInfo: {
            sku: sku,
            customAttributes: attributes
          },
          allImages: {
            main: customImages.main,
            sub: customImages.sub
          },
          totalViews: customImages.sub.length + 1
        },
        message: 'Custom images generated successfully'
      });

    } catch (error) {
      console.error('Error in getImagesWithAttributes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom images',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get available customization options for a specific SKU
   * GET /api/images/:sku/customization-options
   */
  public getCustomizationOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sku } = req.params;

      if (!sku) {
        res.status(400).json({
          success: false,
          message: 'SKU is required'
        });
        return;
      }

      // Extract product type from SKU
      const productType = sku.match(/^[A-Z]+/)?.[0] || '';

      // Define available options based on product type
      const options = this.getAvailableOptions(productType);

      res.status(200).json({
        success: true,
        data: {
          sku: sku,
          productType: productType,
          availableOptions: options
        },
        message: 'Customization options retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getCustomizationOptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customization options',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get available customization options based on product type
   */
  private getAvailableOptions(productType: string): any {
    const baseOptions = {
      diamondShapes: ['RD', 'PR', 'PRS', 'PRN', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS', 'BR', 'NF', 'MF', 'BF'],
      diamondSizes: ['10', '15', '20', '25', '30', '40', '50', '70', '100', '130', '150', '200', '300'],
      metals: ['WG', 'YG', 'RG', 'PT'],
      tones: ['1T', '2T'],
      finishes: ['BR', 'NR', 'PL', 'YG', 'RG', 'WG'],
      viewTypes: ['GP', '45', 'BV', 'EV', 'FV', 'TV', 'NBV', 'SV', 'NV', '360']
    };

    switch (productType) {
      case 'ENG':
      case 'SR':
        return {
          ...baseOptions,
          karats: ['14', '18', '22'],
          diamondColors: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
          diamondClarities: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3']
        };

      case 'GR':
      case 'FR':
        return {
          ...baseOptions,
          karats: ['14', '18', '22']
        };

      case 'PD':
        return {
          ...baseOptions,
          karats: ['14', '18', '22']
        };

      case 'ER':
        return {
          ...baseOptions,
          karats: ['14', '18', '22']
        };

      case 'BR':
        return {
          ...baseOptions,
          karats: ['14', '18', '22']
        };

      default:
        return baseOptions;
    }
  }
}

export default ImageController;
