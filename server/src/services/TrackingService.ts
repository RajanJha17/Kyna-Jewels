import { TrackingOrder } from '../models/TrackingOrder';
import { Sequel247Service } from './Sequel247Service';
import { OrderModel } from '../models/orderModel';
import { UserModel } from '../models/userModel';
import { NotificationService } from './NotificationService';
import { WebhookService, WebhookConfig } from './WebhookService';
import { AuditService, AuditContext } from './AuditService';
import { 
  TrackingRequest, 
  TrackingResponse, 
  OrderStatus, 
  TrackingStep,
  AppError,
  NotFoundError
} from '../types/tracking';
import { 
  ORDER_STATUS_MAPPING, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../constants/tracking';
import { 
  validateOrderNumber, 
  validateEmail, 
  createValidationError,
  logError,
  logInfo
} from '../utils/tracking';
import { DataValidator, validateAndSanitize } from '../utils/validation';
import { RetryService, createRetryService, RETRY_CONFIGS, RetryableOperation } from './RetryService';

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
   * Track an order by order number and email
   */
  async trackOrder(request: TrackingRequest): Promise<TrackingResponse> {
    try {
      // Validate and sanitize input
      const validationResult = validateAndSanitize(request, DataValidator.validateTrackingRequest);
      if (!validationResult.isValid) {
        throw createValidationError('validation', validationResult.errors.join(', '));
      }

      const sanitizedRequest = validationResult.sanitizedData;

      // Find order in database
      const order = await TrackingOrder.findByOrderNumberAndEmail(
        sanitizedRequest.orderNumber, 
        sanitizedRequest.email
      );

      if (!order) {
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      // Update tracking from Sequel247 if docket number exists
      if (order.docketNumber) {
        await this.updateTrackingFromSequel(order);
      }

      // Build tracking response
      const trackingResponse = this.buildTrackingResponse(order);

      logInfo(`Order ${sanitizedRequest.orderNumber} tracked successfully`, 'TrackingService');
      return trackingResponse;

    } catch (error) {
      logError(error as Error, 'trackOrder');
      throw error;
    }
  }

  /**
   * Get order history for a customer
   */
  async getOrderHistory(email: string, limit: number = 10): Promise<any[]> {
    try {
      if (!validateEmail(email)) {
        throw createValidationError('email', ERROR_MESSAGES.INVALID_EMAIL);
      }

      const orders = await TrackingOrder.findByCustomerEmail(email, limit);
      return orders;

    } catch (error) {
      logError(error as Error, 'getOrderHistory');
      throw error;
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

      logInfo(`Updating tracking for docket ${order.docketNumber}`, 'TrackingService');

      // Create retryable operation for Sequel247 API call
      const retryableOperation: RetryableOperation<any> = {
        operation: async () => {
          return await this.sequelService.trackShipment(order.docketNumber);
        },
        operationName: `trackShipment-${order.docketNumber}`,
        context: { orderId: order._id, docketNumber: order.docketNumber }
      };

      const sequelResponse = await this.retryService.executeWithRetry(retryableOperation);
      
      if (sequelResponse.data) {
        order.updateFromSequelTracking(sequelResponse.data);
        await order.save();
        
        logInfo(`Tracking updated for order ${order._id}`, 'TrackingService');
      }

    } catch (error) {
      logError(error as Error, 'updateTrackingFromSequel');
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
      
      logInfo(`Order ${order._id} created`, 'TrackingService');
      return order;

    } catch (error) {
      logError(error as Error, 'createOrder');
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
      const order = await TrackingOrder.findOne({ orderNumber: orderNumber.toUpperCase() });
      
      if (!order) {
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      order.addTrackingEvent(
        status, 
        description || ORDER_STATUS_MAPPING[status].description,
        location
      );

      await order.save();
      
      logInfo(`Order ${orderNumber} status updated to ${status}`, 'TrackingService');
      return order;

    } catch (error) {
      logError(error as Error, 'updateOrderStatus');
      throw error;
    }
  }

  /**
   * Build tracking response with progress steps
   */
  private buildTrackingResponse(trackingOrder: any): any {
    const trackingObj = trackingOrder.toObject();
    
    // Get orderType from the populated order reference
    const orderType = trackingObj.order?.orderType || 'normal';
    const orderNumber = trackingObj.order?.orderNumber || 'N/A';
    const totalAmount = trackingObj.order?.totalAmount || 0;
    const items = trackingObj.order?.items || [];
    const shippingAddress = trackingObj.order?.shippingAddress;
    
    console.log('🔍 Building Tracking Response:');
    console.log('  Order Number:', orderNumber);
    console.log('  Order Type from populated order:', orderType);
    console.log('  Status:', trackingObj.status);
    
    // Return data in the format expected by frontend
    const response = {
      orderNumber: orderNumber,
      customerEmail: trackingObj.order?.user?.email || trackingObj.userId, // Get email from populated user or use userId
      status: trackingObj.status,
      orderType: orderType, // ⭐ FROM POPULATED ORDER REFERENCE
      estimatedDelivery: trackingObj.estimatedDelivery ? new Date(trackingObj.estimatedDelivery).toISOString() : undefined,
      docketNumber: trackingObj.docketNumber,
      shippingAddress: shippingAddress,
      trackingHistory: trackingObj.trackingHistory || [],
      items: items,
      totalAmount: totalAmount,
      updatedAt: trackingObj.updatedAt ? new Date(trackingObj.updatedAt).toISOString() : new Date().toISOString()
    };
    
    console.log('  📤 Sending Order Type to Frontend:', response.orderType);
    console.log('  📤 Full Response:', JSON.stringify(response, null, 2));
    
    return response;
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
      OrderStatus.DELIVERED
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
        .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      return {
        status,
        title: statusInfo.title,
        description: trackingEvent?.description || statusInfo.description,
        completed: isCompleted,
        active: isActive,
        timestamp: trackingEvent?.timestamp,
        location: trackingEvent?.location
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
      [OrderStatus.CANCELLED]: 0
    };

    return statusProgressMap[status] || 0;
  }

  /**
   * Validate tracking request
   */
  private validateTrackingRequest(request: TrackingRequest): void {
    if (!request.orderNumber || !validateOrderNumber(request.orderNumber)) {
      throw createValidationError('orderNumber', ERROR_MESSAGES.INVALID_ORDER_NUMBER);
    }

    if (!request.email || !validateEmail(request.email)) {
      throw createValidationError('email', ERROR_MESSAGES.INVALID_EMAIL);
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
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCounts: Record<OrderStatus, number> = {
        [OrderStatus.ORDER_PLACED]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.PACKAGING]: 0,
        [OrderStatus.IN_TRANSIT]: 0,
        [OrderStatus.ON_THE_ROAD]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0
      };

      ordersByStatus.forEach(item => {
        statusCounts[item._id as OrderStatus] = item.count;
      });

      const recentOrders = await TrackingOrder.find()
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        totalOrders,
        ordersByStatus: statusCounts,
        recentOrders
      };

    } catch (error) {
      logError(error as Error, 'getTrackingStats');
      throw error;
    }
  }

  /**
   * Create tracking record from order when shipped
   */
  async createTrackingFromOrder(orderId: string, docketNumber: string): Promise<any> {
    try {
      // Validate docket number
      const docketValidation = DataValidator.validateDocketNumber(docketNumber);
      if (!docketValidation.isValid) {
        throw createValidationError('docketNumber', docketValidation.errors.join(', '));
      }

      const order = await OrderModel.findById(orderId).populate('user');
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Get userId from populated user
      const userId = typeof order.user === 'object' && '_id' in order.user ? order.user._id : order.user;

      // Check if tracking record already exists for this order
      const existingTracking = await TrackingOrder.findOne({ 
        order: order._id
      });
      
      if (existingTracking) {
        // Update existing tracking record with docket number
        existingTracking.docketNumber = docketValidation.sanitizedData;
        await existingTracking.save();
        logInfo(`Updated tracking record for order ${order._id} with docket ${docketValidation.sanitizedData}`, 'TrackingService');
        return existingTracking;
      }

      // Create new tracking record - only tracking-specific fields
      const trackingOrder = new TrackingOrder({
        userId: userId,
        order: order._id,
        status: OrderStatus.ORDER_PLACED,
        docketNumber: docketValidation.sanitizedData,
        trackingHistory: [{
          status: OrderStatus.ORDER_PLACED,
          description: 'Order placed',
          timestamp: new Date(),
          code: OrderStatus.ORDER_PLACED
        }]
      });
      
      await trackingOrder.save();
      
      // Link tracking order back to order
      order.trackingOrder = trackingOrder._id;
      await order.save();
      
      logInfo(`Created tracking record for order ${order._id} with docket ${docketValidation.sanitizedData}`, 'TrackingService');
      return trackingOrder;

    } catch (error) {
      logError(error as Error, 'createTrackingFromOrder');
      throw error;
    }
  }

  /**
   * Sync tracking status back to original order
   */
  async syncOrderStatus(trackingOrder: any, previousStatus?: OrderStatus, auditContext?: AuditContext): Promise<void> {
    try {
      const order = await OrderModel.findOne({ 
        orderNumber: trackingOrder.orderNumber 
      });
      
      if (!order) {
        logError(new Error(`Order not found for tracking order ${trackingOrder.orderNumber}`), 'syncOrderStatus');
        return;
      }

      const orderStatus = this.mapTrackingStatusToOrderStatus(trackingOrder.status);
      const previousOrderStatus = previousStatus ? this.mapTrackingStatusToOrderStatus(previousStatus) : order.orderStatus;
      
      if (order.orderStatus !== orderStatus) {
        const oldStatus = order.orderStatus;
        order.orderStatus = orderStatus as any;
        
        // Update specific timestamps based on status
        if (orderStatus === 'shipped' && !order.shippedAt) {
          order.shippedAt = new Date();
        } else if (orderStatus === 'delivered' && !order.deliveredAt) {
          order.deliveredAt = new Date();
        } else if (orderStatus === 'cancelled' && !order.cancelledAt) {
          order.cancelledAt = new Date();
        }

        await order.save();
        
        // Log audit trail for status change
        if (auditContext) {
          await this.auditService.logOrderStatusChange(
            order._id.toString(),
            order._id.toString(),
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
              logError(webhookError as Error, 'sendTrackingStatusChange webhook');
            }
          }
        }
        
        logInfo(`Synced status for order ${order._id}: ${orderStatus}`, 'TrackingService');
      }

    } catch (error) {
      logError(error as Error, 'syncOrderStatus');
      // Don't throw error here as we don't want to break the tracking update
    }
  }

  /**
   * Map tracking status to order status
   */
  private mapTrackingStatusToOrderStatus(trackingStatus: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.ORDER_PLACED]: 'pending',
      [OrderStatus.PROCESSING]: 'processing',
      [OrderStatus.PACKAGING]: 'processing',
      [OrderStatus.IN_TRANSIT]: 'shipped',
      [OrderStatus.ON_THE_ROAD]: 'shipped',
      [OrderStatus.DELIVERED]: 'delivered',
      [OrderStatus.CANCELLED]: 'cancelled'
    };
    
    return statusMap[trackingStatus] || 'pending';
  }

  /**
   * Get user orders with tracking information
   */
  async getUserOrdersWithTracking(userId: string): Promise<any[]> {
    try {
      const orders = await OrderModel.find({ user: userId })
        .populate('user', 'firstName lastName email phone')
        .sort({ orderedAt: -1 });

      // Add tracking info to each order
      for (const order of orders) {
        const tracking = await TrackingOrder.findOne({ 
          order: order._id 
        });
        
        if (tracking) {
          order.trackingInfo = {
            docketNumber: tracking.docketNumber,
            status: tracking.status,
            estimatedDelivery: tracking.estimatedDelivery?.toString(),
            trackingHistory: tracking.trackingHistory,
            hasTracking: true
          };
        } else {
          order.trackingInfo = {
            hasTracking: false
          };
        }
      }

      return orders;

    } catch (error) {
      logError(error as Error, 'getUserOrdersWithTracking');
      throw error;
    }
  }

  /**
   * Get order by order number with tracking info
   */
  async getOrderWithTracking(orderNumber: string): Promise<any> {
    try {
      const order = await OrderModel.findOne({ orderNumber })
        .populate('user', 'firstName lastName email phone');
      
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      const tracking = await TrackingOrder.findOne({ orderNumber });
      
      if (tracking) {
        order.trackingInfo = {
          docketNumber: tracking.docketNumber,
          status: tracking.status,
          estimatedDelivery: tracking.estimatedDelivery?.toString(),
          trackingHistory: tracking.trackingHistory,
          hasTracking: true
        };
      } else {
        order.trackingInfo = {
          hasTracking: false
        };
      }

      return order;

    } catch (error) {
      logError(error as Error, 'getOrderWithTracking');
      throw error;
    }
  }

  /**
   * Cancel a shipment with Sequel247
   */
  async cancelShipment(docketNumber: string, reason: string): Promise<boolean> {
    try {
      logInfo(`Cancelling shipment ${docketNumber}: ${reason}`);
      
      // Call Sequel247 API to cancel the shipment
      const success = await this.sequelService.cancelShipment(docketNumber, reason);
      
      if (success) {
        logInfo(`Shipment ${docketNumber} cancelled successfully`);
      } else {
        logError(new Error(`Failed to cancel shipment ${docketNumber}`), 'cancelShipment');
      }
      
      return success;

    } catch (error) {
      logError(error as Error, 'cancelShipment');
      throw error;
    }
  }

  /**
   * Download Proof of Delivery (POD) for delivered orders
   */
  async downloadPOD(
    docketNumbers: string[],
    fromDate: string,
    toDate: string
  ): Promise<string | null> {
    try {
      logInfo(`Requesting POD for dockets: ${docketNumbers.join(', ')}`);
      
      // Call Sequel247 API to get POD link
      const podLink = await this.sequelService.downloadPOD(
        docketNumbers,
        fromDate,
        toDate
      );
      
      if (podLink) {
        logInfo(`POD available: ${podLink}`);
      } else {
        logInfo('POD not available yet');
      }
      
      return podLink;

    } catch (error) {
      logError(error as Error, 'downloadPOD');
      return null;
    }
  }
}
