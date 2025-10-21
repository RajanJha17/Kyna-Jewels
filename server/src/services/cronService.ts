import cron from 'node-cron';
import { sendReminderEmails } from '../controllers/referralController';
import { TrackingOrder } from '../models/TrackingOrder';
import { TrackingService } from './TrackingService';
import { Sequel247Service } from './Sequel247Service';

// Schedule reminder emails to run daily at 10:00 AM
export const startCronJobs = () => {
  console.log('Starting cron jobs...');
  
  // Send reminder emails daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily reminder email job...');
    try {
      const result = await sendReminderEmails();
      console.log('Reminder email job completed:', result);
    } catch (error) {
      console.error('Error in reminder email cron job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('Cron jobs started successfully');
};

// Start tracking updates cron job (optimized with batch tracking)
export const startTrackingCronJob = (trackingService: TrackingService, sequelService: Sequel247Service) => {
  console.log('Starting tracking updates cron job...');
  
  // Update tracking every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Running automatic tracking update job...');
    
    try {
      // Get all orders with docket numbers that are not delivered or cancelled
      const orders = await TrackingOrder.find({ 
        docketNumber: { $exists: true, $ne: null },
        status: { $nin: ['DELIVERED', 'CANCELLED'] }
      });
      
      if (orders.length === 0) {
        console.log('📦 No orders to update');
        return;
      }
      
      console.log(`📦 Found ${orders.length} orders to check for updates`);
      
      // Extract all docket numbers for batch tracking
      const docketNumbers = orders.map(order => order.docketNumber).filter(Boolean);
      
      if (docketNumbers.length === 0) {
        console.log('⚠️ No valid docket numbers found');
        return;
      }
      
      let updatedCount = 0;
      let errorCount = 0;
      
      try {
        console.log(`🚀 Fetching tracking data for ${docketNumbers.length} shipments in batch...`);
        
        // Use batch tracking API (much more efficient!)
        const batchResponse = await sequelService.trackMultipleShipments(docketNumbers);
        
        // Process successful shipments
        if (batchResponse.successShipments) {
          const successShipments = batchResponse.successShipments as Record<string, any>;
          
          for (const order of orders) {
            if (!order.docketNumber) continue;
            
            const trackingData = successShipments[order.docketNumber];
            
            if (trackingData) {
              try {
                const previousStatus = order.status;
                
                // Update order with tracking data
                order.updateFromSequelTracking(trackingData);
                await order.save();
                
                const newStatus = order.status;
                
                if (previousStatus !== newStatus) {
                  console.log(`✅ Order ${order._id}: ${previousStatus} → ${newStatus}`);
                  
                  // Sync status back to original order with previous status for notifications
                  await trackingService.syncOrderStatus(order, previousStatus);
                  
                  updatedCount++;
                }
              } catch (error) {
                console.error(`❌ Failed to update order ${order._id}:`, (error as Error).message);
                errorCount++;
              }
            }
          }
        }
        
        // Log error shipments if any
        if (batchResponse.errorShipments) {
          const errorShipments = batchResponse.errorShipments as Record<string, any>;
          const errorDockets = Object.keys(errorShipments);
          
          if (errorDockets.length > 0) {
            console.log(`⚠️ ${errorDockets.length} shipments had errors:`);
            errorDockets.forEach(docket => {
              console.log(`  ❌ ${docket}: ${JSON.stringify(errorShipments[docket])}`);
              errorCount++;
            });
          }
        }
        
        console.log(`🎉 Batch tracking completed: ${updatedCount} orders updated, ${errorCount} errors`);
        
      } catch (batchError) {
        console.error('❌ Batch tracking failed, falling back to individual tracking:', (batchError as Error).message);
        
        // Fallback to individual tracking if batch fails
        for (const order of orders) {
          try {
            const previousStatus = order.status;
            await trackingService.updateTrackingFromSequel(order);
            
            await order.save();
            const newStatus = order.status;
            
            if (previousStatus !== newStatus) {
              console.log(`✅ Order ${order._id}: ${previousStatus} → ${newStatus}`);
              await trackingService.syncOrderStatus(order, previousStatus);
              updatedCount++;
            }
          } catch (error) {
            console.error(`❌ Failed to update order ${order._id}:`, (error as Error).message);
            errorCount++;
          }
        }
        
        console.log(`🎉 Fallback tracking completed: ${updatedCount} orders updated, ${errorCount} errors`);
      }
      
    } catch (error) {
      console.error('❌ Tracking cron job error:', error);
    }
  }, {
    timezone: 'UTC'
  });
  
  console.log('✅ Tracking updates cron job started (every 30 minutes) - Using batch API');
};

