// Set environment variables
process.env.MONGO_URI = 'mongodb://localhost:27017/kynajewels';
process.env.JWT_SECRET = 'kyna_jwt_secret_key_2024_development';
process.env.CCAVENUE_MERCHANT_ID = 'test_merchant_id';
process.env.CCAVENUE_ACCESS_CODE = 'test_access_code';
process.env.CCAVENUE_WORKING_KEY = 'test_working_key';

// Import and run the app
require('ts-node').register();
require('./src/app.ts');
