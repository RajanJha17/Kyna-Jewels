# Test Instructions for Protected Track Order Route

## Issue
User logged in as `tiwariaditya1810@gmail.com` is seeing orders from `addytiw1810@gmail.com` too.

## Database State
✅ Database is correct:
- `tiwariaditya1810@gmail.com`: 3 orders
- `addytiw1810@gmail.com`: 6 orders

## Code Changes Made
✅ Backend controller filters by user email
✅ Frontend route is protected
✅ Auth middleware extracts user correctly
✅ Added extensive logging

## IMPORTANT: Restart Backend Server

**The backend server MUST be restarted to pick up the new code changes!**

### How to Restart:

1. **Stop the current backend server:**
   - Go to the terminal running the backend
   - Press `Ctrl+C` to stop it

2. **Start the backend server again:**
   ```bash
   cd server
   npm run dev
   ```

3. **Clear browser cache and cookies:**
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Storage → Clear site data
   - Or just log out and log back in

## Testing Steps

### Test 1: Login as tiwariaditya1810@gmail.com

1. **Logout** if already logged in
2. **Login** with `tiwariaditya1810@gmail.com` / `12345678`
3. Go to `/track-order`
4. **Expected**: Should see ONLY 3 orders:
   - ORD1761032991634001 (normal, IN_TRANSIT)
   - ORD1761032991634002 (customized, PROCESSING)
   - ORD1761032991634003 (normal, DELIVERED)

5. **Check backend console logs:**
   - Look for: `🔐 Auth Middleware - User authenticated: tiwariaditya1810@gmail.com`
   - Look for: `📧 Fetching orders for user email: tiwariaditya1810@gmail.com`
   - Look for: `🔍 Filtering by email: tiwariaditya1810@gmail.com`
   - Look for: `✅ Found 3 orders for user tiwariaditya1810@gmail.com`
   - Should log each order with its email

### Test 2: Login as addytiw1810@gmail.com

1. **Logout**
2. **Login** with `addytiw1810@gmail.com` / (password)
3. Go to `/track-order`
4. **Expected**: Should see ONLY 6 orders (all for addytiw1810@gmail.com)

5. **Check backend console logs:**
   - Look for: `🔐 Auth Middleware - User authenticated: addytiw1810@gmail.com`
   - Look for: `📧 Fetching orders for user email: addytiw1810@gmail.com`
   - Look for: `🔍 Filtering by email: addytiw1810@gmail.com`
   - Look for: `✅ Found 6 orders for user addytiw1810@gmail.com`

## What to Check in Backend Logs

When you refresh the `/track-order` page, you should see this sequence in the backend console:

```
🔐 Auth Middleware - User authenticated: tiwariaditya1810@gmail.com
📧 Fetching orders for user email: tiwariaditya1810@gmail.com
📧 User object: {
  "_id": "...",
  "email": "tiwariaditya1810@gmail.com",
  ...
}
🔍 Filtering by email: tiwariaditya1810@gmail.com
✅ Found 3 orders for user tiwariaditya1810@gmail.com
   Order 1: ORD1761032991634001 - Email: tiwariaditya1810@gmail.com
   Order 2: ORD1761032991634002 - Email: tiwariaditya1810@gmail.com
   Order 3: ORD1761032991634003 - Email: tiwariaditya1810@gmail.com
```

## If Still Seeing Wrong Orders

1. **Check if backend restarted:**
   - Look for startup messages in backend console
   - Should see "Server running on port 5000" or similar

2. **Check browser console:**
   - Open DevTools → Console
   - Look for the API response
   - Check what data is being returned

3. **Clear all caches:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   // Then refresh
   ```

4. **Check if using correct backend URL:**
   - Frontend should call `http://localhost:5000/api/tracking/test-orders`
   - Check Network tab in DevTools

5. **Verify JWT token is correct:**
   ```javascript
   // In browser console
   console.log(document.cookie);
   // Should see token for the logged-in user
   ```

## Files Modified
- `server/src/controllers/trackingController.ts` - Added detailed logging
- `server/src/middleware/auth.ts` - Added authentication logging
- `server/check-orders-db.js` - Script to verify database state

## Next Steps
1. ✅ Restart backend server
2. ✅ Clear browser cache/cookies
3. ✅ Test with both users
4. ✅ Check backend console logs
5. ✅ Report what you see in the logs


