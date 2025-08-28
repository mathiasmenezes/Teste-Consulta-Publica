import React from 'react';
import { X, GripVertical } from 'lucide-react';

const FormField = ({ 
  field, 
  index, 
  onUpdate, 
  onDelete, 
  isPreview = false,
  value = '',
  onChange = () => {}
}) => {
  const handleFieldUpdate = (updates) => {
    onUpdate(index, { ...field, ...updates });
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || 'Digite o texto...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            placeholder={field.placeholder || 'Digite o e-mail...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder || 'Digite o número...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || 'Digite o texto...'}
            rows={field.rows || 3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          >
            <option value="">Selecione uma opção...</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`field-${index}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option);
                    } else {
                      const index = newValue.indexOf(option);
                      if (index > -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    onChange(newValue);
                  }}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );

      case 'static_text':
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {field.content || 'Texto estático'}
            </div>
          </div>
        );

      case 'divider':
        const dividerStyles = {
          solid: 'border-solid',
          dashed: 'border-dashed',
          dotted: 'border-dotted'
        };
        return (
          <div className="my-4">
            <hr className={`border-t-2 ${dividerStyles[field.style] || 'border-solid'} border-gray-300 dark:border-gray-600`} />
          </div>
        );

      default:
        return <div className="text-red-500">Unknown field type: {field.type}</div>;
    }
  };

  if (isPreview) {
    return (
      <div className="mb-6">
        {(field.type !== 'static_text' && field.type !== 'divider') && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {renderField()}
        {field.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{field.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-500 cursor-move" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.type === 'static_text' ? 'Texto Estático' : 
             field.type === 'divider' ? 'Separador' :
             field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
          </span>
        </div>
        <button
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {field.type !== 'static_text' && field.type !== 'divider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rótulo
            </label>
            <input
              type="text"
              value={field.label || ''}
              onChange={(e) => handleFieldUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Rótulo do campo"
            />
          </div>
        )}

        {field.type !== 'static_text' && field.type !== 'divider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={field.description || ''}
              onChange={(e) => handleFieldUpdate({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Descrição do campo"
            />
          </div>
        )}

        {field.type !== 'static_text' && field.type !== 'divider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder (opcional)
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Texto do placeholder"
            />
          </div>
        )}

        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Opções (uma por linha)
            </label>
            <textarea
              value={field.options?.join('\n') || ''}
              onChange={(e) => handleFieldUpdate({ 
                options: e.target.value.split('\n').filter(option => option.trim()) 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
              placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            />
          </div>
        )}

        {field.type === 'textarea' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Linhas
            </label>
            <input
              type="number"
              value={field.rows || 3}
              onChange={(e) => handleFieldUpdate({ rows: parseInt(e.target.value) || 3 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              min="1"
              max="10"
            />
          </div>
        )}

        {field.type === 'static_text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conteúdo do Texto
            </label>
            <textarea
              value={field.content || ''}
              onChange={(e) => handleFieldUpdate({ content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={4}
              placeholder="Digite aqui o texto que será exibido..."
            />
          </div>
        )}

        {field.type === 'divider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estilo da Linha
            </label>
            <select
              value={field.style || 'solid'}
              onChange={(e) => handleFieldUpdate({ style: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="solid">Linha Sólida</option>
              <option value="dashed">Linha Tracejada</option>
              <option value="dotted">Linha Pontilhada</option>
            </select>
          </div>
        )}

        {field.type !== 'static_text' && field.type !== 'divider' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${index}`}
              checked={field.required || false}
              onChange={(e) => handleFieldUpdate({ required: e.target.checked })}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor={`required-${index}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Campo obrigatório
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;
