# Jeevandhara Blood Network - Backend Implementation Plan

## 📋 Project Overview

This document outlines the complete backend implementation strategy for the Jeevandhara Blood Network platform, including authentication, user management, and dynamic dashboards.

---

## 🏗️ Architecture Overview

```
Frontend (HTML/CSS/JS)
    ↓
Browser/Client
    ↓
┌─────────────────────────────────┐
│   Backend Services              │
├─────────────────────────────────┤
│  Firebase Authentication        │ → User Login/Registration
│  Supabase Database              │ → User Data, History, Badges
│  Backend Server (Node.js/Python)│ → API Endpoints
└─────────────────────────────────┘
```

---

## 🔑 Part 1: Firebase Setup & Authentication

### Purpose
- Handle user login/registration
- Manage authentication tokens
- Secure password management
- Multi-user support

### Features to Implement
1. **Donor Registration** - Create new donor accounts
2. **Donor Login** - Email/password authentication
3. **Password Reset** - Forget password functionality
4. **Session Management** - Keep users logged in
5. **Logout** - Clear session/tokens

### Implementation Steps

#### 1.1 Firebase Project Creation
```
1. Go to https://console.firebase.google.com/
2. Create new project: "Jeevandhara"
3. Enable Authentication methods:
   - Email/Password
   - (Optional) Google Sign-In, Phone Authentication
4. Get your Firebase Config:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
```

#### 1.2 Frontend Firebase Integration
**File:** `frontend/pages/main_donar_login.html`

```javascript
// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Register new donor
async function registerDonor(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User registered:", user.uid);
    return user;
  } catch (error) {
    console.error("Registration error:", error.message);
  }
}

// Login donor
async function loginDonor(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User logged in:", user.uid);
    localStorage.setItem('currentUserId', user.uid);
    window.location.href = 'donar_test.html'; // Redirect to dashboard
    return user;
  } catch (error) {
    console.error("Login error:", error.message);
  }
}

// Logout donor
async function logoutDonor() {
  try {
    await signOut(auth);
    localStorage.removeItem('currentUserId');
    window.location.href = 'front_page.html';
  } catch (error) {
    console.error("Logout error:", error.message);
  }
}
```

---

## 💾 Part 2: Supabase Setup & Database

### Purpose
- Store user profiles and donor information
- Track donation history
- Manage badges and rewards
- Dynamic dashboard data

### Database Schema

#### 2.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY (Firebase UID),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(15),
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  location VARCHAR(255),
  date_of_birth DATE,
  profile_picture_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2 Donation History Table
```sql
CREATE TABLE donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  donation_date DATE NOT NULL,
  blood_center_name VARCHAR(255),
  blood_center_location VARCHAR(255),
  blood_quantity_ml INT,
  blood_type_collected VARCHAR(5),
  donation_status VARCHAR(50), -- "Completed", "Pending", "Cancelled"
  health_check_status VARCHAR(50),
  next_eligible_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_donation_user_id ON donation_history(user_id);
CREATE INDEX idx_donation_date ON donation_history(donation_date);
```

#### 2.3 Badges Table
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_url VARCHAR(500),
  achievement_criteria VARCHAR(255), -- e.g., "5_donations", "1_year_member"
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.4 User Badges (Junction Table)
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

#### 2.5 Rewards Table
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reward_type VARCHAR(100), -- "discount_coupon", "certificate", "points"
  reward_value VARCHAR(255), -- e.g., "10% OFF", "100 points"
  reward_description TEXT,
  earned_date TIMESTAMP DEFAULT NOW(),
  expiry_date DATE,
  is_claimed BOOLEAN DEFAULT false,
  claimed_date TIMESTAMP
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
```

### 2.2 Supabase Project Setup
```
1. Go to https://supabase.com/
2. Create new project: "jeevandhara_db"
3. Copy connection credentials:
   - Project URL
   - Anon Key (public)
   - Service Role Key (SECRET - backend only)
4. Create tables using SQL commands above
```

### 2.3 Frontend Supabase Integration

**File:** `frontend/js/supabase-client.js` (Create new)

```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get user profile
async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) console.error('Error fetching profile:', error);
  return data;
}

// Get donation history
async function getDonationHistory(userId) {
  const { data, error } = await supabase
    .from('donation_history')
    .select('*')
    .eq('user_id', userId)
    .order('donation_date', { ascending: false });
  
  if (error) console.error('Error fetching history:', error);
  return data;
}

