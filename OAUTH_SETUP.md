# Google OAuth Setup Guide

This guide explains how to set up **real** Google OAuth for the application.

## ⚠️ Important Notice

The application now uses **real Google OAuth authentication**. Facebook login has been removed.

## Prerequisites

- Google Cloud Console account
- Application running on `http://localhost:3000` (frontend)
- Backend running on `http://localhost:5000`

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: Your app name
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:5000/auth/google/callback`

### 3. Get Credentials

Copy the **Client ID** and **Client Secret** from the created credentials.



## Environment Configuration

Update your `backend/config.env` file with the **real** credentials:

```env
# OAuth Configuration - Google Auth Setup
GOOGLE_CLIENT_ID="84613775915-3kbuchd30tebuu3mccubtdahhpbq2h5j.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
SESSION_SECRET="your-session-secret-key"
```

## Testing OAuth

1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `npm start`
3. Go to the login page
4. Click on "Google" or "Facebook" buttons
5. Complete the OAuth flow

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure the redirect URI in your OAuth provider matches exactly
2. **"App not configured"**: Ensure your Facebook app is in development mode or has been reviewed
3. **"Invalid client"**: Check that your Google/Facebook credentials are correct
4. **"Route not found"**: Ensure the backend server is running and OAuth routes are properly configured

### Development vs Production

For production deployment:

1. Update redirect URIs to your production domain
2. Use environment variables for all secrets
3. Enable HTTPS for production
4. Set `NODE_ENV=production` for secure cookies

## Security Notes

- Never commit real OAuth credentials to version control
- Use environment variables for all secrets
- Regularly rotate your OAuth secrets
- Monitor OAuth usage for suspicious activity

## Current Status

- ✅ **Google OAuth**: Implemented and configured
- ✅ **Backend Routes**: Configured
- ✅ **Frontend Integration**: Complete
- ✅ **OAuth Credentials**: Configured with real Google credentials
- ✅ **Facebook Login**: Removed

## Testing Google OAuth

1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `npm start`
3. Go to the login page
4. Click "Continue with Google" button
5. Complete the Google OAuth flow

**Note**: The application now uses real Google OAuth authentication with the provided credentials.
