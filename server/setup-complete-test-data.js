/**
 * Complete setup script: Creates users, orders, and tracking orders
 * This will create everything from scratch for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define order statuses
// TrackingOrder uses: ORDER_PLACED, PROCESSING, PACKAGING, ON_THE_ROAD, DELIVERED, CANCELLED
// Order model uses: pending, processing, shipped, delivered, cancelled, returned
const ORDER_STATUSES = {
  ORDER_PLACED: {
    tracking: 'ORDER_PLACED',
    order: 'pending'
  },
  PROCESSING: {
    tracking: 'PROCESSING',
    order: 'processing'
  },
  PACKAGING: {
    tracking: 'PACKAGING',
    order: 'processing'
  },
  ON_THE_ROAD: {
    tracking: 'ON_THE_ROAD',
    order: 'shipped'
  },
  DELIVERED: {
    tracking: 'DELIVERED',
    order: 'delivered'
  },
  CANCELLED: {
    tracking: 'CANCELLED',
    order: 'cancelled'
  }
};

const ORDER_TYPES = {
  NORMAL: 'normal',
  CUSTOMIZED: 'customized'
};

// Sample product ID
const SAMPLE_PRODUCT_ID = new mongoose.Types.ObjectId();

/**
 * Build complete tracking history based on current status
 * If order is DELIVERED, it should have all 5 stages
 * If order is ON_THE_ROAD, it should have 4 stages, etc.
 */
function buildTrackingHistory(currentStatus) {
  const allStages = [
    { status: ORDER_STATUSES.ORDER_PLACED.tracking, description: 'Order placed successfully', hours: 0 },
    { status: ORDER_STATUSES.PROCESSING.tracking, description: 'Order is being processed', hours: 2 },
    { status: ORDER_STATUSES.PACKAGING.tracking, description: 'Order is being packed', hours: 6 },
    { status: ORDER_STATUSES.ON_THE_ROAD.tracking, description: 'Package is out for delivery', hours: 24 },
    { status: ORDER_STATUSES.DELIVERED.tracking, description: 'Package delivered successfully', hours: 48 }
  ];

  // Find the index of current status
  const currentIndex = allStages.findIndex(stage => stage.status === currentStatus);
  
  if (currentIndex === -1) {
    // If status not found, return just the current status
    return [{
      status: currentStatus,
      description: 'Current status',
      location: 'Mumbai, Maharashtra',
      timestamp: new Date(),
      code: currentStatus
    }];
  }

  // Build history up to current status
  const history = [];
  const now = new Date();
  
  for (let i = 0; i <= currentIndex; i++) {
    const stage = allStages[i];
    const timestamp = new Date(now.getTime() - (allStages[currentIndex].hours - stage.hours) * 60 * 60 * 1000);
    
    history.push({
      status: stage.status,
      description: stage.description,
      location: 'Mumbai, Maharashtra',
      timestamp: timestamp,
      code: stage.status
    });
  }

  return history;
}

