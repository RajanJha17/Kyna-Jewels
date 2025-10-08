import { ImageService } from './imageService';

export interface ParsedImageInfo {
  sku: string;
  category: string;
  folder: string;
  attributes: {
    diamondShape?: string;
    diamondSize?: string;
    tone?: string;
    metal?: string;
    finish?: string;
    view?: string;
    [key: string]: string | undefined;
  };
  baseUrl: string;
}

export class ImageUrlParser {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  /**
   * Parse image URL to extract SKU, attributes, and folder information
   */
  parseImageUrl(imageUrl: string): ParsedImageInfo {
    try {
      // Decode URL and split into parts
      const decodedUrl = decodeURIComponent(imageUrl);
      const urlParts = decodedUrl.split('/');
      
      // Extract filename and remove extension
      const filename = urlParts[urlParts.length - 1].replace('.webp', '').replace('.glb', '').replace('.mp4', '');
      const folder = urlParts[urlParts.length - 2];
      const category = urlParts[urlParts.length - 3];
      const baseUrl = urlParts.slice(0, -3).join('/');
      
      // Parse filename: ENG1-EM-30-18-LG-EFVVS-GP
      const parts = filename.split('-');
      const sku = parts[0]; // ENG1, GR1, FR1, etc.
      const attributes = this.parseAttributes(parts.slice(1));
      
      return {
        sku,
        category,
        folder,
        attributes,
        baseUrl
      };
    } catch (error) {
      console.error('Error parsing image URL:', error);
      throw new Error('Invalid image URL format');
    }
  }

  /**
   * Parse attributes from filename parts
   */
  private parseAttributes(parts: string[]): { [key: string]: string } {
    const attributes: { [key: string]: string } = {};
    
    // Remove view type from the end if present
    const viewTypes = ['GP', '45', 'BV', 'EV', 'FV', 'TV', 'NBV', 'SV', '360', 'AV', 'SIDE', 'BACK', 'TRV', 'NV'];
    let attributeParts = [...parts];
    const lastPart = parts[parts.length - 1];
    
    if (viewTypes.includes(lastPart)) {
      attributes.view = lastPart;
      attributeParts = parts.slice(0, -1);
    }
    
    // Parse attributes based on SKU type
    const sku = parts[0]?.match(/^[A-Z]+/)?.[0] || '';
    
    switch (sku) {
      case 'ENG':
      case 'SR':
        // Engagement/Solitaire: Handle multiple patterns
        // ENG137-RD-50-RG-TV.webp
        // ENG123-MQ-130-WG-FV.webp
        // ENG123-MQ-130-2T-YG-WG-SV.webp
        // ENG1-EM-30-18-LG-EFVVS (old pattern)
        
        if (attributeParts.length >= 5) {
          // Complex pattern: ENG123-MQ-130-2T-YG-WG-SV
          if (this.isDiamondShape(attributeParts[0])) {
            attributes.diamondShape = attributeParts[0]; // MQ, RD, etc.
            attributes.diamondSize = attributeParts[1]; // 130, 50, etc.
            if (this.isTone(attributeParts[2])) {
              attributes.tone = attributeParts[2]; // 2T
              attributes.metal = attributeParts[3]; // YG
              attributes.finish = attributeParts[4]; // WG
            } else {
              // No tone: ENG137-RD-50-RG-TV
              attributes.metal = attributeParts[2]; // RG
            }
          }
        } else if (attributeParts.length === 4) {
          // Medium pattern: ENG137-RD-50-RG-TV
          if (this.isDiamondShape(attributeParts[0])) {
            attributes.diamondShape = attributeParts[0]; // RD
            attributes.diamondSize = attributeParts[1]; // 50
            attributes.metal = attributeParts[2]; // RG
          }
        } else if (attributeParts.length >= 5) {
          // Old pattern: ENG1-EM-30-18-LG-EFVVS
          if (attributeParts[0]) attributes.diamondShape = attributeParts[0]; // EM
          if (attributeParts[1]) attributes.diamondSize = attributeParts[1]; // 30
          if (attributeParts[2]) attributes.karat = attributeParts[2]; // 18
          if (attributeParts[3]) attributes.metal = attributeParts[3]; // LG
          if (attributeParts[4]) attributes.diamondColor = attributeParts[4]; // EFVVS
        }
        break;
        
      case 'GR':
      case 'FR':
        // Gents/Fashion Rings: GR1-RD-70-2T-BR-RG-45
        if (attributeParts[0]) attributes.diamondShape = attributeParts[0]; // RD
        if (attributeParts[1]) attributes.diamondSize = attributeParts[1]; // 70
        if (attributeParts[2]) attributes.tone = attributeParts[2]; // 2T
        if (attributeParts[3]) attributes.finish = attributeParts[3]; // BR
        if (attributeParts[4]) attributes.metal = attributeParts[4]; // RG
        break;
        
      case 'PD':
        // Pendants: Handle multiple patterns
        // PD19-PRS-300-2T-WG-YG-NV.mp4
        // PD9-2T-YG-BR-NV.mp4
        // PD21-PRN-50-2T-WG-RG-FV.webp
        // PD9-WG-BV.webp
        
        if (attributeParts.length >= 6) {
          // Complex pendant: PD19-PRS-300-2T-WG-YG-NV
          if (this.isDiamondShape(attributeParts[0])) {
            attributes.diamondShape = attributeParts[0]; // PRS, PRN, etc.
            attributes.diamondSize = attributeParts[1]; // 300, 50, etc.
            attributes.tone = attributeParts[2]; // 2T
            attributes.metal = attributeParts[3]; // WG
            attributes.finish = attributeParts[4]; // YG, RG, etc.
          }
        } else if (attributeParts.length === 4) {
          // Medium complexity: PD9-2T-YG-BR-NV
          if (this.isTone(attributeParts[0])) {
            attributes.tone = attributeParts[0]; // 2T
            attributes.metal = attributeParts[1]; // YG
            attributes.finish = attributeParts[2]; // BR
          }
        } else if (attributeParts.length === 2) {
          // Simple pendant: PD9-WG-BV
          if (this.isMetal(attributeParts[0])) {
            attributes.metal = attributeParts[0]; // WG
          }
        } else {
          // Fallback: parse by type detection
          attributeParts.forEach((part, index) => {
            if (this.isDiamondShape(part)) {
              attributes.diamondShape = part;
            } else if (this.isTone(part)) {
              attributes.tone = part;
            } else if (this.isMetal(part)) {
              attributes.metal = part;
            } else if (this.isFinish(part)) {
              attributes.finish = part;
            } else if (this.isNumeric(part)) {
              attributes.diamondSize = part;
            }
          });
        }
        break;
        
      case 'ER':
        // Earrings: ER66-EM-05-WG-AV
        if (attributeParts[0]) attributes.diamondShape = attributeParts[0]; // EM
        if (attributeParts[1]) attributes.diamondSize = attributeParts[1]; // 05
        if (attributeParts[2]) attributes.metal = attributeParts[2]; // WG
        break;
        
      case 'BR':
        // Bracelets: BR1-RD-025-WG-TRV
        if (attributeParts[0]) attributes.diamondShape = attributeParts[0]; // RD
        if (attributeParts[1]) attributes.diamondSize = attributeParts[1]; // 025
        if (attributeParts[2]) attributes.metal = attributeParts[2]; // WG
        break;
        
      default:
        // Generic parsing
        attributeParts.forEach((part, index) => {
          if (this.isDiamondShape(part)) {
            attributes.diamondShape = part;
          } else if (this.isMetal(part)) {
            attributes.metal = part;
          } else if (this.isTone(part)) {
            attributes.tone = part;
          } else if (this.isFinish(part)) {
            attributes.finish = part;
          } else if (this.isNumeric(part)) {
            attributes.diamondSize = part;
          }
        });
        break;
    }
    
    return attributes;
  }

