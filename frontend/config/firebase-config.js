/**
 * Firebase Configuration
 * This file loads Firebase credentials for the Jeevandhara Blood Network
 * 
 * ⚠️  SECURITY NOTE:
 * - In production frontend, these values are public but scoped by Firestore/Security Rules
 * - The API Key cannot directly access user data - rules enforce security
 * - For sensitive operations, use a backend service with service account
 * 
 * @file frontend/config/firebase-config.js
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAWHMIfd0tqkvczeEDDGrJ_BkgmI_p2hIk",
  authDomain: "jeevandhara-84e0e.firebaseapp.com",
  projectId: "jeevandhara-84e0e",
  storageBucket: "jeevandhara-84e0e.firebasestorage.app",
  messagingSenderId: "590648502795",
  appId: "1:590648502795:web:8e16b71e58de2fb3e9350e",
  measurementId: "G-4F4XESD94C"
};

/**
 * Firebase SDKs available:
 * - Authentication (already configured)
 * - Cloud Firestore (optional - for additional data)
 * - Realtime Database (optional)
 * - Cloud Storage (optional - for file uploads)
 * - Analytics (included)
 * 
 * Next Step: Import this config in your HTML/JS files
 * 
 * Example usage in main_donar_login.html:
 * 
 * import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
 * import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
 * import { firebaseConfig } from '../config/firebase-config.js';
 * 
 * const app = initializeApp(firebaseConfig);
 * const auth = getAuth(app);
 */
