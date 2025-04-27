import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Database, Key, Save, HardDrive, Shield, RefreshCw as Refresh } from 'lucide-react';

const ProjectSettings: React.FC = () => {
  const [dbType, setDbType] = useState('postgres');
  const [dbCredentials, setDbCredentials] = useState({
    host: 'db.example.com',
    port: '5432',
    username: 'apiuser',
    password: '••••••••••••',
    database: 'api_builder_db'
  });
  
  const [apiSettings, setApiSettings] = useState({
    rateLimitEnabled: true,
    rateLimit: 60,
    cachingEnabled: true,
    cacheDuration: 300,
    timeout: 30,
    versioningEnabled: true
  });
  
  const handleDbCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDbCredentials(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApiSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setApiSettings(prev => ({ ...prev, [name]: newValue }));
  };
  
  const handleSaveDbSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Database settings would be saved');
  };
  
  const handleSaveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('API settings would be saved');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Settings</h2>
      
      {/* Database Configuration */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <Database size={18} className="mr-2 text-indigo-600" />
          Database Configuration
        </h3>
        
        <form onSubmit={handleSaveDbSettings} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {['postgres', 'mysql', 'mongodb', 'dynamodb'].map((type) => (
                  <div 
                    key={type}
                    className={`
                      cursor-pointer border rounded-lg p-4 flex items-center
                      ${dbType === type ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                    onClick={() => setDbType(type)}
                  >
                    <div className={`w-4 h-4 rounded-full border ${dbType === type ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`} />
                    <span className="ml-2 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    id="host"
                    name="host"
                    value={dbCredentials.host}
                    onChange={handleDbCredentialChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    id="port"
                    name="port"
                    value={dbCredentials.port}
                    onChange={handleDbCredentialChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={dbCredentials.username}
                    onChange={handleDbCredentialChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={dbCredentials.password}
                    onChange={handleDbCredentialChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    id="database"
                    name="database"
                    value={dbCredentials.database}
                    onChange={handleDbCredentialChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button
                  variant="secondary"
                  leftIcon={<Refresh size={16} />}
                  onClick={() => alert('Testing database connection...')}
                >
                  Test Connection
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save size={16} />}
                >
                  Save Configuration
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </div>
      
      {/* API Configuration */}
      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <Key size={18} className="mr-2 text-indigo-600" />
          API Configuration
        </h3>
        
        <form onSubmit={handleSaveApiSettings} className="space-y-5">
          <Card className="p-4">
            <div className="space-y-5">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Performance Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <input
                        id="rateLimitEnabled"
                        name="rateLimitEnabled"
                        type="checkbox"
                        checked={apiSettings.rateLimitEnabled}
                        onChange={handleApiSettingChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="rateLimitEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable Rate Limiting
                      </label>
                    </div>
                    
                    {apiSettings.rateLimitEnabled && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        className="flex items-center"
                      >
                        <span className="text-sm text-gray-500 mr-2">Limit (req/min):</span>
                        <input
                          type="number"
                          name="rateLimit"
                          value={apiSettings.rateLimit}
                          onChange={handleApiSettingChange}
                          min="1"
                          max="1000"
                          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <input
                        id="cachingEnabled"
                        name="cachingEnabled"
                        type="checkbox"
                        checked={apiSettings.cachingEnabled}
                        onChange={handleApiSettingChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="cachingEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable Caching
                      </label>
                    </div>
                    
                    {apiSettings.cachingEnabled && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        className="flex items-center"
                      >
                        <span className="text-sm text-gray-500 mr-2">TTL (seconds):</span>
                        <input
                          type="number"
                          name="cacheDuration"
                          value={apiSettings.cacheDuration}
                          onChange={handleApiSettingChange}
                          min="1"
                          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
                    Request Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    id="timeout"
                    name="timeout"
                    value={apiSettings.timeout}
                    onChange={handleApiSettingChange}
                    min="1"
                    max="300"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center p-3 border border-gray-200 rounded-md h-full">
                  <input
                    id="versioningEnabled"
                    name="versioningEnabled"
                    type="checkbox"
                    checked={apiSettings.versioningEnabled}
                    onChange={handleApiSettingChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="versioningEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                    Enable API Versioning
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-3">API Keys</h4>
                <div className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-medium text-sm">Primary API Key</span>
                      <p className="text-xs text-gray-500">Use this key for production access</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Refresh size={14} />}
                      onClick={() => alert('API key would be regenerated')}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <div className="flex items-center bg-gray-50 p-2 rounded-md">
                    <code className="text-sm font-mono text-gray-800 flex-grow">sk_live_Rg7dO2fUA9t5KlwQpXXXXXXXXXXXXXXXXXXXXXXX</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert('API key copied to clipboard')}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={16} />}
              >
                Save Settings
              </Button>
            </div>
          </Card>
        </form>
      </div>
      
      {/* Danger Zone */}
      <div className="pt-4 mt-6">
        <Card className="p-4 border-red-200">
          <h3 className="text-lg font-medium text-red-600 flex items-center mb-4">
            <Shield size={18} className="mr-2" />
            Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div>
                <h4 className="font-medium text-gray-800">Purge Cache</h4>
                <p className="text-sm text-gray-500">Clears all cached API responses</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to purge the cache?')) {
                    alert('Cache would be purged');
                  }
                }}
              >
                Purge
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div>
                <h4 className="font-medium text-gray-800">Reset API Settings</h4>
                <p className="text-sm text-gray-500">Resets all API settings to default values</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset API settings?')) {
                    alert('API settings would be reset');
                  }
                }}
              >
                Reset
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-red-200 rounded-md bg-red-50">
              <div>
                <h4 className="font-medium text-red-700">Delete Project</h4>
                <p className="text-sm text-red-600">Permanently delete this project and all its APIs</p>
              </div>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                    alert('Project would be deleted');
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectSettings;