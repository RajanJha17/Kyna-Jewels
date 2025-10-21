# 🔐 Authentication Issue Explained

## The Problem

You see `401 Unauthorized` even though "token is available" in cookies.

## Root Cause

The token cookie is set with `httpOnly: true` (in `server/src/utils/generateTokenAndSetCookie.ts`):

```typescript
res.cookie("token", token, {
  httpOnly: true,  // ← THIS IS THE ISSUE
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### What `httpOnly: true` means:

- ✅ **Good**: Cookie is protected from XSS attacks (JavaScript cannot access it)
- ❌ **Bad**: `document.cookie` in JavaScript returns empty/cannot see this cookie
- ✅ **Good**: Cookie is automatically sent with requests (via `credentials: "include"`)
- ❌ **Bad**: Frontend cannot read it to put in `Authorization` header

## Why You See This Issue

### Authentication Flow:

1. **Login (works):**
   - User logs in → Backend returns token in response body
   - Frontend saves token to sessionStorage/localStorage ✅
   - Backend also sets httpOnly cookie ✅
   - Frontend can make authenticated requests ✅

2. **Page Refresh or Direct Navigation (FAILS):**
   - User refreshes page or navigates directly to `/track-order`
   - sessionStorage/localStorage is lost (or never had token)
   - Cookie still exists BUT JavaScript can't read it ❌
   - Frontend tries to read `document.cookie` → Returns nothing
   - No token in sessionStorage → `getAccessToken()` returns `null`
   - API request sent without `Authorization` header ❌
   - Backend sees no token → 401 Unauthorized ❌

## Current System Has Two Token Mechanisms

### 1. Cookie-based (httpOnly)
- ✅ Sent automatically with `credentials: "include"`
- ✅ Backend middleware checks `req.cookies.token`
- ❌ Frontend cannot read to put in Authorization header

### 2. Header-based (Authorization: Bearer)
- ✅ Frontend adds `Authorization: Bearer <token>` header
- ✅ Backend middleware checks `headers.authorization`
- ❌ Token must be in sessionStorage/localStorage
- ❌ Lost on page refresh if not persisted

## The Solution

You have 3 options:

### Option 1: Use ONLY Cookie-based Auth (Recommended for Production)

**Change backend middleware** to ONLY check cookies, don't require Authorization header:

```typescript
// server/src/middleware/auth.ts
export const authenticateToken = async (req, res, next) => {
  try {
    // Only get token from cookies
    const token = req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }
    
    // ... rest of verification
  }
}
```

**And remove Authorization header from frontend**:
```typescript
// client/src/services/api.ts
const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    // DON'T add Authorization header
  },
  credentials: "include", // This sends the cookie
});
```

### Option 2: Use ONLY Header-based Auth

**Change backend cookie to NOT be httpOnly:**

```typescript
// server/src/utils/generateTokenAndSetCookie.ts
res.cookie("token", token, {
  httpOnly: false,  // ← Allow JavaScript to read it
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Keep frontend code as-is** - it will read from cookie and add to Authorization header.

### Option 3: Keep Both (Current System - Needs Fix)

**Update TrackOrderPage to handle missing token gracefully** and redirect to login:

```typescript
useEffect(() => {
  const currentToken = getAccessToken();
  
  if (!currentToken) {
    // No token in storage - redirect to login
    navigate('/login');
    return;
  }
  
  // Fetch orders...
}, []);
```

## What You Should Do RIGHT NOW

### Test 1: Login from Scratch

1. **Clear all storage**:
   - Open DevTools (F12) → Console
   - Run: `localStorage.clear(); sessionStorage.clear();`
   - Close and reopen browser (to clear cookies too)

2. **Go to login page**: `http://localhost:5173/login`

3. **Login with**: `tiwariaditya1810@gmail.com` / `12345678`

4. **Check console logs** - you should see:
   ```
   ✅ SAVING TOKEN: eyJhbGciOiJIUzI1NiI...
   ✅ Token verified in sessionStorage: YES
   🚀 Navigating to /track-order
   ```

5. **After redirect**, you should see orders! ✅

### Test 2: After Page Refresh

1. After successful login and seeing orders
2. **Refresh the page** (F5)
3. **Check what happens**:
   - If sessionStorage persists → Orders still visible ✅
   - If sessionStorage cleared → 401 error (needs Option 1 or 2 fix)

## Recommended Long-term Fix

**Use Option 1 (Cookie-only auth)** because:
- ✅ More secure (httpOnly protects from XSS)
- ✅ Survives page refreshes
- ✅ Automatically sent with requests
- ✅ Backend handles everything
- ✅ Frontend simpler (no token management)

The backend middleware ALREADY supports cookies (line 15 checks `req.cookies.token`), so you just need to:
1. Make frontend NOT require token in storage
2. Make frontend NOT add Authorization header
3. Keep `credentials: "include"` (already there)

Would you like me to implement Option 1 now?

