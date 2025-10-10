// Test Payment Flow without Webhooks
// This script demonstrates how to test Razorpay integration locally

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Simple test route to verify payment without webhooks
app.post("/test-payment", async (req, res) => {
  try {
    const Razorpay = require("razorpay");

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create a test order
    const order = await razorpay.orders.create({
      amount: 10000, // ₹100 in paise
      currency: "INR",
      receipt: "test_" + Date.now(),
      notes: {
        test: "localhost testing",
      },
    });

    console.log("✅ Test order created:", order.id);

    res.json({
      success: true,
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Kyna Jewels Test",
      description: "Test Payment",
    });
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test payment verification
app.post("/verify-test-payment", async (req, res) => {
  try {
    const crypto = require("crypto");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    console.log("🔍 Payment verification:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      isValid: isValid,
    });

    res.json({
      success: isValid,
      message: isValid
        ? "Payment verified successfully!"
        : "Payment verification failed!",
    });
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Simple HTML page for testing
app.get("/test-payment-page", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Razorpay Test</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body>
        <h1>Razorpay Payment Test</h1>
        <button onclick="startPayment()">Pay ₹100 (Test)</button>
        
        <script>
        async function startPayment() {
            try {
                // Create order
                const response = await fetch('/test-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    alert('Failed to create order: ' + data.error);
                    return;
                }
                
                // Open Razorpay checkout
                const options = {
                    key: data.keyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: data.name,
                    description: data.description,
                    order_id: data.orderId,
                    handler: async function(response) {
                        // Verify payment
                        const verifyResponse = await fetch('/verify-test-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response)
                        });
                        
                        const verifyData = await verifyResponse.json();
                        
                        if (verifyData.success) {
                            alert('✅ Payment Successful!\\nPayment ID: ' + response.razorpay_payment_id);
                        } else {
                            alert('❌ Payment Verification Failed!');
                        }
                    },
                    prefill: {
                        name: 'Test User',
                        email: 'test@example.com',
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#328F94'
                    }
                };
                
                const rzp = new Razorpay(options);
                rzp.open();
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        </script>
    </body>
    </html>
  `);
});

const PORT = 3001; // Use fixed port to avoid conflicts
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(
    `📝 Open http://localhost:${PORT}/test-payment-page to test payments`
  );
  console.log("");
  console.log("💡 This test works WITHOUT webhooks!");
  console.log("   Payment verification happens on the frontend callback");
  console.log("");
  console.log("🔧 Test Cards:");
  console.log("   Success: 4111 1111 1111 1111");
  console.log("   Failure: 4000 0000 0000 0002");
  console.log("   CVV: Any 3 digits");
  console.log("   Expiry: Any future date");
});
