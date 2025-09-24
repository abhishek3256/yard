# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Git installed on your machine

## Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd C:\Users\Acer Nitro\Desktop\yard

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Multi-tenant SaaS Notes Application"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `multi-tenant-notes-saas`
4. Make it **Public** (required for free Vercel deployment)
5. Don't initialize with README (we already have files)
6. Click "Create repository"

## Step 3: Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/multi-tenant-notes-saas.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository: `multi-tenant-notes-saas`
5. Click "Import"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: multi-tenant-notes-saas
# - Directory: ./
# - Override settings? No
```

## Step 5: Configure Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the following variable:
   - **Name**: `JWT_SECRET`
   - **Value**: `your-super-secret-jwt-key-change-in-production`
   - **Environment**: Production, Preview, Development

## Step 6: Redeploy (if needed)

After adding environment variables:
1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

## Step 7: Test Your Deployment

Your application will be available at: `https://your-project-name.vercel.app`

### Test Endpoints:

1. **Health Check**: `GET https://your-project-name.vercel.app/api/health`
2. **Login**: `POST https://your-project-name.vercel.app/api/auth/login`
3. **Create Note**: `POST https://your-project-name.vercel.app/api/notes`

### Test Accounts:
- `admin@acme.test` (password: password)
- `user@acme.test` (password: password)
- `admin@globex.test` (password: password)
- `user@globex.test` (password: password)

## Troubleshooting

### Common Issues:

1. **Database not initializing**: 
   - Check that environment variables are set
   - Redeploy after adding environment variables

2. **CORS errors**:
   - Middleware is configured for CORS
   - Check browser console for specific errors

3. **Build errors**:
   - Ensure all dependencies are in package.json
   - Check TypeScript compilation

### Manual Database Reset:
If you need to reset the database, the app will automatically recreate it on first API call.

## Production Considerations

1. **Change JWT Secret**: Use a strong, unique JWT secret in production
2. **Database**: SQLite works for demo, consider PostgreSQL for production
3. **Monitoring**: Add logging and monitoring for production use
4. **Security**: Implement rate limiting and additional security measures

## Automatic Deployments

Once set up, every push to your main branch will automatically deploy to Vercel!

```bash
# Make changes and push
git add .
git commit -m "Update application"
git push origin main
# Vercel will automatically deploy
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure all dependencies are installed
4. Check the application logs in Vercel dashboard
