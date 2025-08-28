import React, { useState } from 'react';
import { Chrome } from 'lucide-react';

const SocialLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    
    try {
      // Use real OAuth endpoints
      const oauthUrl = `https://consulta-publica-2f0cb893919c.herokuapp.com/auth/${provider}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Erro de login social:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Ou continue com</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          className="w-full max-w-xs inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Chrome className="h-5 w-5" />
          <span className="ml-2">Google</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Processando login social...</p>
        </div>
      )}
    </div>
  );
};

export default SocialLogin;
