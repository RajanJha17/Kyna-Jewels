/**
 * Clear old indexes from kynajewels database
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function clearIndexes() {
  try {
    const mongoUri = 'mongodb://localhost:27017/kynajewels';
    console.log('🔗 Connecting to kynajewels database...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    
    // Drop indexes from orders collection
    console.log('🗑️  Dropping indexes from orders collection...');
    try {
      const ordersCollection = db.collection('orders');
      await ordersCollection.dropIndexes();
      console.log('   ✅ Dropped orders indexes');
    } catch (err) {
      console.log('   ⚠️  No orders collection found or already clean');
    }

    // Drop indexes from trackingorders collection
    console.log('🗑️  Dropping indexes from trackingorders collection...');
    try {
      const trackingCollection = db.collection('trackingorders');
      await trackingCollection.dropIndexes();
      console.log('   ✅ Dropped trackingorders indexes');
    } catch (err) {
      console.log('   ⚠️  No trackingorders collection found or already clean');
    }

    console.log('\n✅ All indexes cleared! You can now run feed-data-kynajewels.js');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected\n');
  }
}

clearIndexes();

