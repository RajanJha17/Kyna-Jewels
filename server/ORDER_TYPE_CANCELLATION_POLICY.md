# 📋 Order Type & Cancellation Policy Implementation

**Date**: October 18, 2025  
**Feature**: Order Type Field with Cancellation Policy  
**Status**: ✅ **FULLY IMPLEMENTED**

---

## 🎯 Overview

Implemented a new `orderType` field in the orders system that determines whether a customer can cancel their order. This ensures that customized products (Build Your Own, Upload Your Own, Engraved) cannot be cancelled once placed, while normal products can be cancelled before delivery.

---

## 📊 Order Types

| Order Type | Value | Can Cancel? | Description |
|------------|-------|-------------|-------------|
| **Normal Products** | `normal` | ✅ **YES** | Standard jewelry items from catalog |
| **Build Your Own** | `build-your-own` | ❌ **NO** | Custom-built jewelry pieces |
| **Upload Your Own** | `upload-your-own` | ❌ **NO** | Custom designs uploaded by customer |
| **Engraved** | `engraved` | ❌ **NO** | Jewelry with custom engravings |

---

## 🔧 Implementation Details

### 1. **Database Schema Updates**

#### OrderModel Schema
**File**: `server/src/models/orderModel.ts`

```typescript
export interface IOrder extends Document {
  // ... existing fields
  orderType: 'normal' | 'build-your-own' | 'upload-your-own' | 'engraved';
  // ... other fields
}

const orderSchema = new Schema<IOrder>({
  // ... existing schema
  orderType: { 
    type: String, 
    enum: ['normal', 'build-your-own', 'upload-your-own', 'engraved'],
    default: 'normal',
    required: true
  },
  // ... other fields
});
```

#### TrackingOrder Schema
**File**: `server/src/models/TrackingOrder.ts`

```typescript
const TrackingOrderSchema = new Schema<TrackingOrderDocument>({
  // ... existing fields
  orderType: {
    type: String,
    enum: ['normal', 'build-your-own', 'upload-your-own', 'engraved'],
    default: 'normal',
    required: true
  },
  // ... other fields
});
```

#### TypeScript Interface
**File**: `server/src/types/tracking.ts`

```typescript
export interface TrackingOrder {
  // ... existing fields
  orderType: 'normal' | 'build-your-own' | 'upload-your-own' | 'engraved';
  // ... other fields
}
```

---

### 2. **Cancellation Logic Implementation**

#### Backend Controller
**File**: `server/src/controllers/trackingController.ts`

```typescript
cancelShipment = async (req, res, next) => {
  // ... validation code
  
  // Check order type - only 'normal' orders can be cancelled
  const { TrackingOrder } = await import('../models/TrackingOrder');
  const trackingOrder = await TrackingOrder.findOne({ docketNumber });
  
  if (trackingOrder && trackingOrder.orderType !== 'normal') {
    const orderTypeLabel = trackingOrder.orderType === 'build-your-own' 
      ? 'Build Your Own'
      : trackingOrder.orderType === 'upload-your-own'
      ? 'Upload Your Own'
      : trackingOrder.orderType === 'engraved'
      ? 'Engraved'
      : trackingOrder.orderType;

    return res.status(403).json({
      success: false,
      error: `Cannot cancel ${orderTypeLabel} orders. Customized orders cannot be cancelled once placed.`
    });
  }
  
  // Continue with cancellation...
};
```

**Error Responses:**
```json
// For Build Your Own orders:
{
  "success": false,
  "error": "Cannot cancel Build Your Own orders. Customized orders cannot be cancelled once placed."
}

// For Upload Your Own orders:
{
  "success": false,
  "error": "Cannot cancel Upload Your Own orders. Customized orders cannot be cancelled once placed."
}

// For Engraved orders:
{
  "success": false,
  "error": "Cannot cancel Engraved orders. Customized orders cannot be cancelled once placed."
}
```

---

### 3. **Frontend Implementation**

#### TrackOrderPage Component
**File**: `client/src/pages/TrackOrderPage.tsx`

