# 📋 API & Credentials Setup Guide

## 🎯 What You Need to Provide

Follow this guide to set up Firebase and Supabase, then send me the credentials.

---

## 🔥 Step 1: Firebase Setup

### Go to Firebase Console
**Link:** https://console.firebase.google.com

### Create a New Project
```
1. Click "Create a project"
2. Project Name: "Jeevandhara Blood Network"
3. Enable Google Analytics (optional)
4. Accept terms and click "Create project"
5. Wait for project creation (1-2 minutes)
```

### Enable Authentication
```
1. In left sidebar, click "Authentication"
2. Click "Get Started"
3. Select "Email/Password" provider
4. Toggle Enable --> ON
5. Click Save
```

### Get Your Firebase Credentials
```
1. Go to Project Settings (gear icon, top left)
2. Click "General" tab
3. Scroll down to "Your apps" section
4. Click "Web" icon (</>) to create web app
5. App Name: "Jeevandhara Web"
6. Check "Also set up Firebase Hosting for this app" (optional)
7. Click "Register app"
8. Copy the config text (see code section below)
```

### Copy This Config Block
```javascript
// COPY EVERYTHING BELOW AND SEND TO ME

const firebaseConfig = {
  apiKey: "AIza...",                    // Copy this
  authDomain: "xxx.firebaseapp.com",    // Copy this
  projectId: "xxx",                     // Copy this
  storageBucket: "xxx.appspot.com",     // Copy this
  messagingSenderId: "xxx",             // Copy this
  appId: "1:xxx:web:xxx"                // Copy this
};
```

---

## 🐘 Step 2: Supabase Setup

### Go to Supabase
**Link:** https://supabase.com

### Create New Project
```
1. Click "New Project"
2. Organization: Create new (if needed)
3. Project Name: "jeevandhara_db"
4. Database Password: Create a strong password (save this!)
5. Region: Choose closest to you
6. Click "Create new project"
7. Wait for setup (2-5 minutes)
```

### Create Database Tables
```
1. In left sidebar, click "SQL Editor"
2. Click "New Query"
3. Copy-paste the SQL from IMPLEMENTATION.md (Part 2.1-2.5)
4. Click "Run" button
5. Verify all tables are created
```

### Get Your Supabase Credentials
```
1. Click Settings (left sidebar, bottom)
2. Click "API" tab
3. You'll see:
   - API URL
   - Anon Key
   - Service Role Key (SECRET!)
```

### Copy These Values
```
SUPABASE_URL: https://xxx.supabase.co
SUPABASE_ANON_KEY: eyJ...
SUPABASE_SERVICE_KEY: eyJ... (DO NOT SHARE PUBLICLY)
```

---

## 🔐 Sending Credentials to Me (SECURE METHOD)

### ⚠️ IMPORTANT SECURITY RULES

**NEVER:**
- ❌ Post credentials in public chat
- ❌ Send via unencrypted email
- ❌ Upload to GitHub/public spaces
- ❌ Send both keys together in one message

**DO:**
- ✅ Use encrypted messaging apps
- ✅ Split sensitive keys
- ✅ Revoke keys if accidentally exposed

### Method 1: Encrypted Message (RECOMMENDED)
Use Signal, WhatsApp, or similar encrypted messaging:

```
Message 1 (Anon Key - Safe to share):
Hi, here are my Supabase credentials:

API URL: https://xxx.supabase.co
Anon Key: eyJ...

Firebase Config:
{
  "apiKey": "AIza...",
  "authDomain": "xxx.firebaseapp.com",
  "projectId": "jeevandhara-xxx",
  ...
}
```

```
Message 2 (Service Key - Share separately if needed):
Service Role Key: eyJ...
```

### Method 2: Secure Note App
Use ProtonNote or similar: https://protonmail.com/

### Method 3: Document Format
Create files as described below:

---

## 📄 Format for Sharing (Copy this template)

### Create a file: `CREDENTIALS_TEMPLATE.txt`

```
=====================================
FIREBASE CONFIGURATION
=====================================

API Key: AIzaSy...
Auth Domain: jeevandhara-xxx.firebaseapp.com
Project ID: jeevandhara-xxx
Storage Bucket: jeevandhara-xxx.appspot.com
Messaging Sender ID: 123456789
App ID: 1:123456789:web:abcd1234

FireBase Project URL: https://console.firebase.google.com/project/jeevandhara-xxx


=====================================
SUPABASE CONFIGURATION
=====================================

Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... 
(Keep this SECRET - only needed for backend)

Supabase Project URL: https://app.supabase.com/project/xxx


=====================================
SETUP CHECKLIST
=====================================
- [ ] Firebase project created
- [ ] Firebase authentication enabled
- [ ] Supabase project created
- [ ] Supabase tables created
- [ ] Credentials copied and verified
```

---

## ✅ Verification Checklist

After setup, verify everything works:

### Firebase Verification
```javascript
// Open browser console and run:
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

const config = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT"
};

const app = initializeApp(config);
console.log("Firebase initialized:", app);
// Should print: Firebase initialized: {…}
```

### Supabase Verification
```javascript
// Open browser console and run:
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const client = createClient('YOUR_URL', 'YOUR_ANON_KEY');
console.log("Supabase connected:", client);
// Should print: Supabase connected: {…}
```

---

## 🚀 Next Steps After You Send Credentials

Once you send me the credentials, I will:

1. ✅ Create `frontend/config/firebase-config.js`
2. ✅ Create `frontend/config/supabase-config.js`
3. ✅ Update `main_donar_login.html` with Firebase integration
4. ✅ Create `dashboard.js` to load user data
5. ✅ Update `donar_test.html` to display dashboard
6. ✅ Test complete login → dashboard flow

---

## 📞 Questions?

If you get stuck:
1. Check the full IMPLEMENTATION.md for detailed steps
2. Refer to official docs:
   - Firebase: https://firebase.google.com/docs
   - Supabase: https://supabase.com/docs

---

## 🎯 TL;DR - Quick Checklist

```
To give me your APIs:

1. ✅ Create Firebase project
2. ✅ Get Firebase config (6 values)
3. ✅ Create Supabase project
4. ✅ Create databases in Supabase
5. ✅ Get Supabase credentials (URL + Anon Key)
6. ✅ Send via encrypted message or this document format
7. ✅ I'll integrate everything!
```

---

**Last Updated:** April 2026