// Get user badges
async function getUserBadges(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      badge_id,
      badges (
        id,
        badge_name,
        badge_description,
        badge_icon_url
      ),
      earned_date
    `)
    .eq('user_id', userId);
  
  if (error) console.error('Error fetching badges:', error);
  return data;
}

// Get user rewards
async function getUserRewards(userId) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .order('earned_date', { ascending: false });
  
  if (error) console.error('Error fetching rewards:', error);
  return data;
}

// Update user profile
async function updateUserProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', userId);
  
  if (error) console.error('Error updating profile:', error);
  return data;
}

export {
  supabase,
  getUserProfile,
  getDonationHistory,
  getUserBadges,
  getUserRewards,
  updateUserProfile
};
```

---

## 🖥️ Part 3: Dynamic Dashboard Implementation

### 3.1 Dashboard Structure

**File:** `frontend/pages/donar_test.html` (Modify/Enhance)

```html
<!-- Dashboard Header with User Info -->
<div id="user-dashboard" class="dashboard-container">
  <div class="user-profile-card">
    <img id="user-avatar" src="" alt="Profile">
    <div id="user-info">
      <h2 id="user-name"></h2>
      <p id="user-blood-group"></p>
      <p id="user-location"></p>
    </div>
  </div>

  <!-- Stats Section -->
  <div class="stats-grid">
    <div class="stat-card">
      <h3>Total Donations</h3>
      <p id="donation-count">0</p>
    </div>
    <div class="stat-card">
      <h3>Lives Saved</h3>
      <p id="lives-saved">0</p>
    </div>
    <div class="stat-card">
      <h3>Badges Earned</h3>
      <p id="badge-count">0</p>
    </div>
  </div>

  <!-- Donation History Section -->
  <section id="donation-history-section">
    <h3>Recent Donations</h3>
    <table id="donation-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Blood Center</th>
          <th>Quantity</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="donation-tbody"></tbody>
    </table>
  </section>

  <!-- Badges Section -->
  <section id="badges-section">
    <h3>Your Badges & Achievements</h3>
    <div id="badges-grid" class="badges-grid"></div>
  </section>

  <!-- Rewards Section -->
  <section id="rewards-section">
    <h3>Your Rewards</h3>
    <div id="rewards-list"></div>
  </section>
</div>
```

### 3.2 Dashboard JavaScript

**File:** `frontend/js/dashboard.js` (Create new)

```javascript
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  getUserProfile,
  getDonationHistory,
  getUserBadges,
  getUserRewards
} from './supabase-client.js';

const auth = getAuth();

async function loadDashboard() {
  // Check if user is logged in
  const userId = localStorage.getItem('currentUserId');
  if (!userId) {
    window.location.href = 'main_donar_login.html';
    return;
  }

  try {
    // Load user profile
    const profile = await getUserProfile(userId);
    displayUserProfile(profile);

    // Load donation history
    const donations = await getDonationHistory(userId);
    displayDonationHistory(donations);

    // Load badges
    const badges = await getUserBadges(userId);
    displayBadges(badges);

    // Load rewards
    const rewards = await getUserRewards(userId);
    displayRewards(rewards);

    // Calculate statistics
    updateDashboardStats(donations, badges);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function displayUserProfile(profile) {
  document.getElementById('user-name').textContent = 
    `${profile.first_name} ${profile.last_name}`;
  document.getElementById('user-blood-group').textContent = 
    `Blood Group: ${profile.blood_group}`;
  document.getElementById('user-location').textContent = 
    `Location: ${profile.location}`;
  
  if (profile.profile_picture_url) {
    document.getElementById('user-avatar').src = profile.profile_picture_url;
  }
}

function displayDonationHistory(donations) {
  const tbody = document.getElementById('donation-tbody');
  tbody.innerHTML = '';

  donations.forEach(donation => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(donation.donation_date).toLocaleDateString()}</td>
      <td>${donation.blood_center_name}</td>
      <td>${donation.blood_quantity_ml} ml</td>
      <td><span class="status ${donation.donation_status}">${donation.donation_status}</span></td>
    `;
    tbody.appendChild(row);
  });
}

function displayBadges(badges) {
  const badgesGrid = document.getElementById('badges-grid');
  badgesGrid.innerHTML = '';

  badges.forEach(badgeRecord => {
    const badge = badgeRecord.badges;
    const badgeCard = document.createElement('div');
    badgeCard.className = 'badge-card';
    badgeCard.innerHTML = `
      <img src="${badge.badge_icon_url}" alt="${badge.badge_name}">
      <h4>${badge.badge_name}</h4>
      <p>${badge.badge_description}</p>
      <small>Earned: ${new Date(badgeRecord.earned_date).toLocaleDateString()}</small>
    `;
    badgesGrid.appendChild(badgeCard);
  });
}

function displayRewards(rewards) {
  const rewardsList = document.getElementById('rewards-list');
  rewardsList.innerHTML = '';

  rewards.forEach(reward => {
    const rewardCard = document.createElement('div');
    rewardCard.className = 'reward-card';
    rewardCard.innerHTML = `
      <h4>${reward.reward_type}</h4>
      <p class="reward-value">${reward.reward_value}</p>
      <p>${reward.reward_description}</p>
      <small>Earned: ${new Date(reward.earned_date).toLocaleDateString()}</small>
      ${!reward.is_claimed ? `<button onclick="claimReward('${reward.id}')">Claim Reward</button>` : '<p class="claimed">✓ Claimed</p>'}
    `;
    rewardsList.appendChild(rewardCard);
  });
}

