import { Request, Response, NextFunction } from 'express';
import { TrackingService } from '../services/TrackingService';
import { 
  ApiResponse, 
  TrackingRequest, 
  AppError, 
  ValidationError,
  NotFoundError 
} from '../types/tracking';
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  HTTP_STATUS 
} from '../constants/tracking';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  logError 
} from '../utils/tracking';

export class TrackingController {
  private trackingService: TrackingService;

  constructor(trackingService: TrackingService) {
    this.trackingService = trackingService;
  }

  /**
   * Track an order by order number and email
   */
  trackOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber, email } = req.body as TrackingRequest;

      if (!orderNumber || !email) {
        const errors: Record<string, string> = {};
        if (!orderNumber) errors.orderNumber = 'Order number is required';
        if (!email) errors.email = 'Email is required';
        
        const response: ApiResponse = createErrorResponse(
          'Order number and email are required',
          errors
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.trackingService.trackOrder({ orderNumber, email });
      
      const response: ApiResponse = createSuccessResponse(
        result, 
        SUCCESS_MESSAGES.ORDER_FOUND
      );
      
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order history for a customer
   */
  getOrderHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const { limit = 10 } = req.query;

      if (!email) {
        const response: ApiResponse = createErrorResponse('Email is required');
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const orders = await this.trackingService.getOrderHistory(
        email, 
        parseInt(limit as string)
      );
      
      const response: ApiResponse = createSuccessResponse(orders);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get tracking statistics (admin only)
   */
  getTrackingStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.trackingService.getTrackingStats();
      
      const response: ApiResponse = createSuccessResponse(stats);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status (admin only)
   */
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const { status, description, location } = req.body;

      if (!orderNumber || !status) {
        const response: ApiResponse = createErrorResponse(
          'Order number and status are required'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const order = await this.trackingService.updateOrderStatus(
        orderNumber, 
        status, 
        description, 
        location
      );
      
      const response: ApiResponse = createSuccessResponse(
        order, 
        'Order status updated successfully'
      );
      
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a test order (development only)
   */
  createTestOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'production') {
        const response: ApiResponse = createErrorResponse(
          'This endpoint is not available in production'
        );
        res.status(HTTP_STATUS.FORBIDDEN).json(response);
        return;
      }

      const orderData = req.body;
      const order = await this.trackingService.createOrder(orderData);
      
      const response: ApiResponse = createSuccessResponse(
        order, 
        'Test order created successfully'
      );
      
      res.status(HTTP_STATUS.CREATED).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse = createSuccessResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'KynaJewels Tracking API',
        version: '1.0.0'
      });
      
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Test webhook configuration
   */
  testWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const webhookModule = await import('../services/WebhookService');
      
      const webhookConfig: any = {
        url: process.env.WEBHOOK_URL || '',
        secret: process.env.WEBHOOK_SECRET || '',
        events: ['tracking.status_change', 'order.shipped', 'order.delivered', 'order.cancelled'],
        retryAttempts: 3,
        timeout: 10000
      };

      const webhookService = new webhookModule.WebhookService(webhookConfig);
      const success = await webhookService.testWebhook();

      const response: ApiResponse = createSuccessResponse(
        { success, config: webhookConfig },
        success ? 'Webhook test successful' : 'Webhook test failed'
      );
      
      res.status(success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get webhook configuration
   */
  getWebhookConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = {
        url: process.env.WEBHOOK_URL || '',
        events: ['tracking.status_change', 'order.shipped', 'order.delivered', 'order.cancelled'],
        retryAttempts: 3,
        timeout: 10000,
        enabled: !!(process.env.WEBHOOK_URL && process.env.WEBHOOK_SECRET)
      };

      const response: ApiResponse = createSuccessResponse(config);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit trail for an order
   */
  getOrderAuditTrail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const { limit = 50 } = req.query;

      if (!orderNumber) {
        const response: ApiResponse = createErrorResponse('Order number is required');
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const { AuditService } = await import('../services/AuditService');
      const auditService = new AuditService();
      const auditTrail = await auditService.getOrderAuditTrail(orderNumber, parseInt(limit as string));

      const response: ApiResponse = createSuccessResponse(auditTrail);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Search audit logs
   */
  searchAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { 
        entityType, 
        action, 
        userId, 
        orderNumber, 
        docketNumber, 
        startDate, 
        endDate, 
        limit = 100 
      } = req.query;

      const { AuditService } = await import('../services/AuditService');
      const auditService = new AuditService();
      
      const filters = {
        entityType: entityType as string,
        action: action as string,
        userId: userId as string,
        orderNumber: orderNumber as string,
        docketNumber: docketNumber as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string)
      };

      const auditLogs = await auditService.searchAuditLogs(filters);

      const response: ApiResponse = createSuccessResponse(auditLogs);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit statistics
   */
  getAuditStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { AuditService } = await import('../services/AuditService');
      const auditService = new AuditService();
      const stats = await auditService.getAuditStats();

      const response: ApiResponse = createSuccessResponse(stats);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel a shipment
   */
  cancelShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { docketNumber, reason, orderNumber, email } = req.body;

      // Validation
      if (!docketNumber || !reason) {
        const errors: Record<string, string> = {};
        if (!docketNumber) errors.docketNumber = 'Docket number is required';
        if (!reason) errors.reason = 'Cancellation reason is required';
        
        const response: ApiResponse = createErrorResponse(
          'Docket number and reason are required',
          errors
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Optional: Verify order ownership if orderNumber and email provided
      let orderData: any = null;
      if (orderNumber && email) {
        orderData = await this.trackingService.trackOrder({ orderNumber, email });
        if (!orderData || orderData.docketNumber !== docketNumber) {
          const response: ApiResponse = createErrorResponse(
            'Order verification failed. Docket number does not match this order.'
          );
          res.status(HTTP_STATUS.FORBIDDEN).json(response);
          return;
        }
      }

      // Check order type - only 'normal' orders can be cancelled
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const trackingOrder = await TrackingOrder.findOne({ docketNumber });
      
      if (trackingOrder && trackingOrder.orderType === 'customized') {
        const response: ApiResponse = createErrorResponse(
          'Cannot cancel customized orders. Customized orders cannot be cancelled once placed.'
        );
        res.status(HTTP_STATUS.FORBIDDEN).json(response);
        return;
      }

      // Cancel the shipment with Sequel247
      const success = await this.trackingService.cancelShipment(docketNumber, reason);

      if (success) {
        // Update the tracking order status in database
        try {
          const { OrderStatus } = await import('../types/tracking');
          
          if (trackingOrder) {
            trackingOrder.status = OrderStatus.CANCELLED;
            trackingOrder.addTrackingEvent(
              OrderStatus.CANCELLED,
              `Shipment cancelled: ${reason}`
            );
            await trackingOrder.save();

            // Sync with main order model
            await this.trackingService.syncOrderStatus(trackingOrder, trackingOrder.status);
          }
        } catch (dbError) {
          console.error('Failed to update tracking status in database:', dbError);
          // Continue even if DB update fails - shipment is already cancelled with courier
        }

        const response: ApiResponse = createSuccessResponse(
          { cancelled: true, docketNumber },
          'Shipment cancelled successfully'
        );
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse = createErrorResponse(
          'Failed to cancel shipment. Please try again or contact support.'
        );
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
      }

    } catch (error) {
      logError(error as Error, 'cancelShipment');
      next(error);
    }
  };

  /**
   * Get all test orders for display on tracking page
   */
  getAllTestOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { TrackingOrder } = await import('../models/TrackingOrder');
      
      // Fetch all orders, limiting to 20 most recent
      const orders = await TrackingOrder.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('orderNumber customerEmail customerName status orderType totalAmount items docketNumber createdAt updatedAt')
        .lean();

      // Format the response
      const formattedOrders = orders.map((order: any) => ({
        orderNumber: order.orderNumber,
        email: order.customerEmail,
        customerName: order.customerName,
        status: order.status,
        orderType: order.orderType || 'normal',
        amount: order.totalAmount,
        productName: order.items && order.items.length > 0 ? order.items[0].productName : 'Product',
        docketNumber: order.docketNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));

      const response: ApiResponse = createSuccessResponse(
        formattedOrders,
        'Test orders fetched successfully'
      );
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logError(error as Error, 'getAllTestOrders');
      next(error);
    }
  };
}

// Error handling middleware
export const handleError = (
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  logError(error, 'TrackingController');

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;
  let errors: Record<string, string> | undefined;

  if (error instanceof ValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = error.message;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  const response: ApiResponse = createErrorResponse(message, errors);
  res.status(statusCode).json(response);
};

// 404 handler
export const handleNotFound = (req: Request, res: Response): void => {
  const response: ApiResponse = createErrorResponse('Endpoint not found');
  res.status(HTTP_STATUS.NOT_FOUND).json(response);
};
