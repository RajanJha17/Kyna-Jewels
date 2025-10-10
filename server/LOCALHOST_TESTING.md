# Testing Razorpay Payments on Localhost

## Option 1: Test Without Webhooks (Quickest)

Your payment integration will work perfectly without webhooks for development. The frontend handles payment verification directly.

### Quick Test:

1. **Start the test server:**

```bash
cd server
node test-payment-simple.js
```

2. **Open browser:**
   Go to `http://localhost:3001/test-payment-page`

3. **Test with these cards:**

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

This tests the complete flow: Order creation → Payment → Verification

---

## Option 2: ngrok for Webhook Testing

If you want to test webhooks, use ngrok to expose your localhost.

### Setup ngrok:

1. **Install ngrok:**

   - Download from [ngrok.com](https://ngrok.com)
   - Sign up for free account
   - Extract the executable

2. **Authenticate:**

```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

3. **Start your server:**

```bash
npm run dev  # Your main server on port 5000
```

4. **In another terminal, start ngrok:**

```bash
ngrok http 5000
```

5. **Copy the HTTPS URL** (something like `https://abc123.ngrok.io`)

6. **Configure Razorpay Webhooks:**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Settings → Webhooks
   - Add URL: `https://abc123.ngrok.io/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`

---

## Option 3: LocalTunnel (Alternative to ngrok)

Free alternative to ngrok:

1. **Install:**

```bash
npm install -g localtunnel
```

2. **Start tunnel:**

```bash
lt --port 5000 --subdomain kyna-jewels
```

3. **Use URL:** `https://kyna-jewels.loca.lt`

---

## Option 4: Mock Webhooks for Testing

Create a simple webhook simulator:

### Create webhook test script:

```javascript
// test-webhook.js
const axios = require("axios");

async function simulateWebhook() {
  const webhookData = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test123",
          order_id: "order_test123",
          status: "captured",
          amount: 10000,
          currency: "INR",
          method: "card",
          captured: true,
          created_at: Date.now(),
        },
      },
    },
  };

  try {
    const response = await axios.post(
      "http://localhost:5000/api/payment/webhook",
      webhookData,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Razorpay-Signature": "mock_signature",
        },
      }
    );
    console.log("✅ Webhook test:", response.data);
  } catch (error) {
    console.error("❌ Webhook test failed:", error.message);
  }
}

simulateWebhook();
```

---

## Recommended Approach for Development

### Phase 1: Basic Testing (No Webhooks)

1. Use the simple test server above
2. Test payment flow with test cards
3. Verify frontend integration works

### Phase 2: Full Integration Testing (With Webhooks)

1. Use ngrok for webhook testing
2. Test real webhook scenarios
3. Verify webhook signature validation

### Phase 3: Production Ready

1. Replace test keys with live keys
2. Configure production webhook URLs
3. Deploy to production server

---

## Test Card Numbers

### Success Cards:

- `4111 1111 1111 1111` (Visa)
- `5555 5555 5555 4444` (Mastercard)
- `3782 8224 6310 005` (American Express)

### Failure Cards:

- `4000 0000 0000 0002` (Generic failure)
- `4000 0000 0000 0069` (Expired card)
- `4000 0000 0000 0119` (Processing error)

### CVV & Expiry:

- **CVV**: Any 3 digits (4 for Amex)
- **Expiry**: Any future date

---

## Environment Variables for Testing

Make sure your `.env` has:

```env
# Use test credentials for development
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

NODE_ENV=development
PORT=5000
```

The key point is: **You don't need webhooks to test payments!** The frontend verification flow is sufficient for development and testing.
