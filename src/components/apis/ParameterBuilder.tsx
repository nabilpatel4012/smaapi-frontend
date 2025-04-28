import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import { Table } from "./CreateApiForm";

interface Parameter {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  default?: any;
  items?: any;
  properties?: Record<string, any>;
  mapped?: string;
  pattern?: string;
}

interface ParameterBuilderProps {
  parameters: Parameter[];
  onChange: (parameters: Parameter[]) => void;
  onRequiredChange: (paramName: string, required: boolean) => void;
  table?: Table | null;
}

const PARAMETER_TYPES = [
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
  "date",
  "datetime",
  "email",
  "uuid",
];

const ParameterItem: React.FC<{
  param: Parameter;
  index: number;
  updateParameter: (index: number, field: keyof Parameter, value: any) => void;
  removeParameter: (index: number) => void;
  onRequiredChange: (paramName: string, required: boolean) => void;
  table?: Table | null;
  updateEnumValues: (index: number, enumValues: string) => void;
  updateArrayItems: (index: number, field: string, value: any) => void;
}> = React.memo(
  ({
    param,
    index,
    updateParameter,
    removeParameter,
    onRequiredChange,
    table,
    updateEnumValues,
    updateArrayItems,
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [localParam, setLocalParam] = useState(param);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      setLocalParam(param);
    }, [param]);

    const handleInputChange = useCallback(
      (field: keyof Parameter, value: any) => {
        const updatedParam = { ...localParam, [field]: value };
        setLocalParam(updatedParam);

        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          updateParameter(index, field, value);
        }, 300);
      },
      [index, localParam, updateParameter]
    );

    useEffect(() => {
      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, []);

    const handlePatternChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange("pattern", e.target.value);
      },
      [handleInputChange]
    );

    const handleArrayItemsChange = useCallback(
      (field: string, value: any) => {
        const newItems = {
          ...(localParam.items || { type: "string" }),
          [field]: value,
        };
        handleInputChange("items", newItems);
      },
      [localParam.items, handleInputChange]
    );

    const handleObjectPropertiesChange = useCallback(
      (field: string, value: any) => {
        const newProperties = {
          ...(localParam.properties || {}),
          [field]: value,
        };
        handleInputChange("properties", newProperties);
      },
      [localParam.properties, handleInputChange]
    );

    return (
      <Card className="p-4 relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-400">
          <GripVertical size={16} />
        </div>

        <div className="ml-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`param-name-${localParam.id}`}
                className="block text-sm font-medium text-gray-700"
              >
                Parameter Name
              </label>
              <input
                type="text"
                id={`param-name-${localParam.id}`}
                value={localParam.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., username"
              />
            </div>

            <div>
              <label
                htmlFor={`param-type-${localParam.id}`}
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id={`param-type-${localParam.id}`}
                value={localParam.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {PARAMETER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={localParam.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Parameter description"
              />
            </div>
          </div>

          {localParam.type === "string" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Length
                </label>
                <input
                  type="number"
                  value={localParam.minLength || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "minLength",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Length
                </label>
                <input
                  type="number"
                  value={localParam.maxLength || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maxLength",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pattern (Regex)
                </label>
                <input
                  type="text"
                  value={localParam.pattern || ""}
                  onChange={handlePatternChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., ^[A-Za-z]+$"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Enum Values (comma-separated)
                </label>
                <input
                  type="text"
                  value={localParam.enum ? localParam.enum.join(", ") : ""}
                  onChange={(e) => updateEnumValues(index, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., option1, option2, option3"
                />
              </div>
            </div>
          )}

          {(localParam.type === "number" || localParam.type === "integer") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum
                </label>
                <input
                  type="number"
                  value={localParam.minimum ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "minimum",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum
                </label>
                <input
                  type="number"
                  value={localParam.maximum ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maximum",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {localParam.type === "array" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Items
                  </label>
                  <input
                    type="number"
                    value={localParam.minItems ?? ""}
                    onChange={(e) =>
                      handleArrayItemsChange(
                        "minItems",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Items
                  </label>
                  <input
                    type="number"
                    value={localParam.maxItems ?? ""}
                    onChange={(e) =>
                      handleArrayItemsChange(
                        "maxItems",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Array Item Type
                  </h4>
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-200"
                  >
                    {expanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                </div>

                {expanded && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Item Type
                      </label>
                      <select
                        value={localParam.items?.type || "string"}
                        onChange={(e) =>
                          handleArrayItemsChange("type", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {PARAMETER_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {localParam.items?.type === "string" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Enum Values (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={
                            localParam.items.enum
                              ? localParam.items.enum.join(", ")
                              : ""
                          }
                          onChange={(e) => {
                            const values = e.target.value
                              .split(",")
                              .map((val) => val.trim())
                              .filter((val) => val);
                            handleArrayItemsChange(
                              "enum",
                              values.length > 0 ? values : undefined
                            );
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g., option1, option2, option3"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {localParam.type === "object" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Required Properties (comma-separated)
                </label>
                <input
                  type="text"
                  value={localParam.properties?.required?.join(", ") || ""}
                  onChange={(e) => {
                    const values = e.target.value
                      .split(",")
                      .map((val) => val.trim())
                      .filter((val) => val);
                    handleObjectPropertiesChange(
                      "required",
                      values.length > 0 ? values : undefined
                    );
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., name, email"
                />
              </div>
            </div>
          )}

          {localParam.type !== "array" && localParam.type !== "object" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Value
              </label>
              <input
                type={
                  localParam.type === "number" || localParam.type === "integer"
                    ? "number"
                    : "text"
                }
                value={localParam.default ?? ""}
                onChange={(e) => {
                  let value: any = e.target.value;
                  if (
                    localParam.type === "number" ||
                    localParam.type === "integer"
                  ) {
                    value = e.target.value
                      ? parseFloat(e.target.value)
                      : undefined;
                  } else if (localParam.type === "boolean") {
                    value = e.target.value === "true";
                  }
                  handleInputChange("default", value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localParam.required}
                onChange={(e) => {
                  handleInputChange("required", e.target.checked);
                  if (localParam.name) {
                    onRequiredChange(localParam.name, e.target.checked);
                  }
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required</span>
            </label>

            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => removeParameter(index)}
            >
              Remove
            </Button>
          </div>
        </div>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.param.id === nextProps.param.id &&
      prevProps.param.name === nextProps.param.name &&
      prevProps.param.type === nextProps.param.type &&
      prevProps.param.required === nextProps.param.required &&
      prevProps.param.description === nextProps.param.description &&
      prevProps.param.enum === nextProps.param.enum &&
      prevProps.param.minimum === nextProps.param.minimum &&
      prevProps.param.maximum === nextProps.param.maximum &&
      prevProps.param.minLength === nextProps.param.minLength &&
      prevProps.param.maxLength === nextProps.param.maxLength &&
      prevProps.param.minItems === nextProps.param.minItems &&
      prevProps.param.maxItems === nextProps.param.maxItems &&
      prevProps.param.default === nextProps.param.default &&
      prevProps.param.items === nextProps.param.items &&
      prevProps.param.mapped === nextProps.param.mapped &&
      prevProps.param.pattern === nextProps.param.pattern &&
      prevProps.index === nextProps.index &&
      prevProps.updateParameter === nextProps.updateParameter &&
      prevProps.removeParameter === nextProps.removeParameter &&
      prevProps.onRequiredChange === nextProps.onRequiredChange &&
      prevProps.table === nextProps.table &&
      prevProps.updateEnumValues === nextProps.updateEnumValues &&
      prevProps.updateArrayItems === nextProps.updateArrayItems
    );
  }
);

const ParameterBuilder: React.FC<ParameterBuilderProps> = ({
  parameters,
  onChange,
  onRequiredChange,
  table,
}) => {
  const memoizedTable = useMemo(() => table, [table]);

  const addParameter = useCallback(() => {
    onChange([
      ...parameters,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name: "",
        type: "string",
        required: false,
        mapped: "",
      },
    ]);
  }, [parameters, onChange]);

  const removeParameter = useCallback(
    (index: number) => {
      const newParams = [...parameters];
      newParams.splice(index, 1);
      onChange(newParams);
    },
    [parameters, onChange]
  );

  const updateParameter = useCallback(
    (index: number, field: keyof Parameter, value: any) => {
      const newParams = [...parameters];

      if (field === "type") {
        const currentType = newParams[index].type;
        const newType = value;

        if (currentType === "string") {
          delete newParams[index].minLength;
          delete newParams[index].maxLength;
          delete newParams[index].enum;
        } else if (currentType === "number" || currentType === "integer") {
          delete newParams[index].minimum;
          delete newParams[index].maximum;
        } else if (currentType === "array") {
          delete newParams[index].items;
          delete newParams[index].minItems;
          delete newParams[index].maxItems;
        } else if (currentType === "object") {
          delete newParams[index].properties;
        }

        if (newType === "array") {
          newParams[index].items = { type: "string" };
          newParams[index].minItems = undefined;
          newParams[index].maxItems = undefined;
        } else if (newType === "object") {
          newParams[index].properties = {};
        }
      }

      newParams[index] = { ...newParams[index], [field]: value };
      onChange(newParams);
    },
    [parameters, onChange]
  );

  const updateEnumValues = useCallback(
    (index: number, enumValues: string) => {
      try {
        const values = enumValues
          .split(",")
          .map((val) => val.trim())
          .filter((val) => val);
        updateParameter(index, "enum", values.length > 0 ? values : undefined);
      } catch (e) {
        console.error("Error parsing enum values", e);
      }
    },
    [updateParameter]
  );

  const updateArrayItems = useCallback(
    (index: number, field: string, value: any) => {
      const param = parameters[index];
      const newItems = {
        ...(param.items || { type: "string" }),
        [field]: value,
      };
      updateParameter(index, "items", newItems);
    },
    [parameters, updateParameter]
  );

  const onRequiredChangeCallback = useCallback(
    (paramName: string, required: boolean) => {
      onRequiredChange(paramName, required);
    },
    [onRequiredChange]
  );

  return (
    <div className="space-y-4">
      {parameters.map((param, index) => (
        <ParameterItem
          key={param.id}
          param={param}
          index={index}
          updateParameter={updateParameter}
          removeParameter={removeParameter}
          onRequiredChange={onRequiredChangeCallback}
          table={memoizedTable}
          updateEnumValues={updateEnumValues}
          updateArrayItems={updateArrayItems}
        />
      ))}

      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Plus size={16} />}
        onClick={addParameter}
      >
        Add Parameter
      </Button>

      {parameters.length > 0 && table && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Map Parameters to Table Columns
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Parameter
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Table Column
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parameters.map((param, index) => (
                  <tr key={`map-${param.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className="py-2 px-3 bg-gray-100 rounded-md w-full">
                          {param.name || (
                            <span className="text-gray-400">
                              Unnamed parameter
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={param.mapped || ""}
                        onChange={(e) =>
                          updateParameter(
                            index,
                            "mapped",
                            e.target.value || undefined
                          )
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value=""> -- Select Column -- </option>
                        {table.columns.map((column) => (
                          <option key={column.name} value={column.name}>
                            {column.name} ({column.type})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ParameterBuilder);
