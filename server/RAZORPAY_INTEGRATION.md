# Razorpay Payment Integration

This document outlines the Razorpay payment gateway integration that has replaced the previous CCAvenue implementation.

## Overview

The application now uses Razorpay for processing payments, providing a more modern and developer-friendly payment experience with better security and reliability.

## Features

- ✅ Order creation and management
- ✅ Secure payment processing
- ✅ Payment signature verification
- ✅ Webhook support for real-time updates
- ✅ Refund processing
- ✅ Mobile-friendly checkout
- ✅ Multiple payment methods (Cards, UPI, Net Banking, Wallets)

## Environment Configuration

### Required Environment Variables

Add the following variables to your `.env` file:

```env
# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Getting Razorpay Credentials

1. **Sign up** at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Generate API Keys**:
   - Go to Settings → API Keys
   - Generate Test/Live keys
   - Copy Key ID and Key Secret
3. **Setup Webhooks** (Optional but recommended):
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Generate webhook secret

## API Endpoints

### 1. Initiate Payment

**POST** `/api/payment/initiate`

Creates a Razorpay order and returns checkout details.

**Request Body:**

```json
{
  "orderId": "ORDER_123",
  "amount": "1000.00",
  "currency": "INR",
  "billingInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "address": "123 Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zip": "400001",
    "country": "India"
  },
  "redirectUrl": "https://yoursite.com/payment-success",
  "cancelUrl": "https://yoursite.com/payment-cancel",
  "userId": "user_123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_razorpay_id",
    "razorpayKeyId": "rzp_test_key",
    "orderId": "ORDER_123",
    "amount": 100000,
    "currency": "INR",
    "name": "Kyna Jewels",
    "description": "Payment for jewelry order",
    "prefill": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+919876543210"
    },
    "theme": {
      "color": "#328F94"
    }
  },
  "message": "Payment initiated successfully"
}
```

### 2. Verify Payment

**POST** `/api/payment/verify`

Verifies payment signature and updates order status.

**Request Body:**

```json
{
  "razorpay_order_id": "order_razorpay_id",
  "razorpay_payment_id": "pay_razorpay_id",
  "razorpay_signature": "signature_hash",
  "orderId": "ORDER_123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_123",
    "status": "success",
    "paymentId": "pay_razorpay_id"
  },
  "message": "Payment verified successfully"
}
```

### 3. Payment Status

**GET** `/api/payment/status/:orderId`

Retrieves payment status for an order.

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "ORDER_123",
    "status": "success",
    "amount": 1000,
    "currency": "INR",
    "paymentResponse": {
      "razorpay_payment_id": "pay_razorpay_id",
      "method": "card",
      "captured": true
    }
  }
}
```

### 4. Webhook Handler

**POST** `/api/payment/webhook`

Handles Razorpay webhook events for real-time payment updates.

**Supported Events:**

- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed
- `order.paid` - Order fully paid

## Frontend Integration

### 1. Install Razorpay Checkout Script

The Razorpay checkout script is loaded dynamically. No manual installation required.

### 2. Payment Flow

```typescript
// 1. Initiate payment
const response = await paymentService.initiatePayment(paymentData);

// 2. Open Razorpay checkout
paymentService.openRazorpayCheckout(
  response.data,
  async (paymentResponse) => {
    // 3. Verify payment
    const verification = await paymentService.verifyPayment({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      orderId: response.data.orderId,
    });

    if (verification.success) {
      // Payment successful - redirect to success page
      window.location.href = "/payment-success";
    }
  },
  (error) => {
    // Handle payment error
    console.error("Payment failed:", error);
  }
);
```

## Security Features

### 1. Signature Verification

All payments are verified using HMAC SHA256 signature verification to ensure authenticity.

### 2. Webhook Signature Validation

Webhook payloads are validated using webhook secret to prevent tampering.

### 3. HTTPS Only

All payment processing occurs over HTTPS for secure data transmission.

## Testing

### 1. Test Credentials

Use Razorpay test credentials for development:

- Test Key ID: `rzp_test_xxxxxxxxx`
- Test Key Secret: `your_test_secret`

### 2. Test Cards

Razorpay provides test card numbers for testing:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### 3. Run Integration Test

```bash
cd server
node test-razorpay.js
```

## Migration from CCAvenue

### What Changed

1. **Environment Variables**: CCAvenue vars replaced with Razorpay vars
2. **Payment Flow**: Direct checkout instead of form submission
3. **Verification**: Signature-based verification instead of decryption
4. **Webhooks**: Real-time event handling
5. **Frontend**: Modern checkout experience

### Database Changes

- Added `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature` fields
- Updated `paymentResponse` schema for Razorpay data
- Maintained backward compatibility with existing orders

## Error Handling

### Common Errors

1. **Invalid API Keys**: Check credentials in Razorpay dashboard
2. **Signature Verification Failed**: Ensure correct order and payment IDs
3. **Network Issues**: Implement retry logic for API calls
4. **Webhook Failures**: Verify webhook URL and secret configuration

### Error Codes

- `BAD_REQUEST_ERROR`: Invalid request parameters
- `GATEWAY_ERROR`: Razorpay gateway issues
- `NETWORK_ERROR`: Network connectivity problems
- `SERVER_ERROR`: Internal server errors

## Support

### Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [API Reference](https://razorpay.com/docs/api/)
- [Webhook Guide](https://razorpay.com/docs/webhooks/)
- [Test Cards](https://razorpay.com/docs/payments/test-card-details/)

### Configuration Checklist

- [ ] Razorpay account created and activated
- [ ] API keys generated and added to environment
- [ ] Webhook URL configured in dashboard
- [ ] Test payment flow working
- [ ] Production keys updated for live deployment
- [ ] SSL certificate installed for webhook security

## Production Deployment

### Before Going Live

1. **Replace test keys** with live keys
2. **Configure webhooks** with production URLs
3. **Test thoroughly** with small amounts
4. **Set up monitoring** for payment failures
5. **Configure alerts** for webhook failures
6. **Update error handling** for production scenarios

### Monitoring

- Monitor payment success rates
- Track webhook delivery status
- Set up alerts for payment failures
- Regular reconciliation with Razorpay dashboard
