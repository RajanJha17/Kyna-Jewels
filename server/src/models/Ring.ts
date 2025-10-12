import mongoose, { Document, Schema } from 'mongoose';

/**
 * Ring Status Enum
 */
export enum RingStatus {
  UPLOADED = 'uploaded',
  CUSTOMIZED = 'customized',
  PAYMENT_PENDING = 'payment_pending',
  COMPLETED = 'completed'
}

/**
 * Image Interface
 */
export interface IImage {
  url: string;
  publicId: string;
  userId: string;
  uploadedAt: Date;
  source?: 'upload' | 'url'; // Track if image was uploaded or provided as URL
}

/**
 * Customization Interface
 */
export interface ICustomization {
  sameAsImage?: boolean;
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
  priority?: string;
  estimatedDelivery?: string;
  specialInstructions?: string;
}

/**
 * Jewelry Types Enum
 */
export enum JewelryType {
  RING = 'ring',
  NECKLACE = 'necklace',
  BRACELET = 'bracelet',
  EARRINGS = 'earrings',
  PENDANT = 'pendant',
  CUSTOM = 'custom'
}

/**
 * Ring Interface (now supports all jewelry types)
 */
export interface IRing extends Document {
  userId: string;
  images: IImage[];
  jewelryType?: JewelryType;
  sameAsImage: boolean;
  customization?: ICustomization;
  status: RingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ring Schema
 */
const imageSchema = new Schema<IImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  userId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['upload', 'url'], default: 'upload' }
}, { _id: false });

const customizationSchema = new Schema<ICustomization>({
  sameAsImage: {
    type: Boolean,
    default: false
  },
  metal: {
    type: String,
    enum: ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold']
  },
  metalColor: {
    type: String,
    default: 'Same as Image'
  },
  goldKarat: {
    type: String,
    enum: ['10KT', '14KT', '18KT', '22KT']
  },
  diamondShape: {
    type: String,
    enum: ['Round', 'Oval', 'Cushion', 'Pear', 'Princess', 'Emerald', 'Radiant', 'Heart', 'Marquise']
  },
  diamondSize: {
    type: String,
    default: 'Center Stone'
  },
  diamondColor: {
    type: String,
    default: 'Center Stone'
  },
  diamondClarity: {
    type: String,
    default: 'Center Stone'
  },
  ringSize: {
    type: String
  },
  engraving: {
    type: String,
    maxlength: 15
  },
  modificationRequest: {
    type: String,
    minlength: 15
  },
  description: {
    type: String,
    maxlength: 500
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  estimatedDelivery: {
    type: String
  },
  specialInstructions: {
    type: String,
    maxlength: 1000
  }
}, { _id: false });

const ringSchema = new Schema<IRing>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  images: [imageSchema],
  jewelryType: {
    type: String,
    enum: Object.values(JewelryType),
    default: JewelryType.CUSTOM,
    index: true
  },
  sameAsImage: {
    type: Boolean,
    default: false
  },
  customization: customizationSchema,
  status: {
    type: String,
    enum: Object.values(RingStatus),
    default: RingStatus.UPLOADED,
    index: true
  }
}, {
  timestamps: true,
  collection: 'rings'
});

// Indexes for better query performance
ringSchema.index({ userId: 1, createdAt: -1 });
ringSchema.index({ status: 1 });
ringSchema.index({ jewelryType: 1 });
ringSchema.index({ userId: 1, jewelryType: 1 });

const Ring = mongoose.model<IRing>('Ring', ringSchema);

export default Ring;
