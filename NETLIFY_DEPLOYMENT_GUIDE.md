# Netlify Deployment Guide

This guide will help you deploy your tender management application to Netlify.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Netlify account (free at https://netlify.com)
3. A PostgreSQL database (recommended: Neon, Supabase, or PlanetScale)

## Database Setup

1. Create a PostgreSQL database at:
   - **Neon** (recommended): https://neon.tech
   - **Supabase**: https://supabase.com
   - **PlanetScale**: https://planetscale.com

2. Get your database connection string (DATABASE_URL)

## Deployment Steps

### Option 1: Netlify Dashboard (Recommended)

1. **Connect your repository:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select your repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

3. **Set environment variables:**
   - Go to Site Settings → Environment Variables
   - Add: `DATABASE_URL` = your database connection string

4. **Deploy:**
   - Click "Deploy site"
   - Your app will be live at: `your-site-name.netlify.app`

### Option 2: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize your site:**
   ```bash
   netlify init
   ```

4. **Set environment variables:**
   ```bash
   netlify env:set DATABASE_URL "your_database_connection_string"
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Database Migration

After deployment, you may need to run database migrations:

1. **Using Drizzle locally:**
   ```bash
   # Generate migration files
   npm run db:push
   ```

2. **Or using database client:**
   - Connect to your database
   - Run the SQL from your migration files

## Verification

1. Visit your deployed site
2. Check that the API endpoints work: `https://your-site.netlify.app/.netlify/functions/api/health`
3. Verify the tender management interface loads correctly

## Troubleshooting

- **Functions not working**: Check the Functions tab in Netlify dashboard for error logs
- **Database connection issues**: Verify your DATABASE_URL environment variable
- **Build failures**: Check the Deploy tab for build logs
- **CORS errors**: The serverless function includes CORS headers

## Custom Domain (Optional)

1. Go to Site Settings → Domain management
2. Add your custom domain
3. Configure DNS records as instructed

Your tender management application is now live on Netlify!