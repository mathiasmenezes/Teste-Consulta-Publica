import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session and token
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao analisar usuário armazenado:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setCurrentUser(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        toast.success(`Bem-vindo de volta, ${response.user.name}!`);
        return { success: true, user: response.user };
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      toast.error(error.message || 'Falha ao fazer login');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    toast.success('Deslogado com sucesso');
  };

  const registerUser = async (email, password, name) => {
    try {
      const response = await apiService.register(email, password, name);
      
      if (response.success) {
        toast.success('Usuário registrado com sucesso');
        return { success: true };
      } else {
        throw new Error('Falha ao registrar usuário');
      }
    } catch (error) {
      toast.error(error.message || 'Falha ao registrar usuário');
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await apiService.requestPasswordReset(email);
      
      if (response.success) {
        // In a real application, you would send this token via email
        // For demo purposes, we'll show it in a toast and store it in localStorage
        const resetData = {
          token: response.token,
          email: email,
          expiresAt: response.expiresAt
        };
        
        localStorage.setItem('passwordResetData', JSON.stringify(resetData));
        
        toast.success(`Link de redefinição de senha enviado para ${email}. Verifique seu email.`);
        return { success: true, token: response.token };
      }
    } catch (error) {
      toast.error(error.message || 'Falha ao enviar link de redefinição de senha');
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await apiService.resetPassword(token, newPassword);
      
      if (response.success) {
        toast.success('Senha redefinida com sucesso! Você pode agora fazer login com sua nova senha.');
        localStorage.removeItem('passwordResetData');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Falha ao redefinir senha');
      return { success: false, error: error.message };
    }
  };

  const validateResetToken = async (token) => {
    try {
      const response = await apiService.validateResetToken(token);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  const loginWithSocial = async (user) => {
    try {
      const response = await apiService.socialLogin(user.email, user.name, user.socialProvider, user.socialId);
      
      if (response.success) {
        setCurrentUser(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        toast.success(`Bem-vindo de volta, ${response.user.name}!`);
        return { success: true, user: response.user };
      } else {
        throw new Error('Falha ao fazer login com rede social');
      }
    } catch (error) {
      toast.error('Falha ao fazer login com rede social');
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    registerUser,
    requestPasswordReset,
    resetPassword,
    validateResetToken,
    loginWithSocial,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
