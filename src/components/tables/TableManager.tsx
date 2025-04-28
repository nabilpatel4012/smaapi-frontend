import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Database,
  Trash2,
  Edit2,
  ExternalLink,
  Key,
  Link as LinkIcon,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import CreateTableForm from "./CreateTableForm";
import { mockTables } from "../../mock/mockTables";

interface Column {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  isPrimary: boolean;
  isIndex: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
  };
}

interface Index {
  name: string;
  columns: string[];
  isUnique: boolean;
}

interface Table {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  indexes?: Index[];
  createdAt: string;
}

const TableManager: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [tables, setTables] = useState<Table[]>(mockTables);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedTables = localStorage.getItem(`project_${projectId}_tables`);
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
  }, [projectId]);

  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem(
        `project_${projectId}_tables`,
        JSON.stringify(tables)
      );
    }
  }, [tables, projectId]);

  const handleCreateTable = (table: Table) => {
    const newTables = [...tables, table];
    setTables(newTables);
    setIsCreateMode(false);
  };

  const handleEditTable = (table: Table) => {
    const updatedTables = tables.map((t) => (t.id === table.id ? table : t));
    setTables(updatedTables);
    setSelectedTable(null);
    setIsEditMode(false);
  };

  const handleDeleteTable = (tableId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this table? This action cannot be undone."
      )
    ) {
      const updatedTables = tables.filter((t) => t.id !== tableId);
      setTables(updatedTables);

      if (updatedTables.length === 0) {
        localStorage.removeItem(`project_${projectId}_tables`);
      } else {
        localStorage.setItem(
          `project_${projectId}_tables`,
          JSON.stringify(updatedTables)
        );
      }
    }
  };

  const handleViewTableDetails = (tableId: string) => {
    navigate(`/tables/${tableId}`);
  };

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.description &&
        table.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isCreateMode) {
    return (
      <CreateTableForm
        existingTables={tables}
        onTableCreated={handleCreateTable}
      />
    );
  }

  if (isEditMode && selectedTable) {
    return (
      <CreateTableForm
        existingTables={tables.filter((t) => t.id !== selectedTable.id)}
        onTableCreated={handleEditTable}
        initialTableData={selectedTable}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Tables</h2>
          <p className="text-gray-600 mt-1">
            Manage your database schema and tables
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setIsCreateMode(true)}
        >
          Create Table
        </Button>
      </div>

      {tables.length > 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search tables..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <Card key={table.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <button
                      onClick={() => handleViewTableDetails(table.id)}
                      className="text-lg font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    >
                      {table.name}
                    </button>
                    {table.description && (
                      <p className="text-sm text-gray-500">
                        {table.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSelectedTable(table);
                      setIsEditMode(true);
                    }}
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Columns
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {table.columns.map((column, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        {column.isPrimary && (
                          <Key size={12} className="text-yellow-500 mr-1" />
                        )}
                        {column.foreignKey && (
                          <LinkIcon size={12} className="text-blue-500 mr-1" />
                        )}
                        <span className="font-mono text-gray-800">
                          {column.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">{column.type}</span>
                        {column.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                            Req
                          </span>
                        )}
                        {column.unique && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            Uniq
                          </span>
                        )}
                        {column.isIndex && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                            Idx
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {table.indexes && table.indexes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Indexes
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                    {table.indexes.map((index, i) => (
                      <div
                        key={i}
                        className="text-sm flex items-center justify-between"
                      >
                        <span className="font-mono text-gray-800">
                          {index.name}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                          {index.isUnique ? "Unique" : "Index"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Created {new Date(table.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-800"
                    rightIcon={<ExternalLink size={12} />}
                    onClick={() =>
                      navigate(
                        `/projects/${projectId}/apis/new?table=${table.id}`
                      )
                    }
                  >
                    Create API
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          {tables.length === 0 ? (
            <>
              <Database size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No tables created yet
              </h3>
              <p className="mt-1 text-gray-500">
                Start by creating your first database table
              </p>
              <Button
                variant="primary"
                className="mt-4"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsCreateMode(true)}
              >
                Create Table
              </Button>
            </>
          ) : (
            <>
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                No tables found
              </h3>
              <p className="mt-1 text-gray-500">Try a different search term</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TableManager;
