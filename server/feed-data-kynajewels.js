/**
 * Feed Dummy Data into kynajewels Database
 * For users: tiwariaditya1810@gmail.com and addytiw1810@gmail.com
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Target database
const MONGO_URI = 'mongodb://localhost:27017/kynajewels';

// User IDs from your database
const USERS = [
  {
    id: '68f76a4860fc935c0669a6c8',
    email: 'tiwariaditya1810@gmail.com',
    firstName: 'Aditya',
    lastName: 'Vinay Tiwari TIWARI'
  },
  {
    id: '68f76af560fc935c0669a6cf',
    email: 'addytiw1810@gmail.com',
    firstName: 'Addy',
    lastName: 'bhai'
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

async function feedData() {
  try {
    console.log('\n🚀 FEEDING DUMMY DATA TO KYNAJEWELS DATABASE');
    console.log('='.repeat(70));
    console.log(`📍 Database: ${MONGO_URI}`);
    console.log('='.repeat(70));

    // Connect
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const User = require('./dist/models/userModel').default;
    const Order = require('./dist/models/orderModel').default;
    const TrackingOrder = require('./dist/models/TrackingOrder').TrackingOrder;

    // Clean old data
    console.log('🗑️  Cleaning old Order and TrackingOrder data...');
    const deletedOrders = await Order.deleteMany({});
    const deletedTracking = await TrackingOrder.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrders.deletedCount} old orders`);
    console.log(`   ✅ Deleted ${deletedTracking.deletedCount} old tracking orders\n`);

    // Reset users' orders arrays
    await User.updateMany({}, { $set: { orders: [] } });

    let totalOrders = 0;
    let totalTracking = 0;

    for (const userData of USERS) {
      console.log('='.repeat(70));
      console.log(`👤 User: ${userData.email}`);
      console.log('='.repeat(70));

      const userId = new mongoose.Types.ObjectId(userData.id);
      
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        console.log(`   ❌ User not found! Skipping...\n`);
        continue;
      }

      console.log(`   ✅ Found: ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🆔 ID: ${user._id}\n`);

      // Create 5 orders for each user
      for (let i = 0; i < 5; i++) {
        const product = SAMPLE_PRODUCTS[i];
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        // Determine status
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
          user: userId,
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
          orderedAt: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000),
          estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await order.save();
        totalOrders++;

        // Create TrackingOrder
        const hasDocket = i >= 2;
        const trackingOrder = new TrackingOrder({
          userId: userId,
          order: order._id,
          status: statusData.tracking,
          docketNumber: hasDocket ? `DKT${Date.now()}${Math.floor(Math.random() * 10000)}` : undefined,
          estimatedDelivery: order.estimatedDeliveryDate,
          deliveredAt: statusData.tracking === 'DELIVERED' ? new Date() : undefined,
          podLink: statusData.tracking === 'DELIVERED' ? 'https://sequel247.com/pod/sample.pdf' : undefined,
          trackingHistory: [{
            status: statusData.tracking,
            description: `Order ${statusData.tracking.toLowerCase().replace(/_/g, ' ')}`,
            location: 'Mumbai, Maharashtra',
            timestamp: new Date(),
            code: statusData.tracking
          }]
        });

        await trackingOrder.save();
        totalTracking++;

        // Link tracking to order
        order.trackingOrder = trackingOrder._id;
        await order.save();

        // Add order to user
        user.orders.push(order._id);

        console.log(`   ${i + 1}. ✅ ${orderNumber}`);
        console.log(`      📦 ${product.name}`);
        console.log(`      🏷️  Type: ${orderType}`);
        console.log(`      📊 Status: ${statusData.tracking}`);
        console.log(`      💰 Amount: ₹${totalAmount.toLocaleString()}`);
        console.log(`      🚚 Docket: ${hasDocket ? trackingOrder.docketNumber : 'Not assigned yet'}`);
      }

      // Save user
      await user.save();
      console.log(`\n   ✅ Updated user with ${user.orders.length} orders\n`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ DUMMY DATA SUCCESSFULLY CREATED!');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   📍 Database: kynajewels`);
    console.log(`   📦 Total Orders: ${totalOrders}`);
    console.log(`   🚚 Total Tracking Records: ${totalTracking}`);
    console.log(`   👥 Users Updated: ${USERS.length}`);
    console.log(`   📋 Orders per User: ${totalOrders / USERS.length}`);

    console.log(`\n🔑 Test with these credentials:`);
    console.log(`   📧 tiwariaditya1810@gmail.com`);
    console.log(`   🔑 Password: (your password)`);
    console.log(`\n   📧 addytiw1810@gmail.com`);
    console.log(`   🔑 Password: (your password)`);

    console.log(`\n✅ Ready to test!`);
    console.log(`   1. Start backend server`);
    console.log(`   2. Login with test account`);
    console.log(`   3. Visit /track-order page`);
    console.log(`   4. See your 5 orders!\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

feedData()
  .then(() => {
    console.log('✅ Script completed successfully!\n');
    process.exit(0);
  })
  .catch(() => {
    console.error('💥 Script failed!\n');
    process.exit(1);
  });

