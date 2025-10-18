// Script to update old orderType values to new simplified values
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kynajewels';

console.log('🔧 Fixing orderType values in database...\n');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Get both collections
    const TrackingOrder = mongoose.connection.collection('trackingorders');
    const Order = mongoose.connection.collection('orders');
    
    // Check current values in TrackingOrder
    console.log('📊 Checking TrackingOrder collection...');
    const trackingOrders = await TrackingOrder.find({}).toArray();
    console.log(`  Total orders: ${trackingOrders.length}`);
    
    const trackingOrderTypes = {};
    trackingOrders.forEach(order => {
      const type = order.orderType || 'undefined';
      trackingOrderTypes[type] = (trackingOrderTypes[type] || 0) + 1;
    });
    
    console.log('  Current orderType distribution:');
    Object.keys(trackingOrderTypes).forEach(type => {
      console.log(`    - ${type}: ${trackingOrderTypes[type]}`);
    });
    
    // Update old values to 'customized' in TrackingOrder
    console.log('\n🔄 Updating old orderType values in TrackingOrder...');
    const trackingResult = await TrackingOrder.updateMany(
      { orderType: { $in: ['build-your-own', 'upload-your-own', 'engraved'] } },
      { $set: { orderType: 'customized' } }
    );
    console.log(`  ✅ Updated ${trackingResult.modifiedCount} tracking orders`);
    
    // Set default 'normal' for orders without orderType in TrackingOrder
    const trackingDefaultResult = await TrackingOrder.updateMany(
      { $or: [{ orderType: { $exists: false } }, { orderType: null }] },
      { $set: { orderType: 'normal' } }
    );
    console.log(`  ✅ Set default 'normal' for ${trackingDefaultResult.modifiedCount} tracking orders`);
    
    // Check current values in Order
    console.log('\n📊 Checking Order collection...');
    const orders = await Order.find({}).toArray();
    console.log(`  Total orders: ${orders.length}`);
    
    const orderTypes = {};
    orders.forEach(order => {
      const type = order.orderType || 'undefined';
      orderTypes[type] = (orderTypes[type] || 0) + 1;
    });
    
    console.log('  Current orderType distribution:');
    Object.keys(orderTypes).forEach(type => {
      console.log(`    - ${type}: ${orderTypes[type]}`);
    });
    
    // Update old values to 'customized' in Order
    console.log('\n🔄 Updating old orderType values in Order...');
    const orderResult = await Order.updateMany(
      { orderType: { $in: ['build-your-own', 'upload-your-own', 'engraved'] } },
      { $set: { orderType: 'customized' } }
    );
    console.log(`  ✅ Updated ${orderResult.modifiedCount} orders`);
    
    // Set default 'normal' for orders without orderType in Order
    const orderDefaultResult = await Order.updateMany(
      { $or: [{ orderType: { $exists: false } }, { orderType: null }] },
      { $set: { orderType: 'normal' } }
    );
    console.log(`  ✅ Set default 'normal' for ${orderDefaultResult.modifiedCount} orders`);
    
    // Verify final state
    console.log('\n📊 Final orderType distribution:');
    
    const finalTracking = await TrackingOrder.find({}).toArray();
    const finalTrackingTypes = {};
    finalTracking.forEach(order => {
      const type = order.orderType || 'undefined';
      finalTrackingTypes[type] = (finalTrackingTypes[type] || 0) + 1;
    });
    
    console.log('\n  TrackingOrder:');
    Object.keys(finalTrackingTypes).forEach(type => {
      const emoji = type === 'normal' ? '✅' : type === 'customized' ? '🎨' : '❓';
      console.log(`    ${emoji} ${type}: ${finalTrackingTypes[type]}`);
    });
    
    const finalOrders = await Order.find({}).toArray();
    const finalOrderTypes = {};
    finalOrders.forEach(order => {
      const type = order.orderType || 'undefined';
      finalOrderTypes[type] = (finalOrderTypes[type] || 0) + 1;
    });
    
    console.log('\n  Order:');
    Object.keys(finalOrderTypes).forEach(type => {
      const emoji = type === 'normal' ? '✅' : type === 'customized' ? '🎨' : '❓';
      console.log(`    ${emoji} ${type}: ${finalOrderTypes[type]}`);
    });
    
    // Show sample orders
    console.log('\n📋 Sample Orders:');
    const sampleOrders = await TrackingOrder.find({}).limit(5).toArray();
    sampleOrders.forEach(order => {
      const emoji = order.orderType === 'normal' ? '✅' : '🎨';
      console.log(`  ${emoji} ${order.orderNumber} - ${order.orderType} - ${order.status}`);
    });
    
    console.log('\n🎉 Database update complete!');
    console.log('\n💡 Summary:');
    console.log('  - All old orderType values converted to "customized"');
    console.log('  - All missing orderType values set to "normal"');
    console.log('  - Both TrackingOrder and Order collections updated');
    console.log('\n✅ You can now test the frontend with correct orderType values!\n');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

