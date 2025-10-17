## 🔥 Firebase Authentication Error - Fix Guide

### Problem

Your production server is getting this error:

```
code: 16, UNAUTHENTICATED
Request had invalid authentication credentials
```

This means **Firebase credentials are missing or invalid** on your production server at `rayone.kyptronix.us`.

---

### Solution: Set Firebase Environment Variables

Your server needs these **3 required** environment variables:

1. `FIREBASE_PROJECT_ID` - Your Firebase project ID (e.g., `rayone-42372`)
2. `FIREBASE_PRIVATE_KEY` - Your Firebase service account private key
3. `FIREBASE_CLIENT_EMAIL` - Your Firebase service account email

---

### How to Fix (Choose One Method)

#### **Option 1: Using .env file (Recommended)**

1. SSH into your production server:

   ```bash
   ssh your-server
   ```

2. Navigate to your project directory:

   ```bash
   cd /root/rayone
   ```

3. Create a `.env` file:

   ```bash
   nano .env
   ```

4. Add these lines (replace with your actual values from Firebase Console):

   ```bash
   # Firebase Configuration
   FIREBASE_PROJECT_ID=rayone-42372
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@rayone-42372.iam.gserviceaccount.com

   # Email Configuration (if not already set)
   EMAIL_USER=tirtho.kyptronix@gmail.com
   EMAIL_PASS=your-app-password-here

   # Frontend URL
   FRONTEND_URL=https://raygpt-backend-2.onrender.com
   BACKEND_URL=https://raygpt-backend-2.onrender.com
   ```

5. Save and exit (Ctrl+X, then Y, then Enter)

6. Restart your PM2 process:
   ```bash
   pm2 restart rayone
   ```

---

#### **Option 2: Using PM2 Ecosystem File**

1. Edit your PM2 config:

   ```bash
   cd /root/rayone
   nano ecosystem.config.js
   ```

2. Add the env section:

   ```javascript
   module.exports = {
     apps: [
       {
         name: "rayone",
         script: "./index.js",
         env: {
           NODE_ENV: "production",
           PORT: 5000,
           FIREBASE_PROJECT_ID: "rayone-42372",
           FIREBASE_PRIVATE_KEY:
             "-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n",
           FIREBASE_CLIENT_EMAIL:
             "firebase-adminsdk-xxxxx@rayone-42372.iam.gserviceaccount.com",
           EMAIL_USER: "tirtho.kyptronix@gmail.com",
           EMAIL_PASS: "your-app-password",
           FRONTEND_URL: "https://raygpt-backend-2.onrender.com",
           BACKEND_URL: "https://raygpt-backend-2.onrender.com",
         },
       },
     ],
   };
   ```

3. Restart PM2:
   ```bash
   pm2 restart rayone --update-env
   ```

---

### Where to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rayone-42372`
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Extract these values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters!)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

---

### Verify the Fix

Run this on your server to check if variables are set:

```bash
cd /root/rayone
bash check-firebase-env.sh
```

Or manually check:

```bash
pm2 env rayone | grep FIREBASE
```

---

### Test After Fix

1. After restarting PM2, wait 10 seconds
2. Go to your website: https://raygpt-backend-2.onrender.com
3. Try to subscribe with your email
4. Check server logs:
   ```bash
   pm2 logs rayone --lines 50
   ```

You should see:

- ✅ No more `UNAUTHENTICATED` errors
- ✅ "Subscription created" messages
- ✅ "Email sent" messages

---

### Quick Command Summary

```bash
# SSH into server
ssh your-server

# Navigate to project
cd /root/rayone

# Create .env file
nano .env
# (paste the Firebase credentials)

# Restart PM2
pm2 restart rayone

# Check logs
pm2 logs rayone --lines 50
```