async function setupCompleteTestData() {
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

    // Define test users with password
    const testUsersData = [
      { 
        email: 'tiwariaditya1810@gmail.com', 
        firstName: 'Aditya', 
        lastName: 'Tiwari',
        password: '12345678',
        phone: '+919876543210'
      },
      { 
        email: 'addytiw1810@gmail.com', 
        firstName: 'Addy', 
        lastName: 'Tiw',
        password: '12345678',
        phone: '+919876543211'
      }
    ];

    console.log('👥 Creating test users...\n');

    for (const userData of testUsersData) {
      console.log(`${'='.repeat(60)}`);
      console.log(`📧 Setting up user: ${userData.email}`);
      console.log('='.repeat(60));

      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        console.log(`✅ User already exists: ${user.firstName} ${user.lastName} (ID: ${user._id})`);
        
        // Clear existing orders
        const oldOrders = await Order.find({ user: user._id });
        const oldTrackingIds = oldOrders.map(o => o.trackingOrder).filter(Boolean);
        
        if (oldTrackingIds.length > 0) {
          await TrackingOrder.deleteMany({ _id: { $in: oldTrackingIds } });
          console.log(`🗑️  Deleted ${oldTrackingIds.length} old tracking orders`);
        }
        
        await Order.deleteMany({ user: user._id });
        console.log(`🗑️  Deleted ${oldOrders.length} old orders`);
        
        user.orders = [];
        await user.save();
      } else {
        // Create new user
        console.log(`🆕 Creating new user...`);
        
        // Hash password (NOT HASHING BECAUSE THE MODEL DOES IT AUTOMATICALLY)
        // The User model has a pre-save hook that hashes the password
        
        user = new User({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          password: userData.password, // Plain password - will be hashed by model
          phone: userData.phone,
          isVerified: true,
          role: 'customer',
          isActive: true,
          orders: [],
          wishlist: [],
          gifts: [],
          addresses: [{
            label: 'Home',
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            isDefault: true
          }]
        });

        // Mark password as not needing hashing (since it's already plain and model will hash it)
        user._skipPasswordHashing = true;
        
        await user.save();
        console.log(`✅ User created: ${user.firstName} ${user.lastName} (ID: ${user._id})`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: ${userData.password}`);
      }

      // Create 3 orders with different statuses
      console.log(`\n📦 Creating orders for ${user.email}...\n`);
      
      const ordersData = [
        {
          orderType: ORDER_TYPES.NORMAL,
          trackingStatus: ORDER_STATUSES.ORDER_PLACED.tracking,
          orderStatus: ORDER_STATUSES.ORDER_PLACED.order,
          statusLabel: 'Order Placed',
          amount: 15000,
          productName: 'Diamond Solitaire Ring',
          docketNumber: `DKT${Date.now()}${Math.floor(Math.random() * 10000)}`,
          canCancel: true,
          description: 'Order placed and docket generated'
        },
        {
          orderType: ORDER_TYPES.NORMAL,
          trackingStatus: ORDER_STATUSES.PROCESSING.tracking,
          orderStatus: ORDER_STATUSES.PROCESSING.order,
          statusLabel: 'Processing',
          amount: 25750,
          productName: 'Pearl Earrings',
          docketNumber: `DKT${Date.now() + 1000}${Math.floor(Math.random() * 10000)}`,
          canCancel: true,
          description: 'Order being processed'
        },
        {
          orderType: ORDER_TYPES.NORMAL,
          trackingStatus: ORDER_STATUSES.PACKAGING.tracking,
          orderStatus: ORDER_STATUSES.PACKAGING.order,
          statusLabel: 'Packaging',
          amount: 18200,
          productName: 'Silver Bracelet',
          docketNumber: `DKT${Date.now() + 1500}${Math.floor(Math.random() * 10000)}`,
          canCancel: true,
          description: 'Order is being packed'
        },
        {
          orderType: ORDER_TYPES.NORMAL,
          trackingStatus: ORDER_STATUSES.ON_THE_ROAD.tracking,
          orderStatus: ORDER_STATUSES.ON_THE_ROAD.order,
          statusLabel: 'On the Road',
          amount: 8240,
          productName: 'Gold Pendant Necklace',
          docketNumber: `DKT${Date.now() + 2000}${Math.floor(Math.random() * 10000)}`,
          canCancel: true,
          description: 'In transit - can still cancel'
        },
        {
          orderType: ORDER_TYPES.CUSTOMIZED,
          trackingStatus: ORDER_STATUSES.PROCESSING.tracking,
          orderStatus: ORDER_STATUSES.PROCESSING.order,
          statusLabel: 'Processing',
          amount: 18500,
          productName: 'Upload Your Own Design Pendant',
          docketNumber: `DKT${Date.now() + 3000}${Math.floor(Math.random() * 10000)}`,
          canCancel: false,
          description: 'Processing - Upload Your Own (cannot cancel even though not delivered)'
        },
        {
          orderType: ORDER_TYPES.CUSTOMIZED,
          trackingStatus: ORDER_STATUSES.DELIVERED.tracking,
          orderStatus: ORDER_STATUSES.DELIVERED.order,
          statusLabel: 'Delivered',
          amount: 12360,
          productName: 'Custom Engraved Bracelet',
          docketNumber: `DKT${Date.now() + 4000}${Math.floor(Math.random() * 10000)}`,
          canCancel: false,
          description: 'Delivered - customized item'
        },
        {
          orderType: ORDER_TYPES.CUSTOMIZED,
          trackingStatus: ORDER_STATUSES.DELIVERED.tracking,
          orderStatus: ORDER_STATUSES.DELIVERED.order,
          statusLabel: 'Delivered',
          amount: 36050,
          productName: 'Build Your Own Custom Ring',
          docketNumber: `DKT${Date.now() + 5000}${Math.floor(Math.random() * 10000)}`,
          canCancel: false,
          description: 'Delivered - Build Your Own (cannot cancel)'
        }
      ];

      for (let i = 0; i < ordersData.length; i++) {
        const orderData = ordersData[i];
        const orderNumber = `ORD${Date.now()}${i}${Math.floor(Math.random() * 1000)}`;
        
        console.log(`   ${i + 1}. Creating order: ${orderNumber}`);

        // Step 1: Create Order
        const order = new Order({
          user: user._id,
          orderNumber: orderNumber,
          orderType: orderData.orderType,
          items: [{
            product: SAMPLE_PRODUCT_ID,
            productModel: 'Ring',
            quantity: 1,
            price: orderData.amount,
            total: orderData.amount
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
          orderStatus: orderData.orderStatus,
          subtotal: orderData.amount,
          gst: orderData.amount * 0.03,
          shippingCharge: 0,
          totalAmount: orderData.amount * 1.03,
          trackingNumber: orderData.docketNumber,
          courierService: orderData.docketNumber ? 'Sequel247' : undefined,
          orderedAt: new Date(),
          estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          statusHistory: [{
            status: orderData.statusLabel,
            date: new Date(),
            note: orderData.description
          }]
        });

        await order.save();

        // Step 2: Create TrackingOrder (ONLY tracking-specific fields)
        // Build complete tracking history based on current status
        const trackingHistory = buildTrackingHistory(orderData.trackingStatus);
        
        const trackingOrder = new TrackingOrder({
          userId: user._id, // ✅ Reference to User
          order: order._id, // ✅ Reference to Order (all order data comes from here)
          status: orderData.trackingStatus, // Tracking status
          docketNumber: orderData.docketNumber, // Courier docket number
          estimatedDelivery: order.estimatedDeliveryDate, // Estimated delivery date
          deliveredAt: orderData.trackingStatus === ORDER_STATUSES.DELIVERED.tracking ? new Date() : undefined, // Actual delivery date
          podLink: orderData.trackingStatus === ORDER_STATUSES.DELIVERED.tracking ? 'https://sequel247.com/pod/sample.pdf' : undefined, // Proof of delivery
          trackingHistory: trackingHistory // ✅ Complete history with all stages up to current status
        });

        await trackingOrder.save();

        // Step 3: Link back
        order.trackingOrder = trackingOrder._id;
        await order.save();

        // Step 4: Add to user
        user.orders.push(order._id);

        console.log(`      ✅ ${orderNumber}`);
        console.log(`         Type: ${orderData.orderType}`);
        console.log(`         Status: ${orderData.statusLabel}`);
        console.log(`         Amount: ₹${orderData.amount.toLocaleString()}`);
        console.log(`         Product: ${orderData.productName}`);
        console.log(`         Can Cancel: ${orderData.canCancel ? 'YES ✅' : 'NO ❌'}`);
        console.log(`         Docket: ${orderData.docketNumber || 'Not assigned'}`);
        console.log(`         Tracking Events: ${trackingHistory.length} events`);
      }

      // Save user with all orders
      await user.save();
      console.log(`\n   ✅ User updated with ${user.orders.length} orders\n`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   - Users created/updated: ${testUsersData.length}`);
    console.log(`   - Orders per user: 7`);
    console.log(`   - Total orders: ${testUsersData.length * 7}`);
    console.log('\n🔑 Login Credentials:');
    testUsersData.forEach(u => {
      console.log(`   📧 ${u.email}`);
      console.log(`   🔑 Password: ${u.password}\n`);
    });
    console.log('🔍 Next Steps:');
    console.log('   1. Make sure your backend server is running');
    console.log('   2. Log in with one of the accounts above');
    console.log('   3. Visit /track-order page');
    console.log('   4. You should see ONLY that user\'s orders (7 orders)');
    console.log('   5. ORDER_PLACED = 1 event, PROCESSING = 2 events, PACKAGING = 3 events, ON_THE_ROAD = 4 events, DELIVERED = 5 events');
    console.log('   6. Normal orders will show cancel button, Customized orders will NOT');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

console.log('🚀 Starting Complete Test Data Setup...\n');
setupCompleteTestData()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

