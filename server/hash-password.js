/**
 * Hash a password the same way the signup process does
 * Usage: node server/hash-password.js YourPassword123
 */

const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  console.log('\n🔑 Hashing password:', password);
  console.log('📏 Password length:', password.length);
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('✅ Hash generated:', hash);
  console.log('📏 Hash length:', hash.length);
  console.log('🔍 Hash starts with:', hash.substring(0, 15));
  
  // Test if it matches
  const matches = await bcrypt.compare(password, hash);
  console.log('✅ Password matches hash:', matches);
  
  return hash;
}

const password = process.argv[2] || 'Test@123';
hashPassword(password);

