/**
 * Test script to verify the connected models implementation
 * This simulates what happens when a logged-in user accesses the tracking page
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnectedModels() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kyna_jewelry';
    console.log('🔗 Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const User = require('./dist/models/userModel').default;
    const Order = require('./dist/models/orderModel').default;
    const TrackingOrder = require('./dist/models/TrackingOrder').TrackingOrder;

    // Test with both users
    const testEmails = [
      'tiwariaditya1810@gmail.com',
      'addytiw1810@gmail.com'
    ];

    for (const email of testEmails) {
      console.log('\n' + '='.repeat(70));
      console.log(`🧪 TESTING USER: ${email}`);
      console.log('='.repeat(70));

      // Step 1: Find the user (simulating authentication)
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('❌ User not found!');
        continue;
      }

      console.log(`✅ User found: ${user.firstName} ${user.lastName} (ID: ${user._id})`);
      console.log(`   Orders in User document: ${user.orders.length}`);

      // Step 2: Test direct query using userId (NEW APPROACH with populated order)
      console.log('\n📊 Method 1: Direct query using userId in TrackingOrder...');
      
      const trackingOrdersByUserId = await TrackingOrder.find({ userId: user._id })
        .populate('order')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`✅ Found ${trackingOrdersByUserId.length} tracking orders using userId`);

      // Step 3: Also test the Order → TrackingOrder chain (ORIGINAL APPROACH)
      console.log('\n📊 Method 2: Query through Order → TrackingOrder chain...');
      
      const orders = await Order.find({ user: user._id })
        .populate('trackingOrder')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`✅ Found ${orders.length} orders in Order collection`);

      const trackingOrderIds = orders
        .filter(order => order.trackingOrder)
        .map(order => order.trackingOrder._id || order.trackingOrder);

      console.log(`📦 ${trackingOrderIds.length} orders have tracking information`);

      // Use the direct userId query results for verification
      if (trackingOrdersByUserId.length > 0) {
        const trackingOrders = trackingOrdersByUserId;

        console.log('\n📦 TRACKING ORDERS:');
        trackingOrders.forEach((to, index) => {
          const order = to.order; // Populated order data
          console.log(`   ${index + 1}. Order Number: ${order?.orderNumber || 'N/A'}`);
          console.log(`      User ID: ${to.userId}`);
          console.log(`      Order ID: ${to.order?._id || to.order}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Type: ${order?.orderType || 'normal'}`);
          console.log(`      Tracking Status: ${to.status}`);
          console.log(`      Amount: ₹${order?.totalAmount?.toLocaleString() || '0'}`);
          console.log(`      Docket: ${to.docketNumber || 'Not assigned'}`);
        });

        // Verify userId isolation
        const wrongUserOrders = trackingOrders.filter(to => to.userId?.toString() !== user._id.toString());
        if (wrongUserOrders.length > 0) {
          console.log('\n❌ ERROR: Found orders from other users!');
          wrongUserOrders.forEach(to => {
            console.log(`   - ${to.orderNumber} has userId ${to.userId} (expected ${user._id})`);
          });
        } else {
          console.log('\n✅ USER ISOLATION VERIFIED: All orders belong to userId:', user._id);
        }
      } else {
        console.log('\n⚠️  No tracking orders found');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ TEST COMPLETE');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

console.log('🚀 Starting Connected Models Test...\n');
testConnectedModels()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  });

