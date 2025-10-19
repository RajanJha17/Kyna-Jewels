/**
 * Test script to verify a user's credentials manually
 * Usage: node server/test-user-login.js email@example.com password123
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kynajewels';

async function testLogin(email, password) {
  try {
    console.log('\n🔐 =============== TESTING LOGIN ===============');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('📏 Password length:', password.length);

    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find user
    console.log('🔍 Looking up user...');
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found!');
      console.log('\nAvailable users:');
      const allUsers = await User.find({}).select('email isVerified');
      allUsers.forEach(u => console.log(`  - ${u.email} (verified: ${u.isVerified})`));
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('  Email:', user.email);
    console.log('  Is verified:', user.isVerified);
    console.log('  Has password:', !!user.password);
    console.log('  Password hash length:', user.password?.length);
    console.log('  Password hash start:', user.password?.substring(0, 15));
    console.log('  Hash format:', user.password?.startsWith('$2a$') ? 'bcrypt $2a$' : user.password?.startsWith('$2b$') ? 'bcrypt $2b$' : 'unknown');

    // Test password comparison
    console.log('\n🔑 Testing password comparison...');
    const isValid = await bcrypt.compare(password, user.password);

    console.log('  Result:', isValid ? '✅ PASSWORD MATCHES!' : '❌ PASSWORD DOES NOT MATCH!');

    if (!isValid) {
      console.log('\n💡 Troubleshooting:');
      console.log('  1. Are you entering the exact password used during signup?');
      console.log('  2. Check for extra spaces or different characters');
      console.log('  3. Password is case-sensitive');
      console.log('\n  If this is a test user, you can delete it and create a new one:');
      console.log(`     db.users.deleteOne({ email: "${email}" })`);
    } else {
      console.log('\n✅ Login credentials are CORRECT!');
      console.log('   If login still fails on frontend, check:');
      console.log('   1. API endpoint URL (localhost vs production)');
      console.log('   2. CORS settings');
      console.log('   3. Network tab in browser dev tools');
    }

    console.log('\n=============== TEST COMPLETE ===============\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('\n❌ Usage: node test-user-login.js email@example.com password123\n');
  process.exit(1);
}

testLogin(email, password);

