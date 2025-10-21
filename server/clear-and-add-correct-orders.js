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

async function clearAndAddOrders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const TrackingOrder = mongoose.model('TrackingOrder', TrackingOrderSchema);

    // Get emails from command line or use defaults
    const email1 = process.argv[2] || 'tiwariaditya1810@gmail.com';
    const email2 = process.argv[3] || 'addytiw1810@gmail.com';

    console.log('🗑️  Deleting all existing orders...');
    const deleteResult = await TrackingOrder.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} orders\n`);

    // Create orders for first user - Using 5 correct stages
    const user1Orders = [
      {
        orderNumber: `ORD${Date.now()}001`,
        customerEmail: email1.toLowerCase(),
        customerName: 'Aditya Tiwari',
        totalAmount: 25000,
        orderType: 'normal',
        status: 'ON_THE_ROAD', // Stage 4 of 5 - Can be cancelled
        items: [{
          productName: 'Diamond Ring',
          quantity: 1,
          price: 25000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Aditya Tiwari',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email1.toLowerCase()
        },
        billingAddress: {
          name: 'Aditya Tiwari',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email1.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}001`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            location: 'Mumbai',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'PROCESSING',
            description: 'Order is being processed',
            location: 'Mumbai Warehouse',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            code: 'SCHECKIN'
          },
          {
            status: 'PACKAGING',
            description: 'Order is being packaged',
            location: 'Mumbai Warehouse',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            code: 'SPU'
          },
          {
            status: 'ON_THE_ROAD',
            description: 'Package is on the way',
            location: 'Delhi Hub',
            timestamp: new Date(),
            code: 'SLINORIN'
          }
        ]
      },
      {
        orderNumber: `ORD${Date.now()}002`,
        customerEmail: email1.toLowerCase(),
        customerName: 'Aditya Tiwari',
        totalAmount: 15000,
        orderType: 'customized',
        status: 'PROCESSING', // Stage 2 of 5 - Cannot be cancelled (customized)
        items: [{
          productName: 'Engraved Pendant',
          quantity: 1,
          price: 15000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Aditya Tiwari',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email1.toLowerCase()
        },
        billingAddress: {
          name: 'Aditya Tiwari',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email1.toLowerCase()
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
        customerEmail: email1.toLowerCase(),
        customerName: 'Aditya Tiwari',
        totalAmount: 30000,
        orderType: 'normal',
        status: 'DELIVERED', // Stage 5 of 5 - Delivered, can download POD
        items: [{
          productName: 'Gold Bracelet',
          quantity: 1,
          price: 30000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Aditya Tiwari',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email1.toLowerCase()
        },
        billingAddress: {
          name: 'Aditya Tiwari',
          line1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          email: email1.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}003`,
        deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            location: 'Mumbai',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'PROCESSING',
            description: 'Order is being processed',
            location: 'Mumbai Warehouse',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            code: 'SCHECKIN'
          },
          {
            status: 'PACKAGING',
            description: 'Order is being packaged',
            location: 'Mumbai Warehouse',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            code: 'SPU'
          },
          {
            status: 'ON_THE_ROAD',
            description: 'Package is on the way',
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

    // Create orders for second user
    const user2Orders = [
      {
        orderNumber: `ORD${Date.now()}004`,
        customerEmail: email2.toLowerCase(),
        customerName: 'Addy Tiw',
        totalAmount: 20000,
        orderType: 'normal',
        status: 'PACKAGING', // Stage 3 of 5 - Can be cancelled
        items: [{
          productName: 'Silver Necklace',
          quantity: 1,
          price: 20000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Addy Tiw',
          line1: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: email2.toLowerCase()
        },
        billingAddress: {
          name: 'Addy Tiw',
          line1: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: email2.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}004`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            location: 'Delhi',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'PROCESSING',
            description: 'Order is being processed',
            location: 'Delhi Warehouse',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            code: 'SCHECKIN'
          },
          {
            status: 'PACKAGING',
            description: 'Order is being packaged',
            location: 'Delhi Warehouse',
            timestamp: new Date(),
            code: 'SPU'
          }
        ]
      },
      {
        orderNumber: `ORD${Date.now()}005`,
        customerEmail: email2.toLowerCase(),
        customerName: 'Addy Tiw',
        totalAmount: 18000,
        orderType: 'customized',
        status: 'ORDER_PLACED', // Stage 1 of 5 - Cannot be cancelled (customized)
        items: [{
          productName: 'Custom Ring',
          quantity: 1,
          price: 18000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Addy Tiw',
          line1: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: email2.toLowerCase()
        },
        billingAddress: {
          name: 'Addy Tiw',
          line1: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: email2.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}005`,
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Customized order placed',
            location: 'Delhi',
            timestamp: new Date(),
            code: 'SCREATED'
          }
        ]
      },
      {
        orderNumber: `ORD${Date.now()}006`,
        customerEmail: email2.toLowerCase(),
        customerName: 'Addy Tiw',
        totalAmount: 35000,
        orderType: 'normal',
        status: 'DELIVERED', // Stage 5 of 5 - Delivered, can download POD
        items: [{
          productName: 'Platinum Earrings',
          quantity: 1,
          price: 35000,
          image: '/rings.jpg'
        }],
        shippingAddress: {
          name: 'Addy Tiw',
          line1: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: email2.toLowerCase()
        },
        billingAddress: {
          name: 'Addy Tiw',
          line1: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543211',
          email: email2.toLowerCase()
        },
        docketNumber: `DKT${Date.now()}006`,
        deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            location: 'Delhi',
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            code: 'SCREATED'
          },
          {
            status: 'PROCESSING',
            description: 'Order is being processed',
            location: 'Delhi Warehouse',
            timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
            code: 'SCHECKIN'
          },
          {
            status: 'PACKAGING',
            description: 'Order is being packaged',
            location: 'Delhi Warehouse',
            timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            code: 'SPU'
          },
          {
            status: 'ON_THE_ROAD',
            description: 'Package is on the way',
            location: 'Mumbai Hub',
            timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            code: 'SLINORIN'
          },
          {
            status: 'DELIVERED',
            description: 'Delivered successfully',
            location: 'Delhi',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            code: 'SDELVD'
          }
        ]
      }
    ];

    const allOrders = [...user1Orders, ...user2Orders];

    console.log('📦 Adding new orders with correct 5 stages...\n');
    
    for (const orderData of allOrders) {
      const order = new TrackingOrder(orderData);
      await order.save();
      console.log(`✅ Added: ${orderData.orderNumber} (${orderData.orderType}) - ${orderData.status} - ${orderData.customerEmail}`);
    }

    console.log('\n✨ All orders added successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`\n${email1}:`);
    console.log(`   - 1 Normal (ON_THE_ROAD) - Can be cancelled`);
    console.log(`   - 1 Customized (PROCESSING) - Cannot be cancelled`);
    console.log(`   - 1 Normal (DELIVERED) - Can download POD`);
    console.log(`\n${email2}:`);
    console.log(`   - 1 Normal (PACKAGING) - Can be cancelled`);
    console.log(`   - 1 Customized (ORDER_PLACED) - Cannot be cancelled`);
    console.log(`   - 1 Normal (DELIVERED) - Can download POD`);
    
    console.log('\n✅ Using CORRECT 5 stages:');
    console.log('   1. ORDER_PLACED');
    console.log('   2. PROCESSING');
    console.log('   3. PACKAGING');
    console.log('   4. ON_THE_ROAD');
    console.log('   5. DELIVERED');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

clearAndAddOrders();


