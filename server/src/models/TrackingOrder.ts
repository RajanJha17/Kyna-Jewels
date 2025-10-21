import mongoose, { Document, Schema } from 'mongoose';
import { TrackingOrder as ITrackingOrder, OrderStatus, OrderItem, Address, TrackingEvent } from '../types/tracking';

const TrackingEventSchema = new Schema<TrackingEvent>({
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    required: true 
  },
  description: { type: String, required: true },
  location: { type: String },
  timestamp: { type: Date, required: true, default: Date.now },
  code: { type: String, required: true }
}, { _id: false });

const TrackingOrderSchema = new Schema<TrackingOrderDocument>({
  // Core References - Links to other models
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  order: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order',
    required: true,
    index: true
  },
  
  // Tracking-Specific Fields ONLY
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.ORDER_PLACED,
    index: true
  },
  docketNumber: { 
    type: String, 
    sparse: true,
    index: true,
    trim: true
  },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  podLink: { 
    type: String,
    trim: true
  },
  trackingHistory: [TrackingEventSchema]
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
TrackingOrderSchema.index({ userId: 1, createdAt: -1 }); // Primary index for fetching user's orders
TrackingOrderSchema.index({ order: 1 }); // Index for querying by order reference
TrackingOrderSchema.index({ status: 1, createdAt: -1 }); // Index for filtering by status
TrackingOrderSchema.index({ docketNumber: 1 }); // Index for courier tracking queries

// Virtual for progress calculation
TrackingOrderSchema.virtual('progress').get(function() {
  const statusProgressMap: Record<OrderStatus, number> = {
    [OrderStatus.ORDER_PLACED]: 20,
    [OrderStatus.PROCESSING]: 40,
    [OrderStatus.PACKAGING]: 60,
    [OrderStatus.IN_TRANSIT]: 70,
    [OrderStatus.ON_THE_ROAD]: 80,
    [OrderStatus.DELIVERED]: 100,
    [OrderStatus.CANCELLED]: 0
  };
  
  return statusProgressMap[this.status] || 0;
});

// Methods
TrackingOrderSchema.methods.addTrackingEvent = function(
  status: OrderStatus, 
  description: string, 
  location?: string, 
  code?: string
): void {
  this.trackingHistory.push({
    status,
    description,
    location,
    timestamp: new Date(),
    code: code || status
  });
  
  this.status = status;
  this.updatedAt = new Date();
};

TrackingOrderSchema.methods.updateFromSequelTracking = function(sequelData: any): void {
  if (sequelData.docket_no) {
    this.docketNumber = sequelData.docket_no;
  }
  
  if (sequelData.estimated_delivery) {
    this.estimatedDelivery = new Date(sequelData.estimated_delivery);
  }
  
  // Update tracking history from Sequel data
  if (sequelData.tracking && Array.isArray(sequelData.tracking)) {
    sequelData.tracking.forEach((event: any) => {
      this.addTrackingEvent(
        this.mapSequelStatus(event.code),
        event.description,
        event.location,
        event.code
      );
    });
  }
};

TrackingOrderSchema.methods.mapSequelStatus = function(sequelCode: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'SCREATED': OrderStatus.ORDER_PLACED,
    'SCHECKIN': OrderStatus.PROCESSING,
    'SPU': OrderStatus.PACKAGING,
    'SLINORIN': OrderStatus.ON_THE_ROAD,
    'SLINDEST': OrderStatus.ON_THE_ROAD,
    'SDELASN': OrderStatus.ON_THE_ROAD,
    'SDELVD': OrderStatus.DELIVERED,
    'SCANCELLED': OrderStatus.CANCELLED
  };
  
  return statusMap[sequelCode] || OrderStatus.ORDER_PLACED;
};

// Static methods
TrackingOrderSchema.statics.findByOrderNumberAndEmail = async function(orderNumber: string, email: string) {
  // Since orderNumber and customerEmail are now in the Order model,
  // we need to first find the order, then find the tracking order
  const OrderModel = require('./orderModel').default;
  const UserModel = require('./userModel').default;
  
  // Find user by email
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  
  // Find order by orderNumber and user
  const order = await OrderModel.findOne({ 
    orderNumber: orderNumber.toUpperCase(),
    user: user._id
  });
  if (!order) return null;
  
  // Find tracking order by order reference
  return this.findOne({ order: order._id }).populate('order');
};

TrackingOrderSchema.statics.findByDocketNumber = function(docketNumber: string) {
  return this.findOne({ docketNumber });
};

TrackingOrderSchema.statics.findByCustomerEmail = function(email: string, limit: number = 10) {
  return this.find({ customerEmail: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Add static methods to the interface
export interface TrackingOrderModel extends mongoose.Model<TrackingOrderDocument> {
  findByOrderNumberAndEmail(orderNumber: string, email: string): Promise<TrackingOrderDocument | null>;
  findByDocketNumber(docketNumber: string): Promise<TrackingOrderDocument | null>;
  findByCustomerEmail(email: string, limit?: number): Promise<TrackingOrderDocument[]>;
}

// Add instance methods to the interface
export interface TrackingOrderDocument extends Omit<ITrackingOrder, '_id'>, Document {
  addTrackingEvent(status: OrderStatus, description: string, location?: string, code?: string): void;
  updateFromSequelTracking(sequelData: any): void;
  mapSequelStatus(sequelCode: string): OrderStatus;
}

// Pre-save middleware
TrackingOrderSchema.pre('save', function(next) {
  // No pre-save transformations needed since we removed orderNumber and customerEmail
  // These fields are now in the Order model
  next();
});

export const TrackingOrder = mongoose.model<TrackingOrderDocument, TrackingOrderModel>('TrackingOrder', TrackingOrderSchema);
