import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { FormProvider } from './contexts/FormContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import DemoResetLink from './components/auth/DemoResetLink';
import OAuthCallback from './components/auth/OAuthCallback';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import FormBuilder from './components/admin/FormBuilder';
import FormResponse from './components/user/FormResponse';
import FormResponses from './components/admin/FormResponses';
import FormAnalytics from './components/admin/FormAnalytics';
import UserRegistration from './components/admin/UserRegistration';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FormProvider>
          <Router>
            <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/demo-reset-link" element={<DemoResetLink />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute role="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/form-builder" 
                  element={
                    <ProtectedRoute role="ADMIN">
                      <FormBuilder />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/form-builder/:formId" 
                  element={
                    <ProtectedRoute role="ADMIN">
                      <FormBuilder />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/responses/:formId" 
                  element={
                    <ProtectedRoute role="ADMIN">
                      <FormResponses />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics/:formId" 
                  element={
                    <ProtectedRoute role="ADMIN">
                      <FormAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/register-user" 
                  element={
                    <ProtectedRoute role="ADMIN">
                      <UserRegistration />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User Routes */}
                <Route 
                  path="/user" 
                  element={
                    <ProtectedRoute role="USER">
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/user/form/:formId" 
                  element={
                    <ProtectedRoute role="USER">
                      <FormResponse />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </FormProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
