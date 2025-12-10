<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1WYQzvGB9pmPLVZlTBIBIJ8kZvoI5A_Y2

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

### Step 1: Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new)
2. Add and commit your code:
   ```bash
   git add .
   git commit -m "Initial commit"
   ```
3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Netlify

1. Go to [Netlify](https://app.netlify.com/) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify to access your repositories
4. Select your repository
5. Configure build settings (should auto-detect from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables:
   - Click "Show advanced" → "New variable"
   - Add `GEMINI_API_KEY` with your API key value
7. Click "Deploy site"

Your app will be live at a Netlify URL (e.g., `https://your-app-name.netlify.app`)

### Environment Variables

Make sure to set the following environment variable in Netlify:
- `GEMINI_API_KEY`: Your Google Gemini API key
