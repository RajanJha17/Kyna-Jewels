import express, { Request, Response } from "express";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentDetails,
  getRazorpayConfig,
  PaymentRequest as RazorpayPaymentRequest,
} from "../utils/razorpay";
import PaymentOrder, {
  OrderStatus,
  IPaymentResponse,
} from "../models/PaymentOrder";

const router = express.Router();

/**
 * POST /api/payment/initiate
 * Initiates payment with Razorpay
 */
router.post("/initiate", async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      amount,
      currency = "INR",
      billingInfo,
      redirectUrl,
      cancelUrl,
      userId,
      images,
    } = req.body;

    // Debug: Log received images
    console.log("🔍 Payment initiate - received images:", images);
    console.log(
      "🔍 Payment initiate - images type:",
      typeof images,
      "Array?",
      Array.isArray(images)
    );

    // Validate required fields
    if (
      !orderId ||
      !amount ||
      !billingInfo ||
      !redirectUrl ||
      !cancelUrl ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: [
          "orderId",
          "amount",
          "billingInfo",
          "redirectUrl",
          "cancelUrl",
          "userId",
        ],
      });
    }

    // Validate billing info
    const requiredBillingFields = [
      "name",
      "address",
      "city",
      "state",
      "zip",
      "country",
      "phone",
      "email",
    ];
    const missingBillingFields = requiredBillingFields.filter(
      (field) => !billingInfo[field]
    );

    if (missingBillingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required billing fields",
        missing: missingBillingFields,
      });
    }

    // Check if order already exists
    const existingOrder = await PaymentOrder.findByOrderId(orderId);
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        error: "Order ID already exists",
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    // Prepare Razorpay payment request
    const paymentRequest: RazorpayPaymentRequest = {
      orderId,
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      billingInfo,
      userId,
    };

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(paymentRequest);

    // Create order in database
    const order = new PaymentOrder({
      orderId,
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      status: OrderStatus.PENDING,
      billingInfo,
      redirectUrl,
      cancelUrl,
      razorpayOrderId: razorpayOrder.id,
      images: Array.isArray(images) ? images : undefined,
      // Mirror orderId into orderNumber for tracking and uniqueness
      orderNumber: orderId,
    });

    console.log("💾 About to save PaymentOrder with images:", order.images);
    await order.save();
    console.log("✅ PaymentOrder saved successfully with ID:", order._id);

    // Get Razorpay configuration for frontend
    const config = getRazorpayConfig();

    // Return response to frontend
    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: config.keyId,
        orderId,
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        name: "Kyna Jewels",
        description: "Payment for jewelry order",
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: billingInfo.phone,
        },
        theme: {
          color: "#328F94",
        },
        notes: {
          orderId,
          userId,
        },
      },
      message: "Payment initiated successfully",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate payment",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      images,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required payment verification fields",
        required: [
          "razorpay_order_id",
          "razorpay_payment_id",
          "razorpay_signature",
        ],
      });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    // Find the order by Razorpay order ID or orderId
    let order;
    if (orderId) {
      order = await PaymentOrder.findByOrderId(orderId);
    } else {
      order = await PaymentOrder.findOne({
        razorpayOrderId: razorpay_order_id,
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    // Determine payment status
    let newStatus: OrderStatus;
    if (paymentDetails.status === "captured") {
      newStatus = OrderStatus.SUCCESS;
    } else if (paymentDetails.status === "failed") {
      newStatus = OrderStatus.FAILED;
    } else {
      newStatus = OrderStatus.PROCESSING;
    }

    // Prepare payment response
    const paymentResponse: IPaymentResponse = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId: order.orderId,
      amount: (Number(paymentDetails.amount) / 100).toString(), // Convert from paise to rupees
      currency: paymentDetails.currency,
      status: paymentDetails.status,
      method: paymentDetails.method,
      email: paymentDetails.email,
      contact: paymentDetails.contact?.toString(),
      notes: paymentDetails.notes,
      created_at: paymentDetails.created_at,
      captured: paymentDetails.captured,
      international: paymentDetails.international,
      refund_status: paymentDetails.refund_status,
    };

    // Update order with payment response
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    // If images were sent in the verification request, persist them as well
    if (images && Array.isArray(images) && images.length > 0) {
      // Merge or overwrite; here we overwrite with provided images
      order.images = images;
    }
    await order.updateStatus(newStatus, paymentResponse);

    // Return success response
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentId: razorpay_payment_id,
        paymentResponse: order.paymentResponse,
      },
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/payment/webhook
 * Handles Razorpay webhooks
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookBody = JSON.stringify(req.body);

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        error: "Missing webhook signature",
      });
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(
      webhookBody,
      webhookSignature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: "Invalid webhook signature",
      });
    }

    const { event, payload } = req.body;

    // Handle different webhook events
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;

      case "order.paid":
        await handleOrderPaid(payload.order.entity);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    // Acknowledge webhook
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process webhook",
    });
  }
});

/**
 * Handle payment captured webhook
 */
async function handlePaymentCaptured(payment: any) {
  try {
    const order = await PaymentOrder.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (order && order.status === OrderStatus.PROCESSING) {
      await order.updateStatus(OrderStatus.SUCCESS, {
        razorpay_payment_id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: (Number(payment.amount) / 100).toString(),
        currency: payment.currency,
        captured: payment.captured,
        created_at: payment.created_at,
      });
    }
  } catch (error) {
    console.error("Handle payment captured error:", error);
  }
}

/**
 * Handle payment failed webhook
 */
async function handlePaymentFailed(payment: any) {
  try {
    const order = await PaymentOrder.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (order) {
      await order.updateStatus(OrderStatus.FAILED, {
        razorpay_payment_id: payment.id,
        status: payment.status,
        method: payment.method,
        error_code: payment.error_code,
        error_description: payment.error_description,
        error_source: payment.error_source,
        error_step: payment.error_step,
        error_reason: payment.error_reason,
      });
    }
  } catch (error) {
    console.error("Handle payment failed error:", error);
  }
}

/**
 * Handle order paid webhook
 */
async function handleOrderPaid(orderData: any) {
  try {
    const order = await PaymentOrder.findOne({
      razorpayOrderId: orderData.id,
    });

    if (order && order.status !== OrderStatus.SUCCESS) {
      await order.updateStatus(OrderStatus.SUCCESS, {
        razorpay_order_id: orderData.id,
        status: "paid",
        amount: (Number(orderData.amount) / 100).toString(),
        currency: orderData.currency,
      });
    }
  } catch (error) {
    console.error("Handle order paid error:", error);
  }
}

/**
 * GET /api/payment/status/:orderId
 * Get payment status for an order
 */
router.get("/status/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await PaymentOrder.findByOrderId(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "PaymentOrder not found",
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        paymentResponse: order.paymentResponse,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get payment status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/payment/orders/:userId
 * Get all orders for a user
 */
router.get("/orders/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await PaymentOrder.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalPaymentOrders = await PaymentOrder.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalPaymentOrders / Number(limit)),
          totalPaymentOrders,
          hasNext: skip + orders.length < totalPaymentOrders,
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user orders",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
