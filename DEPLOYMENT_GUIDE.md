# ContentCharm Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- A GitHub account
- A Vercel account (sign up at vercel.com with your GitHub account)

### Steps to Deploy

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project
   - Click "Deploy"

3. **Configure Environment Variables in Vercel**
   After deployment, go to your project settings and add these environment variables:

   ```
   VITE_SUPABASE_URL=https://bvgkrotyvoungxmfvdnj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Z2tyb3R5dm91bmd4bWZ2ZG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDE3NDQsImV4cCI6MjA4NjU3Nzc0NH0.DsoEIuXVYCSwFbSBgodOR26IcyoTFwkaD33OmLfr_aI
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tkGSke81uabcxZwyQeiKxaYn
   VITE_ADMIN_EMAIL=admin@contentcharm.com
   ```

4. **Redeploy**
   - After adding environment variables, trigger a new deployment
   - Your site will be live at `your-project.vercel.app`

## Alternative: Deploy to Netlify

1. **Push code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to https://app.netlify.com/start
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add the same variables as listed above for Vercel

## Custom Domain Setup

### On Vercel:
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

### On Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow the DNS configuration instructions

## Important Notes

- Never commit your `.env` file to Git
- The VITE_ prefix is required for environment variables to be exposed to the browser
- After any environment variable changes, you must redeploy
- Your Supabase backend is already live and will work with the deployed frontend
