import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../contexts/FormContext';
import UserProfile from '../auth/UserProfile';

import ThemeToggle from '../common/ThemeToggle';
import { 
  LogOut, 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getActiveForms, getFormResponseCount, hasUserResponded } = useForm();
  const [activeForms, setActiveForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActiveForms = useCallback(async () => {
    try {
      setLoading(true);
      const forms = await getActiveForms();
      
      // Get response counts and user response status for each form
      const formsWithData = await Promise.all(
        forms.map(async (form) => {
          const [responseCount, hasResponded] = await Promise.all([
            getFormResponseCount(form.id),
            hasUserResponded(form.id, currentUser.id)
          ]);
          
          return {
            ...form,
            responseCount,
            hasResponded
          };
        })
      );
      
      setActiveForms(formsWithData);
    } catch (error) {
      console.error('Erro ao carregar formulários ativos:', error);
    } finally {
      setLoading(false);
    }
  }, [getActiveForms, getFormResponseCount, hasUserResponded, currentUser.id]);

  useEffect(() => {
    loadActiveForms();
  }, [loadActiveForms]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFormStatus = (form) => {
    return form.hasResponded ? 'completed' : 'pending';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusText = (status) => {
    if (status === 'completed') {
      return 'Concluído';
    }
    return 'Pendente';
  };

  const getStatusColor = (status) => {
    if (status === 'completed') {
      return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
    }
    return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
  };

  const completedForms = activeForms.filter(form => form.hasResponded);
  const pendingForms = activeForms.filter(form => !form.hasResponded);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Cidadão+ Consulta Pública</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bem-vindo, {currentUser?.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="mb-8">
          <UserProfile />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Formulários</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeForms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Concluídos</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedForms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingForms.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forms List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : activeForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum formulário disponível</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Não há formulários ativos no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Forms */}
            {pendingForms.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Formulários Pendentes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingForms.map((form) => (
                    <div key={form.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{form.title}</h3>
                          {form.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <Calendar className="h-4 w-4 mr-1" />
                            Criado em {formatDate(form.createdAt)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-1" />
                            {form.responseCount || 0} respostas
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getFormStatus(form))}`}>
                            {getStatusIcon(getFormStatus(form))}
                            <span className="ml-1">{getStatusText(getFormStatus(form))}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => navigate(`/user/form/${form.id}`)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                        >
                          Iniciar Formulário
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Forms */}
            {completedForms.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Formulários Concluídos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedForms.map((form) => (
                    <div key={form.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{form.title}</h3>
                          {form.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <Calendar className="h-4 w-4 mr-1" />
                            Criado em {formatDate(form.createdAt)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-1" />
                            {form.responseCount || 0} respostas
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getFormStatus(form))}`}>
                            {getStatusIcon(getFormStatus(form))}
                            <span className="ml-1">{getStatusText(getFormStatus(form))}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          disabled
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                        >
                          Formulário Concluído
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;
