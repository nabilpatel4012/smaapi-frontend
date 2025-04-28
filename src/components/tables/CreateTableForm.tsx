import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Save, Trash2, Key, Link as LinkIcon } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

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
  id?: string;
  name: string;
  description?: string;
  columns: Column[];
  indexes?: Index[];
  createdAt?: string;
}

interface CreateTableFormProps {
  existingTables?: Table[];
  onTableCreated: (table: Table) => void;
  initialTableData?: Table;
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
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectDbType, setProjectDbType] = useState<string>("PostgreSQL");

  const [tableData, setTableData] = useState<Table>(
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

  const handleSubmit = () => {
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

    const newTable = {
      ...tableWithTimestamps,
      id: tableData.id || `table_${Date.now()}`,
      createdAt: tableData.createdAt || new Date().toISOString(),
    };

    onTableCreated(newTable);
    navigate(`/projects/${projectId}/tables`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialTableData ? "Edit Table" : "Create New Table"}
        </h2>
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
                              table.columns
                                .filter((col) => col.isPrimary || col.unique)
                                .map((col) => (
                                  <option
                                    key={`${table.id}-${col.name}`}
                                    value={`${table.name}.${col.name}`}
                                  >
                                    {table.name}.{col.name}
                                  </option>
                                ))
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

          {(projectDbType === "PostgreSQL" || projectDbType === "MySQL") && (
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
