const express = require("express");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json());

// Test Razorpay configuration
console.log("🔧 Testing Razorpay Configuration...\n");

// Check environment variables
const requiredVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing Razorpay environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("\nPlease set these variables in your .env file:");
  console.error("RAZORPAY_KEY_ID=your_test_key_id");
  console.error("RAZORPAY_KEY_SECRET=your_test_key_secret");
  console.error("RAZORPAY_WEBHOOK_SECRET=your_webhook_secret (optional)");
  process.exit(1);
}

console.log("✅ All required environment variables are set:");
console.log(
  `   - RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID?.substring(0, 10)}...`
);
console.log(
  `   - RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET?.substring(
    0,
    10
  )}...`
);
console.log(
  `   - RAZORPAY_WEBHOOK_SECRET: ${
    process.env.RAZORPAY_WEBHOOK_SECRET ? "Set" : "Not set (optional)"
  }`
);

// Test Razorpay instance creation
try {
  const Razorpay = require("razorpay");

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("\n✅ Razorpay instance created successfully!");

  // Test order creation (with a test amount)
  const testOrder = async () => {
    try {
      console.log("\n🧪 Testing order creation...");

      const order = await razorpay.orders.create({
        amount: 10000, // ₹100 in paise
        currency: "INR",
        receipt: "test_receipt_" + Date.now(),
        notes: {
          test: "This is a test order",
          environment: "development",
        },
      });

      console.log("✅ Test order created successfully:");
      console.log(`   - Order ID: ${order.id}`);
      console.log(`   - Amount: ₹${order.amount / 100}`);
      console.log(`   - Currency: ${order.currency}`);
      console.log(`   - Status: ${order.status}`);

      return order;
    } catch (error) {
      console.error("❌ Order creation failed:", error.message);
      if (error.statusCode === 401) {
        console.error("   This usually means your API keys are incorrect.");
      }
      throw error;
    }
  };

  // Run the test
  testOrder()
    .then((order) => {
      console.log("\n🎉 Razorpay integration test completed successfully!");
      console.log("\nNext steps:");
      console.log("1. Replace the test keys with your actual Razorpay keys");
      console.log("2. Add your webhook endpoint URL in Razorpay dashboard");
      console.log("3. Test the complete payment flow with your frontend");

      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Razorpay integration test failed!");
      console.error("Error details:", error.message);

      console.log("\nTroubleshooting:");
      console.log("1. Verify your Razorpay API keys are correct");
      console.log("2. Check if your account is activated");
      console.log("3. Ensure you have internet connectivity");
      console.log("4. Check Razorpay dashboard for any account issues");

      process.exit(1);
    });
} catch (error) {
  console.error("❌ Failed to create Razorpay instance:", error.message);
  console.error("\nMake sure you have installed the razorpay package:");
  console.error("npm install razorpay");
  process.exit(1);
}
