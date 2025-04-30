import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Table, Key, Link as LinkIcon, ArrowLeft } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import apiClient from "../../utils/apiClient";

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

const TableView: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("project_id");

  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTable = async () => {
      if (!tableId || isNaN(Number(tableId))) {
        setError("Invalid table ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Construct the API URL with optional project_id
        const url = `/core/tables/${tableId}${
          projectId && !isNaN(Number(projectId))
            ? `?project_id=${projectId}`
            : ""
        }`;
        const response = await apiClient.get(url);

        // Transform API response to match Table interface
        const tableData: Table = {
          id: response.data.table_id.toString(),
          name: response.data.table_name,
          description: response.data.description || undefined,
          columns: Array.isArray(response.data.table_schema?.columns)
            ? response.data.table_schema.columns
            : [],
          indexes: Array.isArray(response.data.table_schema?.indexes)
            ? response.data.table_schema.indexes
            : [],
          createdAt: new Date(response.data.created_at).toISOString(),
        };

        setTable(tableData);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Table not found");
        } else if (err.response?.status === 401) {
          setError("Unauthorized: Please log in");
        } else if (err.response?.status === 400) {
          setError("Invalid request: Check table or project ID");
        } else {
          setError("Failed to fetch table details");
        }
        console.error("Error fetching table:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTable();
  }, [tableId, projectId]);

  if (isLoading) {
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
          <p className="mt-2 text-gray-600">Loading table details...</p>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          {error || "Table not found"}
        </h3>
        <p className="mt-1 text-gray-500">
          {error
            ? "An error occurred while fetching the table."
            : "The requested table does not exist."}
        </p>
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft size={16} />}
          className="mt-4"
          onClick={() => navigate("/tables")}
        >
          Back to Tables
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/tables")}
          >
            Back to Tables
          </Button>
          <div>
            <div className="flex items-center">
              <Table size={25} className="text-blue-500 mr-2" />
              <span className="text-xl">{table.name}</span>{" "}
            </div>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600">
              {table.description || "No description provided"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Columns</h3>
            {table.columns.length > 0 ? (
              <div className="mt-4 space-y-4">
                {table.columns.map((column, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      {column.isPrimary && (
                        <Key size={14} className="text-yellow-500 mr-2" />
                      )}
                      {column.foreignKey && (
                        <LinkIcon size={14} className="text-blue-500 mr-2" />
                      )}
                      <span className="font-mono text-gray-800">
                        {column.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {column.type}
                      </span>
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
            ) : (
              <p className="mt-2 text-gray-600">No columns defined</p>
            )}
          </div>

          {table.indexes && table.indexes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Indexes</h3>
              <div className="mt-4 space-y-4">
                {table.indexes.map((index, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-mono text-gray-800">
                      {index.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {index.isUnique ? "Unique" : "Index"} on{" "}
                      {index.columns.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Created: {new Date(table.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TableView;
