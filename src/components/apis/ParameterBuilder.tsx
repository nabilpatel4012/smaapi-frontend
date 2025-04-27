import React, { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

interface Parameter {
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
}

interface ParameterBuilderProps {
  parameters: Parameter[];
  onChange: (parameters: Parameter[]) => void;
  onRequiredChange: (paramName: string, required: boolean) => void;
}

const ParameterBuilder: React.FC<ParameterBuilderProps> = ({
  parameters,
  onChange,
  onRequiredChange,
}) => {
  const [expandedParams, setExpandedParams] = useState<Record<string, boolean>>(
    {}
  );

  const addParameter = () => {
    onChange([...parameters, { name: "", type: "string", required: false }]);
  };

  const removeParameter = (index: number) => {
    const newParams = [...parameters];
    newParams.splice(index, 1);
    onChange(newParams);
  };

  const updateParameter = (
    index: number,
    field: keyof Parameter,
    value: any
  ) => {
    const newParams = [...parameters];

    // Reset type-specific fields when changing type
    if (field === "type") {
      const currentType = newParams[index].type;
      const newType = value;

      // Clear type-specific fields from the old type
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

      // Initialize fields for the new type
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
  };

  const toggleExpand = (index: number) => {
    setExpandedParams({
      ...expandedParams,
      [index]: !expandedParams[index],
    });
  };

  const updateEnumValues = (index: number, enumValues: string) => {
    try {
      // Split by comma and trim each value
      const values = enumValues.split(",").map((val) => val.trim());
      updateParameter(index, "enum", values);
    } catch (e) {
      console.error("Error parsing enum values", e);
    }
  };

  const updateArrayItems = (index: number, field: string, value: any) => {
    const newParams = [...parameters];
    if (!newParams[index].items) {
      newParams[index].items = { type: "string" };
    }
    newParams[index].items = { ...newParams[index].items, [field]: value };
    onChange(newParams);
  };

  const parameterTypes = [
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

  return (
    <div className="space-y-4">
      {parameters.map((param, index) => (
        <Card key={index} className="p-4 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-400">
            <GripVertical size={16} />
          </div>

          <div className="ml-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parameter Name
                </label>
                <input
                  type="text"
                  value={param.name}
                  onChange={(e) =>
                    updateParameter(index, "name", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={param.type}
                  onChange={(e) =>
                    updateParameter(index, "type", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {parameterTypes.map((type) => (
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
                  value={param.description || ""}
                  onChange={(e) =>
                    updateParameter(index, "description", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Parameter description"
                />
              </div>
            </div>

            {/* String-specific fields */}
            {param.type === "string" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Length
                  </label>
                  <input
                    type="number"
                    value={param.minLength || ""}
                    onChange={(e) =>
                      updateParameter(
                        index,
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
                    value={param.maxLength || ""}
                    onChange={(e) =>
                      updateParameter(
                        index,
                        "maxLength",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enum Values (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={param.enum ? param.enum.join(", ") : ""}
                    onChange={(e) => updateEnumValues(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., option1, option2, option3"
                  />
                </div>
              </div>
            )}

            {/* Number-specific fields */}
            {(param.type === "number" || param.type === "integer") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum
                  </label>
                  <input
                    type="number"
                    value={param.minimum ?? ""}
                    onChange={(e) =>
                      updateParameter(
                        index,
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
                    value={param.maximum ?? ""}
                    onChange={(e) =>
                      updateParameter(
                        index,
                        "maximum",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Array-specific fields */}
            {param.type === "array" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min Items
                    </label>
                    <input
                      type="number"
                      value={param.minItems ?? ""}
                      onChange={(e) =>
                        updateParameter(
                          index,
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
                      value={param.maxItems ?? ""}
                      onChange={(e) =>
                        updateParameter(
                          index,
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
                      onClick={() => toggleExpand(index)}
                      className="p-1 rounded-md text-gray-500 hover:bg-gray-200"
                    >
                      {expandedParams[index] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </div>

                  {expandedParams[index] && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Item Type
                        </label>
                        <select
                          value={param.items?.type || "string"}
                          onChange={(e) =>
                            updateArrayItems(index, "type", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          {parameterTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {param.items?.type === "string" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Enum Values (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={
                              param.items.enum
                                ? param.items.enum.join(", ")
                                : ""
                            }
                            onChange={(e) => {
                              const values = e.target.value
                                .split(",")
                                .map((val) => val.trim());
                              updateArrayItems(
                                index,
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

            {/* Default value field (for most types) */}
            {param.type !== "array" && param.type !== "object" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Value
                </label>
                <input
                  type={
                    param.type === "number" || param.type === "integer"
                      ? "number"
                      : "text"
                  }
                  value={param.default ?? ""}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (param.type === "number" || param.type === "integer") {
                      value = e.target.value
                        ? parseFloat(e.target.value)
                        : undefined;
                    } else if (param.type === "boolean") {
                      value = e.target.value === "true";
                    }
                    updateParameter(index, "default", value);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={param.required}
                  onChange={(e) => {
                    updateParameter(index, "required", e.target.checked);
                    if (param.name) {
                      onRequiredChange(param.name, e.target.checked);
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
      ))}

      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Plus size={16} />}
        onClick={addParameter}
      >
        Add Parameter
      </Button>
    </div>
  );
};

export default ParameterBuilder;
