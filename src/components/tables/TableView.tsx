import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, Key, Link as LinkIcon } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
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

const TableView: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const table = mockTables.find((t) => t.id === tableId);

  if (!table) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Table not found</h3>
        <p className="mt-1 text-gray-500">
          The requested table does not exist.
        </p>
        <Button
          variant="secondary"
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Table Details: {table.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Detailed view of the {table.name} table
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/tables`)}>
          Back to Tables
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600">{table.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Columns</h3>
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
                    <span className="text-sm text-gray-500">{column.type}</span>
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
