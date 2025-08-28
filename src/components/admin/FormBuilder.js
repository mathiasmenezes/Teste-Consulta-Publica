import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useForm } from '../../contexts/FormContext';
import { useAuth } from '../../contexts/AuthContext';
import FormField from '../form/FormField';

import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Eye, 
  EyeOff, 
  Type, 
  Mail, 
  Hash, 
  AlignLeft, 
  List, 
  Circle, 
  CheckSquare, 
  Calendar,
  Settings,
  FileText,
  Minus
} from 'lucide-react';

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getFormById, createForm, updateForm, loading } = useForm();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewValues, setPreviewValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fieldTypes = [
    { type: 'text', label: 'Campo de Texto', icon: Type },
    { type: 'email', label: 'Campo de Email', icon: Mail },
    { type: 'number', label: 'Campo Numérico', icon: Hash },
    { type: 'textarea', label: 'Área de Texto', icon: AlignLeft },
    { type: 'select', label: 'Lista Suspensa', icon: List },
    { type: 'radio', label: 'Botões de Opção', icon: Circle },
    { type: 'checkbox', label: 'Caixas de Seleção', icon: CheckSquare },
    { type: 'date', label: 'Seletor de Data', icon: Calendar },
    { type: 'static_text', label: 'Texto Estático', icon: FileText },
    { type: 'divider', label: 'Separador', icon: Minus }
  ];

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        const existingForm = await getFormById(formId);
        if (existingForm) {
          setFormData(existingForm);
          setIsEditing(true);
        }
      }
    };
    
    loadForm();
  }, [formId, getFormById]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({ ...prev, fields: items }));
  };

  const addField = (fieldType) => {
    let newField = {
      id: Date.now().toString(),
      type: fieldType,
      required: false
    };

    // Set appropriate defaults based on field type
    switch (fieldType) {
      case 'static_text':
        newField = {
          ...newField,
          label: 'Texto Estático',
          content: 'Digite aqui o texto que será exibido...'
        };
        break;
      case 'divider':
        newField = {
          ...newField,
          label: 'Separador',
          style: 'solid' // solid, dashed, dotted
        };
        break;
      case 'select':
      case 'radio':
      case 'checkbox':
        newField = {
          ...newField,
          label: `Novo campo ${fieldType}`,
          options: ['Opção 1', 'Opção 2', 'Opção 3']
        };
        break;
      default:
        newField = {
          ...newField,
          label: `Novo campo ${fieldType}`
        };
    }

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index, updatedField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? updatedField : field
      )
    }));
  };

  const deleteField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Por favor insira um título para o formulário');
      return;
    }

    if (formData.fields.length === 0) {
      alert('Por favor adicione pelo menos um campo ao formulário');
      return;
    }

    try {
      const formDataWithCreator = {
        ...formData,
        createdBy: currentUser.id
      };

      if (isEditing) {
        await updateForm(formId, formDataWithCreator);
      } else {
        const result = await createForm(formDataWithCreator);
        if (result.success) {
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
    }
  };

  const handlePreviewChange = (index, value) => {
    setPreviewValues(prev => ({
      ...prev,
      [index]: value
    }));
  };

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
                Voltar ao Painel
              </button>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Formulário' : 'Criar Novo Formulário'}
          </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Ocultar Pré-visualização' : 'Mostrar Pré-visualização'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? (
                  <div className="loading-spinner mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Atualizar Formulário' : 'Salvar Formulário'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações do Formulário
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título do Formulário *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Digite o título do formulário"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Digite a descrição do formulário"
                  />
                </div>
              </div>
            </div>

            {/* Field Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Campos
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {fieldTypes.map((fieldType) => {
                  const Icon = fieldType.icon;
                  return (
                    <button
                      key={fieldType.type}
                      onClick={() => addField(fieldType.type)}
                      className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                    >
                      <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-center">
                        {fieldType.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Builder Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {showPreview ? 'Pré-visualização do Formulário' : 'Criação de Formulário'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {showPreview 
                    ? 'Pré-visualize como seu formulário aparecerá para os usuários'
                    : 'Arraste e solte campos para criar seu formulário'
                  }
                </p>
              </div>

              <div className="p-6">
                {showPreview ? (
                  /* Preview Mode */
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {formData.title || 'Formulário sem título'}
                      </h1>
                      {formData.description && (
                        <p className="text-gray-600 dark:text-gray-400">{formData.description}</p>
                      )}
                    </div>

                    {formData.fields.map((field, index) => (
                      <FormField
                        key={field.id || index}
                        field={field}
                        index={index}
                        isPreview={true}
                        value={previewValues[index] || ''}
                        onChange={(value) => handlePreviewChange(index, value)}
                      />
                    ))}

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200">
                        Enviar Formulário
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Builder Mode */
                  <div>
                    {formData.fields.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
                          <Plus className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Nenhum campo adicionado ainda
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Comece a criar seu formulário adicionando campos da barra lateral
                        </p>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="form-fields">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {formData.fields.map((field, index) => (
                                <Draggable
                                  key={field.id || index}
                                  draggableId={field.id || index.toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`${snapshot.isDragging ? 'dragging' : ''}`}
                                    >
                                      <FormField
                                        field={field}
                                        index={index}
                                        onUpdate={updateField}
                                        onDelete={deleteField}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FormBuilder;
