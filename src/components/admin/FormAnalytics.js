import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../../contexts/FormContext';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Clock,
  FileText,
  PieChart,
  Activity,
  Download
} from 'lucide-react';

const FormAnalytics = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { getFormById, getFormResponses } = useForm();
  
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    fieldAnalytics: [],
    responseTrends: [],
    topResponses: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    loadFormData();
  }, [formId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const formData = await getFormById(formId);
      const responsesData = await getFormResponses(formId);
      
      setForm(formData);
      setResponses(responsesData);
      
      // Calculate analytics
      const calculatedAnalytics = calculateAnalytics(formData, responsesData);
      setAnalytics(calculatedAnalytics);
    } catch (error) {
      console.error('Error loading form analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (formData, responsesData) => {
    if (!formData || !responsesData) return analytics;

    const totalResponses = responsesData.length;
    const fields = formData.fields || [];
    
    // Calculate field analytics (exclude divider and static_text fields)
    const fieldAnalytics = fields
      .filter(field => field.type !== 'divider' && field.type !== 'static_text')
      .map(field => {
        const fieldResponses = responsesData.map(response => {
          const fieldData = response.data[field.id] || response.data[field.label];
          return fieldData;
        }).filter(Boolean);

        const completionRate = totalResponses > 0 ? (fieldResponses.length / totalResponses) * 100 : 0;
        
        let fieldStats = {
          fieldId: field.id,
          fieldLabel: field.label,
          fieldType: field.type,
          completionRate: Math.round(completionRate * 100) / 100,
          totalResponses: fieldResponses.length,
          averageValue: null,
          topValues: []
        };

        // Calculate field-specific analytics
        if (field.type === 'number') {
          const numbers = fieldResponses.map(r => parseFloat(r)).filter(n => !isNaN(n));
          fieldStats.averageValue = numbers.length > 0 ? (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2) : null;
        } else if (['select', 'radio', 'checkbox'].includes(field.type)) {
          const valueCounts = {};
          fieldResponses.forEach(value => {
            if (Array.isArray(value)) {
              value.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
            } else {
              valueCounts[value] = (valueCounts[value] || 0) + 1;
            }
          });
          fieldStats.topValues = Object.entries(valueCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([value, count]) => ({ value, count, percentage: Math.round((count / fieldResponses.length) * 100) }));
        }

        return fieldStats;
      });

    // Calculate response trends (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentResponses = responsesData.filter(response => 
      new Date(response.submittedAt) >= sevenDaysAgo
    );

    const responseTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayResponses = recentResponses.filter(response => {
        const responseDate = new Date(response.submittedAt);
        return responseDate.toDateString() === date.toDateString();
      });
      responseTrends.push({
        date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        count: dayResponses.length
      });
    }

    // Calculate completion time (if available)
    const completionTimes = responsesData
      .filter(response => response.submittedAt && response.createdAt)
      .map(response => {
        const submitted = new Date(response.submittedAt);
        const created = new Date(response.createdAt);
        return (submitted - created) / 1000 / 60; // in minutes
      });

    const averageCompletionTime = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    return {
      totalResponses,
      completionRate: totalResponses > 0 ? 100 : 0, // Assuming all responses are complete
      averageCompletionTime,
      fieldAnalytics,
      responseTrends,
      topResponses: responsesData.slice(0, 5)
    };
  };

  const exportAnalytics = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `form-analytics-${formId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    if (!form || !responses.length) return '';

    const validFields = form.fields.filter(field => field.type !== 'divider' && field.type !== 'static_text');
    const headers = ['ID da Resposta', 'Enviado em', 'ID do Usuário', ...validFields.map(f => f.label)];
    const rows = responses.map(response => [
      response.id,
      new Date(response.submittedAt).toLocaleString('pt-BR'),
      response.userId,
      ...validFields.map(field => {
        const value = response.data[field.id] || response.data[field.label];
        return Array.isArray(value) ? value.join(', ') : (value || '');
      })
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (loading) {
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
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Formulário não encontrado</h3>
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
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Estatísticas do Formulário</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportAnalytics}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{form.title}</h2>
          {form.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
          )}
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Criado em {new Date(form.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {form.fields?.length || 0} campos
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Respostas</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Conclusão</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tempo Médio</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.averageCompletionTime} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {form.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Response Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tendência de Respostas (Últimos 7 dias)</h3>
          <div className="flex items-end space-x-2 h-32">
            {analytics.responseTrends.map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${Math.max(trend.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{trend.date}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{trend.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Field Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Estatísticas por Campo</h3>
          <div className="space-y-4">
            {analytics.fieldAnalytics.map((field, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{field.fieldLabel}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{field.fieldType}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Taxa de Preenchimento</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{field.completionRate}%</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Respostas</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{field.totalResponses}</p>
                  </div>
                  
                  {field.averageValue && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Valor Médio</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{field.averageValue}</p>
                    </div>
                  )}
                </div>

                {/* Top values for select/radio/checkbox fields */}
                {field.topValues && field.topValues.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Valores Mais Frequentes</p>
                    <div className="flex flex-wrap gap-2">
                      {field.topValues.map((value, valueIndex) => (
                        <span 
                          key={valueIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                        >
                          {value.value} ({value.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{field.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${field.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Responses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Respostas Recentes</h3>
          {analytics.topResponses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhuma resposta ainda.</p>
          ) : (
            <div className="space-y-3">
              {analytics.topResponses.map((response, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Resposta #{response.id.slice(-6)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(response.submittedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(response.data).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                      </div>
                    ))}
                    {Object.keys(response.data).length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        +{Object.keys(response.data).length - 3} mais campos
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormAnalytics;
