# 🚨 URGENT: Fix Email Error - Application-Specific Password Required

## ❌ Current Error:
```
Error: Invalid login: 534-5.7.9 Application-specific password required
```

## 🎯 Problem:
The password in your `.env` file is **NOT VALID** for Gmail `enquiries@kynajewels.com`

---

## ✅ SOLUTION (5 Steps):

### **Step 1: Enable 2-Step Verification**

1. Go to: https://myaccount.google.com/security
2. Log in with: **enquiries@kynajewels.com**
3. Find **"2-Step Verification"**
4. Click **"Get Started"** (if not already enabled)
5. Follow the setup (use phone number for verification)

---

### **Step 2: Generate App Password**

1. After 2-Step is enabled, go to: https://myaccount.google.com/apppasswords
2. If prompted, log in again
3. You'll see **"App passwords"** page
4. Select dropdown:
   - **Select app:** Mail
   - **Select device:** Other (Custom name)
5. Type name: **"Kyna Jewels Backend"**
6. Click **"Generate"**

---

### **Step 3: Copy the Password**

Google will show a 16-character password like:

```
abcd efgh ijkl mnop
```

**IMPORTANT:** 
- Copy this ENTIRE password
- Remove ALL spaces: `abcdefghijklmnop`
- This is your NEW App Password

---

### **Step 4: Update .env File**

Open: `server/.env`

Find this section:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=mxxvjzykttnvpqbi           ← REPLACE THIS
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
```

Replace with:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=abcdefghijklmnop           ← YOUR NEW PASSWORD (NO SPACES)
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
```

---

### **Step 5: Restart Server**

```bash
# Stop server (Ctrl+C)

# Start again
cd server
npm run dev
```

---

## 📋 Complete .env File Template

Your `server/.env` should look like this:

```env
# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV=development
PORT=5000

# ==========================================
# DATABASE
# ==========================================
MONGO_URI=mongodb://localhost:27017/kynajewels

# ==========================================
# AUTHENTICATION
# ==========================================
JWT_SECRET=kyna-jewels-super-secret-jwt-key-min-32-characters-long-2024

# ==========================================
# EMAIL CONFIGURATION (⚠️ UPDATE EMAIL_PASS)
# ==========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=YOUR_NEW_16_CHAR_APP_PASSWORD_HERE    ← REPLACE THIS!
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
EMAIL_SECURE=false

# ==========================================
# OPTIONAL (Not needed for signup)
# ==========================================
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CCAVENUE_MERCHANT_ID=test-merchant-id
CCAVENUE_ACCESS_CODE=test-access-code
CCAVENUE_WORKING_KEY=test-working-key
SEQUEL247_TEST_ENDPOINT=https://test.sequel247.com/
SEQUEL247_TEST_TOKEN=your-test-token
SEQUEL247_STORE_CODE=BLRAK
```

---

## 🧪 Test After Fix

After updating `.env` and restarting:

```bash
# Test signup
POST http://localhost:5000/api/auth/signup
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "Test123!"
}
```

**Expected Result:**
```
✅ User created successfully
✅ Verification email sent
✅ Email received with OTP code
```

---

## 🔍 Why Old Password Doesn't Work

The password `mxxvjzykttnvpqbi` might be:
- ❌ Generated for a different Gmail account
- ❌ Expired or revoked
- ❌ Created before 2-Step Verification was enabled
- ❌ Not a valid App Password at all

**You MUST generate a fresh new one from Google!**

---

## 📞 Quick Links

- **Google Security:** https://myaccount.google.com/security
- **App Passwords:** https://myaccount.google.com/apppasswords
- **2-Step Verification:** https://myaccount.google.com/signinoptions/two-step-verification

---

## ✅ Checklist

- [ ] Log in to Google Account (enquiries@kynajewels.com)
- [ ] Enable 2-Step Verification
- [ ] Generate NEW App Password
- [ ] Copy 16-character password (remove spaces)
- [ ] Update `server/.env` file
- [ ] Change `EMAIL_PASS=YOUR_NEW_PASSWORD`
- [ ] Save file
- [ ] Restart server
- [ ] Test signup
- [ ] Verify email is sent ✅

---

## 🎯 The ONLY Thing You Need to Change:

```env
# In server/.env file:

EMAIL_PASS=mxxvjzykttnvpqbi    ← OLD (doesn't work) ❌

EMAIL_PASS=abcdefghijklmnop    ← NEW (will work) ✅
```

**Replace with your actual 16-character App Password from Google!**

---

## 🆘 Need Help?

If you're stuck:
1. Make sure you're logged into **enquiries@kynajewels.com** (not a different account)
2. Make sure 2-Step Verification is **ON**
3. Wait 5-10 minutes after enabling 2-Step
4. Try generating the App Password again
5. Copy it correctly (no spaces)

---

**DO THIS NOW:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate NEW password
3. Update `EMAIL_PASS` in `server/.env`
4. Restart server
5. Email will work! ✅