  /**
   * Generate all views for a specific SKU with given attributes
   */
  async generateAllViews(sku: string, attributes: any): Promise<{ main: string; sub: string[] }> {
    try {
      // Use existing ImageService to generate all views
      return await this.imageService.generateImageUrlsFlexible(sku, attributes, 'all');
    } catch (error) {
      console.error('Error generating all views:', error);
      throw new Error('Failed to generate image views');
    }
  }

  /**
   * Generate images with updated attributes for the same SKU
   */
  async generateCustomImages(sku: string, updatedAttributes: any): Promise<{ main: string; sub: string[] }> {
    try {
      // Generate new images with updated attributes
      return await this.imageService.generateImageUrlsFlexible(sku, updatedAttributes, 'all');
    } catch (error) {
      console.error('Error generating custom images:', error);
      throw new Error('Failed to generate custom images');
    }
  }

  /**
   * Helper methods to identify attribute types
   */
  private isDiamondShape(part: string): boolean {
    const shapes = ['RD', 'PR', 'PRS', 'PRN', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS', 'CUS'];
    return shapes.includes(part.toUpperCase());
  }

  private isMetal(part: string): boolean {
    const metals = ['WG', 'YG', 'RG', 'PT', 'SL', 'LG'];
    return metals.includes(part.toUpperCase());
  }

  private isTone(part: string): boolean {
    return part.toUpperCase().includes('T') && (part.includes('1') || part.includes('2'));
  }

  private isFinish(part: string): boolean {
    const finishes = ['BR', 'NR', 'PL'];
    return finishes.includes(part.toUpperCase());
  }

  private isNumeric(part: string): boolean {
    return /^\d+$/.test(part) || /^\d+\.\d+$/.test(part);
  }
}

export default ImageUrlParser;
