---
description: Deploy to Netlify via GitHub
---

# Deploy to Netlify Workflow

This workflow guides you through deploying the Child Marriage Free World Explorer app to Netlify via GitHub.

## Prerequisites

- GitHub account
- Netlify account (free tier is fine)
- GEMINI_API_KEY for the Google Gemini API

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (can be public or private)
3. Do NOT initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL

## Step 2: Push Code to GitHub

// turbo
1. Add the remote repository:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

// turbo
2. Push the code:
```bash
git push -u origin main
```

## Step 3: Connect Netlify to GitHub

1. Go to https://app.netlify.com/
2. Sign in (or create an account if needed)
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub" as the provider
5. Authorize Netlify to access your GitHub account if prompted
6. Select your repository from the list

## Step 4: Configure Build Settings

The build settings should auto-detect from the `netlify.toml` file:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

If not auto-detected, enter these manually.

## Step 5: Add Environment Variables

**CRITICAL:** Before deploying, add your environment variables:

1. Click "Show advanced" or go to "Site settings" → "Environment variables"
2. Add the following variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key

## Step 6: Deploy

1. Click "Deploy site"
2. Wait for the build to complete (usually 1-3 minutes)
3. Your site will be live at a URL like `https://random-name-123.netlify.app`

## Step 7: Custom Domain (Optional)

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## Updating the Deployment

To deploy updates:

// turbo
1. Commit your changes:
```bash
git add .
git commit -m "Your commit message"
```

// turbo
2. Push to GitHub:
```bash
git push
```

Netlify will automatically detect the push and redeploy your site.

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### API Key Issues
- Make sure `GEMINI_API_KEY` is set in Netlify environment variables
- The key should match the one in your local `.env.local` file

### 404 Errors on Refresh
- The `netlify.toml` file includes redirect rules for SPA routing
- If issues persist, check that the redirect rules are present in the config
