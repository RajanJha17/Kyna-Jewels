import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Razorpay Payment Gateway Utility Functions
 * Handles order creation, payment verification, and webhook validation
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  billingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  userId: string;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Get Razorpay configuration from environment variables
 */
export const getRazorpayConfig = (): RazorpayConfig => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay configuration missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables."
    );
  }

  return {
    keyId,
    keySecret,
    webhookSecret: webhookSecret || "",
  };
};

/**
 * Create Razorpay instance
 */
export const createRazorpayInstance = (): Razorpay => {
  const config = getRazorpayConfig();

  return new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
};

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (
  paymentRequest: PaymentRequest
): Promise<RazorpayOrderResponse> => {
  try {
    const razorpay = createRazorpayInstance();

    const orderOptions = {
      amount: paymentRequest.amount, // Amount in paise
      currency: paymentRequest.currency,
      receipt: paymentRequest.orderId,
      notes: {
        userId: paymentRequest.userId,
        orderId: paymentRequest.orderId,
        customerName: paymentRequest.billingInfo.name,
        customerEmail: paymentRequest.billingInfo.email,
        customerPhone: paymentRequest.billingInfo.phone,
      },
    };

    const order = await razorpay.orders.create(orderOptions);
    return order as RazorpayOrderResponse;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new Error("Failed to create Razorpay order");
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
  verificationData: PaymentVerificationData
): boolean => {
  try {
    const config = getRazorpayConfig();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verificationData;

    // Create the verification string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", config.keySecret)
      .update(body.toString())
      .digest("hex");

    // Compare signatures
    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error("Payment signature verification error:", error);
    return false;
  }
};

/**
 * Verify Razorpay webhook signature
 */
export const verifyWebhookSignature = (
  webhookBody: string,
  webhookSignature: string
): boolean => {
  try {
    const config = getRazorpayConfig();

    if (!config.webhookSecret) {
      console.warn(
        "Webhook secret not configured. Skipping signature verification."
      );
      return true; // Allow webhook processing without signature verification if not configured
    }

    const expectedSignature = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(webhookBody, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(webhookSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
};

/**
 * Get payment details from Razorpay
 */
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const razorpay = createRazorpayInstance();
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    console.error("Get payment details error:", error);
    throw new Error("Failed to fetch payment details");
  }
};

/**
 * Get order details from Razorpay
 */
export const getOrderDetails = async (orderId: string) => {
  try {
    const razorpay = createRazorpayInstance();
    return await razorpay.orders.fetch(orderId);
  } catch (error) {
    console.error("Get order details error:", error);
    throw new Error("Failed to fetch order details");
  }
};

/**
 * Process refund for a payment
 */
export const processRefund = async (
  paymentId: string,
  amount?: number,
  notes?: Record<string, any>
) => {
  try {
    const razorpay = createRazorpayInstance();

    const refundOptions: any = {
      payment_id: paymentId,
      notes: notes || {},
    };

    if (amount) {
      refundOptions.amount = amount; // Amount in paise
    }

    return await razorpay.payments.refund(paymentId, refundOptions);
  } catch (error) {
    console.error("Refund processing error:", error);
    throw new Error("Failed to process refund");
  }
};

export default {
  getRazorpayConfig,
  createRazorpayInstance,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentDetails,
  getOrderDetails,
  processRefund,
};
