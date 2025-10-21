const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kynajewels';

const TrackingOrderSchema = new mongoose.Schema({
  orderNumber: String,
  customerEmail: String,
  customerName: String,
  totalAmount: Number,
  orderType: String,
  status: String,
  items: [{ productName: String, quantity: Number, price: Number, image: String }],
  shippingAddress: {
    name: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String
  },
  billingAddress: {
    name: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String
  },
  docketNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  trackingHistory: [{
    status: String,
    description: String,
    location: String,
    timestamp: Date,
    code: String
  }]
}, { timestamps: true });

async function addOrdersForUser() {
  try {
    // Get email from command line
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide user email as argument');
      console.error('Usage: node add-orders-for-user.js <email>');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const TrackingOrder = mongoose.model('TrackingOrder', TrackingOrderSchema);

    // Sample orders for the user
    const orders = [
      {
        orderNumber: `ORD${Date.now()}001`,
        customerEmail: email.toLowerCase(),
        customerName: 'Test User',
        totalAmount: 25000,
        orderType: 'normal',
        status: 'IN_TRANSIT',
        items: [{
          productName: 'Diamond Ring',
          quantity: 1,
          price: 25000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Test User',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email.toLowerCase()
        },
        billingAddress: {
          name: 'Test User',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}001`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            location: 'Mumbai',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'IN_TRANSIT',
            description: 'Package in transit',
            location: 'Delhi Hub',
            timestamp: new Date(),
            code: 'SLINORIN'
          }
        ]
      },
      {
        orderNumber: `ORD${Date.now()}002`,
        customerEmail: email.toLowerCase(),
        customerName: 'Test User',
        totalAmount: 15000,
        orderType: 'customized',
        status: 'PROCESSING',
        items: [{
          productName: 'Engraved Pendant',
          quantity: 1,
          price: 15000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Test User',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email.toLowerCase()
        },
        billingAddress: {
          name: 'Test User',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}002`,
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Customized order placed',
            location: 'Mumbai',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'PROCESSING',
            description: 'Engraving in progress',
            location: 'Workshop',
            timestamp: new Date(),
            code: 'SCHECKIN'
          }
        ]
      },
      {
        orderNumber: `ORD${Date.now()}003`,
        customerEmail: email.toLowerCase(),
        customerName: 'Test User',
        totalAmount: 30000,
        orderType: 'normal',
        status: 'DELIVERED',
        items: [{
          productName: 'Gold Bracelet',
          quantity: 1,
          price: 30000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Test User',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email.toLowerCase()
        },
        billingAddress: {
          name: 'Test User',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}003`,
        deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            location: 'Mumbai',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'IN_TRANSIT',
            description: 'Package in transit',
            location: 'Delhi Hub',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            code: 'SLINORIN'
          },
          {
            status: 'DELIVERED',
            description: 'Delivered successfully',
            location: 'Mumbai',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            code: 'SDELVD'
          }
        ]
      }
    ];

    console.log(`\n📦 Adding ${orders.length} orders for ${email}...\n`);

    for (const orderData of orders) {
      const order = new TrackingOrder(orderData);
      await order.save();
      console.log(`✅ Added: ${orderData.orderNumber} (${orderData.orderType}) - ${orderData.status}`);
    }

    console.log('\n✨ All orders added successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`   Email: ${email}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   - 1 Normal (In Transit) - Can be cancelled`);
    console.log(`   - 1 Customized (Processing) - Cannot be cancelled`);
    console.log(`   - 1 Normal (Delivered) - Can download POD`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addOrdersForUser();

