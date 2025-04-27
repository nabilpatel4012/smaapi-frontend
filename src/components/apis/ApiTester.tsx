import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Copy, Download, Upload, Clock } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Editor from '@monaco-editor/react';

interface ApiTesterProps {
  method: string;
  endpoint: string;
  parameters: {
    query: {
      required: string[];
      properties: Record<string, any>;
    } | null;
    body: {
      required: string[];
      properties: Record<string, any>;
    } | null;
  };
}

const ApiTester: React.FC<ApiTesterProps> = ({
  method,
  endpoint,
  parameters,
}) => {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState('{}');
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  });
  const [response, setResponse] = useState<{
    status?: number;
    duration?: number;
    data?: any;
    error?: string;
  }>({});
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [isLoading, setIsLoading] = useState(false);

  const handleQueryParamChange = (key: string, value: string) => {
    setQueryParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setHeaders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addHeader = () => {
    setHeaders(prev => ({
      ...prev,
      '': ''
    }));
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
  };

  const buildUrl = () => {
    const url = new URL(endpoint, window.location.origin);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const response = await fetch(buildUrl(), {
        method,
        headers,
        body: method !== 'GET' ? requestBody : undefined
      });

      const data = await response.json();
      const duration = performance.now() - startTime;

      setResponse({
        status: response.status,
        duration,
        data
      });
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
  };

  const handleDownloadResponse = () => {
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* URL and Method */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-24">
            <select
              value={method}
              disabled
              className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm"
            >
              <option>{method}</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={buildUrl()}
              readOnly
              className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
            />
          </div>
          <Button
            variant="primary"
            leftIcon={<Play size={16} />}
            onClick={handleSendRequest}
            isLoading={isLoading}
          >
            Send
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Request</h3>

          {/* Query Parameters */}
          {parameters.query && (
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Query Parameters</h4>
              <div className="space-y-3">
                {Object.entries(parameters.query.properties).map(([key, schema]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {key}
                      {parameters.query?.required?.includes(key) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={queryParams[key] || ''}
                      onChange={(e) => handleQueryParamChange(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Request Body / Headers Tabs */}
          <Card className="p-4">
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`
                    pb-4 pt-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'body'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setActiveTab('body')}
                >
                  Body
                </button>
                <button
                  className={`
                    pb-4 pt-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'headers'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setActiveTab('headers')}
                >
                  Headers
                </button>
              </nav>
            </div>

            {activeTab === 'body' && (
              <Editor
                height="300px"
                defaultLanguage="json"
                value={requestBody}
                onChange={(value) => setRequestBody(value || '{}')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            )}

            {activeTab === 'headers' && (
              <div className="space-y-3">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newHeaders = { ...headers };
                        delete newHeaders[key];
                        setHeaders({
                          ...newHeaders,
                          [e.target.value]: value
                        });
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Header name"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleHeaderChange(key, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Header value"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addHeader}
                  className="w-full"
                >
                  Add Header
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Response Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Response</h3>
            {response.data && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Copy size={16} />}
                  onClick={handleCopyResponse}
                >
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download size={16} />}
                  onClick={handleDownloadResponse}
                >
                  Download
                </Button>
              </div>
            )}
          </div>

          <Card className="p-4">
            {response.status && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Status {response.status}
                  </span>
                  {response.duration && (
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      {response.duration.toFixed(0)}ms
                    </span>
                  )}
                </div>
              </div>
            )}

            {response.error ? (
              <div className="text-red-600 text-sm">{response.error}</div>
            ) : (
              <Editor
                height="400px"
                defaultLanguage="json"
                value={response.data ? JSON.stringify(response.data, null, 2) : ''}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;