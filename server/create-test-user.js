/**
 * Create a test user with known password for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kynajewels';

async function createTestUser() {
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define user schema (matching your actual schema)
    const userSchema = new mongoose.Schema({
      email: String,
      password: { type: String, select: false },
      name: String,
      firstName: String,
      lastName: String,
      isVerified: { type: Boolean, default: false },
      role: { type: String, default: 'customer' },
      isActive: { type: Boolean, default: true },
      verificationToken: String,
      verificationTokenExpiresAt: Date,
    }, { timestamps: true });

    // Add pre-save hook to hash password (same as your model)
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (err) {
        next(err);
      }
    });

    const User = mongoose.model('User', userSchema);

    const testEmail = 'test@example.com';
    const testPassword = 'Test123';

    // Delete if exists
    await User.deleteOne({ email: testEmail });
    console.log('🗑️  Deleted old test user (if existed)');

    // Create new user
    console.log('\n📝 Creating test user...');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('   Password length:', testPassword.length);

    const user = new User({
      email: testEmail,
      password: testPassword, // Will be hashed by pre-save hook
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      isVerified: true, // Already verified for easy testing
    });

    await user.save();
    console.log('✅ User created!');

    // Fetch and test
    const savedUser = await User.findOne({ email: testEmail }).select('+password');
    console.log('\n📊 Saved user details:');
    console.log('   Email:', savedUser.email);
    console.log('   Has password:', !!savedUser.password);
    console.log('   Password hash:', savedUser.password.substring(0, 20) + '...');
    console.log('   Is verified:', savedUser.isVerified);

    // Test password comparison
    console.log('\n🔑 Testing password comparison...');
    const matches = await bcrypt.compare(testPassword, savedUser.password);
    console.log('   Password matches:', matches ? '✅ YES' : '❌ NO');

    if (matches) {
      console.log('\n✅ SUCCESS! You can now login with:');
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
      console.log('\n💡 Try logging in on your frontend now!');
    } else {
      console.log('\n❌ ERROR: Password does not match! Something is wrong with hashing.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();

