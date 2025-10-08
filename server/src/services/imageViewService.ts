import ImageViewConfig, { IImageViewConfig } from '../models/imageViewConfigModel';

/**
 * Service for managing dynamic image views
 */
export class ImageViewService {
  
  /**
   * Get all active views for a specific category
   */
  static async getViewsForCategory(category: string = 'all'): Promise<IImageViewConfig[]> {
    try {
      const views = await ImageViewConfig.find({
        $or: [{ category: category }, { category: 'all' }],
        isActive: true
      }).sort({ order: 1 });
      
      return views;
    } catch (error) {
      console.error('Error fetching views for category:', error);
      return [];
    }
  }

  /**
   * Get main view (GP)
   */
  static async getMainView(): Promise<IImageViewConfig | null> {
    try {
      const mainView = await ImageViewConfig.findOne({
        viewType: 'GP',
        isActive: true
      });
      
      return mainView;
    } catch (error) {
      console.error('Error fetching main view:', error);
      return null;
    }
  }

  /**
   * Get sub views (all except GP)
   */
  static async getSubViews(category: string = 'all'): Promise<IImageViewConfig[]> {
    try {
      const subViews = await ImageViewConfig.find({
        $or: [{ category: category }, { category: 'all' }],
        viewType: { $ne: 'GP' },
        isActive: true
      }).sort({ order: 1 });
      
      return subViews;
    } catch (error) {
      console.error('Error fetching sub views:', error);
      return [];
    }
  }

  /**
   * Get thumbnail views
   */
  static async getThumbnailViews(category: string = 'all'): Promise<IImageViewConfig[]> {
    try {
      const thumbnailViews = await ImageViewConfig.find({
        $or: [{ category: category }, { category: 'all' }],
        isThumbnail: true,
        isActive: true
      }).sort({ order: 1 });
      
      return thumbnailViews;
    } catch (error) {
      console.error('Error fetching thumbnail views:', error);
      return [];
    }
  }

  /**
   * Generate dynamic image URLs based on configured views
   */
  static async generateDynamicImageUrls(
    sku: string, 
    attributes: any, 
    category: string = 'all'
  ): Promise<{ main: string; sub: string[]; thumbnails: string[] }> {
    try {
      const baseUrl = process.env.IMAGE_BASE_URL || 'https://kynajewels.com/images/RENDERING%20PHOTOS';
      const categoryPath = this.getCategoryPath(sku);
      const attributeString = this.buildAttributeString(sku, attributes);
      const filename = `${sku}-${attributeString}`;

      // Get configured views
      const [mainView, subViews, thumbnailViews] = await Promise.all([
        this.getMainView(),
        this.getSubViews(category),
        this.getThumbnailViews(category)
      ]);

      // Generate main image URL (always GP)
      const main = `${baseUrl}/${categoryPath}/${filename}-GP.jpg`;

      // Generate sub view URLs
      const sub = subViews.map(view => 
        `${baseUrl}/${categoryPath}/${filename}-${view.viewType}.jpg`
      );

      // Generate thumbnail URLs
      const thumbnails = thumbnailViews.map(view => 
        `${baseUrl}/${categoryPath}/${filename}-${view.viewType}.jpg`
      );

      return { main, sub, thumbnails };
    } catch (error) {
      console.error('Error generating dynamic image URLs:', error);
      // Fallback to default views if error occurs
      return this.getDefaultImageUrls(sku, attributes);
    }
  }

  /**
   * Get default image URLs (fallback)
   */
  private static getDefaultImageUrls(sku: string, attributes: any): { main: string; sub: string[]; thumbnails: string[] } {
    const baseUrl = process.env.IMAGE_BASE_URL || 'https://kynajewels.com/images/RENDERING%20PHOTOS';
    const categoryPath = this.getCategoryPath(sku);
    const attributeString = this.buildAttributeString(sku, attributes);
    const filename = `${sku}-${attributeString}`;

    return {
      main: `${baseUrl}/${categoryPath}/${filename}-GP.jpg`,
      sub: [
        `${baseUrl}/${categoryPath}/${filename}-45.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-BV.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-EV.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-FV.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-TV.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-NBV.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-SV.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-360.glb`
      ],
      thumbnails: []
    };
  }

