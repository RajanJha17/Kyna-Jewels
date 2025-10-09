import { Request, Response } from "express";
import { encrypt } from "../utils/encryption";
import OrderModel from "../models/orderModel";

/**
 * Payment controller
 */
export class PaymentController {
  /**
   * Initiate payment for an order
   * POST /api/payment/initiate
   */
  static initiatePayment = async (req: Request, res: Response) => {
    try {
      const {
        orderId,
        amount,
        currency = "INR",
        billingInfo,
        redirectUrl,
        cancelUrl,
        userId,
        jewelryId, // Add jewelryId from request
      } = req.body;

      // Validate required fields
      if (!orderId || !amount || !billingInfo || !redirectUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: orderId, amount, billingInfo, and redirectUrl are required",
        });
      }

      // Generate a unique order number for the database
      const orderNumber = `KYNA${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      console.log("💳 Creating payment order:", {
        orderId,
        orderNumber,
        amount,
        userId,
        jewelryId,
      });

      // Create order in database
      const orderData = {
        orderNumber, // Use generated order number
        orderId, // Keep original orderId from frontend
        userId: userId || null,
        customerEmail: billingInfo.email,
        customerName: billingInfo.name,
        customerPhone: billingInfo.phone,
        totalAmount: parseFloat(amount),
        currency,
        status: "pending",
        paymentMethod: "ccavenue",
        billingAddress: {
          address: billingInfo.address,
          city: billingInfo.city,
          state: billingInfo.state,
          zipCode: billingInfo.zip,
          country: billingInfo.country,
        },
        jewelryId: jewelryId || null, // Link to jewelry order if provided
        redirectUrl,
        cancelUrl,
        createdAt: new Date(),
      };

      // Save order to database
      const order = new OrderModel(orderData);
      await order.save();

      console.log("✅ Order saved to database:", order.orderNumber);

      // Prepare CCAvenue payment data
      const ccavenueData = {
        merchant_id: process.env.CCAVENUE_MERCHANT_ID,
        order_id: orderNumber, // Use the database order number
        amount: amount,
        currency: currency,
        redirect_url: redirectUrl,
        cancel_url: cancelUrl || redirectUrl,
        language: "EN",
        billing_name: billingInfo.name,
        billing_address: billingInfo.address,
        billing_city: billingInfo.city,
        billing_state: billingInfo.state,
        billing_zip: billingInfo.zip,
        billing_country: billingInfo.country,
        billing_tel: billingInfo.phone,
        billing_email: billingInfo.email,
        merchant_param1: userId || "",
        merchant_param2: jewelryId || "",
        merchant_param3: orderId, // Store original orderId as reference
      };

      console.log("🔐 Encrypting payment data for CCAvenue");

      // Encrypt the data
      const encryptedData = encrypt(
        new URLSearchParams(ccavenueData).toString(),
        process.env.CCAVENUE_WORKING_KEY!
      );

      res.status(200).json({
        success: true,
        data: {
          encryptedData,
          accessCode: process.env.CCAVENUE_ACCESS_CODE,
          orderId: orderNumber, // Return the database order number
          paymentUrl:
            "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
        },
        message: "Payment initiated successfully",
      });
    } catch (error) {
      console.error("💥 Payment initiation error:", error);

      // Handle specific MongoDB errors
      if (error.code === 11000) {
        return res.status(500).json({
          success: false,
          message: "Order processing error. Please try again with a new order.",
          error: "Duplicate order detected",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to initiate payment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Other payment-related methods (e.g., success, cancel, webhook) can be added here
}
