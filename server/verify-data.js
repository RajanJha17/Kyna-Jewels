/**
 * Script to verify dummy data in Order and TrackingOrder models
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function verifyData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kyna_jewelry';
    console.log('🔗 Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const Order = require('./dist/models/orderModel').default;
    const TrackingOrder = require('./dist/models/TrackingOrder').TrackingOrder;
    const User = require('./dist/models/userModel').default;

    console.log('📊 DATABASE CONTENTS:\n');
    console.log('='.repeat(70));

    // Check Orders
    const orders = await Order.find({}).populate('user', 'email firstName').lean();
    console.log(`\n📦 ORDERS (${orders.length} total):`);
    orders.forEach((order, index) => {
      console.log(`\n   ${index + 1}. Order Number: ${order.orderNumber}`);
      console.log(`      User: ${order.user?.email || 'N/A'}`);
      console.log(`      Type: ${order.orderType}`);
      console.log(`      Status: ${order.orderStatus}`);
      console.log(`      Amount: ₹${order.totalAmount.toLocaleString()}`);
      console.log(`      Items: ${order.items.length} item(s)`);
      console.log(`      Tracking Link: ${order.trackingOrder ? 'YES ✅' : 'NO ❌'}`);
    });

    // Check TrackingOrders
    const trackingOrders = await TrackingOrder.find({}).populate('order', 'orderNumber').lean();
    console.log(`\n\n📍 TRACKING ORDERS (${trackingOrders.length} total):`);
    trackingOrders.forEach((tracking, index) => {
      console.log(`\n   ${index + 1}. Order: ${tracking.order?.orderNumber || 'N/A'}`);
      console.log(`      Status: ${tracking.status}`);
      console.log(`      Docket: ${tracking.docketNumber || 'Not assigned'}`);
      console.log(`      User ID: ${tracking.userId}`);
      console.log(`      Tracking History: ${tracking.trackingHistory.length} events`);
      if (tracking.deliveredAt) {
        console.log(`      Delivered At: ${new Date(tracking.deliveredAt).toLocaleDateString()}`);
      }
      if (tracking.podLink) {
        console.log(`      POD Link: ${tracking.podLink}`);
      }
    });

    // Check Users with orders
    const users = await User.find({ orders: { $exists: true, $ne: [] } })
      .select('email firstName orders')
      .lean();
    
    console.log(`\n\n👥 USERS WITH ORDERS (${users.length} total):`);
    users.forEach((user, index) => {
      console.log(`\n   ${index + 1}. ${user.email} (${user.firstName})`);
      console.log(`      Orders: ${user.orders.length} order(s)`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Data verification complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

verifyData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