  /**
   * Extract category path from SKU
   */
  private static getCategoryPath(sku: string): string {
    const skuPrefix = sku.substring(0, 2).toUpperCase();
    
    switch (skuPrefix) {
      case 'GR': return this.getGentsRingSubfolder(sku);
      case 'ENG': return this.getEngagementRingSubfolder(sku);
      case 'SR': return this.getSolitaireRingSubfolder(sku);
      case 'BR': return 'BRACELETS/ALL BRACELETS';
      case 'PN': return 'PENDANTS';
      case 'ER': return this.getEarringSubfolder(sku);
      case 'FR': return this.getFashionRingSubfolder(sku);
      default: return 'GENTS RINGS/GR1-10';
    }
  }

  /**
   * Get gents ring subfolder based on SKU
   */
  private static getGentsRingSubfolder(sku: string): string {
    const match = sku.match(/GR(\d+)/);
    if (!match) return 'GENTS RINGS/GR1-10';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 10) return 'GENTS RINGS/GR1-10';
    if (num >= 11 && num <= 20) return 'GENTS RINGS/GR11-20';
    if (num >= 21 && num <= 30) return 'GENTS RINGS/GR21-30';
    if (num >= 31 && num <= 40) return 'GENTS RINGS/GR31-40';
    if (num >= 41 && num <= 50) return 'GENTS RINGS/GR41-50';
    if (num >= 51 && num <= 60) return 'GENTS RINGS/GR51-60';
    if (num >= 61 && num <= 70) return 'GENTS RINGS/GR61-70';
    if (num >= 71 && num <= 80) return 'GENTS RINGS/GR71-80';
    if (num >= 81 && num <= 90) return 'GENTS RINGS/GR81-90';
    if (num >= 91 && num <= 100) return 'GENTS RINGS/GR91-100';
    return 'GENTS RINGS/GR1-10'; // Fallback
  }

  /**
   * Get engagement ring subfolder based on SKU
   */
  private static getEngagementRingSubfolder(sku: string): string {
    const match = sku.match(/ENG(\d+)/);
    if (!match) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 10) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10';
    if (num >= 11 && num <= 20) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG11-20';
    if (num >= 21 && num <= 30) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG21-30';
    if (num >= 31 && num <= 40) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG31-40';
    if (num >= 41 && num <= 50) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG41-50';
    if (num >= 51 && num <= 60) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG51-60';
    if (num >= 61 && num <= 70) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG61-70';
    if (num >= 71 && num <= 80) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG71-80';
    if (num >= 81 && num <= 90) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG81-90';
    if (num >= 91 && num <= 100) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG91-100';
    return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10'; // Fallback
  }

  /**
   * Get solitaire ring subfolder based on SKU
   */
  private static getSolitaireRingSubfolder(sku: string): string {
    const match = sku.match(/SR(\d+)/);
    if (!match) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 10) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10';
    if (num >= 11 && num <= 20) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR11-20';
    if (num >= 21 && num <= 30) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR21-30';
    if (num >= 31 && num <= 40) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR31-40';
    if (num >= 41 && num <= 50) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR41-50';
    return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10'; // Fallback
  }

  /**
   * Get earring subfolder based on SKU
   */
  private static getEarringSubfolder(sku: string): string {
    const match = sku.match(/ER(\d+)/);
    if (!match) return 'EARINGS/ER1-50';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 50) return 'EARINGS/ER1-50';
    if (num >= 51 && num <= 100) return 'EARINGS/ER51-100';
    if (num >= 101 && num <= 150) return 'EARINGS/ER101-150';
    if (num >= 151 && num <= 200) return 'EARINGS/ER151-200';
    if (num >= 201 && num <= 250) return 'EARINGS/ER201-250';
    if (num >= 251 && num <= 300) return 'EARINGS/ER251-300';
    return 'EARINGS/ER1-50'; // Fallback
  }

  /**
   * Get fashion ring subfolder based on SKU
   */
  private static getFashionRingSubfolder(sku: string): string {
    const match = sku.match(/FR(\d+)/);
    if (!match) return 'FASHION RINGS/FR1-50';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 50) return 'FASHION RINGS/FR1-50';
    if (num >= 51 && num <= 100) return 'FASHION RINGS/FR51-100';
    if (num >= 101 && num <= 150) return 'FASHION RINGS/FR101-150';
    if (num >= 151 && num <= 200) return 'FASHION RINGS/FR151-200';
    if (num >= 201 && num <= 250) return 'FASHION RINGS/FR201-250';
    if (num >= 251 && num <= 300) return 'FASHION RINGS/FR251-300';
    return 'FASHION RINGS/FR1-50'; // Fallback
  }

  /**
   * Build attribute string from product attributes
   */
  private static buildAttributeString(sku: string, attributes: any): string {
    const parts: string[] = [];
    
    if (attributes.diamondShape) parts.push(attributes.diamondShape);
    if (attributes.diamondSize) parts.push(attributes.diamondSize.toString());
    if (attributes.diamondColor) parts.push(attributes.diamondColor);
    if (attributes.metal) parts.push(attributes.metal);
    if (attributes.karat) parts.push(`${attributes.karat}KT`);
    if (attributes.tone) parts.push(attributes.tone);
    if (attributes.finish) parts.push(attributes.finish);
    
    return parts.join('-');
  }

  /**
   * Initialize default views in database
   */
  static async initializeDefaultViews(): Promise<void> {
    try {
      const defaultViews = [
        { viewType: 'GP', displayName: 'Ground Pose', isMain: true, isThumbnail: false, category: 'all', order: 1 },
        { viewType: '45', displayName: '45° Angle View', isMain: false, isThumbnail: false, category: 'all', order: 2 },
        { viewType: 'BV', displayName: 'Builder View', isMain: false, isThumbnail: false, category: 'all', order: 3 },
        { viewType: 'EV', displayName: 'Engraving View', isMain: false, isThumbnail: false, category: 'all', order: 4 },
        { viewType: 'FV', displayName: 'Front View', isMain: false, isThumbnail: false, category: 'all', order: 5 },
        { viewType: 'TV', displayName: 'Top View', isMain: false, isThumbnail: false, category: 'all', order: 6 },
        { viewType: 'NBV', displayName: 'New Builder View', isMain: false, isThumbnail: false, category: 'all', order: 7 },
        { viewType: 'SV', displayName: 'Side View', isMain: false, isThumbnail: false, category: 'all', order: 8 },
        { viewType: '360', displayName: '3D View (.glb)', isMain: false, isThumbnail: false, category: 'all', order: 9 }
      ];

      for (const viewData of defaultViews) {
        await ImageViewConfig.findOneAndUpdate(
          { viewType: viewData.viewType },
          viewData,
          { upsert: true, new: true }
        );
      }

      console.log('✅ Default image views initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing default views:', error);
    }
  }

  /**
   * Add new view type
   */
  static async addView(viewData: {
    viewType: string;
    displayName: string;
    description?: string;
    category: string;
    order: number;
    isThumbnail?: boolean;
  }): Promise<IImageViewConfig> {
    try {
      const newView = new ImageViewConfig({
        ...viewData,
        isMain: viewData.viewType === 'GP', // GP is always main
        isActive: true
      });

      return await newView.save();
    } catch (error) {
      console.error('Error adding new view:', error);
      throw error;
    }
  }

  /**
   * Update view configuration
   */
  static async updateView(viewType: string, updateData: Partial<IImageViewConfig>): Promise<IImageViewConfig | null> {
    try {
      // Ensure GP remains main view
      if (viewType === 'GP') {
        updateData.isMain = true;
      }

      return await ImageViewConfig.findOneAndUpdate(
        { viewType },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating view:', error);
      throw error;
    }
  }

  /**
   * Delete view (soft delete by setting isActive to false)
   */
  static async deleteView(viewType: string): Promise<boolean> {
    try {
      // Prevent deletion of GP view
      if (viewType === 'GP') {
        throw new Error('Cannot delete GP view as it is the main view');
      }

      const result = await ImageViewConfig.findOneAndUpdate(
        { viewType },
        { isActive: false },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error deleting view:', error);
      throw error;
    }
  }
}
