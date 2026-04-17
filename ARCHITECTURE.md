# 🏗️ Jeevandhara Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Pages (HTML/CSS/JS)                                   │
│  ├── front_page.html (Landing)                                 │
│  ├── main_donar_login.html (Authentication)                    │
│  └── donar_test.html (Dynamic Dashboard)                      │
└─────────────────────────────────────────────────────────────────┘
          ↓                    ↓                        ↓
    (Firebase Auth)    (Supabase API)         (localStorage)
          ↓                    ↓                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CLOUD SERVICES (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  FIREBASE            │      │  SUPABASE            │        │
│  │  (Authentication)    │      │  (Database)          │        │
│  ├──────────────────────┤      ├──────────────────────┤        │
│  │ • Email/Password     │      │ • Users Table        │        │
│  │ • User Sessions      │      │ • Donation History   │        │
│  │ • Password Reset     │      │ • Badges Table       │        │
│  │ • User UID Generate  │      │ • Rewards Table      │        │
│  └──────────────────────┘      │ • Real-time Updates  │        │
│                                 └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Users Table
```
id (UUID - Firebase UID)
├── email
├── first_name, middle_name, last_name
├── phone_number
├── gender
├── blood_group ← KEY FIELD
├── location
├── date_of_birth
├── profile_picture_url
├── is_active
├── created_at (auto)
└── updated_at (auto)
```

### Donation History Table
```
id (UUID)
├── user_id (FK to Users)
├── donation_date
├── blood_center_name
├── blood_center_location
├── blood_quantity_ml
├── blood_type_collected
├── donation_status (Completed/Pending/Cancelled)
├── health_check_status
├── next_eligible_date
├── notes
├── created_at (auto)
└── updated_at (auto)
```

### Badges Table
```
id (UUID)
├── badge_name (e.g., "Bronze Donor", "100 Days Hero")
├── badge_description
├── badge_icon_url
├── achievement_criteria (e.g., "5_donations", "1_year_member")
└── created_at (auto)
```

### User Badges (Junction Table)
```
id (UUID)
├── user_id (FK to Users)
├── badge_id (FK to Badges)
└── earned_date
```

### Rewards Table
```
id (UUID)
├── user_id (FK to Users)
├── reward_type (discount_coupon/certificate/points)
├── reward_value (e.g., "10% OFF", "100 points")
├── reward_description
├── earned_date (auto)
├── expiry_date
├── is_claimed
└── claimed_date
```

---

## 🔐 Authentication Flow

### Registration Flow
```
User visits main_donar_login.html
    ↓
Clicks "Sign Up"
    ↓
Fills in form (email, password, name, blood group, etc.)
    ↓
Firebase creates authentication entry
    ↓
Supabase inserts user profile record
    ↓
User session started (localStorage)
    ↓
Redirect to donar_test.html (Dashboard)
```

### Login Flow
```
User visits main_donar_login.html
    ↓
Clicks "Login"
    ↓
Enters email & password
    ↓
Firebase authenticates (returns UID)
    ↓
Save UID to localStorage
    ↓
Fetch user data from Supabase using UID
    ↓
Populate dashboard with user data
    ↓
Display dashboard
```

### Logout Flow
```
User clicks "Logout"
    ↓
Firebase signOut()
    ↓
Clear localStorage
    ↓
Redirect to front_page.html
```

---

## 📊 Dashboard Components

### User Profile Section
```
┌─────────────────────────────────┐
│  👤 John Doe                    │
│  Blood Group: O+ | Location: NY  │
└─────────────────────────────────┘
```

### Statistics Section
```
┌──────────────┬──────────────┬──────────────┐
│  Total Donations: 5  │  Lives Saved: 10  │  Badges: 3  │
└──────────────┴──────────────┴──────────────┘
```

### Donation History Section
```
┌──────────┬──────────────┬──────────┬──────────┐
│   Date   │ Blood Center │ Quantity │  Status  │
├──────────┼──────────────┼──────────┼──────────┤
│ 2024-04-15│ Red Cross    │ 450 ml   │ Complete │
│ 2024-03-20│ City Hospital│ 450 ml   │ Complete │
│ 2024-02-10│ Red Cross    │ 450 ml   │ Complete │
└──────────┴──────────────┴──────────┴──────────┘
```

### Badges Section
```
┌───────────────┬───────────────┬───────────────┐
│ 🥇           │ 🥈           │ 🥉           │
│ Bronze Donor  │ Silver Donor  │ Gold Donor    │
│ 5 Donations   │ 10 Donations  │ 20 Donations  │
└───────────────┴───────────────┴───────────────┘
```

### Rewards Section
```
┌────────────────────────────────┐
│ 🎫 10% OFF at Blood Center      │
│    Valid until: 2024-06-15      │
│    [Claim Reward]               │
├────────────────────────────────┤
│ 🎖️ Free Health Checkup         │
│    Valid for 30 days            │
│    [Claimed ✓]                  │
└────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### On Page Load
```
DOMContentLoaded event
    ↓
Check if user logged in (localStorage.currentUserId)
    ↓
Get Firebase UID from localStorage
    ↓
Call getUserProfile(uid) → Supabase
    ↓
Call getDonationHistory(uid) → Supabase
    ↓
Call getUserBadges(uid) → Supabase
    ↓
Call getUserRewards(uid) → Supabase
    ↓
Render dashboard with all data
```

### On Add Donation (Admin/Backend)
```
Admin logs donation in system
    ↓
POST request to /api/donations/:userId
    ↓
Supabase inserts new donation_history record
    ↓
Trigger: Check if user qualifies for any badges
    ↓
If yes, insert into user_badges table
    ↓
Generate reward for donation (e.g., "10 points")
    ↓
Insert into rewards table
    ↓
User sees update on next dashboard load
```

---

## 🛡️ Security Measures

### Frontend Security
```
✓ Firebase handles password hashing
✓ UID stored securely (localStorage is acceptable for UIDs)
✓ Sensitive data never logged to console in production
✓ CORS enabled only for trusted domains
```

### Backend Security (If Implemented)
```
✓ Use Service Role Key only in secure backend
✓ Validate UID from Firebase before any DB access
✓ Rate limiting on API endpoints
✓ HTTPS only (enforce in production)
✓ Environment variables for all credentials
```

### Credential Protection
```
✓ Anon Key: Safe to use in frontend (can only read/write allowed data)
✓ Service Key: SECRET - only use in backend
✓ API Key: Keep private, don't expose in frontend
✓ Never commit .env file or credentials to GitHub
```

---

## 📁 Project File Structure

```
CEP Project folder-3 - Copy/
├── index.html (entry point)
├── IMPLEMENTATION.md (detailed plan)
├── CREDENTIALS_SETUP.md (how to provide APIs)
├── ARCHITECTURE.md (this file)
│
├── frontend/
│   ├── pages/
│   │   ├── main_donar_login.html ✅ Firebase auth
│   │   ├── donar_test.html ✅ Dynamic dashboard
│   │   ├── hospital_register.html
│   │   ├── blood_availability.html
│   │   └── ... (other pages)
│   │
│   ├── js/
│   │   ├── dashboard.js (Dashboard logic)
│   │   ├── supabase-client.js (Supabase integration)
│   │   └── auth-handler.js (Authentication)
│   │
│   ├── config/
│   │   ├── firebase-config.js (Firebase credentials)
│   │   └── supabase-config.js (Supabase credentials)
│   │
│   └── images/
│       └── (all images)
│
├── backend/ (Optional)
│   ├── server.js (Express server)
│   ├── firebase-credentials.json (Service account)
│   ├── routes/
│   │   ├── users.js
│   │   ├── donations.js
│   │   └── badges.js
│   └── .env (Environment variables)
│
└── docs/
    ├── IMPLEMENTATION.md
    ├── CREDENTIALS_SETUP.md
    └── API_ENDPOINTS.md
```

---

## 🚀 Deployment Checklist

### Frontend Deployment (Firebase Hosting)
```
□ Replace credentials with production keys
□ Remove debug logging
□ Optimize images
□ Minify CSS/JS
□ Test all features
□ Deploy to Firebase Hosting
```

### Backend Deployment (If used)
```
□ Set environment variables on server
□ Enable HTTPS
□ Set up CORS correctly
□ Configure rate limiting
□ Set up logging
□ Deploy to hosting (Heroku, Railway, AWS, etc.)
```

---

## 📞 Support & Documentation

**When Implementation is Complete:**
- ✅ Login/Registration working
- ✅ Dashboard showing user data
- ✅ Donation history visible
- ✅ Badges auto-populate
- ✅ Rewards system working

**What We Can Add Later:**
- Payment integration
- SMS notifications
- Admin dashboard
- Blood bank APIs
- Mobile app
- Advanced analytics

---

**Ready to implement!** 🎉

Send your credentials using CREDENTIALS_SETUP.md and we'll get everything working!
