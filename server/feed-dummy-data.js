/**
 * Feed Dummy Data into Order and TrackingOrder Models
 * This script creates sample orders and tracking data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Dummy data configuration
const DUMMY_USERS = [
  {
    email: 'tiwariaditya1810@gmail.com',
    firstName: 'Aditya',
    lastName: 'Tiwari'
  },
  {
    email: 'addytiw1810@gmail.com',
    firstName: 'Addy',
    lastName: 'Tiw'
  }
];

const ORDER_STATUSES = {
  ORDER_PLACED: { tracking: 'ORDER_PLACED', order: 'pending' },
  PROCESSING: { tracking: 'PROCESSING', order: 'processing' },
  ON_THE_ROAD: { tracking: 'ON_THE_ROAD', order: 'shipped' },
  DELIVERED: { tracking: 'DELIVERED', order: 'delivered' }
};

const SAMPLE_PRODUCTS = [
  { name: 'Diamond Solitaire Ring', price: 15000 },
  { name: 'Gold Pendant Necklace', price: 25000 },
  { name: 'Pearl Earrings', price: 8000 },
  { name: 'Silver Bracelet', price: 12000 },
  { name: 'Ruby Ring', price: 35000 }
];

async function feedDummyData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kyna_jewelry';
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   URI: ${mongoUri}\n`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Import models
    const User = require('./dist/models/userModel').default;
    const Order = require('./dist/models/orderModel').default;
    const TrackingOrder = require('./dist/models/TrackingOrder').TrackingOrder;

    console.log('=' .repeat(70));
    console.log('🗑️  CLEANING OLD DATA...');
    console.log('='.repeat(70));

    // Clean old data
    const deletedOrders = await Order.deleteMany({});
    const deletedTracking = await TrackingOrder.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrders.deletedCount} old orders`);
    console.log(`   ✅ Deleted ${deletedTracking.deletedCount} old tracking orders\n`);

    // Reset users' orders arrays
    await User.updateMany({}, { $set: { orders: [] } });
    console.log('   ✅ Reset users orders arrays\n');

    console.log('=' .repeat(70));
    console.log('📦 CREATING DUMMY DATA...');
    console.log('='.repeat(70));

    let totalOrders = 0;
    let totalTracking = 0;

    for (const userData of DUMMY_USERS) {
      console.log(`\n👤 User: ${userData.email}`);
      console.log('-'.repeat(70));

      // Find user
      const user = await User.findOne({ email: userData.email });
      if (!user) {
        console.log(`   ⚠️  User not found. Skipping...`);
        continue;
      }

      console.log(`   ✅ Found user: ${user.firstName} ${user.lastName} (ID: ${user._id})\n`);

      // Create 5 orders for each user
      for (let i = 0; i < 5; i++) {
        const product = SAMPLE_PRODUCTS[i];
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        // Determine order status based on index
        let statusData;
        if (i === 0) statusData = ORDER_STATUSES.ORDER_PLACED;
        else if (i === 1) statusData = ORDER_STATUSES.PROCESSING;
        else if (i === 2) statusData = ORDER_STATUSES.ON_THE_ROAD;
        else statusData = ORDER_STATUSES.DELIVERED;

        const orderType = i >= 3 ? 'customized' : 'normal';
        const subtotal = product.price;
        const gst = subtotal * 0.03;
        const totalAmount = subtotal + gst;

        // Create Order
        const order = new Order({
          user: user._id,
          orderNumber: orderNumber,
          orderType: orderType,
          items: [{
            product: new mongoose.Types.ObjectId(),
            productModel: 'Ring',
            quantity: 1,
            price: product.price,
            total: product.price
          }],
          shippingAddress: {
            label: 'Home',
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India'
          },
          paymentMethod: 'UPI',
          paymentStatus: 'paid',
          transactionId: `TXN${Date.now()}${i}`,
          orderStatus: statusData.order,
          subtotal: subtotal,
          gst: gst,
          shippingCharge: 0,
          totalAmount: totalAmount,
          orderedAt: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000), // Stagger dates
          estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await order.save();
        totalOrders++;

        // Create TrackingOrder
        const hasDocket = i >= 2; // Orders 3, 4, 5 have docket numbers
        const trackingOrder = new TrackingOrder({
          userId: user._id,
          order: order._id,
          status: statusData.tracking,
          docketNumber: hasDocket ? `DKT${Date.now()}${Math.floor(Math.random() * 10000)}` : undefined,
          estimatedDelivery: order.estimatedDeliveryDate,
          deliveredAt: statusData.tracking === 'DELIVERED' ? new Date() : undefined,
          podLink: statusData.tracking === 'DELIVERED' ? 'https://sequel247.com/pod/sample.pdf' : undefined,
          trackingHistory: [{
            status: statusData.tracking,
            description: `Order ${statusData.tracking.toLowerCase().replace('_', ' ')}`,
            location: 'Mumbai, Maharashtra',
            timestamp: new Date(),
            code: statusData.tracking
          }]
        });

        await trackingOrder.save();
        totalTracking++;

        // Link tracking back to order
        order.trackingOrder = trackingOrder._id;
        await order.save();

        // Add order to user
        user.orders.push(order._id);

        console.log(`   ${i + 1}. ✅ ${orderNumber}`);
        console.log(`      Product: ${product.name}`);
        console.log(`      Type: ${orderType}`);
        console.log(`      Status: ${statusData.tracking}`);
        console.log(`      Amount: ₹${totalAmount.toLocaleString()}`);
        console.log(`      Docket: ${hasDocket ? trackingOrder.docketNumber : 'Not assigned yet'}`);
      }

      // Save user with updated orders
      await user.save();
      console.log(`\n   ✅ Updated user with ${user.orders.length} orders`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ DUMMY DATA CREATION COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   - Total Orders Created: ${totalOrders}`);
    console.log(`   - Total Tracking Records: ${totalTracking}`);
    console.log(`   - Users Updated: ${DUMMY_USERS.length}`);
    console.log(`   - Orders per User: ${totalOrders / DUMMY_USERS.length}`);

    console.log(`\n🔑 Test Credentials:`);
    DUMMY_USERS.forEach(u => {
      console.log(`   📧 ${u.email}`);
      console.log(`   🔑 Password: 12345678\n`);
    });

    console.log('✅ You can now test the tracking functionality!');
    console.log('   1. Start your backend server');
    console.log('   2. Login with test credentials');
    console.log('   3. Visit /track-order page\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

// Execute
console.log('\n🚀 DUMMY DATA FEEDER');
console.log('='.repeat(70));
console.log('This script will:');
console.log('  1. Clean existing Order and TrackingOrder data');
console.log('  2. Create 5 orders per user (10 total)');
console.log('  3. Link all models properly (User → Order → TrackingOrder)');
console.log('='.repeat(70) + '\n');

feedDummyData()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed!');
    process.exit(1);
  });

