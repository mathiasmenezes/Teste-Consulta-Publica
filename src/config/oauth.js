// OAuth Configuration
// In production, these should be set as environment variables

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
    scope: 'email profile',
    responseType: 'token',
    redirectUri: window.location.origin + '/auth/google/callback'
  },

  // Facebook OAuth Configuration
  facebook: {
    appId: process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id',
    scope: 'email,public_profile',
    responseType: 'token',
    redirectUri: window.location.origin + '/auth/facebook/callback'
  }
};

// Demo OAuth Configuration (for development/testing)
export const DEMO_OAUTH_CONFIG = {
  google: {
    clientId: 'demo-google-client-id',
    scope: 'email profile',
    responseType: 'token',
    redirectUri: window.location.origin + '/auth/google/callback'
  },
  facebook: {
    appId: 'demo-facebook-app-id',
    scope: 'email,public_profile',
    responseType: 'token',
    redirectUri: window.location.origin + '/auth/facebook/callback'
  }
};

// Instructions for setting up OAuth in production:
export const OAUTH_SETUP_INSTRUCTIONS = {
  google: {
    title: 'Google OAuth Setup',
    steps: [
      'Go to Google Cloud Console (https://console.cloud.google.com/)',
      'Create a new project or select an existing one',
      'Enable the Google+ API',
      'Go to Credentials and create an OAuth 2.0 Client ID',
      'Add your domain to authorized origins',
      'Add your callback URL to authorized redirect URIs',
      'Copy the Client ID and set it as REACT_APP_GOOGLE_CLIENT_ID'
    ]
  },
  facebook: {
    title: 'Facebook OAuth Setup',
    steps: [
      'Go to Facebook Developers (https://developers.facebook.com/)',
      'Create a new app or select an existing one',
      'Add Facebook Login product to your app',
      'Configure the OAuth settings',
      'Add your domain to Valid OAuth Redirect URIs',
      'Copy the App ID and set it as REACT_APP_FACEBOOK_APP_ID'
    ]
  }
};
