# Protected Track Order Route Implementation

## Overview
The track order page is now a **protected route** that requires user authentication. Users can only view and track orders associated with their logged-in email address.

## Changes Made

### 1. Backend Changes

#### **`server/src/routes/tracking.ts`**
- Added `authenticateToken` middleware import
- Protected the `/test-orders` endpoint with authentication
```typescript
router.get('/test-orders', authenticateToken, generalRateLimit, (req, res) => {
  // Only authenticated users can access
});
```

#### **`server/src/controllers/trackingController.ts`**
- Updated `getAllTestOrders` method to filter orders by logged-in user's email
- Method now:
  1. Extracts user from `req.user` (set by `authenticateToken` middleware)
  2. Queries `TrackingOrder` collection filtering by `customerEmail`
  3. Returns only orders matching the authenticated user's email
  4. Returns appropriate error if user is not authenticated

```typescript
// Get user from request (set by authenticateToken middleware)
const user = (req as any).user;
if (!user || !user.email) {
  return error response;
}

// Fetch only orders for the logged-in user's email
const orders = await TrackingOrder.find({ 
  customerEmail: user.email.toLowerCase() 
})
```

### 2. Frontend Changes

#### **`client/src/App.tsx`**
- Wrapped `/track-order` route with `PrivateRoute` component
- Users must be logged in to access the tracking page
- Unauthenticated users are redirected to `/login`

```tsx
<Route
  path="/track-order"
  element={
    <PrivateRoute>
      <TrackOrderPage />
    </PrivateRoute>
  }
/>
```

#### **`client/src/pages/TrackOrderPage.tsx`**
- Updated order list heading from "Test Orders from Database" to "Your Orders"
- Added console logging for debugging authentication and order fetching
- Improved error handling for authentication failures

#### **`client/src/services/api.ts`**
- Already configured to send authentication token in headers
- Uses `getAccessToken()` to include JWT token in API requests
- Includes `credentials: 'include'` for cookie-based auth

### 3. Helper Scripts

#### **`server/add-orders-for-user.js`**
- Script to add sample orders for testing
- Usage: `node add-orders-for-user.js <user-email>`
- Creates 3 sample orders:
  1. **Normal order (In Transit)** - Can be cancelled
  2. **Customized order (Processing)** - Cannot be cancelled
  3. **Normal order (Delivered)** - Can download POD

## How It Works

### Authentication Flow

1. **User Login**
   - User logs in via `/login` page
   - Backend returns JWT token (in cookie and/or response)
   - Token stored in cookies and localStorage

2. **Accessing Track Order Page**
   - Frontend `PrivateRoute` checks authentication status
   - If not authenticated → redirect to `/login`
   - If authenticated → allow access to page

3. **Fetching Orders**
   - Frontend calls `trackingApi.getAllTestOrders()`
   - API service includes JWT token in request headers
   - Backend `authenticateToken` middleware verifies token
   - Controller extracts user email from decoded token
   - Database query filters orders by user's email
   - Returns only that user's orders

### Security Features

✅ **Route Protection**: Only authenticated users can access
✅ **Email-based Filtering**: Users only see their own orders
✅ **Token Verification**: JWT tokens are validated on backend
✅ **Automatic Redirection**: Unauthenticated users sent to login
✅ **Error Handling**: Proper error messages for auth failures

## Testing

### 1. Add Orders for a User
```bash
# From server directory
node add-orders-for-user.js <user-email>

# Example
node add-orders-for-user.js tiwariaditya1810@gmail.com
```

### 2. Test the Protected Route

**Without Login:**
1. Navigate to `/track-order` (not logged in)
2. Should redirect to `/login` page

**With Login:**
1. Login with user credentials
2. Navigate to `/track-order`
3. Should see "Your Orders" section with orders for that user only
4. Try logging in with different users - each sees only their orders

### 3. Test Order Features

**Normal Order (In Transit):**
- Should show "Cancel Order" button
- Can be cancelled before delivery

**Customized Order:**
- Should NOT show "Cancel Order" button
- Cannot be cancelled (customized products policy)

**Delivered Order:**
- Should show "Proof of Delivery" button
- Can download POD PDF

## API Endpoints

### GET `/api/tracking/test-orders`
**Protected**: Yes (requires authentication)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Cookie: token=<JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderNumber": "ORD123456",
      "email": "user@example.com",
      "customerName": "John Doe",
      "status": "IN_TRANSIT",
      "orderType": "normal",
      "amount": 25000,
      "productName": "Diamond Ring",
      "docketNumber": "DKT123456",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "message": "Found 3 orders for your account"
}
```

**Error (Not Authenticated):**
```json
{
  "success": false,
  "error": "Access token required"
}
```

## User Experience

### For Customers:

1. **Login Required**: Must create account and login to track orders
2. **Privacy**: Can only see their own orders (not other customers' orders)
3. **Order Management**: Can track, cancel (if eligible), and download POD for their orders
4. **Personalized**: "Your Orders" section shows real orders, not test data

### For Developers:

1. **Easy Testing**: Use `add-orders-for-user.js` to create test orders
2. **Debugging**: Console logs show authentication and order fetching process
3. **Flexible**: Can add orders for any user email
4. **Realistic**: Sample orders cover different order types and statuses

## Database Schema

Orders are stored in `TrackingOrder` collection with:
- `customerEmail`: Email of the customer (used for filtering)
- `orderNumber`: Unique order identifier
- `orderType`: 'normal' or 'customized'
- `status`: Current order status
- `docketNumber`: Shipping tracking number
- Other fields: items, addresses, tracking history, etc.

## Security Considerations

1. ✅ JWT tokens validated on every request
2. ✅ Email-based access control
3. ✅ No order data leakage between users
4. ✅ Protected routes on both frontend and backend
5. ✅ Proper error messages (no sensitive info leaked)

## Future Enhancements

- [ ] Add order filtering (by status, date range)
- [ ] Add pagination for users with many orders
- [ ] Add order search functionality
- [ ] Email notifications for order updates
- [ ] Push notifications for mobile app

## Troubleshooting

### Issue: "Access token required" error
**Solution**: Ensure user is logged in and token is stored in cookies/localStorage

### Issue: Orders not showing
**Solution**: 
- Check if orders exist for that user's email in database
- Use `add-orders-for-user.js` to create test orders
- Verify email matches exactly (case-insensitive comparison is done)

### Issue: Can't access tracking page
**Solution**: User must be logged in. Check `isAuthenticated` in Redux state

### Issue: Seeing other users' orders
**Solution**: Should not happen. Backend filters by email. Check authentication middleware.

## Commands Summary

```bash
# Add test orders for a user
node add-orders-for-user.js <email>

# Example
node add-orders-for-user.js tiwariaditya1810@gmail.com

# Start backend server
npm run dev

# Start frontend server  
cd client && npm run dev
```

## Files Modified

**Backend:**
- `server/src/routes/tracking.ts`
- `server/src/controllers/trackingController.ts`

**Frontend:**
- `client/src/App.tsx`
- `client/src/pages/TrackOrderPage.tsx`

**New Files:**
- `server/add-orders-for-user.js`
- `server/PROTECTED_TRACKING_ROUTE.md`

---

✅ **Implementation Complete**: Track order page is now fully protected and user-specific!