// Manual function to run tracking updates (for testing) - optimized with batch tracking
export const runTrackingUpdateJob = async (trackingService: TrackingService, sequelService?: Sequel247Service) => {
  console.log('🔄 Manually running tracking update job...');
  
  try {
    const orders = await TrackingOrder.find({ 
      docketNumber: { $exists: true, $ne: null },
      status: { $nin: ['DELIVERED', 'CANCELLED'] }
    });
    
    if (orders.length === 0) {
      console.log('📦 No orders to update');
      return { success: true, message: 'No orders to update' };
    }
    
    console.log(`📦 Found ${orders.length} orders to check for updates`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Use batch tracking if sequelService is provided
    if (sequelService) {
      const docketNumbers = orders.map(order => order.docketNumber).filter(Boolean);
      
      if (docketNumbers.length > 0) {
        try {
          console.log(`🚀 Using batch tracking for ${docketNumbers.length} shipments...`);
          
          const batchResponse = await sequelService.trackMultipleShipments(docketNumbers);
          
          // Process successful shipments
          if (batchResponse.successShipments) {
            const successShipments = batchResponse.successShipments as Record<string, any>;
            
            for (const order of orders) {
              if (!order.docketNumber) continue;
              
              const trackingData = successShipments[order.docketNumber];
              
              if (trackingData) {
                try {
                  const previousStatus = order.status;
                  order.updateFromSequelTracking(trackingData);
                  await order.save();
                  
                  const newStatus = order.status;
                  if (previousStatus !== newStatus) {
                    console.log(`✅ Order ${order._id}: ${previousStatus} → ${newStatus}`);
                    await trackingService.syncOrderStatus(order, previousStatus);
                    updatedCount++;
                  }
                } catch (error) {
                  console.error(`❌ Failed to update order ${order._id}:`, (error as Error).message);
                  errorCount++;
                }
              }
            }
          }
          
          // Count error shipments
          if (batchResponse.errorShipments) {
            const errorShipments = batchResponse.errorShipments as Record<string, any>;
            errorCount += Object.keys(errorShipments).length;
          }
        } catch (batchError) {
          console.error('❌ Batch tracking failed, falling back to individual:', (batchError as Error).message);
          // Fall through to individual tracking below
        }
      }
    } else {
      // Fallback to individual tracking
      console.log('⚠️ Using individual tracking (batch not available)...');
      
      for (const order of orders) {
        try {
          const previousStatus = order.status;
          await trackingService.updateTrackingFromSequel(order);
          await order.save();
          
          const newStatus = order.status;
          if (previousStatus !== newStatus) {
            console.log(`✅ Order ${order._id}: ${previousStatus} → ${newStatus}`);
            await trackingService.syncOrderStatus(order, previousStatus);
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ Failed to update order ${order._id}:`, (error as Error).message);
          errorCount++;
        }
      }
    }
    
    const result = {
      success: true,
      message: `Updated ${updatedCount} orders, ${errorCount} errors`,
      updatedCount,
      errorCount,
      totalOrders: orders.length
    };
    
    console.log('🎉 Manual tracking update completed:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error in manual tracking update job:', error);
    throw error;
  }
};

// Manual function to run reminder emails (for testing)
export const runReminderJob = async () => {
  console.log('Manually running reminder email job...');
  try {
    const result = await sendReminderEmails();
    console.log('Manual reminder email job completed:', result);
    return result;
  } catch (error) {
    console.error('Error in manual reminder email job:', error);
    throw error;
  }
};
