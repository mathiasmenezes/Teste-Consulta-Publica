import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithSocial } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Falha na autenticação OAuth. Tente novamente.');
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('Nenhum token de autenticação recebido.');
          return;
        }

        // Store the token
        localStorage.setItem('token', token);

        // Fetch user data using the token
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        if (userData.success) {
          // Store user data
          localStorage.setItem('currentUser', JSON.stringify(userData.user));
          
          setStatus('success');
          setMessage(`Entrou com ${provider}!`);
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate(userData.user.role === 'ADMIN' ? '/admin' : '/user');
          }, 1500);
        } else {
          throw new Error('Falha ao autenticar o usuário');
        }
      } catch (error) {
        console.error('Erro de retorno de chamada OAuth:', error);
        setStatus('error');
        setMessage('Falha na autenticação. Tente novamente.');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, loginWithSocial]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Loader className="h-12 w-12 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'processing' && 'Processando Autenticação...'}
            {status === 'success' && 'Autenticação Bem-sucedida!'}
            {status === 'error' && 'Autenticação Falhou'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200"
            >
              Voltar ao Login
            </button>
          )}
          
          {status === 'processing' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Por favor, aguarde enquanto concluímos sua autenticação...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
