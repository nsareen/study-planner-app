# Study Planner App - Deployment Guide

## GitHub Repository
✅ **Repository Created**: https://github.com/nsareen/study-planner-app
✅ **Code Pushed**: All code is now on the main branch

## Connecting to Vercel for Automatic Deployments

### Step 1: Sign up/Login to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. **Choose "Continue with GitHub"** (this links your GitHub account)
4. Authorize Vercel to access your GitHub repositories

### Step 2: Import Your Project
1. Once logged in, click **"Add New Project"** or **"Import Project"**
2. You'll see a list of your GitHub repositories
3. Find **"study-planner-app"** and click **"Import"**

### Step 3: Configure Build Settings
Vercel should auto-detect these settings from our `vercel.json`, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `.` (leave empty or put a dot)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Environment Variables (if needed)
Currently, the app doesn't require any environment variables. If you add any later:
1. Go to Settings → Environment Variables
2. Add your variables
3. Redeploy

### Step 5: Deploy
1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Deploy to a URL like: `https://study-planner-app.vercel.app`

### Step 6: Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Automatic Deployments
Once connected, every push to your GitHub repository will trigger:
- **Main branch**: Production deployment
- **Other branches**: Preview deployments

## Your Next Steps:
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import the "study-planner-app" repository
4. Deploy!

## Useful Commands

### Local Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run tests
npm run lint             # Check code quality
```

### GitHub Commands
```bash
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push origin main     # Push to GitHub (triggers deployment)
```

## Deployment Status
After deployment, you can:
1. View deployment logs in Vercel dashboard
2. Get a unique URL for each deployment
3. Roll back to previous deployments if needed
4. View analytics and performance metrics

## Troubleshooting

### Build Fails?
1. Check the build logs in Vercel dashboard
2. Common issues:
   - TypeScript errors: Run `npm run build` locally first
   - Missing dependencies: Ensure package.json is complete
   - Version conflicts: Check Node.js version requirements

### 404 Errors on Routes?
The `vercel.json` file includes rewrites to handle client-side routing. This should work automatically.

### Need Help?
- Vercel Docs: https://vercel.com/docs
- GitHub Integration: https://vercel.com/docs/deployments/git/vercel-for-github
- Support: https://vercel.com/support

## Success Checklist
- [x] GitHub repository created
- [x] Code pushed to main branch
- [x] vercel.json configured
- [x] .vercelignore configured
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported and deployed
- [ ] Live URL received

Your app will be live at a URL like:
`https://study-planner-app-[your-username].vercel.app`