import React, { useState } from 'react';
import { Plus, Database, Trash2, Edit2 } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

interface Column {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string;
}

interface Table {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  createdAt: string;
}

const TableManager: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleCreateTable = (table: Table) => {
    setTables([...tables, table]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteTable = (tableId: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      setTables(tables.filter((t) => t.id !== tableId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Tables</h2>
          <p className="text-gray-600 mt-1">Manage your database schema and tables</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Table
        </Button>
      </div>

      {tables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{table.name}</h3>
                    {table.description && (
                      <p className="text-sm text-gray-500">{table.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedTable(table)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => handleDeleteTable(table.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Columns</h4>
                <div className="space-y-2">
                  {table.columns.map((column, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono text-gray-800">{column.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">{column.type}</span>
                        {column.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {column.unique && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            Unique
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created {new Date(table.createdAt).toLocaleDateString()}</span>
                  <span>{table.columns.length} columns</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Tables Created</h3>
          <p className="text-gray-500 mt-1">
            Create your first table to start building APIs
          </p>
          <Button
            variant="primary"
            className="mt-4"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Table
          </Button>
        </Card>
      )}

      {/* Create/Edit Table Modal would go here */}
    </div>
  );
};

export default TableManager;