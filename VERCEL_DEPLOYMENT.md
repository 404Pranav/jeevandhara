# Deploying Jeevandhara to Vercel

## Step 1: Commit and Push to GitHub

```bash
cd "d:\CEP Project folder-3 - Copy"
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in (or create account with GitHub)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**
   - Select your GitHub repository (Jeevandhara)
   - Click **Import**
4. **Configure Project**
   - Framework: Select **"Other"** (or leave auto-detected)
   - Root Directory: Leave as **"."**
   - Build Command: Leave as default or use `echo 'Static site built'`
   - Output Directory: Leave as **"."**
5. **Add Environment Variables** (Optional but recommended)
   ```
   FIREBASE_API_KEY = AIzaSyAWHMIfd0tqkvczeEDDGrJ_BkgmI_p2hIk
   FIREBASE_PROJECT_ID = jeevandhara-84e0e
   SUPABASE_URL = https://uboobsildtrvwvgmamlw.supabase.co
   SUPABASE_ANON_KEY = your-anon-key-here
   ```
6. Click **"Deploy"** → Wait 2-3 minutes

## Step 3: Configure Firebase Authorized Domains

Once deployed, you'll get a Vercel URL like: `https://your-project-name.vercel.app`

Add this to Firebase:
1. Go to **Firebase Console** → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**, enter: `your-project-name.vercel.app`
4. Also add development domains:
   - `localhost` (for local testing)
   - `127.0.0.1` (for local testing)

## Step 4: Test the Deployment

1. Visit your Vercel URL
2. Navigate to **Donor Login**
3. Test Google Sign-in button
4. Verify dashboard loads user data from Supabase

## Important Notes

✅ **Your Firebase credentials are safe to be public** (they're frontend API keys)
✅ **Security is enforced through Firebase Security Rules** (not secret API keys)
✅ **Supabase also uses public anon keys for frontend** (RLS policies enforce security)

## Troubleshooting

### "Google Sign-in not working"
- Check that your Vercel domain is in Firebase Authorized domains
- Wait 5-10 minutes after adding the domain (Firebase caches)
- Clear browser cache and try again

### "Can't access Supabase data"
- Verify Supabase RLS policies allow your authenticated users
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` match your project

### "Page not loading"
- Check Vercel deployment logs (Dashboard → Project → Deployments)
- Verify all HTML files are in the correct paths
- Check browser console for JavaScript errors

## Custom Domain (Optional)

To add your own domain (e.g., `jeevandhara.com`):
1. In Vercel Dashboard → Project Settings → Domains
2. Click **Add** and enter your domain
3. Update domain DNS records as Vercel instructs
4. Add custom domain to Firebase Authorized domains