function updateDashboardStats(donations, badges) {
  document.getElementById('donation-count').textContent = donations.length;
  document.getElementById('badge-count').textContent = badges.length;
  document.getElementById('lives-saved').textContent = (donations.length * 2); // Approximate
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
```

---

## 📡 Part 4: Backend API Endpoints (Node.js/Express)

### Optional Backend Server Setup

If you want a dedicated backend (for additional features):

**File:** `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Initialize Firebase Admin
const serviceAccount = require('./firebase-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// API Endpoints

// 1. Create/Update User Profile
app.post('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, ...userData })
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Add Donation Record
app.post('/api/donations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const donationData = { user_id: userId, ...req.body };

    const { data, error } = await supabase
      .from('donation_history')
      .insert([donationData])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Award Badge to User
app.post('/api/badges/:userId/:badgeId', async (req, res) => {
  try {
    const { userId, badgeId } = req.params;

    const { data, error } = await supabase
      .from('user_badges')
      .insert([{ user_id: userId, badge_id: badgeId }])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Add Reward
app.post('/api/rewards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rewardData = { user_id: userId, ...req.body };

    const { data, error } = await supabase
      .from('rewards')
      .insert([rewardData])
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get Dashboard Data
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [userProfile, donations, badges, rewards] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('donation_history').select('*').eq('user_id', userId),
      supabase.from('user_badges').select('*').eq('user_id', userId),
      supabase.from('rewards').select('*').eq('user_id', userId)
    ]);

    res.json({
      success: true,
      data: {
        profile: userProfile.data,
        donations: donations.data,
        badges: badges.data,
        rewards: rewards.data
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🔐 Part 5: How to Provide API Keys & Credentials

### ⚠️ SECURITY GUIDELINES

**NEVER commit credentials directly to code!**

### Method 1: Environment Variables (.env file)

**File:** `.env` (Create in project root)

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**File:** `.gitignore` (Update)

```
.env
.env.local
firebase-credentials.json
node_modules/
```

### Method 2: Secure Credential Sharing with Me

When you're ready to provide credentials, please:

1. **For Firebase:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Download JSON file
   - Share the content in an **encrypted** message or secure platform

2. **For Supabase:**
   - Go to Supabase → Settings → API
   - Copy the "Paste API Keys here" section
   - Share in **encrypted** format

3. **Secure Methods to Share:**
   - Use encrypted messaging (Signal, WhatsApp end-to-end)
   - Use secure note apps (ProtonNote, PrivateNote)
   - **NEVER** post in public chat/GitHub/email without encryption

### Method 3: Configuration File Template

**File:** `frontend/config/firebase-config.js` (Template)

```javascript
// Replace these values with your actual Firebase credentials
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Supabase Configuration
export const supabaseConfig = {
  url: "YOUR_SUPABASE_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

---

## 📋 Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Create Firebase project
- [ ] Create Supabase project
- [ ] Set up database tables in Supabase
- [ ] Get all API credentials

### Phase 2: Frontend Authentication (Week 2)
- [ ] Integrate Firebase auth in `main_donar_login.html`
- [ ] Implement registration functionality
- [ ] Implement login functionality
- [ ] Test login/registration flow
- [ ] Add password reset feature

### Phase 3: Frontend Dashboard (Week 3)
- [ ] Integrate Supabase client
- [ ] Create `donar_test.html` dashboard
- [ ] Implement user profile display
- [ ] Display donation history
- [ ] Display badges and rewards
- [ ] Test all dashboard features

### Phase 4: Backend Setup (Week 4) - Optional
- [ ] Set up Node.js/Express server
- [ ] Create API endpoints
- [ ] Test API endpoints
- [ ] Deploy backend

### Phase 5: Advanced Features (Week 5+)
- [ ] Auto badge detection
- [ ] Reward system automation
- [ ] Admin dashboard
- [ ] Donation scheduling
- [ ] Blood bank integration

---

## 🚀 Quick Start Guide

### Step 1: Setup Firebase
```
1. Visit https://console.firebase.google.com
2. Create project "Jeevandhara"
3. Enable Authentication → Email/Password
4. Copy credentials from Settings
```

### Step 2: Setup Supabase
```
1. Visit https://supabase.com
2. Create project "jeevandhara_db"
3. Run SQL commands from Part 2
4. Copy URL and API keys
```

### Step 3: Add Credentials to Frontend
```
1. Create frontend/config/firebase-config.js
2. Add Firebase and Supabase credentials
3. Import in main_donar_login.html
```

### Step 4: Test Login Flow
```
1. Open main_donar_login.html in browser
2. Register a new donor account
3. Should redirect to donar_test.html dashboard
4. Dashboard should load user data from Supabase
```

---

## 📞 Support & Next Steps

### Questions to Ask
- Do you want a backend server or frontend-only integration?
- Should badges be automatic or admin-awarded?
- Any specific reward system requirements?
- Timeline for implementation?

### When You're Ready to Share Credentials
Please provide:
1. Firebase Project ID
2. Firebase Web API Key
3. Supabase Project URL
4. Supabase Anon Key

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

**Last Updated:** April 2026
**Status:** Ready for Implementation
