import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../../contexts/FormContext';
import { useAuth } from '../../contexts/AuthContext';
import FormField from '../form/FormField';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';


const FormResponse = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getFormById, submitResponse, hasUserResponded, loading } = useForm();
  
  const [formData, setFormData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyResponded, setHasAlreadyResponded] = useState(false);
  const [formLoading, setFormLoading] = useState(true);

  const loadFormData = useCallback(async () => {
    try {
      setFormLoading(true);
      const form = await getFormById(formId);
      
      if (form) {
        setFormData(form);
        
        // Check if user has already responded
        const responded = await hasUserResponded(formId, currentUser.id);
        setHasAlreadyResponded(responded);
        
        // Initialize form values (exclude static_text and divider fields)
        const initialValues = {};
        form.fields.forEach((field, index) => {
          const fieldId = field.id || index;
          if (field.type === 'static_text' || field.type === 'divider') {
            // Skip these field types as they don't require user input
            return;
          }
          if (field.type === 'checkbox') {
            initialValues[fieldId] = [];
          } else {
            initialValues[fieldId] = '';
          }
        });
        setFormValues(initialValues);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    } finally {
      setFormLoading(false);
    }
  }, [formId, getFormById, hasUserResponded, currentUser.id]);

  useEffect(() => {
    loadFormData();
  }, [formId, loadFormData]);

  const handleFieldChange = (index, value) => {
    const field = formData.fields[index];
    const fieldId = field.id || index;
    
    // Skip static_text and divider fields as they don't require user input
    if (field.type === 'static_text' || field.type === 'divider') {
      return;
    }
    
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    formData.fields.forEach((field, index) => {
      const fieldId = field.id || index;
      
      // Skip static_text and divider fields as they don't require validation
      if (field.type === 'static_text' || field.type === 'divider') {
        return;
      }
      
      const value = formValues[fieldId];
      
      if (field.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || value.trim() === '') {
          newErrors[fieldId] = 'Este campo é obrigatório';
        }
      }
      
      // Additional validation for email fields
      if (field.type === 'email' && value && !isValidEmail(value)) {
        newErrors[fieldId] = 'Por favor, insira um endereço de email válido';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitResponse(formId, formValues, currentUser.id);
      if (result.success) {
        // Redirect to user dashboard after successful submission
        navigate('/user');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!formData.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Formulário não encontrado</h2>
          <button
            onClick={() => navigate('/user')}
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
          >
            Voltar para o Painel
          </button>
        </div>
      </div>
    );
  }

  if (hasAlreadyResponded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Formulário já completado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Você já enviou uma resposta para "{formData.title}". Cada usuário só pode responder uma vez a este formulário.
            </p>
            <button
              onClick={() => navigate('/user')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Painel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar para o Painel
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {formData.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {formData.title}
              </h2>
              {formData.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  {formData.description}
                </p>
              )}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium mb-1">IMPORTANTE:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Você só pode responder este formulário uma vez</li>
                      <li>Campos obrigatórios são marcados com asterisco (*)</li>
                      <li>Revise suas respostas antes de enviar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.fields.map((field, index) => {
                const fieldId = field.id || index;
                const hasError = errors[fieldId];
                
                return (
                  <div key={fieldId} className={`${hasError ? 'border-l-4 border-red-400 pl-4' : ''}`}>
                    <FormField
                      field={field}
                      index={index}
                      isPreview={true}
                      value={formValues[fieldId] || ''}
                      onChange={(value) => handleFieldChange(index, value)}
                    />
                    {hasError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {hasError}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Formulário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FormResponse;
