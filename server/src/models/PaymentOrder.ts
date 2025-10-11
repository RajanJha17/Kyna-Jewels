import mongoose, { Document, Schema } from "mongoose";

/**
 * Order Status Enum
 */
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

/**
 * Payment Response Interface - Updated for Razorpay
 */
export interface IPaymentResponse {
  // Razorpay specific fields
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;

  // Common payment fields
  orderId?: string;
  amount?: string;
  currency?: string;
  status?: string;
  method?: string;

  // Payment details
  description?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, any>;

  // Error fields
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;

  // Metadata
  created_at?: number;
  captured?: boolean;
  international?: boolean;
  refund_status?: string;

  // Legacy fields for backward compatibility
  trackingId?: string;
  bankRefNo?: string;
  orderStatus?: string;
  failureMessage?: string;
  paymentMode?: string;
  cardName?: string;
  statusCode?: string;
  statusMessage?: string;
  responseCode?: string;
  transDate?: string;
}

/**
 * Order Interface
 */
export interface IOrder extends Document {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentResponse?: IPaymentResponse;
  // Optional images uploaded (Cloudinary etc.)
  images?: Array<{
    url: string;
    publicId?: string;
    uploadedAt?: Date;
    source?: string;
    alt?: string;
  }>;

  // Razorpay specific fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  billingInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
  };
  redirectUrl: string;
  cancelUrl: string;
  createdAt: Date;
  updatedAt: Date;
  updateStatus(
    newStatus: OrderStatus,
    paymentResponse?: IPaymentResponse
  ): Promise<IOrder>;
  isSuccessful(): boolean;
  isFailed(): boolean;
}

/**
 * Order Model Interface
 */
export interface IOrderModel extends mongoose.Model<IOrder> {
  findByOrderId(orderId: string): Promise<IOrder | null>;
  findByUserId(userId: string, limit?: number): Promise<IOrder[]>;
  findByStatus(status: OrderStatus, limit?: number): Promise<IOrder[]>;
}

/**
 * Billing Info Schema
 */
const billingInfoSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false }
);

/**
 * Payment Response Schema
 */
const paymentResponseSchema = new Schema(
  {
    // Razorpay specific fields
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },

    // Common payment fields
    orderId: { type: String },
    amount: { type: String },
    currency: { type: String },
    status: { type: String },
    method: { type: String },

    // Payment details
    description: { type: String },
    email: { type: String },
    contact: { type: String },
    notes: { type: Schema.Types.Mixed },

    // Error fields
    error_code: { type: String },
    error_description: { type: String },
    error_source: { type: String },
    error_step: { type: String },
    error_reason: { type: String },

    // Metadata
    created_at: { type: Number },
    captured: { type: Boolean },
    international: { type: Boolean },
    refund_status: { type: String },

    // Legacy CCAvenue fields for backward compatibility
    trackingId: { type: String },
    bankRefNo: { type: String },
    orderStatus: { type: String },
    failureMessage: { type: String },
    paymentMode: { type: String },
    cardName: { type: String },
    statusCode: { type: String },
    statusMessage: { type: String },
    responseCode: { type: String },
    transDate: { type: String },
  },
  { _id: false }
);

/**
 * Order Schema
 */
const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    paymentResponse: {
      type: paymentResponseSchema,
      default: null,
    },

    // Razorpay specific fields
    razorpayOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },

    billingInfo: {
      type: billingInfoSchema,
      required: true,
    },
    redirectUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cancelUrl: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional images uploaded (Cloudinary or other services)
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        uploadedAt: { type: Date },
        source: { type: String },
        alt: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// Indexes for better query performance
orderSchema.index({ orderId: 1, userId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "billingInfo.email": 1 });

// Pre-save middleware to generate orderId if not provided
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = `ORD_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

// Instance methods
orderSchema.methods.updateStatus = function (
  newStatus: OrderStatus,
  paymentResponse?: IPaymentResponse
) {
  this.status = newStatus;
  if (paymentResponse) {
    this.paymentResponse = paymentResponse;
  }
  return this.save();
};

orderSchema.methods.isSuccessful = function (): boolean {
  return this.status === OrderStatus.SUCCESS;
};

orderSchema.methods.isFailed = function (): boolean {
  return this.status === OrderStatus.FAILED;
};

// Static methods
orderSchema.statics.findByOrderId = function (orderId: string) {
  return this.findOne({ orderId });
};

orderSchema.statics.findByUserId = function (
  userId: string,
  limit: number = 10
) {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

orderSchema.statics.findByStatus = function (
  status: OrderStatus,
  limit: number = 10
) {
  return this.find({ status }).sort({ createdAt: -1 }).limit(limit);
};

const PaymentOrder = mongoose.model<IOrder, IOrderModel>(
  "PaymentOrder",
  orderSchema
);

export default PaymentOrder;