**Interface Update:**
```typescript
interface TrackingData {
  // ... existing fields
  orderType?: 'normal' | 'build-your-own' | 'upload-your-own' | 'engraved';
  // ... other fields
}
```

**Cancellation Check:**
```typescript
const canCancelOrder = () => {
  if (!trackingData) return false;
  const status = trackingData.status.toUpperCase();
  const orderType = trackingData.orderType || 'normal';
  
  // Only normal products can be cancelled
  // Customized products (build-your-own, upload-your-own, engraved) cannot be cancelled
  return (
    trackingData.docketNumber &&
    status !== "DELIVERED" &&
    status !== "CANCELLED" &&
    orderType === 'normal'  // ✅ NEW CHECK
  );
};
```

**UI Behavior:**
- ✅ Cancel button **visible** for normal products
- ❌ Cancel button **hidden** for customized products
- ✅ Backend validation as additional security layer

---

### 4. **Sample Data Updates**

#### Seed Data
**File**: `server/src/utils/seedTrackingData.ts`

```typescript
const sampleOrders = [
  {
    orderNumber: 'KYNA12345678',
    orderType: 'normal', // ✅ Can be cancelled
    status: OrderStatus.ON_THE_ROAD,
    // ... other fields
  },
  {
    orderNumber: 'KYNA87654321',
    orderType: 'build-your-own', // ❌ Cannot be cancelled
    status: OrderStatus.DELIVERED,
    // ... other fields
  }
];
```

---

## 🔐 Security & Validation

### Multi-Layer Protection

1. **Frontend Validation** ✅
   - Cancel button hidden for non-normal orders
   - User cannot initiate cancellation

2. **Backend Validation** ✅
   - Order type checked before Sequel247 API call
   - Returns 403 Forbidden for customized orders
   - Clear error message explaining why

3. **Database Schema** ✅
   - Enum validation ensures only valid order types
   - Default value of 'normal' for backward compatibility

---

## 📋 API Response Examples

### Successful Cancellation (Normal Product)
```json
POST /api/tracking/cancel-shipment

Request:
{
  "docketNumber": "SEQ123456789",
  "reason": "Customer changed mind",
  "orderNumber": "ORD123456",
  "email": "customer@example.com"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "cancelled": true,
    "docketNumber": "SEQ123456789"
  },
  "message": "Shipment cancelled successfully"
}
```

### Failed Cancellation (Customized Product)
```json
POST /api/tracking/cancel-shipment

Request:
{
  "docketNumber": "SEQ987654321",
  "reason": "Want to cancel",
  "orderNumber": "ORD789012",
  "email": "customer@example.com"
}

Response: 403 Forbidden
{
  "success": false,
  "error": "Cannot cancel Build Your Own orders. Customized orders cannot be cancelled once placed."
}
```

---

## 🎨 User Experience

### For Normal Products:
1. ✅ User tracks order
2. ✅ Sees "Cancel Order" button (if not delivered/cancelled)
3. ✅ Clicks button → dialog opens
4. ✅ Enters reason → cancellation proceeds
5. ✅ Order cancelled with Sequel247
6. ✅ Database updated
7. ✅ Success message shown

### For Customized Products:
1. ✅ User tracks order
2. ❌ "Cancel Order" button is **hidden**
3. ❌ Cannot initiate cancellation from UI
4. ✅ If somehow API called (e.g., via Postman), backend rejects with clear error

---

## 🧪 Testing Scenarios

### Test Case 1: Cancel Normal Product ✅
```bash
# Should succeed
curl -X POST http://localhost:5000/api/tracking/cancel-shipment \
  -H "Content-Type: application/json" \
  -d '{
    "docketNumber": "SEQ_NORMAL_123",
    "reason": "Changed my mind",
    "orderNumber": "ORD_NORMAL",
    "email": "test@example.com"
  }'

Expected: 200 OK with success message
```

