# 🔥 Firebase Integration Guide

## Quick Start - Add Firebase to Your HTML Pages

### ✅ Setup Complete!
Your Firebase project is ready. Now integrate it into your pages.

---

## 🎯 Step 1: Update main_donar_login.html

Add this code to your `main_donar_login.html` file (in the `<head>` section):

```html
<!-- Add before closing </head> tag -->

<!-- Firebase SDK -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
  import { firebaseConfig } from "../config/firebase-config.js";

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Make auth globally available
  window.firebaseAuth = auth;

  console.log("✅ Firebase initialized successfully!");
</script>
```

---

## 🔐 Step 2: Add Authentication Functions

Replace or update your login/register form handling code with this:

```javascript
// Add this in a <script> tag or in your dashboard.js file

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Handle Registration
async function handleRegister(email, password, firstName, lastName, bloodGroup) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      window.firebaseAuth,
      email,
      password
    );
    
    const user = userCredential.user;
    console.log("✅ User registered:", user.uid);
    
    // Save userId for later use
    localStorage.setItem('currentUserId', user.uid);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', `${firstName} ${lastName}`);
    localStorage.setItem('bloodGroup', bloodGroup);
    
    // Show success message
    document.getElementById('reg-success-msg').classList.remove('hidden');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
      window.location.href = 'donar_test.html';
    }, 1500);
    
    return user;
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    
    // Display error to user
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) {
      errorMsg.textContent = error.message;
      errorMsg.classList.remove('hidden');
    }
  }
}

// Handle Login
async function handleLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      window.firebaseAuth,
      email,
      password
    );
    
    const user = userCredential.user;
    console.log("✅ User logged in:", user.uid);
    
    // Save userId for later use
    localStorage.setItem('currentUserId', user.uid);
    localStorage.setItem('userEmail', email);
    
    // Show success message
    document.getElementById('login-success-msg').classList.remove('hidden');
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'donar_test.html';
    }, 1200);
    
    return user;
  } catch (error) {
    console.error("❌ Login error:", error.message);
    
    // Display error to user
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) {
      if (error.code === 'auth/user-not-found') {
        errorMsg.textContent = "User not found. Please register first.";
      } else if (error.code === 'auth/wrong-password') {
        errorMsg.textContent = "Invalid password.";
      } else {
        errorMsg.textContent = error.message;
      }
      errorMsg.classList.remove('hidden');
    }
  }
}

// Handle Logout
async function handleLogout() {
  try {
    await signOut(window.firebaseAuth);
    console.log("✅ User logged out");
    
    // Clear local storage
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('bloodGroup');
    
    // Redirect to home
    window.location.href = 'front_page.html';
  } catch (error) {
    console.error("❌ Logout error:", error.message);
  }
}

// Export functions
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
```

---

## 📝 Step 3: Update Your Form HTML

Update your registration form to use the new functions:

```html
<!-- Registration Form -->
<form id="register-form" onsubmit="handleRegisterForm(event)">
  <input type="text" id="reg-name" placeholder="Full Name" required>
  <input type="email" id="reg-email" placeholder="Email" required>
  <input type="password" id="reg-password" placeholder="Password" required>
  <select id="reg-blood" required>
    <option value="">Select Blood Group</option>
    <option value="O+">O+</option>
    <option value="O-">O-</option>
    <option value="A+">A+</option>
    <option value="A-">A-</option>
    <option value="B+">B+</option>
    <option value="B-">B-</option>
    <option value="AB+">AB+</option>
    <option value="AB-">AB-</option>
  </select>
  <button type="submit">Register</button>
</form>

<script>
async function handleRegisterForm(event) {
  event.preventDefault();
  
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const bloodGroup = document.getElementById('reg-blood').value;
  
  const nameParts = name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';
  
  await handleRegister(email, password, firstName, lastName, bloodGroup);
}
</script>
```

---

## 🚀 Step 4: Update Dashboard (donar_test.html)

Add this code to load user data and check authentication:

```html
<!-- Add at the top of your dashboard section -->
<script type="module">
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
  import { firebaseConfig } from "../config/firebase-config.js";

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Check if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ User is logged in:", user.uid);
      console.log("📧 Email:", user.email);
      
      // Load user data
      const userName = localStorage.getItem('userName') || user.email;
      const bloodGroup = localStorage.getItem('bloodGroup') || 'Not set';
      
      // Update dashboard with user info
      document.getElementById('user-name').textContent = userName;
      document.getElementById('user-blood-group').textContent = `Blood Group: ${bloodGroup}`;
      
      // Load other dashboard data from Supabase
      loadDashboardData(user.uid);
    } else {
      console.log("❌ No user logged in - redirecting to login");
      window.location.href = 'main_donar_login.html';
    }
  });

  // Make logout function available globally
  window.logoutUser = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      window.location.href = 'front_page.html';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
</script>
```

---

## 🧪 Step 5: Test Firebase Integration

### Test Registration
1. Open `main_donar_login.html` in your browser
2. Fill in registration form with:
   - Name: John Doe
   - Email: john@example.com
   - Password: TestPassword123
   - Blood Group: O+
3. Click Register
4. Should redirect to dashboard
5. Open browser console (F12) and check for "✅ Firebase initialized successfully!"

### Test Login
1. Open `main_donar_login.html`
2. Enter same email and password
3. Click Login
4. Should redirect to dashboard

### Check Firebase Console
1. Go to https://console.firebase.google.com/project/jeevandhara-blood-network/authentication
2. You should see your test user listed!

---

## 📊 Firebase Project Overview

**Project Name:** jeevandhara-blood-network
**Region:** Global
**Current Features:**
- ✅ Email/Password Authentication
- ✅ User Management
- ✅ Session Management

**Credentials Location:**
- Frontend: `frontend/config/firebase-config.js`
- Environment: `.env` file (keep private!)

---

## 🔗 Next: Integrate Supabase

Once your Supabase project is ready, update `frontend/config/supabase-config.js` with:
```javascript
export const supabaseConfig = {
  url: "your_supabase_project_url",
  anonKey: "your_supabase_anon_key"
};
```

Then use it in your dashboard to load user profile, donation history, and badges!

---

## 🐛 Troubleshooting

### Issue: "Firebase is not defined"
**Solution:** Make sure you import Firebase correctly:
```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
```

### Issue: "Module not found" error
**Solution:** Use full CDN URLs:
```javascript
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
```

### Issue: CORS error
**Solution:** Firebase is configured to work from your domain. If using `file://` protocol locally, some features may be limited.

### Issue: User can't register
**Solution:**
1. Check email format is valid
2. Password must be at least 6 characters
3. Check browser console for exact error message

---

## 📚 Reference

**Firebase SDK Version:** 10.5.0
**Available Modules:**
- `firebase-app` - Core
- `firebase-auth` - Authentication (using)
- `firebase-firestore` - Database (optional)
- `firebase-analytics` - Analytics (optional)

**Authentication Methods:**
- Email/Password ✅ (configured)
- Google Sign-in (can add)
- Phone Auth (can add)

---

## ✅ Checklist

- [ ] Firebase config loaded in firebase-config.js
- [ ] .env file created with credentials
- [ ] .gitignore updated to protect .env
- [ ] main_donar_login.html updated with Firebase code
- [ ] Registration function working
- [ ] Login function working
- [ ] Logout function available
- [ ] Dashboard checks authentication
- [ ] Test users can register and login
- [ ] Firebase console shows registered users

---

**Next Step:** Test the authentication flow, then integrate Supabase for the dashboard! 🚀
