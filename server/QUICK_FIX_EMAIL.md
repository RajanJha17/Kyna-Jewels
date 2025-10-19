# ⚡ QUICK FIX: Email Verification Error

## Problem
```
Error: Invalid login: 534-5.7.9 Application-specific password required
```

## Cause
The password `mxxvjzykttnvpqbi` is **NOT** a valid App Password for `enquiries@kynajewels.com`

## Solution (5 Minutes)

### 1️⃣ Generate NEW App Password

**Go to:** https://myaccount.google.com/apppasswords

**Steps:**
1. Log in with `enquiries@kynajewels.com`
2. Select app: **Mail**
3. Select device: **Other** → Name it "Kyna Backend"
4. Click **Generate**
5. Copy the 16-character password (like: `abcd efgh ijkl mnop`)
6. **Remove spaces:** `abcdefghijklmnop`

---

### 2️⃣ Create `.env` File

**Location:** `server/.env`

**Content:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/kyna-jewels
JWT_SECRET=kyna-jewels-super-secret-jwt-key-min-32-characters-long-2024

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=YOUR_NEW_PASSWORD_HERE_NO_SPACES
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
EMAIL_SECURE=false
```

**Replace `YOUR_NEW_PASSWORD_HERE_NO_SPACES` with your new 16-char password!**

---

### 3️⃣ Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### 4️⃣ Test Signup

```bash
POST http://localhost:5000/api/auth/signup

{
  "name": "Test",
  "email": "test@gmail.com",
  "password": "Test123!"
}
```

**Expected:**
- ✅ User created
- ✅ Email sent with OTP
- ✅ No errors!

---

## ⚠️ Important Notes

1. **Password must be 16 characters** (no more, no less)
2. **Remove ALL spaces** from the password
3. **2-Step Verification** must be enabled on Gmail
4. **`.env` file location:** `server/.env` (not root)

---

## 📋 Templates Created

- ✅ `server/ENV_TEMPLATE.txt` - Copy this to `.env`
- ✅ `server/FIX_EMAIL_ERROR.md` - Detailed instructions
- ✅ `server/QUICK_FIX_EMAIL.md` - This file

---

## ✨ After Fix

### Before:
```
❌ Error: Invalid login
✅ User created (no email)
```

### After:
```
✅ Verification email sent successfully
✅ User created  
✅ Email received with OTP
```

---

**Follow these 4 steps and your email will work!** 📧✅

