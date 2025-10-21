const fs = require('fs');
const path = require('path');

const envContent = `# Environment Configuration for Kyna Jewels Backend

NODE_ENV=development
PORT=5000

# ✅ MONGODB - Using your kynajewels database
MONGODB_URI=mongodb://localhost:27017/kynajewels

# ✅ JWT SECRET - Required for authentication
JWT_SECRET=kyna-jewels-super-secret-jwt-key-min-32-characters-long-2024

# EMAIL Configuration (Optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=YOUR_APP_PASSWORD_HERE
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
EMAIL_SECURE=false

# CLOUDINARY (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# PAYMENT GATEWAY (Optional)
CCAVENUE_MERCHANT_ID=test-merchant-id
CCAVENUE_ACCESS_CODE=test-access-code
CCAVENUE_WORKING_KEY=test-working-key

# COURIER SERVICE (Optional)
SEQUEL247_TEST_TOKEN=your-test-token
SEQUEL247_STORE_CODE=BLRAK
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log(`📍 Location: ${envPath}`);
  console.log('\n✅ Configuration:');
  console.log('   Database: mongodb://localhost:27017/kynajewels');
  console.log('   Port: 5000');
  console.log('   JWT Secret: ✅ Set');
  console.log('\n🚀 Now restart your backend server!');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}

