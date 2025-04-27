import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Moon, Sun, Monitor, Check } from 'lucide-react';

const AppearanceSettings: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [densityLevel, setDensityLevel] = useState('comfortable');
  const [colorAccent, setColorAccent] = useState('indigo');
  
  const handleSaveSettings = () => {
    alert('Appearance settings would be saved');
  };
  
  // Theme options
  const themeOptions = [
    { id: 'light', name: 'Light', icon: <Sun size={18} /> },
    { id: 'dark', name: 'Dark', icon: <Moon size={18} /> },
    { id: 'system', name: 'System', icon: <Monitor size={18} /> },
  ];
  
  // Font size options
  const fontSizeOptions = [
    { id: 'small', name: 'Small', style: 'text-xs' },
    { id: 'medium', name: 'Medium', style: 'text-sm' },
    { id: 'large', name: 'Large', style: 'text-base' },
  ];
  
  // Density options
  const densityOptions = [
    { id: 'compact', name: 'Compact' },
    { id: 'comfortable', name: 'Comfortable' },
    { id: 'spacious', name: 'Spacious' },
  ];
  
  // Color options
  const colorOptions = [
    { id: 'indigo', name: 'Indigo', color: 'bg-indigo-500' },
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
    { id: 'amber', name: 'Amber', color: 'bg-amber-500' },
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance Settings</h2>
      
      {/* Theme Selection */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <div
              key={option.id}
              className={`
                cursor-pointer border rounded-lg p-4
                ${theme === option.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}
              `}
              onClick={() => setTheme(option.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-2 text-gray-700">
                    {option.icon}
                  </div>
                  <span className="font-medium">{option.name}</span>
                </div>
                {theme === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Font Size */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Font Size</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fontSizeOptions.map((option) => (
            <div
              key={option.id}
              className={`
                cursor-pointer border rounded-lg p-4
                ${fontSize === option.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}
              `}
              onClick={() => setFontSize(option.id)}
            >
              <div className="flex items-center justify-between">
                <span className={`${option.style} font-medium`}>{option.name}</span>
                {fontSize === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Density */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">UI Density</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {densityOptions.map((option) => (
            <div
              key={option.id}
              className={`
                cursor-pointer border rounded-lg p-4
                ${densityLevel === option.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}
              `}
              onClick={() => setDensityLevel(option.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.name}</span>
                {densityLevel === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Color Accent */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Color Accent</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {colorOptions.map((option) => (
            <div
              key={option.id}
              className={`
                cursor-pointer border rounded-lg p-3 flex flex-col items-center
                ${colorAccent === option.id ? 'border-gray-700' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setColorAccent(option.id)}
            >
              <div className={`h-8 w-8 rounded-full ${option.color} mb-2`}>
                {colorAccent === option.id && (
                  <div className="h-full w-full flex items-center justify-center">
                    <Check size={18} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm">{option.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Preview */}
      <Card className="p-4">
        <h3 className="text-md font-medium text-gray-900 mb-3">Preview</h3>
        <div className={`
          rounded-lg border border-gray-200 p-4 overflow-hidden
          ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}
        `}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`
                font-semibold
                ${fontSize === 'small' ? 'text-lg' : fontSize === 'medium' ? 'text-xl' : 'text-2xl'}
              `}>
                Sample UI Preview
              </h3>
              <Button
                variant="primary"
                className={`
                  ${colorAccent === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                    colorAccent === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 
                    colorAccent === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 
                    colorAccent === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                    colorAccent === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : 
                    'bg-amber-600 hover:bg-amber-700'}
                `}
              >
                Action Button
              </Button>
            </div>
            
            <div className={`
              rounded-md
              ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
              ${densityLevel === 'compact' ? 'p-2' : densityLevel === 'comfortable' ? 'p-4' : 'p-6'}
            `}>
              <p className={`
                ${fontSize === 'small' ? 'text-xs' : fontSize === 'medium' ? 'text-sm' : 'text-base'}
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                This is a preview of how your interface will look with the selected settings.
                The text size, spacing, and colors will reflect your choices.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${colorAccent === 'indigo' ? 'bg-indigo-100 text-indigo-800' : 
                  colorAccent === 'blue' ? 'bg-blue-100 text-blue-800' : 
                  colorAccent === 'purple' ? 'bg-purple-100 text-purple-800' : 
                  colorAccent === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 
                  colorAccent === 'rose' ? 'bg-rose-100 text-rose-800' : 
                  'bg-amber-100 text-amber-800'}
                ${theme === 'dark' ? 'opacity-90' : ''}
              `}>
                Badge Example
              </span>
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveSettings}
        >
          Save Appearance Settings
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;