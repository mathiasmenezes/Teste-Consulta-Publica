import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Shield, Chrome, Facebook } from 'lucide-react';

const UserProfile = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  const getSocialProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return <Chrome className="h-4 w-4 text-red-600" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSocialProviderName = (provider) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'facebook':
        return 'Facebook';
      default:
        return 'Email';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          {currentUser.social_provider ? (
            getSocialProviderIcon(currentUser.social_provider)
          ) : (
            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentUser.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <span className="text-gray-900 dark:text-white">{currentUser.email}</span>
        </div>

        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-gray-400" />
          <span className="text-gray-900 dark:text-white capitalize">{currentUser.role}</span>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            Member since {formatDate(currentUser.created_at)}
          </span>
        </div>

        {currentUser.social_provider && (
          <div className="flex items-center space-x-3">
            {getSocialProviderIcon(currentUser.social_provider)}
            <span className="text-gray-900 dark:text-white">
              Connected via {getSocialProviderName(currentUser.social_provider)}
            </span>
          </div>
        )}

        {currentUser.updated_at && currentUser.updated_at !== currentUser.created_at && (
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-gray-900 dark:text-white">
              Last updated {formatDate(currentUser.updated_at)}
            </span>
          </div>
        )}
      </div>

      {currentUser.social_provider && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getSocialProviderIcon(currentUser.social_provider)}
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Social Login Active</p>
              <p>
                Your account is connected to {getSocialProviderName(currentUser.social_provider)}. 
                You can use your {getSocialProviderName(currentUser.social_provider)} account to sign in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
