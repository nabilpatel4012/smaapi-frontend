import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash,
  Save,
  Code,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Editor from "@monaco-editor/react";

interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  options: {
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    enum?: string[];
    format?: string;
    default?: any;
    minItems?: number;
    items?: any;
  };
}

interface ResponseDefinition {
  code: string;
  description: string;
  properties: Record<string, any>;
}

interface ArrayItemsDefinition {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  enum?: string[];
}

const CreateAPI: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Basic Info
  const [apiName, setApiName] = useState("");
  const [apiDescription, setApiDescription] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [endpointPath, setEndpointPath] = useState("");
  const [endpointDescription, setEndpointDescription] = useState("");

  // Parameters
  const [queryParams, setQueryParams] = useState<FieldDefinition[]>([]);
  const [bodyParams, setBodyParams] = useState<FieldDefinition[]>([]);
  const [nestedObjects, setNestedObjects] = useState<
    Record<string, { required: string[]; properties: Record<string, any> }>
  >({});

  // Arrays
  const [arrayFields, setArrayFields] = useState<
    Record<string, ArrayItemsDefinition>
  >({});
  const [enumValues, setEnumValues] = useState<Record<string, string[]>>({});

  // Filters and Responses
  const [allowedFilters, setAllowedFilters] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState("");
  const [responses, setResponses] = useState<ResponseDefinition[]>([
    {
      code: "200",
      description: "Success response",
      properties: {
        message: { type: "string" },
      },
    },
    {
      code: "400",
      description: "Error response",
      properties: {
        error: { type: "string" },
      },
    },
  ]);

  // UI States
  const [activeTab, setActiveTab] = useState("basic");
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [jsonValue, setJsonValue] = useState("{}");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    queryParams: true,
    bodyParams: true,
    filters: true,
    responses: true,
  });

  // Generate API schema from form data
  const generateApiSchema = () => {
    // Process required fields
    const requiredQueryParams = queryParams
      .filter((param) => param.required)
      .map((param) => param.name);
    const requiredBodyParams = bodyParams
      .filter((param) => param.required)
      .map((param) => param.name);

    // Process properties
    const queryProperties: Record<string, any> = {};
    const bodyProperties: Record<string, any> = {};

    // Add query parameters to properties
    queryParams.forEach((param) => {
      queryProperties[param.name] = { type: param.type, ...param.options };
    });

    // Add body parameters to properties
    bodyParams.forEach((param) => {
      if (param.type === "array") {
        const arrayDef = arrayFields[param.name];

        bodyProperties[param.name] = {
          type: "array",
          ...(param.options.minItems
            ? { minItems: param.options.minItems }
            : {}),
          items: arrayDef || { type: "string" },
        };
      } else if (param.type === "object") {
        bodyProperties[param.name] = nestedObjects[param.name] || {
          type: "object",
          properties: {},
        };
      } else {
        bodyProperties[param.name] = { type: param.type, ...param.options };
      }
    });

    // Format response objects
    const formattedResponses: Record<string, any> = {};
    responses.forEach((response) => {
      formattedResponses[response.code] = {
        description: response.description,
        properties: response.properties,
      };
    });

    // Create final schema
    const apiSchema = {
      project_id: Number(projectId),
      api_name: apiName,
      api_description: apiDescription,
      http_method: httpMethod,
      endpoint_path: endpointPath,
      endpoint_description: endpointDescription,
      parameters: {
        query:
          queryParams.length > 0
            ? {
                required: requiredQueryParams,
                properties: queryProperties,
              }
            : null,
        body:
          bodyParams.length > 0
            ? {
                required: requiredBodyParams,
                properties: bodyProperties,
              }
            : null,
      },
      allowedFilters,
      responses: formattedResponses,
    };

    return apiSchema;
  };

  // Update JSON view when form changes
  useEffect(() => {
    const schema = generateApiSchema();
    setJsonValue(JSON.stringify(schema, null, 2));
  }, [
    apiName,
    apiDescription,
    httpMethod,
    endpointPath,
    endpointDescription,
    queryParams,
    bodyParams,
    allowedFilters,
    responses,
    nestedObjects,
    arrayFields,
  ]);

  // Parse JSON and update form
  const handleJsonChange = (value: string | undefined) => {
    if (!value) return;
    setJsonValue(value);

    try {
      const parsed = JSON.parse(value);

      // Update basic info
      setApiName(parsed.api_name || "");
      setApiDescription(parsed.api_description || "");
      setHttpMethod(parsed.http_method || "GET");
      setEndpointPath(parsed.endpoint_path || "");
      setEndpointDescription(parsed.endpoint_description || "");

      // Update parameters
      const queryParamsArray: FieldDefinition[] = [];
      const bodyParamsArray: FieldDefinition[] = [];
      const newNestedObjects: Record<string, any> = {};
      const newArrayFields: Record<string, any> = {};

      // Process query parameters
      if (parsed.parameters?.query?.properties) {
        Object.entries(parsed.parameters.query.properties).forEach(
          ([name, def]: [string, any]) => {
            const required =
              parsed.parameters.query.required?.includes(name) || false;
            const { type, ...options } = def;
            queryParamsArray.push({ name, type, required, options });
          }
        );
      }

      // Process body parameters
      if (parsed.parameters?.body?.properties) {
        Object.entries(parsed.parameters.body.properties).forEach(
          ([name, def]: [string, any]) => {
            const required =
              parsed.parameters.body.required?.includes(name) || false;

            if (def.type === "array") {
              bodyParamsArray.push({
                name,
                type: "array",
                required,
                options: { minItems: def.minItems },
              });
              newArrayFields[name] = def.items;
            } else if (def.type === "object") {
              bodyParamsArray.push({
                name,
                type: "object",
                required,
                options: {},
              });
              newNestedObjects[name] = {
                required: def.required || [],
                properties: def.properties || {},
              };
            } else {
              const { type, ...options } = def;
              bodyParamsArray.push({ name, type, required, options });
            }
          }
        );
      }

      // Update filters and responses
      setAllowedFilters(parsed.allowedFilters || []);

      const responsesArray: ResponseDefinition[] = [];
      if (parsed.responses) {
        Object.entries(parsed.responses).forEach(
          ([code, def]: [string, any]) => {
            responsesArray.push({
              code,
              description: def.description || "",
              properties: def.properties || {},
            });
          }
        );
      }

      // Update state
      setQueryParams(queryParamsArray);
      setBodyParams(bodyParamsArray);
      setNestedObjects(newNestedObjects);
      setArrayFields(newArrayFields);
      setResponses(responsesArray);
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  };

  // Parameter management
  const addQueryParam = () => {
    setQueryParams([
      ...queryParams,
      { name: "", type: "string", required: false, options: {} },
    ]);
  };

  const addBodyParam = () => {
    setBodyParams([
      ...bodyParams,
      { name: "", type: "string", required: false, options: {} },
    ]);
  };

  const removeQueryParam = (index: number) => {
    const updated = [...queryParams];
    updated.splice(index, 1);
    setQueryParams(updated);
  };

  const removeBodyParam = (index: number) => {
    const param = bodyParams[index];
    const updated = [...bodyParams];
    updated.splice(index, 1);
    setBodyParams(updated);

    // Clean up associated data
    if (param.type === "array") {
      const updatedArrayFields = { ...arrayFields };
      delete updatedArrayFields[param.name];
      setArrayFields(updatedArrayFields);
    } else if (param.type === "object") {
      const updatedNestedObjects = { ...nestedObjects };
      delete updatedNestedObjects[param.name];
      setNestedObjects(updatedNestedObjects);
    }
  };

  const updateQueryParam = (index: number, field: string, value: any) => {
    const updated = [...queryParams];
    updated[index] = { ...updated[index], [field]: value };
    setQueryParams(updated);
  };

  const updateBodyParam = (index: number, field: string, value: any) => {
    const updated = [...bodyParams];

    // Handle type changes
    if (field === "type" && updated[index].type !== value) {
      // Reset options when type changes
      updated[index] = { ...updated[index], [field]: value, options: {} };

      // Initialize array or object structures if needed
      const paramName = updated[index].name;
      if (value === "array" && !arrayFields[paramName]) {
        setArrayFields({
          ...arrayFields,
          [paramName]: { type: "string" },
        });
      } else if (value === "object" && !nestedObjects[paramName]) {
        setNestedObjects({
          ...nestedObjects,
          [paramName]: { required: [], properties: {} },
        });
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setBodyParams(updated);
  };

  const updateQueryParamOption = (
    index: number,
    option: string,
    value: any
  ) => {
    const updated = [...queryParams];
    updated[index] = {
      ...updated[index],
      options: { ...updated[index].options, [option]: value },
    };
    setQueryParams(updated);
  };

  const updateBodyParamOption = (index: number, option: string, value: any) => {
    const updated = [...bodyParams];
    updated[index] = {
      ...updated[index],
      options: { ...updated[index].options, [option]: value },
    };
    setBodyParams(updated);
  };

  // Array item management
  const updateArrayField = (
    fieldName: string,
    property: string,
    value: any
  ) => {
    setArrayFields({
      ...arrayFields,
      [fieldName]: {
        ...arrayFields[fieldName],
        [property]: value,
      },
    });
  };

  // Add enum value
  const addEnumValue = (fieldName: string) => {
    const current = enumValues[fieldName] || [];
    setEnumValues({
      ...enumValues,
      [fieldName]: [...current, ""],
    });
  };

  // Update enum value
  const updateEnumValue = (fieldName: string, index: number, value: string) => {
    const current = [...(enumValues[fieldName] || [])];
    current[index] = value;

    setEnumValues({
      ...enumValues,
      [fieldName]: current,
    });

    // Update in the proper field
    const bodyParamIndex = bodyParams.findIndex((p) => p.name === fieldName);
    if (bodyParamIndex >= 0) {
      updateBodyParamOption(bodyParamIndex, "enum", current);
    }

    // If this is an array field with enum
    Object.keys(arrayFields).forEach((arrayField) => {
      if (
        arrayFields[arrayField].type === "string" &&
        fieldName === `${arrayField}.items`
      ) {
        setArrayFields({
          ...arrayFields,
          [arrayField]: {
            ...arrayFields[arrayField],
            enum: current,
          },
        });
      }
    });
  };

  // Remove enum value
  const removeEnumValue = (fieldName: string, index: number) => {
    const current = [...(enumValues[fieldName] || [])];
    current.splice(index, 1);

    setEnumValues({
      ...enumValues,
      [fieldName]: current,
    });

    // Update in the proper field
    const bodyParamIndex = bodyParams.findIndex((p) => p.name === fieldName);
    if (bodyParamIndex >= 0) {
      updateBodyParamOption(bodyParamIndex, "enum", current);
    }

    // If this is an array field with enum
    Object.keys(arrayFields).forEach((arrayField) => {
      if (
        arrayFields[arrayField].type === "string" &&
        fieldName === `${arrayField}.items`
      ) {
        setArrayFields({
          ...arrayFields,
          [arrayField]: {
            ...arrayFields[arrayField],
            enum: current,
          },
        });
      }
    });
  };

  // Filter management
  const addFilter = () => {
    if (currentFilter && !allowedFilters.includes(currentFilter)) {
      setAllowedFilters([...allowedFilters, currentFilter]);
      setCurrentFilter("");
    }
  };

  const removeFilter = (filter: string) => {
    setAllowedFilters(allowedFilters.filter((f) => f !== filter));
  };

  // Response management
  const addResponse = () => {
    setResponses([
      ...responses,
      {
        code: "",
        description: "",
        properties: { message: { type: "string" } },
      },
    ]);
  };

  const removeResponse = (index: number) => {
    const updated = [...responses];
    updated.splice(index, 1);
    setResponses(updated);
  };

  const updateResponse = (index: number, field: string, value: any) => {
    const updated = [...responses];
    updated[index] = { ...updated[index], [field]: value };
    setResponses(updated);
  };

  // Toggle section expand/collapse
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Form submission
  const handleSave = () => {
    const apiSchema = generateApiSchema();
    console.log("Saving API:", apiSchema);
    alert("API saved successfully!");
    navigate(`/projects/${projectId}`);
  };

  const renderOptionsForType = (
    type: string,
    index: number,
    isQuery: boolean
  ) => {
    const updateOption = isQuery
      ? updateQueryParamOption
      : updateBodyParamOption;
    const params = isQuery ? queryParams : bodyParams;
    const param = params[index];

    switch (type) {
      case "string":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Length
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.minLength || ""}
                onChange={(e) =>
                  updateOption(
                    index,
                    "minLength",
                    parseInt(e.target.value) || ""
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Length
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.maxLength || ""}
                onChange={(e) =>
                  updateOption(
                    index,
                    "maxLength",
                    parseInt(e.target.value) || ""
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pattern (regex)
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.pattern || ""}
                onChange={(e) => updateOption(index, "pattern", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Format
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.format || ""}
                onChange={(e) => updateOption(index, "format", e.target.value)}
              >
                <option value="">None</option>
                <option value="email">Email</option>
                <option value="uri">URI</option>
                <option value="date">Date</option>
                <option value="date-time">Date-Time</option>
              </select>
            </div>
            {!isQuery && (
              <div className="col-span-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Enum Values
                  </label>
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                    onClick={() => addEnumValue(param.name)}
                  >
                    Add Value
                  </button>
                </div>
                {(enumValues[param.name] || []).map((value, enumIndex) => (
                  <div key={enumIndex} className="flex items-center mt-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={value}
                      onChange={(e) =>
                        updateEnumValue(param.name, enumIndex, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="ml-2 text-red-600 hover:text-red-900"
                      onClick={() => removeEnumValue(param.name, enumIndex)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "number":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.minimum || ""}
                onChange={(e) =>
                  updateOption(index, "minimum", parseInt(e.target.value) || "")
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.maximum || ""}
                onChange={(e) =>
                  updateOption(index, "maximum", parseInt(e.target.value) || "")
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.default || ""}
                onChange={(e) =>
                  updateOption(index, "default", parseInt(e.target.value) || "")
                }
              />
            </div>
          </div>
        );

      case "array":
        if (isQuery) return null;

        const paramName = param.name;
        const arrayDef = arrayFields[paramName] || { type: "string" };

        return (
          <div className="mt-2 border-l-2 border-indigo-200 pl-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Items
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={param.options.minItems || ""}
                onChange={(e) =>
                  updateOption(
                    index,
                    "minItems",
                    parseInt(e.target.value) || ""
                  )
                }
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">
                Array Items Type
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={arrayDef.type}
                onChange={(e) =>
                  updateArrayField(paramName, "type", e.target.value)
                }
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
              </select>
            </div>

            {arrayDef.type === "string" && (
              <div className="mt-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Enum Values for Array Items
                  </label>
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                    onClick={() => addEnumValue(`${paramName}.items`)}
                  >
                    Add Value
                  </button>
                </div>
                {(enumValues[`${paramName}.items`] || []).map(
                  (value, enumIndex) => (
                    <div key={enumIndex} className="flex items-center mt-2">
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={value}
                        onChange={(e) =>
                          updateEnumValue(
                            `${paramName}.items`,
                            enumIndex,
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        className="ml-2 text-red-600 hover:text-red-900"
                        onClick={() =>
                          removeEnumValue(`${paramName}.items`, enumIndex)
                        }
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {arrayDef.type === "object" && (
              <div className="mt-3">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    Object properties for array items can be defined in JSON
                    view
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "object":
        if (isQuery) return null;
        return (
          <div className="mt-2 border-l-2 border-indigo-200 pl-4">
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Object properties can be defined in JSON view
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render the form view
  const renderFormView = () => {
    return (
      <div className="space-y-6">
        {/* Basic Information */}
        {activeTab === "basic" && (
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  API Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  placeholder="CreateUser, GetProducts, etc."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  API Description
                </label>
                <textarea
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={apiDescription}
                  onChange={(e) => setApiDescription(e.target.value)}
                  placeholder="Brief description of what this API does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  HTTP Method
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Endpoint Path
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={endpointPath}
                  onChange={(e) => setEndpointPath(e.target.value)}
                  placeholder="/users, /products/:id, etc."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Endpoint Description
                </label>
                <textarea
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={endpointDescription}
                  onChange={(e) => setEndpointDescription(e.target.value)}
                  placeholder="Detailed description of this endpoint"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Parameters */}
        {activeTab === "parameters" && (
          <div className="space-y-6">
            {/* Query Parameters */}
            <Card className="p-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("queryParams")}
              >
                <h2 className="text-lg font-medium text-gray-900">
                  Query Parameters
                </h2>
                {expandedSections.queryParams ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections.queryParams && (
                <>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Define parameters that will be passed in the URL query
                    string.
                  </p>

                  {queryParams.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No query parameters defined yet.
                    </div>
                  ) : (
                    queryParams.map((param, index) => (
                      <div
                        key={index}
                        className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={param.name}
                                onChange={(e) =>
                                  updateQueryParam(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Type
                              </label>
                              <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={param.type}
                                onChange={(e) =>
                                  updateQueryParam(
                                    index,
                                    "type",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                              </select>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <input
                                  id={`required-query-${index}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={param.required}
                                  onChange={(e) =>
                                    updateQueryParam(
                                      index,
                                      "required",
                                      e.target.checked
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`required-query-${index}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Required
                                </label>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-4 text-red-600 hover:text-red-900"
                            onClick={() => removeQueryParam(index)}
                          >
                            <Trash size={16} />
                          </button>
                        </div>

                        {/* Options specific to the parameter type */}
                        {renderOptionsForType(param.type, index, true)}
                      </div>
                    ))
                  )}

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addQueryParam}
                      //   icon={<Plus size={16} />}
                    >
                      Add Query Parameter
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* Body Parameters */}
            <Card className="p-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("bodyParams")}
              >
                <h2 className="text-lg font-medium text-gray-900">
                  Body Parameters
                </h2>
                {expandedSections.bodyParams ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections.bodyParams && (
                <>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Define parameters that will be passed in the request body.
                  </p>

                  {bodyParams.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No body parameters defined yet.
                    </div>
                  ) : (
                    bodyParams.map((param, index) => (
                      <div
                        key={index}
                        className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={param.name}
                                onChange={(e) =>
                                  updateBodyParam(index, "name", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Type
                              </label>
                              <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={param.type}
                                onChange={(e) =>
                                  updateBodyParam(index, "type", e.target.value)
                                }
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="array">Array</option>
                                <option value="object">Object</option>
                              </select>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <input
                                  id={`required-body-${index}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={param.required}
                                  onChange={(e) =>
                                    updateBodyParam(
                                      index,
                                      "required",
                                      e.target.checked
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`required-body-${index}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Required
                                </label>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-4 text-red-600 hover:text-red-900"
                            onClick={() => removeBodyParam(index)}
                          >
                            <Trash size={16} />
                          </button>
                        </div>

                        {/* Options specific to the parameter type */}
                        {renderOptionsForType(param.type, index, false)}
                      </div>
                    ))
                  )}

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addBodyParam}
                      //   icon={<Plus size={16} />}
                    >
                      Add Body Parameter
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Filters */}
        {activeTab === "filters" && (
          <Card className="p-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("filters")}
            >
              <h2 className="text-lg font-medium text-gray-900">
                Allowed Filters
              </h2>
              {expandedSections.filters ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            {expandedSections.filters && (
              <>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Define which fields can be used for filtering in query
                  parameters.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {allowedFilters.map((filter, index) => (
                    <Badge
                      key={index}
                      text={filter}
                      onRemove={() => removeFilter(filter)}
                    />
                  ))}

                  {allowedFilters.length === 0 && (
                    <div className="text-gray-500">No filters defined yet.</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={currentFilter}
                    onChange={(e) => setCurrentFilter(e.target.value)}
                    placeholder="Field name (e.g. username, email)"
                  />
                  <Button type="button" onClick={addFilter}>
                    Add Filter
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Responses */}
        {activeTab === "responses" && (
          <Card className="p-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("responses")}
            >
              <h2 className="text-lg font-medium text-gray-900">Responses</h2>
              {expandedSections.responses ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            {expandedSections.responses && (
              <>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Define the possible responses for this API endpoint.
                </p>

                {responses.map((response, index) => (
                  <div
                    key={index}
                    className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Status Code
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={response.code}
                            onChange={(e) =>
                              updateResponse(index, "code", e.target.value)
                            }
                            placeholder="200, 400, 404, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={response.description}
                            onChange={(e) =>
                              updateResponse(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Success response, Error response, etc."
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-4 text-red-600 hover:text-red-900"
                        onClick={() => removeResponse(index)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Properties (edit in JSON view)
                      </label>
                      <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(response.properties, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addResponse}
                    // icon={<Plus size={16} />}
                  >
                    Add Response
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* JSON View */}
        {activeTab === "json" && (
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              JSON Schema
            </h2>
            <div className="h-[600px] border border-gray-300 rounded-md">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={jsonValue}
                onChange={handleJsonChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-500 hover:text-gray-700"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Create API Endpoint
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "form" ? "json" : "form")}
            // icon={viewMode === "form" ? <Code size={16} /> : <Eye size={16} />}
          >
            {viewMode === "form" ? "View JSON" : "View Form"}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            // icon={<Save size={16} />}
          >
            Save API
          </Button>
        </div>
      </div>

      {/* Main content */}
      {viewMode === "form" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="lg:w-64 space-y-2">
            <button
              type="button"
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === "basic"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("basic")}
            >
              Basic Information
            </button>
            <button
              type="button"
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === "parameters"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("parameters")}
            >
              Parameters
            </button>
            <button
              type="button"
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === "filters"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("filters")}
            >
              Filters
            </button>
            <button
              type="button"
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === "responses"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("responses")}
            >
              Responses
            </button>
            <button
              type="button"
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === "json"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("json")}
            >
              JSON Schema
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">{renderFormView()}</div>
        </div>
      ) : (
        // JSON View mode
        <Card className="p-6">
          <div className="h-[600px] border border-gray-300 rounded-md">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={jsonValue}
              onChange={handleJsonChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreateAPI;
