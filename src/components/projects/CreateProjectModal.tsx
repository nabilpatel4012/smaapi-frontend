import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database } from 'lucide-react';
import Button from '../common/Button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: {
    name: string;
    description: string;
    databaseType: string;
  }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    databaseType: 'PostgreSQL',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.databaseType) {
      newErrors.databaseType = 'Database type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const databaseTypes = [
    {
      id: 'PostgreSQL',
      name: 'PostgreSQL',
      description: 'Advanced open-source database',
      icon: <Database className="h-6 w-6 text-blue-500" />,
    },
    {
      id: 'MySQL',
      name: 'MySQL',
      description: 'Popular open-source database',
      icon: <Database className="h-6 w-6 text-orange-500" />,
    },
    {
      id: 'MongoDB',
      name: 'MongoDB',
      description: 'NoSQL document database',
      icon: <Database className="h-6 w-6 text-green-500" />,
    },
    {
      id: 'DynamoDB',
      name: 'DynamoDB',
      description: 'AWS NoSQL database service',
      icon: <Database className="h-6 w-6 text-purple-500" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Project Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Database Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {databaseTypes.map((db) => (
                        <div
                          key={db.id}
                          className={`cursor-pointer rounded-lg border p-4 ${
                            formData.databaseType === db.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({ ...formData, databaseType: db.id })}
                        >
                          <div className="flex items-center">
                            {db.icon}
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">{db.name}</h4>
                              <p className="text-xs text-gray-500">{db.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.databaseType && (
                      <p className="mt-1 text-sm text-red-600">{errors.databaseType}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Project
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;