import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft } from 'lucide-react';


const DemoResetLink = () => {
  const [resetData, setResetData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('passwordResetData');
    if (storedData) {
      setResetData(JSON.parse(storedData));
    }
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar para a área de transferência:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!resetData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Nenhum Token de Redefinição
              </h2>
              <p className="text-gray-600 mb-6">
                Nenhum token de redefinição de senha foi encontrado. Por favor, solicite um novo link de redefinição.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Solicitar Link de Redefinição
              </Link>
            </div>
          </div>
        </div>

      </div>
    );
  }

  const resetUrl = `${window.location.origin}/reset-password/${resetData.token}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Link de Redefinição de Senha
              </h2>
              <p className="text-gray-600">
                Este é o link de redefinição de senha gerado para demonstração.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informações do Token
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email:
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{resetData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expira em:
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(resetData.expiresAt)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link de Redefinição
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={resetUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(resetUrl)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Clique no botão de cópia para copiar o link para a área de transferência
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Token (para referência)
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={resetData.token}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono text-xs"
                />
                <button
                  onClick={() => copyToClipboard(resetData.token)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">Nota de Demonstração:</p>
                <p>
                  Em uma aplicação real, este link seria enviado por email para o usuário.
                  Este é apenas um exemplo para demonstração da funcionalidade.
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                to={resetUrl}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Testar Link de Redefinição
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o Login
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DemoResetLink;
