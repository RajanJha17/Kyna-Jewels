import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

// Order interface
export interface IOrder extends Document {
  user: Schema.Types.ObjectId | IUser;
    orderNumber: string;  // ✅ Added
     estimatedDeliveryDate?: Date; // ✅ Added
  orderType: 'normal' | 'customized'; // ✅ Order type for cancellation policy
  statusHistory?: {
    status: string;
    date: Date;
    note?: string;
  }[]; // ✅ Added

  items: {
    product: Schema.Types.ObjectId;
    productModel: 'Pendant' | 'Earring' | 'Bracelet' | 'Ring';
    quantity: number;
    price: number;
    total: number;
  }[];
  shippingAddress: {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  gst: number;
  shippingCharge: number;
  totalAmount: number;
  trackingNumber?: string;
  courierService?: string;
  trackingOrder?: Schema.Types.ObjectId; // Reference to TrackingOrder model
  trackingInfo?: {
    docketNumber?: string;
    status?: string;
    lastUpdated?: Date;
    estimatedDelivery?: string;
    hasTracking?: boolean;
    error?: string;
    trackingHistory?: any[];
    events?: Array<{
      status: string;
      timestamp: Date;
      location?: string;
      note?: string;
    }>;
  };
  orderedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  returnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  // Link to the customer placing the order
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true }, // ✅ Added
    estimatedDeliveryDate: { type: Date }, // ✅ Added
  orderType: { 
    type: String, 
    enum: ['normal', 'customized'],
    default: 'normal',
    required: true
  }, // ✅ Order type for cancellation policy
  statusHistory: [{
    status: { type: String, required: true },
    date: { type: Date, required: true },
    note: { type: String }
  }],


  // Ordered items
  items: [{
    product: { type: Schema.Types.ObjectId, refPath: 'items.productModel', required: true },
    productModel: { type: String, required: true, enum: ['Pendant', 'Earring', 'Bracelet', 'Ring'] },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // price at purchase time
    total: { type: Number, required: true }
  }],

  // Shipping details
  shippingAddress: {
    label: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },

  // Payment info
  paymentMethod: { type: String, enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },

  // Order status
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], 
    default: 'pending' 
  },
  
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  gst: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Tracking info
  trackingNumber: { type: String },
  courierService: { type: String },
  trackingOrder: { type: Schema.Types.ObjectId, ref: 'TrackingOrder' }, // ✅ Reference to TrackingOrder
  trackingInfo: {
    docketNumber: { type: String },
    status: { type: String },
    lastUpdated: { type: Date },
    estimatedDelivery: { type: String },
    hasTracking: { type: Boolean },
    error: { type: String },
    trackingHistory: [{ type: Schema.Types.Mixed }],
    events: [{
      status: { type: String },
      timestamp: { type: Date },
      location: { type: String },
      note: { type: String }
    }]
  },

  // Important dates
  orderedAt: { type: Date, default: Date.now },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  returnedAt: { type: Date }

}, {
  timestamps: true
});

// Index for faster queries by user and order date
orderSchema.index({ user: 1, orderedAt: -1 });

const OrderModel = mongoose.model<IOrder>('Order', orderSchema);

export { OrderModel };
export default OrderModel;
