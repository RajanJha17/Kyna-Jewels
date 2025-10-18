# 🧪 Testing Sequel247 API Integration

This guide shows you how to test if Sequel247's API is responding correctly to your requests.

## 🎯 What These Tests Do

These tests will verify:
- ✅ Sequel247 API is accessible and responding
- ✅ Your JSON requests are formatted correctly
- ✅ Sequel247 responds with correct JSON format
- ✅ Response fields match the documentation
- ✅ Status codes are mapped correctly
- ✅ Your implementation can parse Sequel247 responses

## 🚀 Quick Start - Test Sequel247 API

### Option 1: Using Node.js (Recommended)

```bash
cd server
node test-sequel247-api.js
```

### Option 2: Using PowerShell (Windows)

```powershell
cd server
.\test-sequel247-api.ps1
```

## 📋 What Will Be Tested

### 1. **Serviceability Check API**
Tests if Sequel247 can check pincode serviceability:
```json
Request:
{
  "token": "YOUR_TOKEN",
  "pin_code": "560078"
}

Expected Response:
{
  "status": "true",
  "message": "Pincode is servieceable",
  "data": {
    "city": "BANGALORE",
    "hub": "BANGALORE",
    "state": "KARNATAKA"
  }
}
```

### 2. **Track Shipment API**
Tests if Sequel247 tracking API works:
```json
Request:
{
  "token": "YOUR_TOKEN",
  "docket": "0581094993"
}

Expected Response:
{
  "status": "true",
  "data": {
    "docket_no": "0581094993",
    "shipment_status": "SDELVD",
    "tracking": [
      {
        "description": "Shipment is Created",
        "location": "BANGALORE",
        "date_time": "2017-02-27 12:26:00",
        "code": "SCREATED"
      }
    ],
    "estimated_delivery": "14-06-2017 20:00"
  }
}
```

### 3. **Calculate EDD API**
Tests estimated delivery date calculation:
```json
Request:
{
  "token": "YOUR_TOKEN",
  "origin_pincode": "560001",
  "destination_pincode": "110001",
  "pickup_date": "2024-01-20"
}

Expected Response:
{
  "status": "true",
  "data": {
    "estimated_delivery": "22-01-2024 20:00",
    "estimated_day": "Monday"
  }
}
```

### 4. **JSON Format Validation**
Verifies request/response formats match documentation.

## 📊 Understanding Test Results

### ✅ Success Indicators

```
✅ Sequel247 API is responding!
📦 Response Status: 200
✅ Successfully retrieved tracking information
✅ Pincode 560078 is serviceable
```

**What this means:**
- Sequel247 API is working correctly
- Your credentials are valid
- JSON format is correct
- You can proceed with real orders

### ⚠️ Expected Warnings

```
⚠️ Track API Error (This is expected if docket doesn't exist)
ℹ️ This error is expected - test docket may not exist
✅ But the API is responding correctly with proper error format
```

**What this means:**
- Test docket number doesn't exist (normal)
- But API is still responding correctly
- Error format is as expected
- Your implementation will work with real dockets

### ❌ Error Indicators

```
❌ ERROR: Sequel247 token is not configured!
❌ Serviceability API Error
Status: 401 Unauthorized
```

**What this means:**
- Check your `.env` file
- Ensure `SEQUEL247_TEST_TOKEN` is set
- Token might be invalid or expired
- Contact Sequel247 support

## 🔧 Prerequisites

Before running tests, ensure you have:

1. **Environment Variables Set** (in `server/.env`):
   ```env
   SEQUEL247_TEST_ENDPOINT=https://test.sequel247.com/
   SEQUEL247_TEST_TOKEN=your_test_token_here
   SEQUEL247_PROD_ENDPOINT=https://sequel247.com/
   SEQUEL247_PROD_TOKEN=your_prod_token_here
   SEQUEL247_STORE_CODE=BLRAK
   NODE_ENV=development
   ```

2. **Dependencies Installed**:
   ```bash
   cd server
   npm install
   ```

## 🧪 Testing with Real Docket Numbers

Once you have a real docket number from Sequel247:

### Using cURL:
```bash
curl -X POST https://test.sequel247.com/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "docket": "YOUR_DOCKET_NUMBER"
  }'
```

### Using Your Application:
```bash
# Start your server
cd server
npm run dev

# Test manual tracking update
curl -X POST http://localhost:5000/api/tracking/manual-update
```

## 📈 Monitoring Real Tracking

After confirming Sequel247 is responding:

1. **Create an order in your system**
2. **Ship the order with a docket number**:
   ```bash
   curl -X POST http://localhost:5000/api/orders/admin/{orderId}/ship \
     -H "Content-Type: application/json" \
     -d '{
       "docketNumber": "YOUR_REAL_DOCKET",
       "courierService": "Sequel247"
     }'
   ```

3. **Monitor automatic updates** (every 30 minutes):
   - Check server logs for: `🔄 Running automatic tracking update job...`
   - Look for: `✅ Order ORD123: PROCESSING → ON_THE_ROAD`

4. **Test manual update**:
   ```bash
   curl -X POST http://localhost:5000/api/tracking/manual-update
   ```

## 🔍 Status Code Mapping

Your system correctly maps Sequel247 status codes:

| Sequel247 Code | Your System Status | Description |
|---------------|-------------------|-------------|
| `SCREATED` | `ORDER_PLACED` | Shipment Created |
| `SCHECKIN` | `PROCESSING` | Checked In at Hub |
| `SPU` | `PACKAGING` | Picked Up |
| `SLINORIN` | `ON_THE_ROAD` | In Transit from Origin |
| `SLINDEST` | `ON_THE_ROAD` | Arrived at Destination |
| `SDELASN` | `ON_THE_ROAD` | Out for Delivery |
| `SDELVD` | `DELIVERED` | Delivered Successfully |
| `SCANCELLED` | `CANCELLED` | Shipment Cancelled |

## 🆘 Troubleshooting

### Issue: "Token is not configured"
**Solution:** Set `SEQUEL247_TEST_TOKEN` in your `.env` file

### Issue: "Connection timeout"
**Solution:** 
- Check your internet connection
- Verify endpoint URL is correct
- Check if Sequel247 API is down

### Issue: "Invalid token" (401 error)
**Solution:**
- Verify token is correct
- Check if using TEST token for TEST endpoint
- Contact Sequel247 to verify token is active

### Issue: "Docket not found" (expected for tests)
**Solution:**
- This is normal for test dockets
- Use real docket numbers from Sequel247
- Create a shipment first to get a docket

## 📞 Support

- **Sequel247 API Issues:** Contact Sequel247 support
- **Your Implementation Issues:** Check server logs
- **Integration Help:** Review `server/COMPLETE_TRACKING_SYSTEM.md`

## ✨ Success Checklist

After running tests, you should see:

- [x] ✅ Sequel247 API is responding
- [x] ✅ Your JSON requests are formatted correctly
- [x] ✅ Response fields match documentation
- [x] ✅ Status codes map correctly
- [x] ✅ Error handling works properly

**If all items are checked, your Sequel247 integration is working perfectly!** 🎉

