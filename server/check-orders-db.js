const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kynajewels';

async function checkOrders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const TrackingOrder = mongoose.model('TrackingOrder', new mongoose.Schema({}, { strict: false }));

    // Get all orders grouped by email
    const allOrders = await TrackingOrder.find({})
      .select('orderNumber customerEmail customerName status orderType')
      .sort({ customerEmail: 1, createdAt: -1 })
      .lean();

    console.log('📦 ALL ORDERS IN DATABASE:\n');
    console.log(`Total Orders: ${allOrders.length}\n`);

    // Group by email
    const ordersByEmail = {};
    allOrders.forEach(order => {
      const email = order.customerEmail || 'NO_EMAIL';
      if (!ordersByEmail[email]) {
        ordersByEmail[email] = [];
      }
      ordersByEmail[email].push(order);
    });

    // Display grouped orders
    Object.keys(ordersByEmail).sort().forEach(email => {
      console.log(`\n📧 Email: ${email}`);
      console.log(`   Orders: ${ordersByEmail[email].length}`);
      ordersByEmail[email].forEach(order => {
        console.log(`   - ${order.orderNumber} | ${order.orderType} | ${order.status}`);
      });
    });

    console.log('\n\n🔍 SPECIFIC CHECK FOR YOUR TWO EMAILS:\n');
    
    const email1 = 'tiwariaditya1810@gmail.com';
    const email2 = 'addytiw1810@gmail.com';
    
    const orders1 = await TrackingOrder.find({ customerEmail: email1 }).lean();
    const orders2 = await TrackingOrder.find({ customerEmail: email2 }).lean();
    
    console.log(`${email1}: ${orders1.length} orders`);
    orders1.forEach(o => console.log(`   - ${o.orderNumber}`));
    
    console.log(`\n${email2}: ${orders2.length} orders`);
    orders2.forEach(o => console.log(`   - ${o.orderNumber}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkOrders();


