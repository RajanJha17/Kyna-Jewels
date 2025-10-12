const mongoose = require('mongoose');
require('dotenv').config();

// Import the TrackingOrder model
const { TrackingOrder } = require('./dist/models/TrackingOrder');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kynajewels';
    console.log('🔌 Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Make sure MongoDB is running and the connection string is correct');
    process.exit(1);
  }
};

// Dummy tracking orders data
const dummyOrders = [
  {
    orderNumber: 'ORD123456',
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    totalAmount: 35000,
    status: 'DELIVERED',
    docketNumber: 'SEQ789456123',
    estimatedDelivery: new Date('2025-01-22T19:32:00Z'),
    items: [
      {
        productId: 'PROD001',
        productName: 'Gold Diamond Ring',
        quantity: 1,
        price: 25000,
        image: '/rings.jpg'
      },
      {
        productId: 'PROD002',
        productName: 'Silver Pendant',
        quantity: 2,
        price: 5000,
        image: '/pendants.jpg'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
      email: 'customer@example.com'
    },
    billingAddress: {
      name: 'John Doe',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
      email: 'customer@example.com'
    },
    trackingHistory: [
      {
        status: 'DELIVERED',
        description: 'Your order has been delivered. Thank you for shopping at Kyna!',
        location: 'Mumbai, Maharashtra',
        timestamp: new Date('2025-01-22T19:32:00Z'),
        code: 'DEL001'
      },
      {
        status: 'ON_THE_ROAD',
        description: 'Our delivery man (Karan) has picked up your order for delivery.',
        location: 'Mumbai Hub',
        timestamp: new Date('2025-01-22T14:00:00Z'),
        code: 'OFD001'
      },
      {
        status: 'IN_TRANSIT',
        description: 'Your order has reached at last mile hub.',
        location: 'Mumbai Last Mile Hub',
        timestamp: new Date('2025-01-22T08:00:00Z'),
        code: 'LMH001'
      },
      {
        status: 'IN_TRANSIT',
        description: 'Your order is on the way to (last mile) hub.',
        location: 'In Transit',
        timestamp: new Date('2025-01-21T05:32:00Z'),
        code: 'TRN001'
      },
      {
        status: 'PROCESSING',
        description: 'Your order is successfully verified.',
        location: 'Warehouse',
        timestamp: new Date('2025-01-20T19:32:00Z'),
        code: 'VRF001'
      },
      {
        status: 'ORDER_PLACED',
        description: 'Your order has been confirmed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-19T14:51:00Z'),
        code: 'CFM001'
      }
    ],
    createdAt: new Date('2025-01-19T14:51:00Z'),
    updatedAt: new Date('2025-01-22T19:32:00Z')
  },
  {
    orderNumber: 'ORD789012',
    customerEmail: 'test@example.com',
    customerName: 'Jane Smith',
    totalAmount: 45000,
    status: 'PACKAGING',
    docketNumber: 'SEQ456789123',
    estimatedDelivery: new Date('2025-01-25T12:00:00Z'),
    items: [
      {
        productId: 'PROD003',
        productName: 'Platinum Earrings',
        quantity: 1,
        price: 45000,
        image: '/earrings.jpg'
      }
    ],
    shippingAddress: {
      name: 'Jane Smith',
      line1: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 9123456789',
      email: 'test@example.com'
    },
    billingAddress: {
      name: 'Jane Smith',
      line1: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 9123456789',
      email: 'test@example.com'
    },
    trackingHistory: [
      {
        status: 'PACKAGING',
        description: 'Your order is being carefully packaged.',
        location: 'Warehouse',
        timestamp: new Date('2025-01-21T10:30:00Z'),
        code: 'PKG001'
      },
      {
        status: 'PROCESSING',
        description: 'Your order is being processed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-20T15:45:00Z'),
        code: 'PRC001'
      },
      {
        status: 'ORDER_PLACED',
        description: 'Your order has been confirmed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-19T09:15:00Z'),
        code: 'CFM001'
      }
    ],
    createdAt: new Date('2025-01-19T09:15:00Z'),
    updatedAt: new Date('2025-01-21T10:30:00Z')
  },
  {
    orderNumber: 'ORD345678',
    customerEmail: 'demo@example.com',
    customerName: 'Mike Johnson',
    totalAmount: 93000,
    status: 'ON_THE_ROAD',
    docketNumber: 'SEQ123456789',
    estimatedDelivery: new Date('2025-01-24T16:00:00Z'),
    items: [
      {
        productId: 'PROD004',
        productName: 'Rose Gold Bracelet',
        quantity: 1,
        price: 18000,
        image: '/bracelets.jpg'
      },
      {
        productId: 'PROD005',
        productName: 'Diamond Necklace',
        quantity: 1,
        price: 75000,
        image: '/necklaces.jpg'
      }
    ],
    shippingAddress: {
      name: 'Mike Johnson',
      line1: '789 Pine Street',
      line2: 'Floor 2',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 9988776655',
      email: 'demo@example.com'
    },
    billingAddress: {
      name: 'Mike Johnson',
      line1: '789 Pine Street',
      line2: 'Floor 2',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 9988776655',
      email: 'demo@example.com'
    },
    trackingHistory: [
      {
        status: 'ON_THE_ROAD',
        description: 'Your order is on the way to your city.',
        location: 'In Transit to Bangalore',
        timestamp: new Date('2025-01-22T08:00:00Z'),
        code: 'TRN002'
      },
      {
        status: 'IN_TRANSIT',
        description: 'Your order has been shipped from our warehouse.',
        location: 'Mumbai Warehouse',
        timestamp: new Date('2025-01-21T18:30:00Z'),
        code: 'SHP001'
      },
      {
        status: 'PACKAGING',
        description: 'Your order is being carefully packaged.',
        location: 'Warehouse',
        timestamp: new Date('2025-01-21T14:20:00Z'),
        code: 'PKG001'
      },
      {
        status: 'PROCESSING',
        description: 'Your order is being processed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-20T11:15:00Z'),
        code: 'PRC001'
      },
      {
        status: 'ORDER_PLACED',
        description: 'Your order has been confirmed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-19T16:45:00Z'),
        code: 'CFM001'
      }
    ],
    createdAt: new Date('2025-01-19T16:45:00Z'),
    updatedAt: new Date('2025-01-22T08:00:00Z')
  },
  {
    orderNumber: 'ORD999888',
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    totalAmount: 25000,
    status: 'PROCESSING',
    docketNumber: 'SEQ999888777',
    estimatedDelivery: new Date('2025-01-26T10:00:00Z'),
    items: [
      {
        productId: 'PROD006',
        productName: 'Gold Chain',
        quantity: 1,
        price: 25000,
        image: '/chains.jpg'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
      email: 'customer@example.com'
    },
    billingAddress: {
      name: 'John Doe',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
      email: 'customer@example.com'
    },
    trackingHistory: [
      {
        status: 'PROCESSING',
        description: 'Your order is being processed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-21T12:00:00Z'),
        code: 'PRC001'
      },
      {
        status: 'ORDER_PLACED',
        description: 'Your order has been confirmed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-20T10:30:00Z'),
        code: 'CFM001'
      }
    ],
    createdAt: new Date('2025-01-20T10:30:00Z'),
    updatedAt: new Date('2025-01-21T12:00:00Z')
  },
  {
    orderNumber: 'ORD111222',
    customerEmail: 'test@example.com',
    customerName: 'Jane Smith',
    totalAmount: 15000,
    status: 'ORDER_PLACED',
    estimatedDelivery: new Date('2025-01-28T14:00:00Z'),
    items: [
      {
        productId: 'PROD007',
        productName: 'Silver Ring',
        quantity: 1,
        price: 15000,
        image: '/rings.jpg'
      }
    ],
    shippingAddress: {
      name: 'Jane Smith',
      line1: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 9123456789',
      email: 'test@example.com'
    },
    billingAddress: {
      name: 'Jane Smith',
      line1: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 9123456789',
      email: 'test@example.com'
    },
    trackingHistory: [
      {
        status: 'ORDER_PLACED',
        description: 'Your order has been confirmed.',
        location: 'Processing Center',
        timestamp: new Date('2025-01-22T16:00:00Z'),
        code: 'CFM001'
      }
    ],
    createdAt: new Date('2025-01-22T16:00:00Z'),
    updatedAt: new Date('2025-01-22T16:00:00Z')
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting to seed tracking orders...');
    
    // Clear existing orders (optional - remove if you want to keep existing data)
    await TrackingOrder.deleteMany({});
    console.log('🗑️  Cleared existing tracking orders');
    
    // Insert dummy orders
    const insertedOrders = await TrackingOrder.insertMany(dummyOrders);
    console.log(`✅ Successfully inserted ${insertedOrders.length} tracking orders`);
    
    // Display summary
    console.log('\n📊 Summary of inserted orders:');
    insertedOrders.forEach(order => {
      console.log(`   • ${order.orderNumber} - ${order.customerEmail} - ${order.status} - ₹${order.totalAmount.toLocaleString()}`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test with these orders:');
    console.log('   • ORD123456 + customer@example.com (Delivered)');
    console.log('   • ORD789012 + test@example.com (Packaging)');
    console.log('   • ORD345678 + demo@example.com (On The Road)');
    console.log('   • ORD999888 + customer@example.com (Processing)');
    console.log('   • ORD111222 + test@example.com (Order Placed)');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase, dummyOrders };
