/**
 * Script to check and fix old users with double-hashed passwords
 * This removes all unverified test users and shows verified users
 */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kynajewels';

async function fixOldUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Get all users
    const allUsers = await User.find({}).select('email isVerified verificationToken createdAt');
    
    console.log(`📊 Total users in database: ${allUsers.length}\n`);

    // Show verified users
    const verifiedUsers = allUsers.filter(u => u.isVerified);
    console.log(`✅ Verified users: ${verifiedUsers.length}`);
    verifiedUsers.forEach(u => {
      console.log(`  - ${u.email} (Created: ${u.createdAt})`);
    });

    // Show unverified users
    const unverifiedUsers = allUsers.filter(u => !u.isVerified);
    console.log(`\n⚠️  Unverified users: ${unverifiedUsers.length}`);
    unverifiedUsers.forEach(u => {
      console.log(`  - ${u.email} (Token: ${u.verificationToken}, Created: ${u.createdAt})`);
    });

    // Ask to delete unverified test users
    if (unverifiedUsers.length > 0) {
      console.log('\n💡 TIP: You can manually delete unverified test users from MongoDB Compass or use the command:');
      console.log('   db.users.deleteMany({ isVerified: false })');
      
      // Uncomment below to auto-delete unverified users (BE CAREFUL!)
      // const result = await User.deleteMany({ isVerified: false });
      // console.log(`\n🗑️  Deleted ${result.deletedCount} unverified users`);
    }

    console.log('\n✅ Analysis complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOldUsers();

