import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const FormContext = createContext();

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

export const FormProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await apiService.getAllForms();
      if (response.success) {
        setForms(response.forms);
        // Responses will be loaded per form when needed
        setResponses([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  // Load data from database when user is authenticated
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [loadData, currentUser]);

  const createForm = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await apiService.createForm(formData);
      
      if (response.success) {
        // Reload forms to get the updated list
        const updatedResponse = await apiService.getAllForms();
        if (updatedResponse.success) {
          setForms(updatedResponse.forms);
        }
        toast.success('Formulário criado com sucesso!');
        return { success: true, formId: response.form.id };
      }
    } catch (error) {
      toast.error('Falha ao criar formulário');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateForm = useCallback(async (formId, formData) => {
    setLoading(true);
    try {
      const response = await apiService.updateForm(formId, formData);
      
      if (response.success) {
        // Reload forms to get the updated list
        const updatedResponse = await apiService.getAllForms();
        if (updatedResponse.success) {
          setForms(updatedResponse.forms);
        }
        
        toast.success('Formulário atualizado com sucesso!');
        return { success: true };
      }
    } catch (error) {
      toast.error('Falha ao atualizar formulário');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteForm = useCallback(async (formId) => {
    setLoading(true);
    try {
      const response = await apiService.deleteForm(formId);
      
      if (response.success) {
        // Reload forms to get the updated list
        const updatedResponse = await apiService.getAllForms();
        if (updatedResponse.success) {
          setForms(updatedResponse.forms);
        }
        
        toast.success('Formulário deletado com sucesso!');
        return { success: true };
      }
    } catch (error) {
      toast.error('Falha ao deletar formulário');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getFormById = useCallback(async (formId) => {
    try {
      const response = await apiService.getFormById(formId);
      if (response.success) {
        return response.form;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter formulário:', error);
      return null;
    }
  }, []);

  const submitResponse = useCallback(async (formId, responseData) => {
    setLoading(true);
    try {
      const response = await apiService.submitResponse(formId, responseData);
      
      if (response.success) {
        toast.success('Resposta enviada com sucesso!');
        return { success: true };
      }
    } catch (error) {
      toast.error('Falha ao enviar resposta');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getFormResponses = useCallback(async (formId) => {
    try {
      const response = await apiService.getFormResponses(formId);
      if (response.success) {
        setResponses(response.responses);
        return response.responses;
      }
      return [];
    } catch (error) {
      console.error('Erro ao obter respostas do formulário:', error);
      return [];
    }
  }, []);

  const getActiveForms = useCallback(async () => {
    try {
      const response = await apiService.getActiveForms();
      if (response.success) {
        return response.forms;
      }
      return [];
    } catch (error) {
      console.error('Erro ao obter formulários ativos:', error);
      return [];
    }
  }, []);

  const getFormResponseCount = useCallback(async (formId) => {
    try {
      const response = await apiService.getFormResponseCount(formId);
      return response.count || 0;
    } catch (error) {
      console.error('Erro ao obter contagem de respostas:', error);
      return 0;
    }
  }, []);

  const getStatistics = useCallback(async () => {
    try {
      const response = await apiService.getStatistics();
      return response.stats || { totalUsers: 0, totalForms: 0, totalResponses: 0, activeForms: 0 };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { totalUsers: 0, totalForms: 0, totalResponses: 0, activeForms: 0 };
    }
  }, []);

  const hasUserResponded = useCallback(async (formId, userId) => {
    try {
      const response = await apiService.hasUserResponded(formId, userId);
      return response.hasResponded;
    } catch (error) {
      console.error('Erro ao verificar resposta do usuário:', error);
      return false;
    }
  }, []);

  const exportResponses = useCallback(async (formId, format = 'csv') => {
    try {
      const response = await apiService.exportResponses(formId, format);
      if (response.success) {
        // Create and download the file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-responses-${formId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Respostas exportadas com sucesso!');
        return { success: true };
      }
    } catch (error) {
      toast.error('Falha ao exportar respostas');
      return { success: false, error: error.message };
    }
  }, []);

  const getFormAnalytics = useCallback(async (formId) => {
    try {
      const response = await apiService.getFormAnalytics(formId);
      return response.analytics || {};
    } catch (error) {
      console.error('Erro ao obter analytics do formulário:', error);
      return {};
    }
  }, []);

  const exportFormAnalytics = useCallback(async (formId) => {
    try {
      const response = await apiService.exportFormAnalytics(formId);
      if (response.success) {
        // Create and download the file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-analytics-${formId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Analytics exportados com sucesso!');
        return { success: true };
      }
    } catch (error) {
      toast.error('Falha ao exportar analytics');
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    forms,
    responses,
    loading,
    createForm,
    updateForm,
    deleteForm,
    getFormById,
    submitResponse,
    getFormResponses,
    getActiveForms,
    getFormResponseCount,
    getStatistics,
    hasUserResponded,
    exportResponses,
    getFormAnalytics,
    exportFormAnalytics,
    loadData
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};
