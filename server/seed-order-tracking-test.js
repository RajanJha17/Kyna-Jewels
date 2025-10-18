// Seed script for order tracking with different order types
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kynajewels';

// Order Status Enum
const OrderStatus = {
  ORDER_PLACED: 'ORDER_PLACED',
  PROCESSING: 'PROCESSING',
  PACKAGING: 'PACKAGING',
  IN_TRANSIT: 'IN_TRANSIT',
  ON_THE_ROAD: 'ON_THE_ROAD',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return seedTrackingData();
  })
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

async function seedTrackingData() {
  // Get the TrackingOrder model
  const TrackingOrderSchema = new mongoose.Schema({
    orderNumber: String,
    customerEmail: String,
    customerName: String,
    totalAmount: Number,
    orderType: String,
    status: String,
    items: [{
      productId: String,
      productName: String,
      quantity: Number,
      price: Number,
      image: String
    }],
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
      email: String
    },
    billingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
      email: String
    },
    docketNumber: String,
    estimatedDelivery: Date,
    trackingHistory: [{
      status: String,
      description: String,
      location: String,
      timestamp: Date,
      code: String
    }]
  }, { timestamps: true });

  const TrackingOrder = mongoose.models.TrackingOrder || mongoose.model('TrackingOrder', TrackingOrderSchema);

  // Clear existing test data
  console.log('🗑️  Clearing existing tracking orders...');
  await TrackingOrder.deleteMany({});

  // Sample tracking orders with different order types
  const sampleOrders = [
    // 1. Normal Product - In Transit (CAN BE CANCELLED)
    {
      orderNumber: 'ORD123456',
      customerEmail: 'customer@example.com',
      customerName: 'Rajesh Kumar',
      totalAmount: 25000,
      orderType: 'normal', // ✅ Can be cancelled
      status: OrderStatus.IN_TRANSIT,
      items: [{
        productId: 'RING001',
        productName: 'Diamond Solitaire Ring',
        quantity: 1,
        price: 25000,
        image: '/product_detail/ring1.jpg'
      }],
      shippingAddress: {
        name: 'Rajesh Kumar',
        line1: '123 MG Road',
        line2: 'Near City Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91-9876543210',
        email: 'customer@example.com'
      },
      billingAddress: {
        name: 'Rajesh Kumar',
        line1: '123 MG Road',
        line2: 'Near City Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91-9876543210',
        email: 'customer@example.com'
      },
      docketNumber: 'SEQ123456789',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      trackingHistory: [
        {
          status: OrderStatus.ORDER_PLACED,
          description: 'Your order has been successfully placed',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          code: 'ORDER_PLACED'
        },
        {
          status: OrderStatus.PROCESSING,
          description: 'Your order is being processed',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          code: 'PROCESSING'
        },
        {
          status: OrderStatus.IN_TRANSIT,
          description: 'Your order is in transit',
          location: 'Mumbai Hub',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          code: 'IN_TRANSIT'
        }
      ]
    },

    // 2. Customized Product - Processing (CANNOT BE CANCELLED)
    {
      orderNumber: 'ORD789012',
      customerEmail: 'test@example.com',
      customerName: 'Priya Sharma',
      totalAmount: 45000,
      orderType: 'customized', // ❌ Cannot be cancelled
      status: OrderStatus.PROCESSING,
      items: [{
        productId: 'BYO001',
        productName: 'Custom Build Your Own Ring',
        quantity: 1,
        price: 45000,
        image: '/product_detail/ring2.jpg'
      }],
      shippingAddress: {
        name: 'Priya Sharma',
        line1: '456 Park Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91-9876543211',
        email: 'test@example.com'
      },
      billingAddress: {
        name: 'Priya Sharma',
        line1: '456 Park Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91-9876543211',
        email: 'test@example.com'
      },
      docketNumber: 'SEQ987654321',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      trackingHistory: [
        {
          status: OrderStatus.ORDER_PLACED,
          description: 'Your custom order has been placed',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          code: 'ORDER_PLACED'
        },
        {
          status: OrderStatus.PROCESSING,
          description: 'Your custom jewelry is being crafted',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          code: 'PROCESSING'
        }
      ]
    },

    // 3. Customized Product - On The Road (CANNOT BE CANCELLED)
    {
      orderNumber: 'ORD345678',
      customerEmail: 'demo@example.com',
      customerName: 'Amit Patel',
      totalAmount: 35000,
      orderType: 'customized', // ❌ Cannot be cancelled
      status: OrderStatus.ON_THE_ROAD,
      items: [{
        productId: 'UYO001',
        productName: 'Custom Design Pendant',
        quantity: 1,
        price: 35000,
        image: '/product_detail/pendant1.jpg'
      }],
      shippingAddress: {
        name: 'Amit Patel',
        line1: '789 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91-9876543212',
        email: 'demo@example.com'
      },
      billingAddress: {
        name: 'Amit Patel',
        line1: '789 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91-9876543212',
        email: 'demo@example.com'
      },
      docketNumber: 'SEQ345678901',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      trackingHistory: [
        {
          status: OrderStatus.ORDER_PLACED,
          description: 'Your custom design order has been placed',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          code: 'ORDER_PLACED'
        },
        {
          status: OrderStatus.PROCESSING,
          description: 'Your design is being processed',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          code: 'PROCESSING'
        },
        {
          status: OrderStatus.PACKAGING,
          description: 'Your order is being packaged',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          code: 'PACKAGING'
        },
        {
          status: OrderStatus.ON_THE_ROAD,
          description: 'Your order is on the way',
          location: 'Bangalore Hub',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          code: 'ON_THE_ROAD'
        }
      ]
    },

    // 4. Customized Product - Packaging (CANNOT BE CANCELLED)
    {
      orderNumber: 'ORD999888',
      customerEmail: 'customer@example.com',
      customerName: 'Sneha Reddy',
      totalAmount: 18000,
      orderType: 'customized', // ❌ Cannot be cancelled
      status: OrderStatus.PACKAGING,
      items: [{
        productId: 'ENG001',
        productName: 'Engraved Gold Bracelet - "Forever Together"',
        quantity: 1,
        price: 18000,
        image: '/product_detail/bracelet1.jpg'
      }],
      shippingAddress: {
        name: 'Sneha Reddy',
        line1: '321 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        phone: '+91-9876543213',
        email: 'customer@example.com'
      },
      billingAddress: {
        name: 'Sneha Reddy',
        line1: '321 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        phone: '+91-9876543213',
        email: 'customer@example.com'
      },
      docketNumber: 'SEQ999888777',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      trackingHistory: [
        {
          status: OrderStatus.ORDER_PLACED,
          description: 'Your engraved jewelry order has been placed',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          code: 'ORDER_PLACED'
        },
        {
          status: OrderStatus.PROCESSING,
          description: 'Your item is being engraved',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          code: 'PROCESSING'
        },
        {
          status: OrderStatus.PACKAGING,
          description: 'Your engraved item is being carefully packaged',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          code: 'PACKAGING'
        }
      ]
    },

    // 5. Normal Product - Order Placed (CAN BE CANCELLED)
    {
      orderNumber: 'ORD111222',
      customerEmail: 'test@example.com',
      customerName: 'Vikram Singh',
      totalAmount: 12000,
      orderType: 'normal', // ✅ Can be cancelled
      status: OrderStatus.ORDER_PLACED,
      items: [{
        productId: 'EARRING001',
        productName: 'Gold Hoop Earrings',
        quantity: 1,
        price: 12000,
        image: '/product_detail/earring1.jpg'
      }],
      shippingAddress: {
        name: 'Vikram Singh',
        line1: '654 Residency Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        phone: '+91-9876543214',
        email: 'test@example.com'
      },
      billingAddress: {
        name: 'Vikram Singh',
        line1: '654 Residency Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        phone: '+91-9876543214',
        email: 'test@example.com'
      },
      docketNumber: 'SEQ111222333',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      trackingHistory: [
        {
          status: OrderStatus.ORDER_PLACED,
          description: 'Your order has been successfully placed',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          code: 'ORDER_PLACED'
        }
      ]
    },

    // 6. Normal Product - Delivered (CANNOT BE CANCELLED - Already delivered)
    {
      orderNumber: 'ORD555666',
      customerEmail: 'demo@example.com',
      customerName: 'Anjali Mehta',
      totalAmount: 22000,
      orderType: 'normal', // Normal but delivered
      status: OrderStatus.DELIVERED,
      items: [{
        productId: 'NECKLACE001',
        productName: 'Pearl Necklace',
        quantity: 1,
        price: 22000,
        image: '/product_detail/necklace1.jpg'
      }],
      shippingAddress: {
        name: 'Anjali Mehta',
        line1: '987 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400020',
        phone: '+91-9876543215',
        email: 'demo@example.com'
      },
      billingAddress: {
        name: 'Anjali Mehta',
        line1: '987 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400020',
        phone: '+91-9876543215',
        email: 'demo@example.com'
      },
      docketNumber: 'SEQ555666777',
      estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      trackingHistory: [
        {
          status: OrderStatus.ORDER_PLACED,
          description: 'Your order has been successfully placed',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          code: 'ORDER_PLACED'
        },
        {
          status: OrderStatus.PROCESSING,
          description: 'Your order is being processed',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          code: 'PROCESSING'
        },
        {
          status: OrderStatus.PACKAGING,
          description: 'Your order is being packaged',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          code: 'PACKAGING'
        },
        {
          status: OrderStatus.ON_THE_ROAD,
          description: 'Your order is on the way',
          location: 'Mumbai Hub',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          code: 'ON_THE_ROAD'
        },
        {
          status: OrderStatus.DELIVERED,
          description: 'Your order has been delivered',
          location: 'Mumbai',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          code: 'DELIVERED'
        }
      ]
    }
  ];

  // Insert orders
  console.log('📦 Inserting tracking orders...\n');
  
  for (const order of sampleOrders) {
    await TrackingOrder.create(order);
    
    const cancelStatus = order.orderType === 'normal' && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED
      ? '✅ CAN CANCEL'
      : '❌ CANNOT CANCEL';
    
    const orderTypeLabel = {
      'normal': 'Normal Product',
      'customized': 'Customized Product'
    }[order.orderType] || order.orderType;
    
    console.log(`✅ ${order.orderNumber} | ${order.customerEmail}`);
    console.log(`   Type: ${orderTypeLabel} | Status: ${order.status}`);
    console.log(`   Docket: ${order.docketNumber}`);
    console.log(`   ${cancelStatus}`);
    console.log('');
  }

  console.log('\n📊 Summary:');
  console.log('─────────────────────────────────────────────────────────');
  console.log('✅ Cancellable Orders (Normal Products, Not Delivered):');
  console.log('   • ORD123456 - In Transit');
  console.log('   • ORD111222 - Order Placed');
  console.log('');
  console.log('❌ Non-Cancellable Orders:');
  console.log('   • ORD789012 - Customized Product');
  console.log('   • ORD345678 - Customized Product');
  console.log('   • ORD999888 - Customized Product');
  console.log('   • ORD555666 - Normal (Already Delivered)');
  console.log('─────────────────────────────────────────────────────────');
  console.log('');
  console.log('🧪 Test Instructions:');
  console.log('1. Track ORD123456 with customer@example.com - Should show Cancel button');
  console.log('2. Track ORD789012 with test@example.com - Cancel button should be HIDDEN');
  console.log('3. Try cancelling ORD123456 via API - Should SUCCESS');
  console.log('4. Try cancelling ORD789012 via API - Should FAIL with error message');
  console.log('');
}

