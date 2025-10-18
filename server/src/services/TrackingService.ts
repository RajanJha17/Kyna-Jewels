import { TrackingOrder } from "../models/TrackingOrder";
import { Sequel247Service } from "./Sequel247Service";
import { OrderModel } from "../models/orderModel";
import { UserModel } from "../models/userModel";
import { NotificationService } from "./NotificationService";
import { WebhookService, WebhookConfig } from "./WebhookService";
import { AuditService, AuditContext } from "./AuditService";
import {
  TrackingRequest,
  TrackingResponse,
  OrderStatus,
  TrackingStep,
  AppError,
  NotFoundError,
} from "../types/tracking";
import {
  ORDER_STATUS_MAPPING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../constants/tracking";
import {
  validateOrderNumber,
  validateEmail,
  createValidationError,
  logError,
  logInfo,
} from "../utils/tracking";
import { DataValidator, validateAndSanitize } from "../utils/validation";
import {
  RetryService,
  createRetryService,
  RETRY_CONFIGS,
  RetryableOperation,
} from "./RetryService";

export class TrackingService {
  private sequelService: Sequel247Service;
  private notificationService: NotificationService;
  private webhookService?: WebhookService;
  private auditService: AuditService;
  private retryService: RetryService;

  constructor(sequelService: Sequel247Service, webhookConfig?: WebhookConfig) {
    this.sequelService = sequelService;
    this.notificationService = new NotificationService();
    this.auditService = new AuditService();
    this.retryService = createRetryService(RETRY_CONFIGS.SEQUEL247_API);

    if (webhookConfig) {
      this.webhookService = new WebhookService(webhookConfig);
    }
  }

  /**
   * Track an order by order number and userId
   */
  async trackOrder(request: {
    orderNumber: string;
    userId: string;
  }): Promise<any> {
    try {
      // Validate input
      if (!request.orderNumber || !request.userId) {
        throw createValidationError(
          "validation",
          "Order number and user ID are required"
        );
      }

      const { orderNumber, userId } = request;

      console.log(`🔍 Tracking order: ${orderNumber} for user: ${userId}`);

      // Try to find in TrackingOrder first
      let order = await this.findTrackingOrder(orderNumber, userId);

      // If not found in TrackingOrder, try to find in PaymentOrder and auto-create TrackingOrder
      if (!order) {
        console.log(`TrackingOrder not found, checking PaymentOrder...`);
        order = await this.findAndCreateTrackingFromPaymentOrder(
          orderNumber,
          userId
        );
      }

      if (!order) {
        console.log(`Order not found for ${orderNumber} and userId ${userId}`);
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      // Update tracking from Sequel247 if docket number exists
      if (order.docketNumber) {
        await this.updateTrackingFromSequel(order);
      }

      // Build tracking response
      const trackingResponse = this.buildTrackingResponse(order);

      logInfo(`Order ${orderNumber} tracked successfully`, "TrackingService");
      return trackingResponse;
    } catch (error) {
      logError(error as Error, "trackOrder");
      throw error;
    }
  }

  /**
   * Find TrackingOrder by orderNumber and userId
   */
  private async findTrackingOrder(
    orderNumber: string,
    userId: string
  ): Promise<any> {
    try {
      // Normalize the order number for consistent comparison
      const normalizedOrderNumber = orderNumber.toUpperCase();

      console.log(
        `🔍 Searching TrackingOrder with normalized orderNumber: ${normalizedOrderNumber}`
      );

      // Try multiple lookup strategies to find existing TrackingOrder
      let order = null;

      // 1) Exact match with normalized orderNumber
      order = await TrackingOrder.findOne({
        orderNumber: normalizedOrderNumber,
        $or: [
          { userId: userId },
          { customerUserId: userId },
          { "paymentResponse.notes.userId": userId },
        ],
      });

      if (order) {
        console.log(`✅ Found TrackingOrder by exact match: ${order._id}`);
        return order;
      }

      // 2) Case-insensitive regex match
      order = await TrackingOrder.findOne({
        orderNumber: { $regex: `^${normalizedOrderNumber}$`, $options: "i" },
        $or: [
          { userId: userId },
          { customerUserId: userId },
          { "paymentResponse.notes.userId": userId },
        ],
      });

      if (order) {
        console.log(
          `✅ Found TrackingOrder by case-insensitive match: ${order._id}`
        );
        return order;
      }

      // 3) Try finding by orderNumber alone (in case userId association is missing)
      order = await TrackingOrder.findOne({
        orderNumber: normalizedOrderNumber,
      });

      if (order) {
        console.log(
          `✅ Found TrackingOrder by orderNumber only: ${order._id}, checking userId compatibility`
        );

        // If found but userId doesn't match, check if we can update it
        if (!order.userId && !order.customerUserId) {
          console.log(
            `🔄 Updating TrackingOrder ${order._id} with userId: ${userId}`
          );
          order.userId = userId;
          await order.save();
        }
        return order;
      }

      // 4) Try finding any TrackingOrder with this exact orderNumber (for debugging)
      const anyOrder = await TrackingOrder.findOne({
        $or: [
          { orderNumber: normalizedOrderNumber },
          { orderNumber: { $regex: `^${orderNumber}$`, $options: "i" } },
        ],
      });

      if (anyOrder) {
        console.log(`⚠️ Found TrackingOrder but userId mismatch:`, {
          foundOrderId: anyOrder._id,
          foundOrderNumber: anyOrder.orderNumber,
          foundUserId: anyOrder.userId,
          requestedUserId: userId,
          foundCustomerEmail: anyOrder.customerEmail,
        });

        // Return it anyway if the orderNumber matches exactly
        if (anyOrder.orderNumber.toUpperCase() === normalizedOrderNumber) {
          return anyOrder;
        }
      }

      console.log(
        `❌ No TrackingOrder found for orderNumber: ${normalizedOrderNumber}, userId: ${userId}`
      );
      return null;
    } catch (error) {
      console.error("Error finding TrackingOrder:", error);
      return null;
    }
  }

  /**
   * Update order tracking from Sequel247
   */
  async updateTrackingFromSequel(order: any): Promise<void> {
    try {
      if (!order.docketNumber) {
        return;
      }

      logInfo(
        `Updating tracking for docket ${order.docketNumber}`,
        "TrackingService"
      );

      // Create retryable operation for Sequel247 API call
      const retryableOperation: RetryableOperation<any> = {
        operation: async () => {
          return await this.sequelService.trackShipment(order.docketNumber);
        },
        operationName: `trackShipment-${order.docketNumber}`,
        context: {
          orderNumber: order.orderNumber,
          docketNumber: order.docketNumber,
        },
      };

      const sequelResponse = await this.retryService.executeWithRetry(
        retryableOperation
      );

      if (sequelResponse.data) {
        order.updateFromSequelTracking(sequelResponse.data);
        await order.save();

        logInfo(
          `Tracking updated for order ${order.orderNumber}`,
          "TrackingService"
        );
      }
    } catch (error) {
      logError(error as Error, "updateTrackingFromSequel");
      // Don't throw error here as we still want to return cached data
    }
  }

  /**
   * Create a new order (for testing purposes)
   */
  async createOrder(orderData: Partial<any>): Promise<any> {
    try {
      const order = new TrackingOrder(orderData);
      await order.save();

      logInfo(`Order ${order.orderNumber} created`, "TrackingService");
      return order;
    } catch (error) {
      logError(error as Error, "createOrder");
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderNumber: string,
    status: OrderStatus,
    description?: string,
    location?: string
  ): Promise<any> {
    try {
      const order = await TrackingOrder.findOne({
        orderNumber: orderNumber.toUpperCase(),
      });

      if (!order) {
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      order.addTrackingEvent(
        status,
        description || ORDER_STATUS_MAPPING[status].description,
        location
      );

      await order.save();

      logInfo(
        `Order ${orderNumber} status updated to ${status}`,
        "TrackingService"
      );
      return order;
    } catch (error) {
      logError(error as Error, "updateOrderStatus");
      throw error;
    }
  }

  /**
   * Build tracking response with progress steps
   */
  private buildTrackingResponse(order: any): any {
    const orderObj = order.toObject();

    // Return data in the format expected by frontend
    return {
      orderNumber: orderObj.orderNumber,
      customerEmail: orderObj.customerEmail,
      status: orderObj.status,
      estimatedDelivery: orderObj.estimatedDelivery
        ? new Date(orderObj.estimatedDelivery).toISOString()
        : undefined,
      docketNumber: orderObj.docketNumber,
      shippingAddress: orderObj.shippingAddress,
      trackingHistory: orderObj.trackingHistory || [],
      items: orderObj.items || [],
      totalAmount: orderObj.totalAmount,
      updatedAt: orderObj.updatedAt
        ? new Date(orderObj.updatedAt).toISOString()
        : new Date().toISOString(),
    };
  }

  /**
   * Build tracking steps for UI display
   */
  private buildTrackingSteps(order: any): TrackingStep[] {
    const allSteps: OrderStatus[] = [
      OrderStatus.ORDER_PLACED,
      OrderStatus.PROCESSING,
      OrderStatus.PACKAGING,
      OrderStatus.ON_THE_ROAD,
      OrderStatus.DELIVERED,
    ];

    const currentStatusIndex = allSteps.indexOf(order.status);
    const completedStatuses = allSteps.slice(0, currentStatusIndex + 1);

    return allSteps.map((status, index) => {
      const isCompleted = completedStatuses.includes(status);
      const isActive = status === order.status;
      const statusInfo = ORDER_STATUS_MAPPING[status];

      // Find the most recent tracking event for this status
      const trackingEvent = order.trackingHistory
        .filter((event: any) => event.status === status)
        .sort(
          (a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime()
        )[0];

      return {
        status,
        title: statusInfo.title,
        description: trackingEvent?.description || statusInfo.description,
        completed: isCompleted,
        active: isActive,
        timestamp: trackingEvent?.timestamp,
        location: trackingEvent?.location,
      };
    });
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(status: OrderStatus): number {
    const statusProgressMap: Record<OrderStatus, number> = {
      [OrderStatus.ORDER_PLACED]: 20,
      [OrderStatus.PROCESSING]: 40,
      [OrderStatus.PACKAGING]: 60,
      [OrderStatus.IN_TRANSIT]: 70,
      [OrderStatus.ON_THE_ROAD]: 80,
      [OrderStatus.DELIVERED]: 100,
      [OrderStatus.CANCELLED]: 0,
    };

    return statusProgressMap[status] || 0;
  }

  /**
   * Validate tracking request
   */
  private validateTrackingRequest(request: TrackingRequest): void {
    if (!request.orderNumber || !validateOrderNumber(request.orderNumber)) {
      throw createValidationError(
        "orderNumber",
        ERROR_MESSAGES.INVALID_ORDER_NUMBER
      );
    }

    if (!request.email || !validateEmail(request.email)) {
      throw createValidationError("email", ERROR_MESSAGES.INVALID_EMAIL);
    }
  }

  /**
   * Get tracking statistics
   */
  async getTrackingStats(): Promise<{
    totalOrders: number;
    ordersByStatus: Record<OrderStatus, number>;
    recentOrders: any[];
  }> {
    try {
      const totalOrders = await TrackingOrder.countDocuments();

      const ordersByStatus = await TrackingOrder.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusCounts: Record<OrderStatus, number> = {
        [OrderStatus.ORDER_PLACED]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.PACKAGING]: 0,
        [OrderStatus.IN_TRANSIT]: 0,
        [OrderStatus.ON_THE_ROAD]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0,
      };

      ordersByStatus.forEach((item) => {
        statusCounts[item._id as OrderStatus] = item.count;
      });

      const recentOrders = await TrackingOrder.find()
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        totalOrders,
        ordersByStatus: statusCounts,
        recentOrders,
      };
    } catch (error) {
      logError(error as Error, "getTrackingStats");
      throw error;
    }
  }

  /**
   * Create tracking record from order when shipped
   */
  async createTrackingFromOrder(
    orderId: string,
    docketNumber: string
  ): Promise<any> {
    try {
      // Validate docket number
      const docketValidation = DataValidator.validateDocketNumber(docketNumber);
      if (!docketValidation.isValid) {
        throw createValidationError(
          "docketNumber",
          docketValidation.errors.join(", ")
        );
      }

      const order = await OrderModel.findById(orderId).populate("user");
      if (!order) {
        throw new NotFoundError("Order not found");
      }

      // Validate order number
      const orderNumberValidation = DataValidator.validateOrderNumber(
        order.orderNumber
      );
      if (!orderNumberValidation.isValid) {
        throw createValidationError(
          "orderNumber",
          orderNumberValidation.errors.join(", ")
        );
      }

      // Check if tracking record already exists
      const existingTracking = await TrackingOrder.findOne({
        orderNumber: orderNumberValidation.sanitizedData,
      });

      if (existingTracking) {
        // Update existing tracking record with docket number
        existingTracking.docketNumber = docketValidation.sanitizedData;
        await existingTracking.save();
        logInfo(
          `Updated tracking record for order ${orderNumberValidation.sanitizedData} with docket ${docketValidation.sanitizedData}`,
          "TrackingService"
        );
        return existingTracking;
      }

      // Prepare tracking data with validation
      const trackingData = {
        orderNumber: orderNumberValidation.sanitizedData,
        customerEmail:
          typeof order.user === "object" && "email" in order.user
            ? order.user.email
            : "",
        customerName:
          typeof order.user === "object" && "firstName" in order.user
            ? `${order.user.firstName} ${order.user.lastName}`.trim()
            : "",
        docketNumber: docketValidation.sanitizedData,
        totalAmount: order.totalAmount,
        status: OrderStatus.ORDER_PLACED,
        items: order.items.map((item) => ({
          productId: item.product.toString(),
          productName: `Product ${item.productModel}`,
          quantity: item.quantity,
          price: item.price,
          image: "",
        })),
        shippingAddress: {
          name: order.shippingAddress.label || "Home",
          line1: order.shippingAddress.street,
          line2: "",
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.postalCode,
          phone:
            typeof order.user === "object" && "phone" in order.user
              ? order.user.phone || ""
              : "",
          email:
            typeof order.user === "object" && "email" in order.user
              ? order.user.email
              : "",
        },
        billingAddress: {
          name: order.shippingAddress.label || "Home",
          line1: order.shippingAddress.street,
          line2: "",
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.postalCode,
          phone:
            typeof order.user === "object" && "phone" in order.user
              ? order.user.phone || ""
              : "",
          email:
            typeof order.user === "object" && "email" in order.user
              ? order.user.email
              : "",
        },
      };

      // Validate tracking data
      const validationResult =
        DataValidator.validateTrackingOrderData(trackingData);
      if (!validationResult.isValid) {
        throw createValidationError(
          "trackingData",
          validationResult.errors.join(", ")
        );
      }

      // Create new tracking record with sanitized data
      const trackingOrder = new TrackingOrder(validationResult.sanitizedData);
      await trackingOrder.save();

      logInfo(
        `Created tracking record for order ${orderNumberValidation.sanitizedData} with docket ${docketValidation.sanitizedData}`,
        "TrackingService"
      );
      return trackingOrder;
    } catch (error) {
      logError(error as Error, "createTrackingFromOrder");
      throw error;
    }
  }

  /**
   * Sync tracking status back to original order
   */
  async syncOrderStatus(
    trackingOrder: any,
    previousStatus?: OrderStatus,
    auditContext?: AuditContext
  ): Promise<void> {
    try {
      const order = await OrderModel.findOne({
        orderNumber: trackingOrder.orderNumber,
      });

      if (!order) {
        logError(
          new Error(
            `Order not found for tracking order ${trackingOrder.orderNumber}`
          ),
          "syncOrderStatus"
        );
        return;
      }

      const orderStatus = this.mapTrackingStatusToOrderStatus(
        trackingOrder.status
      );
      const previousOrderStatus = previousStatus
        ? this.mapTrackingStatusToOrderStatus(previousStatus)
        : order.orderStatus;

      if (order.orderStatus !== orderStatus) {
        const oldStatus = order.orderStatus;
        order.orderStatus = orderStatus as any;

        // Update specific timestamps based on status
        if (orderStatus === "shipped" && !order.shippedAt) {
          order.shippedAt = new Date();
        } else if (orderStatus === "delivered" && !order.deliveredAt) {
          order.deliveredAt = new Date();
        } else if (orderStatus === "cancelled" && !order.cancelledAt) {
          order.cancelledAt = new Date();
        }

        await order.save();

        // Log audit trail for status change
        if (auditContext) {
          await this.auditService.logOrderStatusChange(
            order._id.toString(),
            order.orderNumber,
            oldStatus,
            orderStatus,
            auditContext
          );
        }

        // Send notification for status changes
        if (previousOrderStatus !== orderStatus) {
          await this.notificationService.sendTrackingUpdateNotification(
            trackingOrder,
            previousStatus || trackingOrder.status,
            trackingOrder.status
          );

          // Send webhook for status changes
          if (this.webhookService) {
            try {
              await this.webhookService.sendTrackingStatusChange(
                trackingOrder,
                previousStatus || trackingOrder.status,
                trackingOrder.status
              );
            } catch (webhookError) {
              logError(
                webhookError as Error,
                "sendTrackingStatusChange webhook"
              );
            }
          }
        }

        logInfo(
          `Synced status for order ${order.orderNumber}: ${orderStatus}`,
          "TrackingService"
        );
      }
    } catch (error) {
      logError(error as Error, "syncOrderStatus");
      // Don't throw error here as we don't want to break the tracking update
    }
  }

  /**
   * Map tracking status to order status
   */
  private mapTrackingStatusToOrderStatus(trackingStatus: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.ORDER_PLACED]: "pending",
      [OrderStatus.PROCESSING]: "processing",
      [OrderStatus.PACKAGING]: "processing",
      [OrderStatus.IN_TRANSIT]: "shipped",
      [OrderStatus.ON_THE_ROAD]: "shipped",
      [OrderStatus.DELIVERED]: "delivered",
      [OrderStatus.CANCELLED]: "cancelled",
    };

    return statusMap[trackingStatus] || "pending";
  }

  /**
   * Get user orders with tracking information
   */
  async getUserOrdersWithTracking(userId: string): Promise<any[]> {
    try {
      const orders = await OrderModel.find({ user: userId })
        .populate("user", "firstName lastName email phone")
        .sort({ orderedAt: -1 });

      // Add tracking info to each order
      for (const order of orders) {
        const tracking = await TrackingOrder.findOne({
          orderNumber: order.orderNumber,
        });

        if (tracking) {
          order.trackingInfo = {
            docketNumber: tracking.docketNumber,
            status: tracking.status,
            estimatedDelivery: tracking.estimatedDelivery?.toString(),
            trackingHistory: tracking.trackingHistory,
            hasTracking: true,
          };
        } else {
          order.trackingInfo = {
            hasTracking: false,
          };
        }
      }

      return orders;
    } catch (error) {
      logError(error as Error, "getUserOrdersWithTracking");
      throw error;
    }
  }

  /**
   * Get order by order number with tracking info
   */
  async getOrderWithTracking(orderNumber: string): Promise<any> {
    try {
      const order = await OrderModel.findOne({ orderNumber }).populate(
        "user",
        "firstName lastName email phone"
      );

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      const tracking = await TrackingOrder.findOne({ orderNumber });

      if (tracking) {
        order.trackingInfo = {
          docketNumber: tracking.docketNumber,
          status: tracking.status,
          estimatedDelivery: tracking.estimatedDelivery?.toString(),
          trackingHistory: tracking.trackingHistory,
          hasTracking: true,
        };
      } else {
        order.trackingInfo = {
          hasTracking: false,
        };
      }

      return order;
    } catch (error) {
      logError(error as Error, "getOrderWithTracking");
      throw error;
    }
  }

  /**
   * Find PaymentOrder and create corresponding TrackingOrder
   */
  private async findAndCreateTrackingFromPaymentOrder(
    orderNumber: string,
    userId: string
  ): Promise<any> {
    try {
      const PaymentOrder = require("../models/PaymentOrder").default;
      const UserModel = require("../models/userModel").UserModel;

      // Normalize order number for consistent comparison
      const normalizedOrderNumber = orderNumber.toUpperCase();

      console.log(
        `🔍 Searching PaymentOrder for: ${normalizedOrderNumber}, userId: ${userId}`
      );

      // Search PaymentOrder by orderNumber and userId
      let paymentOrder = await PaymentOrder.findOne({
        $and: [
          {
            $or: [
              { orderNumber: normalizedOrderNumber },
              { orderId: normalizedOrderNumber },
            ],
          },
          { userId: userId },
        ],
      });

      if (!paymentOrder) {
        // Try case-insensitive search
        paymentOrder = await PaymentOrder.findOne({
          $and: [
            {
              $or: [
                { orderNumber: { $regex: `^${orderNumber}$`, $options: "i" } },
                { orderId: { $regex: `^${orderNumber}$`, $options: "i" } },
              ],
            },
            { userId: userId },
          ],
        });
      }

      if (!paymentOrder) {
        console.log(
          `❌ PaymentOrder not found for ${orderNumber} and userId ${userId}`
        );
        return null;
      }

      console.log(`✅ Found PaymentOrder: ${paymentOrder._id}`);

      // IMPORTANT: Check if TrackingOrder already exists before creating
      const existingTrackingOrder = await TrackingOrder.findOne({
        $or: [
          { orderNumber: normalizedOrderNumber },
          { orderNumber: paymentOrder.orderNumber?.toUpperCase() },
          { orderNumber: paymentOrder.orderId?.toUpperCase() },
        ],
      });

      if (existingTrackingOrder) {
        console.log(
          `✅ TrackingOrder already exists: ${existingTrackingOrder._id}, returning existing`
        );

        // Update userId if missing
        if (!existingTrackingOrder.userId) {
          existingTrackingOrder.userId = userId;
          await existingTrackingOrder.save();
          console.log(
            `🔄 Updated existing TrackingOrder with userId: ${userId}`
          );
        }

        return existingTrackingOrder;
      }

      // Get user details
      const user = await UserModel.findById(paymentOrder.userId);
      if (!user) {
        console.log(`❌ User not found for userId: ${paymentOrder.userId}`);
        return null;
      }

      console.log(`🆕 Creating new TrackingOrder for ${normalizedOrderNumber}`);

      // Create TrackingOrder from PaymentOrder data
      const trackingOrderData = {
        orderNumber: paymentOrder.orderNumber || paymentOrder.orderId,
        customerEmail:
          user.email ||
          paymentOrder.billingInfo.email ||
          paymentOrder.paymentResponse?.email,
        customerName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`.trim()
            : user.name || paymentOrder.billingInfo.name || "Customer",
        userId: paymentOrder.userId,
        totalAmount: paymentOrder.amount,
        status: this.mapPaymentStatusToTrackingStatus(paymentOrder.status),
        items: [
          {
            productId: paymentOrder.orderId,
            productName: "Custom Jewelry Order",
            quantity: 1,
            price: paymentOrder.amount,
            image: paymentOrder.images?.[0]?.url || "",
          },
        ],
        shippingAddress: {
          name: paymentOrder.billingInfo.name,
          line1: paymentOrder.billingInfo.address,
          line2: "",
          city: paymentOrder.billingInfo.city,
          state: paymentOrder.billingInfo.state,
          pincode: paymentOrder.billingInfo.zip,
          phone: paymentOrder.billingInfo.phone,
          email: paymentOrder.billingInfo.email,
        },
        billingAddress: {
          name: paymentOrder.billingInfo.name,
          line1: paymentOrder.billingInfo.address,
          line2: "",
          city: paymentOrder.billingInfo.city,
          state: paymentOrder.billingInfo.state,
          pincode: paymentOrder.billingInfo.zip,
          phone: paymentOrder.billingInfo.phone,
          email: paymentOrder.billingInfo.email,
        },
        trackingHistory: [
          {
            status: this.mapPaymentStatusToTrackingStatus(paymentOrder.status),
            description: `Order ${paymentOrder.status} - Payment confirmed`,
            timestamp: paymentOrder.createdAt,
            code: paymentOrder.status.toUpperCase(),
          },
        ],
        paymentResponse: paymentOrder.paymentResponse,
        images: paymentOrder.images || [],
      };

      // Create and save TrackingOrder
      const trackingOrder = new TrackingOrder(trackingOrderData);
      await trackingOrder.save();

      console.log(
        `✅ Created TrackingOrder for ${normalizedOrderNumber}:`,
        trackingOrder._id
      );
      return trackingOrder;
    } catch (error) {
      // Handle duplicate key error specifically
      if (error.code === 11000 && error.keyPattern?.orderNumber) {
        console.log(
          `⚠️ TrackingOrder already exists, attempting to find and return existing`
        );

        try {
          const existingOrder = await TrackingOrder.findOne({
            orderNumber: orderNumber.toUpperCase(),
          });

          if (existingOrder) {
            // Update userId if missing
            if (!existingOrder.userId) {
              existingOrder.userId = userId;
              await existingOrder.save();
            }
            return existingOrder;
          }
        } catch (findError) {
          console.error(
            "Error finding existing TrackingOrder after duplicate error:",
            findError
          );
        }
      }

      console.error("Error creating TrackingOrder from PaymentOrder:", error);
      return null;
    }
  }

  /**
   * Map PaymentOrder status to TrackingOrder status
   */
  private mapPaymentStatusToTrackingStatus(paymentStatus: string): any {
    const { OrderStatus } = require("../types/tracking");

    const statusMap: Record<string, any> = {
      pending: OrderStatus.ORDER_PLACED,
      processing: OrderStatus.PROCESSING,
      success: OrderStatus.ORDER_PLACED,
      failed: OrderStatus.CANCELLED,
      cancelled: OrderStatus.CANCELLED,
      refunded: OrderStatus.CANCELLED,
    };

    return statusMap[paymentStatus] || OrderStatus.ORDER_PLACED;
  }

  /**
   * Get order history for a user by userId
   */
  async getOrderHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      if (!userId) {
        throw createValidationError("userId", "User ID is required");
      }

      // Try to find orders in TrackingOrder collection first
      let orders = await TrackingOrder.find({
        $or: [
          { userId: userId },
          { customerUserId: userId },
          { "paymentResponse.notes.userId": userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      // If no tracking orders found, get from PaymentOrder and create tracking orders
      if (orders.length === 0) {
        const PaymentOrder = require("../models/PaymentOrder").default;
        const paymentOrders = await PaymentOrder.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit);

        // Convert payment orders to tracking orders
        for (const paymentOrder of paymentOrders) {
          try {
            const trackingOrder =
              await this.findAndCreateTrackingFromPaymentOrder(
                paymentOrder.orderNumber || paymentOrder.orderId,
                userId
              );
            if (trackingOrder) {
              orders.push(trackingOrder);
            }
          } catch (error) {
            console.error("Error converting payment order to tracking:", error);
          }
        }
      }

      return orders;
    } catch (error) {
      logError(error as Error, "getOrderHistory");
      throw error;
    }
  }
}
