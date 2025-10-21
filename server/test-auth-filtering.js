const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kynajewels';

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  password: String,
  isVerified: Boolean
});

// Tracking Order schema
const trackingOrderSchema = new mongoose.Schema({
  orderNumber: String,
  customerEmail: String,
  customerName: String,
  status: String,
  orderType: String,
  totalAmount: Number
}, { timestamps: true });

async function testAuthFiltering() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', userSchema);
    const TrackingOrder = mongoose.model('TrackingOrder', trackingOrderSchema);

    // Test 1: Check users in database
    console.log('👥 USERS IN DATABASE:\n');
    const users = await User.find({
      email: { $in: ['tiwariaditya1810@gmail.com', 'addytiw1810@gmail.com'] }
    }).select('email firstName lastName isVerified').lean();

    users.forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName || ''}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   ID: ${user._id}\n`);
    });

    // Test 2: Simulate backend filtering for user 1
    console.log('\n🔍 TEST 1: Filtering for tiwariaditya1810@gmail.com\n');
    const email1 = 'tiwariaditya1810@gmail.com';
    const filterEmail1 = email1.toLowerCase();
    
    console.log(`   Filter query: { customerEmail: "${filterEmail1}" }`);
    
    const orders1 = await TrackingOrder.find({ customerEmail: filterEmail1 })
      .sort({ createdAt: -1 })
      .select('orderNumber customerEmail status orderType')
      .lean();

    console.log(`   Found: ${orders1.length} orders\n`);
    orders1.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.customerEmail} - ${order.status}`);
    });

    // Test 3: Simulate backend filtering for user 2
    console.log('\n🔍 TEST 2: Filtering for addytiw1810@gmail.com\n');
    const email2 = 'addytiw1810@gmail.com';
    const filterEmail2 = email2.toLowerCase();
    
    console.log(`   Filter query: { customerEmail: "${filterEmail2}" }`);
    
    const orders2 = await TrackingOrder.find({ customerEmail: filterEmail2 })
      .sort({ createdAt: -1 })
      .select('orderNumber customerEmail status orderType')
      .lean();

    console.log(`   Found: ${orders2.length} orders\n`);
    orders2.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.customerEmail} - ${order.status}`);
    });

    // Test 4: Check for any case sensitivity issues
    console.log('\n🔍 TEST 3: Case Sensitivity Check\n');
    
    const testEmails = [
      'tiwariaditya1810@gmail.com',
      'TIWARIADITYA1810@gmail.com',
      'TiwariAditya1810@Gmail.com'
    ];

    for (const testEmail of testEmails) {
      const count = await TrackingOrder.countDocuments({ customerEmail: testEmail.toLowerCase() });
      console.log(`   "${testEmail}".toLowerCase() -> Found ${count} orders`);
    }

    console.log('\n✅ All tests complete!');
    console.log('\n📋 EXPECTED BEHAVIOR:');
    console.log('   - tiwariaditya1810@gmail.com should see 3 orders');
    console.log('   - addytiw1810@gmail.com should see 3 orders');
    console.log('   - No cross-contamination between users');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAuthFiltering();


