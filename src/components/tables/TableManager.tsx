import React, { useState, useEffect, Component, ErrorInfo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
import apiClient from "../../utils/apiClient";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-red-200">
          <h3 className="text-lg font-medium text-red-900">
            Something went wrong
          </h3>
          <p className="text-red-600">{this.state.errorMessage}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

interface Project {
  project_id: number;
  project_name: string;
  db_type: string;
}

// Interface for raw API response
interface RawTable {
  table_id: number;
  table_name: string;
  project_id: number;
  table_schema: {
    columns: Column[];
    indexes?: Index[];
  };
  created_at: string;
}

const TableManager: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialProjectId = queryParams.get("project_id") || projectId || "";

  const [tables, setTables] = useState<Table[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform raw API table data to match Table interface
  const transformTableData = (rawTables: RawTable[]): Table[] => {
    return rawTables.map((raw) => ({
      id: raw.table_id.toString(),
      name: raw.table_name,
      description: undefined, // API doesn't provide description; set as undefined
      columns: raw.table_schema.columns,
      indexes: raw.table_schema.indexes,
      createdAt: new Date(raw.created_at).toISOString(),
    }));
  };

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/core/projects?select=["project_id","project_name","db_type"]`
        );
        const projectData = Array.isArray(response.data) ? response.data : [];
        setProjects(projectData);

        // Set project_id from URL if valid, else default to first project or empty
        if (
          initialProjectId &&
          projectData.some(
            (p: Project) => p.project_id.toString() === initialProjectId
          )
        ) {
          setSelectedProjectId(initialProjectId);
        } else if (projectData.length > 0) {
          setSelectedProjectId(projectData[0].project_id.toString());
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [initialProjectId]);

  // Fetch tables when project changes
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = selectedProjectId
          ? `/core/tables?project_id=${selectedProjectId}`
          : `/core/tables`;

        const response = await apiClient.get(url);
        const tableData = Array.isArray(response.data)
          ? transformTableData(response.data)
          : [];
        setTables(tableData);
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError("Failed to load tables");
        setTables([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, [selectedProjectId]);

  const handleCreateTable = (table: Table) => {
    // Placeholder: In a real implementation, make an API call to create the table
    const newTables = [...tables, table];
    setTables(newTables);
    setIsCreateMode(false);
  };

  const handleEditTable = (table: Table) => {
    // Placeholder: In a real implementation, make an API call to update the table
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
      // Placeholder: In a real implementation, make an API call to delete the table
      const updatedTables = tables.filter((t) => t.id !== tableId);
      setTables(updatedTables);
    }
  };

  const handleViewTableDetails = (tableId: string) => {
    navigate(`/tables/${tableId}`);
  };

  const filteredTables = tables.filter((table) => {
    const name = table.name || "";
    const description = table.description || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading && !tables.length && !projects.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Database Tables
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your database schema and tables
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate(`/tables/new`)}
          >
            Create Table
          </Button>
        </div>

        {/* Project Selector */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <label
              htmlFor="project-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Project
            </label>
            <select
              id="project-select"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>
          {tables.length > 0 && (
            <div className="flex-1">
              <label
                htmlFor="search-tables"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Tables
              </label>
              <input
                id="search-tables"
                type="text"
                placeholder="Search tables..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
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
                            <LinkIcon
                              size={12}
                              className="text-blue-500 mr-1"
                            />
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
                          `/projects/${
                            selectedProjectId || projectId
                          }/apis/new?table=${table.id}`
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
                  No tables found
                </h3>
                <p className="mt-1 text-gray-500">
                  {selectedProjectId
                    ? "Start by creating your first database table"
                    : "Select a project or view all tables"}
                </p>
                {selectedProjectId && (
                  <Button
                    variant="primary"
                    className="mt-4"
                    leftIcon={<Plus size={16} />}
                    onClick={() => setIsCreateMode(true)}
                  >
                    Create Table
                  </Button>
                )}
              </>
            ) : (
              <>
                <svg
                  className="h-12 w-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  viewBox="0 24"
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
                <p className="mt-1 text-gray-500">
                  Try a different search term
                </p>
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
    </ErrorBoundary>
  );
};

export default TableManager;
