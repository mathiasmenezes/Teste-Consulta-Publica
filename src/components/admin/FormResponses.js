import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../../contexts/FormContext';

import { 
  ArrowLeft, 
  Download, 
  Users, 
  Calendar,
  User,
  BarChart3
} from 'lucide-react';

const FormResponses = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const { getFormById, getFormResponses, loading } = useForm();
  
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadFormData = useCallback(async () => {
    try {
      setDataLoading(true);
      const [formData, responsesData] = await Promise.all([
        getFormById(formId),
        getFormResponses(formId)
      ]);
      
      setForm(formData);
      setResponses(responsesData);
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    } finally {
      setDataLoading(false);
    }
  }, [formId, getFormById, getFormResponses]);

  useEffect(() => {
    loadFormData();
  }, [formId, loadFormData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportResponses = () => {
    if (!form || responses.length === 0) return;

    const csvData = [
      // Header row
      ['User', 'Submitted At', ...form.fields.map(field => field.label)]
    ];

    // Data rows
    responses.forEach(response => {
      const row = [
        response.user_name || `User ${response.user_id}`,
        formatDate(response.submitted_at),
        ...form.fields.map(field => {
          const value = response.data[field.id || form.fields.indexOf(field)];
          return Array.isArray(value) ? value.join(', ') : (value || '');
        })
      ];
      csvData.push(row);
    });

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openResponseModal = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Formulário não encontrado</h2>
          <button
            onClick={() => navigate('/admin')}
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
          >
            Voltar para o Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar para o Painel
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Respostas do Formulário
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportResponses}
                disabled={responses.length === 0}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {responses.length} respostas
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Criado em {formatDate(form.created_at)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{responses.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total de Respostas</div>
            </div>
          </div>
        </div>

        {/* Responses */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
              <BarChart3 className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma resposta ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              As respostas aparecerão aqui assim que os usuários começarem a preencher o formulário
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Todas as Respostas</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enviado
                    </th>
                    {form.fields.map((field, index) => (
                      <th key={field.id || index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.map((response, responseIndex) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {response.user_name || `Usuário ${response.user_id}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {response.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(response.submitted_at)}
                      </td>
                      {form.fields.map((field, fieldIndex) => {
                        const value = response.data[field.id || fieldIndex];
                        return (
                          <td key={field.id || fieldIndex} className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate">
                              {Array.isArray(value) ? value.join(', ') : (value || '-')}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openResponseModal(response)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Response Detail Modal */}
      {showResponseModal && selectedResponse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes da Resposta
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Usuário: {selectedResponse.user_name || `Usuário ${selectedResponse.user_id}`}</span>
                  <span>Enviado: {formatDate(selectedResponse.submitted_at)}</span>
                </div>
                
                <div className="border-t pt-4">
                  {form.fields.map((field, index) => {
                    const value = selectedResponse.data[field.id || index];
                    return (
                      <div key={field.id || index} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {Array.isArray(value) ? value.join(', ') : (value || 'Nenhuma resposta')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormResponses;