### Test Case 2: Cancel Build-Your-Own Product ❌
```bash
# Should fail
curl -X POST http://localhost:5000/api/tracking/cancel-shipment \
  -H "Content-Type: application/json" \
  -d '{
    "docketNumber": "SEQ_BYO_456",
    "reason": "Want to cancel",
    "orderNumber": "ORD_BYO",
    "email": "test@example.com"
  }'

Expected: 403 Forbidden with error message
```

### Test Case 3: Cancel Upload-Your-Own Product ❌
```bash
# Should fail
curl -X POST http://localhost:5000/api/tracking/cancel-shipment \
  -H "Content-Type: application/json" \
  -d '{
    "docketNumber": "SEQ_UYO_789",
    "reason": "Want to cancel",
    "orderNumber": "ORD_UYO",
    "email": "test@example.com"
  }'

Expected: 403 Forbidden with error message
```

### Test Case 4: Cancel Engraved Product ❌
```bash
# Should fail
curl -X POST http://localhost:5000/api/tracking/cancel-shipment \
  -H "Content-Type: application/json" \
  -d '{
    "docketNumber": "SEQ_ENG_012",
    "reason": "Want to cancel",
    "orderNumber": "ORD_ENG",
    "email": "test@example.com"
  }'

Expected: 403 Forbidden with error message
```

---

## 📝 Migration Notes

### For Existing Orders

**Default Behavior:**
- All existing orders without `orderType` field will default to `'normal'`
- This ensures backward compatibility
- Existing orders can be cancelled (as they were before)

**Updating Existing Orders:**
```javascript
// MongoDB shell or script
db.orders.updateMany(
  { orderType: { $exists: false } },
  { $set: { orderType: 'normal' } }
);

db.trackingorders.updateMany(
  { orderType: { $exists: false } },
  { $set: { orderType: 'normal' } }
);
```

---

## 🚀 Integration with Order Placement

### When Creating Orders (To be implemented by other developer)

**Order Controller** (example):
```typescript
// During order creation
const createOrder = async (req, res) => {
  const { items, orderType, ...otherData } = req.body;
  
  // Determine orderType based on items or explicit flag
  let finalOrderType = 'normal';
  
  if (orderType) {
    finalOrderType = orderType; // Explicitly set by frontend
  } else {
    // Or determine from items
    if (items.some(item => item.isBuildYourOwn)) {
      finalOrderType = 'build-your-own';
    } else if (items.some(item => item.isUploadYourOwn)) {
      finalOrderType = 'upload-your-own';
    } else if (items.some(item => item.isEngraved)) {
      finalOrderType = 'engraved';
    }
  }
  
  const order = new OrderModel({
    ...otherData,
    items,
    orderType: finalOrderType, // ✅ Set the order type
  });
  
  await order.save();
};
```

---

## ✅ Implementation Checklist

- [x] Add `orderType` field to OrderModel
- [x] Add `orderType` field to TrackingOrder model
- [x] Add `orderType` to TypeScript interfaces
- [x] Update cancel shipment controller logic
- [x] Add order type validation before cancellation
- [x] Update frontend interface
- [x] Update frontend cancellation check
- [x] Update seed data with order types
- [x] Build and test TypeScript compilation
- [x] Create documentation

---

## 📚 Summary

**What Changed:**
1. ✅ Added `orderType` field to order schemas
2. ✅ Implemented cancellation policy based on order type
3. ✅ Updated frontend to hide cancel button for customized orders
4. ✅ Added backend validation as security layer
5. ✅ Updated sample data to demonstrate both types

**Cancellation Policy:**
- ✅ **Normal products**: Can be cancelled before delivery
- ❌ **Build Your Own**: Cannot be cancelled (customized)
- ❌ **Upload Your Own**: Cannot be cancelled (customized)  
- ❌ **Engraved**: Cannot be cancelled (customized)

**Security:**
- ✅ Frontend hides button (UX layer)
- ✅ Backend validates order type (Security layer)
- ✅ Clear error messages for users
- ✅ Database schema validation

**Status**: **PRODUCTION READY** 🚀

---

*Note: The `orderType` field will be set during order placement by the other developer. This implementation handles the cancellation policy enforcement.*

