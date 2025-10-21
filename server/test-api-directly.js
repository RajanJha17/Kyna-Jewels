const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kynajewels';

async function testAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Simulating the exact code from getAllTestOrders
    const TrackingOrder = mongoose.model('TrackingOrder', new mongoose.Schema({}, { strict: false }));
    
    const testEmail = 'tiwariaditya1810@gmail.com';
    const filterEmail = testEmail.toLowerCase();
    
    console.log('📧 Simulating API call for:', testEmail);
    console.log('🔍 MongoDB Query: { customerEmail:', `"${filterEmail}" }`);
    console.log('');
    
    const orders = await TrackingOrder.find({ customerEmail: filterEmail })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderNumber customerEmail customerName status orderType totalAmount items docketNumber createdAt updatedAt')
      .lean();

    console.log('✅ Found:', orders.length, 'orders\n');
    
    if (orders.length === 0) {
      console.log('❌ NO ORDERS FOUND!');
      console.log('\nPossible reasons:');
      console.log('1. Orders were deleted from database');
      console.log('2. Email mismatch in database');
      console.log('');
      
      // Check all orders
      const allOrders = await TrackingOrder.find({}).select('customerEmail orderNumber').lean();
      console.log(`Total orders in database: ${allOrders.length}`);
      allOrders.forEach(o => console.log(`  - ${o.orderNumber}: ${o.customerEmail}`));
    } else {
      // Format like the API does
      const formattedOrders = orders.map((order) => ({
        orderNumber: order.orderNumber,
        email: order.customerEmail,
        customerName: order.customerName,
        status: order.status,
        orderType: order.orderType || 'normal',
        amount: order.totalAmount,
        productName: order.items && order.items.length > 0 ? order.items[0].productName : 'Product',
        docketNumber: order.docketNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));

      console.log('📦 Formatted API Response:');
      console.log(JSON.stringify({
        success: true,
        data: formattedOrders,
        message: `Found ${formattedOrders.length} orders for your account`
      }, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAPI();


