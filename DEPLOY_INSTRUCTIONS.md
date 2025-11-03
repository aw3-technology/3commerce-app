# Deploy Instructions for 3Commerce App

## 🚨 Current Issue
Your live site at **https://app.3commerce.com/income/earning** is showing demo data because it's running an old version of the code.

The backend-connected code exists in your repository (commit 80f0afc) but hasn't been deployed yet.

## ✅ What Needs to Happen
You need to **redeploy your application** so the live site uses the updated code with backend integration.

## 🔍 Deployment Options

### Option 1: If using Vercel
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to production
vercel --prod
```

### Option 2: If using Netlify
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod
```

### Option 3: If using custom hosting
1. Build the production version:
```bash
npm run build
```

2. Upload the `build/` folder to your web server

### Option 4: Manual Rebuild (if auto-deploy is enabled)
If you have auto-deploy set up with GitHub:

1. Make a small change and push:
```bash
git commit --allow-empty -m "Trigger redeploy for backend integration"
git push origin main
```

2. Check your hosting dashboard to see the deployment progress

## 🔧 Verify the Deployment

After deploying, check:
1. Visit https://app.3commerce.com/income/earning
2. Open browser DevTools (F12) → Network tab
3. Reload the page
4. Look for API calls to your Supabase database
5. The page should show either:
   - Real data if you have customers/orders
   - "No earnings data available" if tables are empty
   - NOT the hardcoded demo data

## 📊 Current Database Status
- ✅ All tables exist and RLS is disabled
- ✅ 6 products in database
- ❌ 0 customers (need to add some)
- ❌ 0 orders (need to add some)

## 🎯 What's Already Done
All these Earning page components are connected to the backend:
- ✅ Overview (earnings, balance, total sales)
- ✅ Table (daily earnings breakdown)
- ✅ ProductSales (chart with date filtering)
- ✅ TopCountries (earnings by country)

The code is ready - it just needs to be deployed!

## Need Help?
If you're not sure which platform you're using:
1. Check your email for deployment notifications
2. Look at your GitHub repository settings → Pages/Deployments
3. Check for .vercel, .netlify, or similar folders in your project
