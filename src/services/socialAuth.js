import { jwtDecode } from 'jwt-decode';
import apiService from './api';

class SocialAuthService {
  constructor() {
    this.googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';
    this.facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id';
  }

  // Google OAuth Configuration
  getGoogleConfig() {
    return {
      client_id: this.googleClientId,
      scope: 'email profile',
      response_type: 'token',
      redirect_uri: window.location.origin + '/auth/google/callback'
    };
  }

  // Facebook OAuth Configuration
  getFacebookConfig() {
    return {
      app_id: this.facebookAppId,
      scope: 'email,public_profile',
      response_type: 'token',
      redirect_uri: window.location.origin + '/auth/facebook/callback'
    };
  }

  // Open OAuth popup window
  openOAuthPopup(provider, config) {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const url = this.buildOAuthUrl(provider, config);
    
    const popup = window.open(
      url,
      `${provider}OAuth`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('OAuth popup was closed'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OAUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          resolve(event.data.payload);
        } else if (event.data.type === 'OAUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  // Build OAuth URL for different providers
  buildOAuthUrl(provider, config) {
    switch (provider) {
      case 'google':
        const googleParams = new URLSearchParams({
          client_id: config.client_id,
          redirect_uri: config.redirect_uri,
          scope: config.scope,
          response_type: config.response_type,
          state: this.generateState()
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`;
      
      case 'facebook':
        const facebookParams = new URLSearchParams({
          client_id: config.app_id,
          redirect_uri: config.redirect_uri,
          scope: config.scope,
          response_type: config.response_type,
          state: this.generateState()
        });
        return `https://www.facebook.com/v18.0/dialog/oauth?${facebookParams}`;
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // Generate random state for OAuth security
  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(token) {
    try {
      // Decode the ID token to get user information
      const decoded = jwtDecode(token);
      
      const userData = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        socialId: decoded.sub,
        provider: 'google'
      };

      return await this.processSocialUser(userData);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw new Error('Failed to process Google login');
    }
  }

  // Handle Facebook OAuth callback
  async handleFacebookCallback(token) {
    try {
      // Get user information from Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
      const userData = await response.json();

      if (userData.error) {
        throw new Error(userData.error.message);
      }

      const processedUserData = {
        email: userData.email,
        name: userData.name,
        picture: userData.picture?.data?.url,
        socialId: userData.id,
        provider: 'facebook'
      };

      return await this.processSocialUser(processedUserData);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      throw new Error('Failed to process Facebook login');
    }
  }

  // Process social user data and create/update user
  async processSocialUser(userData) {
    try {
      // Use the API service to handle social login
      const response = await apiService.socialLogin(
        userData.email,
        userData.name,
        userData.provider,
        userData.socialId
      );

      if (response.success) {
        return {
          success: true,
          user: response.user,
          isNewUser: !response.user.socialProvider // Check if this is the first social login
        };
      } else {
        throw new Error('Social login failed');
      }
    } catch (error) {
      console.error('Process social user error:', error);
      throw error;
    }
  }

  // Demo OAuth flow (for development/testing)
  async demoSocialLogin(provider) {
    try {
      // Simulate OAuth flow delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoUsers = {
        google: {
          email: 'demo.google@example.com',
          name: 'Demo Google User',
          picture: 'https://via.placeholder.com/150',
          socialId: 'demo_google_123',
          provider: 'google'
        },
        facebook: {
          email: 'demo.facebook@example.com',
          name: 'Demo Facebook User',
          picture: 'https://via.placeholder.com/150',
          socialId: 'demo_facebook_456',
          provider: 'facebook'
        }
      };

      const userData = demoUsers[provider];
      if (!userData) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      return await this.processSocialUser(userData);
    } catch (error) {
      console.error('Demo social login error:', error);
      throw error;
    }
  }
}

const socialAuthService = new SocialAuthService();
export default socialAuthService;
