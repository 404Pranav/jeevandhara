# Keys Needed for Backend Integration

## Firebase Keys

### Required values
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID` (optional)

### Where to get them
1. Go to https://console.firebase.google.com
2. Select your project `jeevandhara-blood-network`
3. Open **Project Settings** (gear icon)
4. In the **General** tab, scroll to **Your apps**
5. If you have not added a web app, add one with the web icon `</>`
6. Copy the Firebase config object shown there

The config object contains the exact values listed above.

---

## Supabase Keys

### Required values
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (backend only)

### Where to get them
1. Go to https://app.supabase.com
2. Select your Supabase project
3. Open **Settings** in the left sidebar
4. Click **API**
5. Copy the values from the API section:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

## Summary

### For frontend integration
- Use `SUPABASE_URL`
- Use `SUPABASE_ANON_KEY`
- Use Firebase values from the web app config

### For backend/server integration
- Use `SUPABASE_SERVICE_KEY` only on backend
- Use Firebase service account credentials if you add a secure server layer (not in frontend)

---

## Notes
- Put these values into your `.env` file to keep them private.
- Do not commit `.env` to Git.
