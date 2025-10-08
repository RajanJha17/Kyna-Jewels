import mongoose, { Document, Schema } from 'mongoose';

/**
 * Image View Configuration Interface
 */
export interface IImageViewConfig extends Document {
  viewType: string;           // e.g., 'GP', 'SIDE', 'TOP', 'DETAIL'
  displayName: string;         // e.g., 'Ground View', 'Side View', 'Top View'
  description?: string;        // Optional description
  isMain: boolean;            // Whether this is the main view (GP is always main)
  isThumbnail: boolean;       // Whether this is a thumbnail view
  category: string;            // Category this view applies to (e.g., 'rings', 'bracelets', 'all')
  order: number;              // Display order
  isActive: boolean;          // Whether this view is currently active
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Image View Configuration Schema
 */
const imageViewConfigSchema = new Schema<IImageViewConfig>({
  viewType: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isMain: {
    type: Boolean,
    default: false
  },
  isThumbnail: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['rings', 'bracelets', 'pendants', 'earrings', 'all'],
    default: 'all'
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'imageViewConfigs'
});

// Indexes for better performance
imageViewConfigSchema.index({ category: 1, isActive: 1 });
imageViewConfigSchema.index({ order: 1 });
imageViewConfigSchema.index({ isMain: 1 });

const ImageViewConfig = mongoose.model<IImageViewConfig>('ImageViewConfig', imageViewConfigSchema);

export default ImageViewConfig;
