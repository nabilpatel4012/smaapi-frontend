import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Save,
  Trash2,
  Key,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import { BaseTable, Table, Column, Index } from "./table.types";
import apiClient from "../../utils/apiClient";

interface CreateTableFormProps {
  existingTables: Table[];
  onTableCreated: (table: Table) => void;
  initialTableData?: Table;
}

interface Project {
  project_id: number;
  project_name: string;
  db_type: string;
}

const dataTypes = [
  "string",
  "text",
  "integer",
  "float",
  "decimal",
  "boolean",
  "date",
  "datetime",
  "json",
  "uuid",
  "array",
  "enum",
];

const CreateTableForm: React.FC<CreateTableFormProps> = ({
  existingTables = [],
  onTableCreated,
  initialTableData,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectDbType, setProjectDbType] = useState<string>("PG");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId || ""
  );
  const [projectError, setProjectError] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [tableData, setTableData] = useState<BaseTable>(
    initialTableData || {
      name: "",
      description: "",
      columns: [],
      indexes: [],
    }
  );

  const [newIndex, setNewIndex] = useState<Index>({
    name: "",
    columns: [],
    isUnique: false,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showIndexForm, setShowIndexForm] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await apiClient.get(
          `/core/projects?select=["project_id","project_name","db_type"]`
        );
        const projectData = Array.isArray(response.data) ? response.data : [];
        setProjects(projectData);

        // Set projectDbType if editing and projectId matches
        if (initialTableData && projectId) {
          const selectedProject = projectData.find(
            (p) => p.project_id.toString() === projectId
          );
          if (selectedProject) {
            setSelectedProjectId(projectId);
            setProjectDbType(selectedProject.db_type);
          }
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjectError("Failed to load projects");
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [initialTableData, projectId]);

  useEffect(() => {
    if (initialTableData) {
      setTableData(initialTableData);
    }
  }, [initialTableData]);

  const handleAddColumn = () => {
    setTableData({
      ...tableData,
      columns: [
        ...tableData.columns,
        {
          name: "",
          type: "string",
          required: false,
          unique: false,
          isPrimary: false,
          isIndex: false,
        },
      ],
    });
  };

  const handleColumnChange = (
    index: number,
    field: keyof Column,
    value: any
  ) => {
    const newColumns = [...tableData.columns];

    if (field === "isPrimary" && value === true) {
      newColumns[index].unique = true;
      newColumns[index].required = true;

      if (value) {
        newColumns.forEach((col, idx) => {
          if (idx !== index) {
            col.isPrimary = false;
          }
        });
      }
    }

    newColumns[index] = { ...newColumns[index], [field]: value };
    setTableData({ ...tableData, columns: newColumns });

    if (validationErrors[`column_${index}_${String(field)}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`column_${index}_${String(field)}`];
      setValidationErrors(newErrors);
    }
  };

  const handleDeleteColumn = (index: number) => {
    const newColumns = [...tableData.columns];
    newColumns.splice(index, 1);

    const updatedIndexes = (tableData.indexes || [])
      .map((idx) => ({
        ...idx,
        columns: idx.columns.filter(
          (col) => col !== tableData.columns[index].name
        ),
      }))
      .filter((idx) => idx.columns.length > 0);

    setTableData({
      ...tableData,
      columns: newColumns,
      indexes: updatedIndexes,
    });
  };

  const handleIndexColumnToggle = (columnName: string) => {
    setNewIndex((prev) => {
      const newColumns = prev.columns.includes(columnName)
        ? prev.columns.filter((c) => c !== columnName)
        : [...prev.columns, columnName];
      return { ...prev, columns: newColumns };
    });
  };

  const handleAddIndex = () => {
    if (newIndex.name && newIndex.columns.length > 0) {
      setTableData({
        ...tableData,
        indexes: [...(tableData.indexes || []), { ...newIndex }],
      });
      setNewIndex({ name: "", columns: [], isUnique: false });
      setShowIndexForm(false);
    }
  };

  const handleDeleteIndex = (indexName: string) => {
    setTableData({
      ...tableData,
      indexes: (tableData.indexes || []).filter(
        (idx) => idx.name !== indexName
      ),
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedProjectId) {
      errors.project = "Please select a project";
    }

    if (!tableData.name.trim()) {
      errors.name = "Table name is required";
    }

    if (tableData.columns.length === 0) {
      errors.columns = "At least one column is required";
    }

    tableData.columns.forEach((column, index) => {
      if (!column.name.trim()) {
        errors[`column_${index}_name`] = "Column name is required";
      }

      const columnNameCount = tableData.columns.filter(
        (c) => c.name === column.name
      ).length;
      if (columnNameCount > 1) {
        errors[`column_${index}_name`] = "Column names must be unique";
      }
    });

    if (!tableData.columns.some((col) => col.isPrimary)) {
      errors.primaryKey =
        "At least one column must be designated as a primary key";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const tableWithTimestamps = {
      ...tableData,
      columns: [
        ...tableData.columns,
        {
          name: "created_at",
          type: "datetime",
          required: true,
          unique: false,
          isPrimary: false,
          isIndex: true,
        },
        {
          name: "updated_at",
          type: "datetime",
          required: true,
          unique: false,
          isPrimary: false,
          isIndex: false,
        },
      ],
    };

    const apiPayload = {
      table_name: tableWithTimestamps.name,
      table_schema: {
        columns: tableWithTimestamps.columns,
        indexes: tableWithTimestamps.indexes || [],
      },
    };

    try {
      const response = await apiClient.post(
        `/core/${selectedProjectId}/tables`,
        apiPayload
      );

      // Create a Table with required id and createdAt properties
      const newTable: Table = {
        ...tableWithTimestamps,
        id: response.data.table_id?.toString() || `table_${Date.now()}`,
        createdAt: response.data.created_at || new Date().toISOString(),
      };

      onTableCreated(newTable);
      navigate(`/projects/${selectedProjectId}/tables`);
    } catch (err) {
      console.error("Error creating table:", err);
      setValidationErrors({
        ...validationErrors,
        api: "Failed to create table. Please try again.",
      });
    }
  };

  if (isLoadingProjects) {
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
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
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
            onClick={() => navigate(`/tables`)}
          >
            Back to Tables
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialTableData ? "Edit Table" : "Create New Table"}
          </h2>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save size={16} />}
          onClick={handleSubmit}
        >
          Save Table
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="project-select"
                className="block text-sm font-medium text-gray-700"
              >
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="project-select"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const selectedProject = projects.find(
                    (p) => p.project_id.toString() === e.target.value
                  );
                  if (selectedProject) {
                    setProjectDbType(selectedProject.db_type);
                  }
                  if (validationErrors.project) {
                    const newErrors = { ...validationErrors };
                    delete newErrors.project;
                    setValidationErrors(newErrors);
                  }
                }}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  validationErrors.project ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
              {validationErrors.project && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.project}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Table Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tableData.name}
                onChange={(e) => {
                  setTableData({ ...tableData, name: e.target.value });
                  if (validationErrors.name) {
                    const newErrors = { ...validationErrors };
                    delete newErrors.name;
                    setValidationErrors(newErrors);
                  }
                }}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  validationErrors.name ? "border-red-500" : ""
                }`}
                placeholder="users, products, orders, etc."
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={tableData.description || ""}
                onChange={(e) =>
                  setTableData({ ...tableData, description: e.target.value })
                }
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe the purpose of this table"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Columns</h3>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={handleAddColumn}
              >
                Add Column
              </Button>
            </div>

            {validationErrors.columns && (
              <p className="mb-4 text-sm text-red-500">
                {validationErrors.columns}
              </p>
            )}

            {validationErrors.primaryKey && (
              <p className="mb-4 text-sm text-red-500">
                {validationErrors.primaryKey}
              </p>
            )}

            {validationErrors.api && (
              <p className="mb-4 text-sm text-red-500">
                {validationErrors.api}
              </p>
            )}

            {tableData.columns.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 px-4 text-sm font-medium text-gray-500">
                  <div className="col-span-3">NAME</div>
                  <div className="col-span-2">TYPE</div>
                  <div className="col-span-5">ATTRIBUTES</div>
                  <div className="col-span-2">ACTIONS</div>
                </div>

                {tableData.columns.map((column, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) =>
                          handleColumnChange(index, "name", e.target.value)
                        }
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          validationErrors[`column_${index}_name`]
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="Column name"
                      />
                      {validationErrors[`column_${index}_name`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {validationErrors[`column_${index}_name`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <select
                        value={column.type}
                        onChange={(e) =>
                          handleColumnChange(index, "type", e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {dataTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-5">
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.required}
                            onChange={(e) =>
                              handleColumnChange(
                                index,
                                "required",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-1 text-sm text-gray-700">
                            Required
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.unique}
                            onChange={(e) =>
                              handleColumnChange(
                                index,
                                "unique",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-1 text-sm text-gray-700">
                            Unique
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.isPrimary}
                            onChange={(e) =>
                              handleColumnChange(
                                index,
                                "isPrimary",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-1 text-sm text-gray-700">
                            Primary Key
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.isIndex}
                            onChange={(e) =>
                              handleColumnChange(
                                index,
                                "isIndex",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-1 text-sm text-gray-700">
                            Index
                          </span>
                        </label>
                      </div>

                      {existingTables.length > 0 && (
                        <div className="mt-2 flex items-center">
                          <LinkIcon size={14} className="text-gray-400 mr-1" />
                          <select
                            value={
                              column.foreignKey
                                ? `${column.foreignKey.table}.${column.foreignKey.column}`
                                : ""
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                const [table, fkColumn] =
                                  e.target.value.split(".");
                                handleColumnChange(index, "foreignKey", {
                                  table,
                                  column: fkColumn,
                                });
                              } else {
                                handleColumnChange(
                                  index,
                                  "foreignKey",
                                  undefined
                                );
                              }
                            }}
                            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">No foreign key</option>
                            {existingTables.map((table) =>
                              Array.isArray(table.columns) &&
                              table.columns.length > 0
                                ? table.columns
                                    .filter(
                                      (col) => col.isPrimary || col.unique
                                    )
                                    .map((col) => (
                                      <option
                                        key={`${table.id}-${col.name}`}
                                        value={`${table.name}.${col.name}`}
                                      >
                                        {table.name}.{col.name}
                                      </option>
                                    ))
                                : null
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={16} />}
                        onClick={() => handleDeleteColumn(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No columns added yet. Click "Add Column" to start.
                </p>
              </div>
            )}
          </div>

          {(projectDbType === "PG" || projectDbType === "MQL") && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Indexes</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setShowIndexForm(true)}
                  disabled={tableData.columns.length === 0}
                >
                  Add Index
                </Button>
              </div>

              {showIndexForm && (
                <Card className="p-4 mb-4 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Index Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newIndex.name}
                        onChange={(e) =>
                          setNewIndex({ ...newIndex, name: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="idx_example_column"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Columns <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {tableData.columns.map((column) => (
                          <label
                            key={column.name}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              checked={newIndex.columns.includes(column.name)}
                              onChange={() =>
                                handleIndexColumnToggle(column.name)
                              }
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {column.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newIndex.isUnique}
                          onChange={(e) =>
                            setNewIndex({
                              ...newIndex,
                              isUnique: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Unique Index
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setShowIndexForm(false);
                          setNewIndex({
                            name: "",
                            columns: [],
                            isUnique: false,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddIndex}
                        disabled={
                          !newIndex.name || newIndex.columns.length === 0
                        }
                      >
                        Add Index
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {(tableData.indexes || []).length > 0 ? (
                <div className="space-y-3">
                  {(tableData.indexes || []).map((index, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Key size={16} className="text-gray-500 mr-2" />
                        <div>
                          <span className="font-medium">{index.name}</span>
                          <div className="text-sm text-gray-500">
                            <span>
                              {index.isUnique ? "Unique " : ""}Index on:{" "}
                            </span>
                            <span className="font-mono">
                              {index.columns.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={16} />}
                        onClick={() => handleDeleteIndex(index.name)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No indexes created yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreateTableForm;
