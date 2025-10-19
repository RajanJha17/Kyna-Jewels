# 🔧 FIX: Email Verification Error - Application-Specific Password Required

## ❌ Current Error:
```
Error sending verification email: Error: Invalid login: 534-5.7.9 
Application-specific password required
```

## ✅ Solution: Generate New Google App Password

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **Step 1: Access Google Account Settings**

1. Open browser
2. Go to: **https://myaccount.google.com/**
3. Log in with: **enquiries@kynajewels.com**
4. Enter your regular Gmail password

---

### **Step 2: Enable 2-Step Verification (If Not Already)**

1. Click **"Security"** in left sidebar
2. Scroll to **"How you sign in to Google"**
3. Click **"2-Step Verification"**
4. Click **"Get Started"**
5. Follow the prompts to enable it (use phone number)

---

### **Step 3: Generate App Password**

1. Go back to Security page
2. Scroll down to **"App passwords"** section
3. OR go directly to: **https://myaccount.google.com/apppasswords**
4. You may need to re-enter your password
5. You'll see a page titled **"App passwords"**

---

### **Step 4: Create New App Password**

1. Under "Select app": Choose **"Mail"**
2. Under "Select device": Choose **"Other (Custom name)"**
3. Enter name: **"Kyna Jewels Backend"**
4. Click **"Generate"**
5. Google will show a 16-character password like:
   ```
   abcd efgh ijkl mnop
   ```

6. **IMPORTANT:** Copy this password immediately (you won't see it again!)

---

### **Step 5: Remove Spaces from Password**

The password has spaces, but you need to remove them:

**What Google shows:**
```
abcd efgh ijkl mnop
```

**What you need to use:**
```
abcdefghijklmnop
```

---

### **Step 6: Update .env File**

1. Open file: `server/.env`
2. If it doesn't exist, create it
3. Copy contents from `server/ENV_TEMPLATE.txt`
4. Find this line:
   ```env
   EMAIL_PASS=YOUR_NEW_16_CHAR_APP_PASSWORD_HERE
   ```
5. Replace with your new password (no spaces):
   ```env
   EMAIL_PASS=abcdefghijklmnop
   ```

---

## 📄 Complete .env Configuration

Your `server/.env` file should look like this:

```env
# SERVER
NODE_ENV=development
PORT=5000

# DATABASE
MONGO_URI=mongodb://localhost:27017/kyna-jewels

# AUTHENTICATION
JWT_SECRET=kyna-jewels-super-secret-jwt-key-min-32-characters-long-2024

# EMAIL (CRITICAL - Update EMAIL_PASS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=abcdefghijklmnop    ← REPLACE WITH YOUR NEW APP PASSWORD
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
EMAIL_SECURE=false

# OPTIONAL (Can skip for now)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CCAVENUE_MERCHANT_ID=test-merchant-id
CCAVENUE_ACCESS_CODE=test-access-code
CCAVENUE_WORKING_KEY=test-working-key
SEQUEL247_TEST_TOKEN=your-test-token
SEQUEL247_STORE_CODE=BLRAK
```

---

## 🔄 Step 7: Restart Server

After updating `.env`:

```bash
# Stop server (Ctrl+C if running)

# Start server again
cd server
npm run dev
```

---

## 🧪 Step 8: Test Signup

```bash
# Test with Postman or curl:
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "your-test-email@gmail.com",
  "password": "Test123!"
}
```

---

## ✅ Expected Results

### **Before Fix:**
```
❌ Error sending verification email: Application-specific password required
✅ User created in database (but no email sent)
```

### **After Fix:**
```
✅ Verification email sent successfully
✅ User created in database
✅ Email received with OTP code
```

---

## 🔍 Verify Email Was Sent

1. Check server console for:
   ```
   ✅ Verification email sent successfully
   ```

2. Check your test email inbox for:
   - **From:** Kyna Jewels <enquiries@kynajewels.com>
   - **Subject:** Verify your email - Kyna Jewels
   - **Body:** Contains 6-digit OTP code

---

## 🚨 Common Issues

### **Issue 1: Still getting "Invalid login" error**
**Solution:** 
- Make sure you copied the ENTIRE 16-character password
- Make sure there are NO spaces in the password
- Make sure 2-Step Verification is enabled

### **Issue 2: "App passwords" option not showing**
**Solution:**
- 2-Step Verification must be enabled first
- Wait 5-10 minutes after enabling 2-Step
- Try logging out and back in

### **Issue 3: Password has spaces**
**Solution:**
- Remove ALL spaces: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

---

## 📞 Need Help?

If you still have issues:

1. Double-check 2-Step Verification is ON
2. Generate a NEW App Password (delete old one)
3. Copy password correctly (no spaces)
4. Update `.env` file
5. Restart server
6. Test again

---

## ✨ Success Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] New App Password generated
- [ ] Password copied (no spaces)
- [ ] `.env` file created in `server` folder
- [ ] `EMAIL_PASS` updated with new password
- [ ] Server restarted
- [ ] Signup tested
- [ ] Email received ✅

---

## 🎯 Final .env Example (With Real Values)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=xyzkabcdwxyzpqrs     ← YOUR REAL 16-CHAR PASSWORD
EMAIL_FROM=Kyna Jewels <enquiries@kynajewels.com>
EMAIL_SECURE=false
```

**That's it! Your email should work now!** 📧✅

