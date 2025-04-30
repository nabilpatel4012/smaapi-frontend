import React, { useEffect, useState, Component, ErrorInfo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateTableForm from "./CreateTableForm";
import apiClient from "../../utils/apiClient";
import Button from "../common/Button";
import { RawTable } from "./table.types";

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

const CreateTableFormWrapper: React.FC = () => {
  const [tables, setTables] = useState([]);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project_id");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const url = projectId
          ? `/core/tables?project_id=${projectId}`
          : `/core/tables`;
        const response = await apiClient.get(url);
        const tableData = Array.isArray(response.data)
          ? response.data.map((raw: RawTable) => ({
              id: raw.table_id.toString(),
              name: raw.table_name,
              description: undefined,
              columns: Array.isArray(raw.table_schema.columns)
                ? raw.table_schema.columns
                : [],
              indexes: raw.table_schema.indexes,
              createdAt: new Date(raw.created_at).toISOString(),
            }))
          : [];
        setTables(tableData);
      } catch (err) {
        console.error("Failed to fetch tables", err);
      }
    };

    fetchTables();
  }, [projectId]);

  const handleTableCreated = () => {
    navigate(`/tables`);
  };

  return (
    <ErrorBoundary>
      <CreateTableForm
        existingTables={tables}
        onTableCreated={handleTableCreated}
      />
    </ErrorBoundary>
  );
};

export default CreateTableFormWrapper;
