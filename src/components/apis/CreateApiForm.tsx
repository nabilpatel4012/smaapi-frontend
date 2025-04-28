import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Minus, Code, Save, AlertCircle, Database } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Editor from "@monaco-editor/react";
import ResponseBuilder from "./ResponseBuilder";
import ParameterBuilder from "./ParameterBuilder";
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

export interface Table {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  indexes: {
    name: string;
    columns: string[];
    isUnique: boolean;
  }[];
}

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
  pattern?: string;
  format?: string;
  default?: any;
  items?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    enum?: string[];
  };
  properties?: Record<string, any>;
}

interface Response {
  statusCode: string;
  description: string;
  properties: Record<string, any>;
}

interface ApiFormData {
  project_id?: string;
  api_name: string;
  api_description?: string;
  http_method: string;
  endpoint_path: string;
  endpoint_description?: string;
  table_id?: string;
  table_name?: string;
  parameters: {
    query: {
      required: string[];
      properties: Record<string, any>;
    } | null;
    body: {
      required: string[];
      properties: Record<string, any>;
    } | null;
  };
  allowedFilters: string[];
  responses: Record<string, Response>;
}

interface CreateApiFormProps {
  tables?: Table[];
}

const CreateApiForm: React.FC<CreateApiFormProps> = ({
  tables = mockTables,
}) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ApiFormData>({
    project_id: projectId,
    api_name: "",
    api_description: "",
    http_method: "GET",
    endpoint_path: "",
    endpoint_description: "",
    table_id: undefined,
    table_name: undefined,
    parameters: {
      query: null,
      body: null,
    },
    allowedFilters: [],
    responses: {
      "200": {
        statusCode: "200",
        description: "Success",
        properties: {},
      },
    },
  });

  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    if (formData.table_id) {
      const table = tables.find((t) => t.id === formData.table_id);
      setSelectedTable(table || null);
    } else {
      setSelectedTable(null);
    }
  }, [formData.table_id, tables]);

  const handleTableChange = useCallback(
    (tableId: string) => {
      const table = tables.find((t) => t.id === tableId);
      if (table) {
        setFormData((prev) => ({
          ...prev,
          table_id: table.id,
          table_name: table.name,
        }));
        setSelectedTable(table);
      }
    },
    [tables]
  );

  const handleBasicInfoChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const convertParamsToSchema = useCallback((params: Parameter[]) => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    params.forEach((param) => {
      const paramSchema: Record<string, any> = {
        type: param.type,
      };

      if (param.description) paramSchema.description = param.description;
      if (param.enum) paramSchema.enum = param.enum;
      if (param.minimum !== undefined) paramSchema.minimum = param.minimum;
      if (param.maximum !== undefined) paramSchema.maximum = param.maximum;
      if (param.minLength !== undefined)
        paramSchema.minLength = param.minLength;
      if (param.maxLength !== undefined)
        paramSchema.maxLength = param.maxLength;
      if (param.pattern) paramSchema.pattern = param.pattern;
      if (param.format) paramSchema.format = param.format;
      if (param.default !== undefined) paramSchema.default = param.default;
      if (param.items) paramSchema.items = param.items;
      if (param.properties) paramSchema.properties = param.properties;

      properties[param.name] = paramSchema;
      if (param.required) required.push(param.name);
    });

    return { properties, required };
  }, []);

  const handleParameterChange = useCallback(
    (
      paramType: "query" | "body",
      paramData: {
        required: string[];
        properties: Record<string, any>;
      } | null
    ) => {
      setFormData((prev) => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [paramType]: paramData,
        },
      }));
    },
    []
  );

  const handleQueryParamsChange = useCallback(
    (params: Parameter[]) => {
      const { properties, required } = convertParamsToSchema(params);
      handleParameterChange("query", { properties, required });
    },
    [convertParamsToSchema, handleParameterChange]
  );

  const handleBodyParamsChange = useCallback(
    (params: Parameter[]) => {
      const { properties, required } = convertParamsToSchema(params);
      handleParameterChange("body", { properties, required });
    },
    [convertParamsToSchema, handleParameterChange]
  );

  const handleRequiredChange = useCallback(
    (paramType: "query" | "body", paramName: string, isRequired: boolean) => {
      setFormData((prev) => {
        const currentParams = prev.parameters[paramType];
        if (!currentParams) return prev;

        const newRequired = isRequired
          ? [...currentParams.required, paramName]
          : currentParams.required.filter((name) => name !== paramName);

        return {
          ...prev,
          parameters: {
            ...prev.parameters,
            [paramType]: {
              ...currentParams,
              required: newRequired,
            },
          },
        };
      });
    },
    []
  );

  const handleAllowedFiltersChange = useCallback(
    (filterName: string, checked: boolean) => {
      setFormData((prev) => {
        const newFilters = checked
          ? [...prev.allowedFilters, filterName]
          : prev.allowedFilters.filter((f) => f !== filterName);
        return {
          ...prev,
          allowedFilters: newFilters,
        };
      });
    },
    []
  );

  const handleResponsesChange = useCallback(
    (responses: Record<string, Response>) => {
      setFormData((prev) => ({
        ...prev,
        responses,
      }));
    },
    []
  );

  const handleJsonChange = useCallback((value: string | undefined) => {
    try {
      if (value) {
        const parsedValue = JSON.parse(value);
        setFormData(parsedValue);
      }
    } catch (error) {
      console.error("Invalid JSON");
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.api_name) {
      errors.api_name = "API name is required";
    }

    if (!formData.endpoint_path) {
      errors.endpoint_path = "Endpoint path is required";
    } else if (!formData.endpoint_path.startsWith("/")) {
      errors.endpoint_path = "Endpoint path must start with /";
    }

    if (!formData.table_id) {
      errors.table_id = "You must select a table";
    }

    if (formData.parameters.body) {
      const bodyParams = Object.entries(formData.parameters.body.properties);
      bodyParams.forEach(([name, param]) => {
        if (!param.mapped && formData.http_method !== "GET") {
          errors[`body_param_${name}`] =
            "Parameter must be mapped to a table column";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      if (
        validationErrors.api_name ||
        validationErrors.endpoint_path ||
        validationErrors.table_id
      ) {
        setCurrentStep(0);
      }
      return;
    }

    try {
      console.log("Saving API:", formData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to save API:", error);
    }
  }, [validateForm, validationErrors, projectId, navigate, formData]);

  const schemaToParameterArray = useCallback(
    (
      schema: { properties: Record<string, any>; required: string[] } | null
    ): Parameter[] => {
      if (!schema) return [];

      return Object.entries(schema.properties).map(([name, props]) => ({
        name,
        type: props.type,
        required: schema.required.includes(name),
        description: props.description,
        enum: props.enum,
        minimum: props.minimum,
        maximum: props.maximum,
        minLength: props.minLength,
        maxLength: props.maxLength,
        pattern: props.pattern,
        format: props.format,
        default: props.default,
        items: props.items,
        properties: props.properties,
      }));
    },
    []
  );

  const queryParams = useMemo(
    () => schemaToParameterArray(formData.parameters.query),
    [formData.parameters.query, schemaToParameterArray]
  );

  const bodyParams = useMemo(
    () => schemaToParameterArray(formData.parameters.body),
    [formData.parameters.body, schemaToParameterArray]
  );

  const steps = [
    {
      title: "Basic Information",
      content: (
        <div className="space-y-6">
          {tables.length === 0 && (
            <Card className="bg-yellow-50 p-4 border-yellow-200">
              <div className="flex items-start">
                <AlertCircle
                  className="text-yellow-500 mr-3 mt-0.5"
                  size={18}
                />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    No tables found
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You must create at least one table before creating an API.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      navigate(`/projects/${projectId}/tables/create`)
                    }
                  >
                    Create Table
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div>
            <label
              htmlFor="api_name"
              className="block text-sm font-medium text-gray-700"
            >
              API Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="api_name"
              id="api_name"
              value={formData.api_name}
              onChange={handleBasicInfoChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                validationErrors.api_name ? "border-red-500" : ""
              }`}
              placeholder="e.g., GetUsers, CreateUser"
              disabled={tables.length === 0}
            />
            {validationErrors.api_name && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.api_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="api_description"
              className="block text-sm font-medium text-gray-700"
            >
              API Description
            </label>
            <textarea
              name="api_description"
              id="api_description"
              value={formData.api_description}
              onChange={handleBasicInfoChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe what this API does"
              disabled={tables.length === 0}
            />
          </div>

          <div>
            <label
              htmlFor="table_id"
              className="block text-sm font-medium text-gray-700"
            >
              Table <span className="text-red-500">*</span>
            </label>
            <select
              id="table_id"
              value={formData.table_id || ""}
              onChange={(e) => handleTableChange(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                validationErrors.table_id ? "border-red-500" : ""
              }`}
              disabled={tables.length === 0}
            >
              <option value="">-- Select Table --</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
            {validationErrors.table_id && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.table_id}
              </p>
            )}
            {selectedTable && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Database size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Selected table: <strong>{selectedTable.name}</strong>
                  </span>
                </div>
                {selectedTable.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedTable.description}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="http_method"
                className="block text-sm font-medium text-gray-700"
              >
                HTTP Method <span className="text-red-500">*</span>
              </label>
              <select
                name="http_method"
                id="http_method"
                value={formData.http_method}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={tables.length === 0}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="endpoint_path"
                className="block text-sm font-medium text-gray-700"
              >
                Endpoint Path <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="endpoint_path"
                id="endpoint_path"
                value={formData.endpoint_path}
                onChange={handleBasicInfoChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  validationErrors.endpoint_path ? "border-red-500" : ""
                }`}
                placeholder="/api/v1/users"
                disabled={tables.length === 0}
              />
              {validationErrors.endpoint_path && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.endpoint_path}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="endpoint_description"
              className="block text-sm font-medium text-gray-700"
            >
              Endpoint Description
            </label>
            <textarea
              name="endpoint_description"
              id="endpoint_description"
              value={formData.endpoint_description}
              onChange={handleBasicInfoChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe what this endpoint does"
              disabled={tables.length === 0}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Parameters",
      content: (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Query Parameters
              </h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={
                  formData.parameters.query ? (
                    <Minus size={16} />
                  ) : (
                    <Plus size={16} />
                  )
                }
                onClick={() =>
                  handleParameterChange(
                    "query",
                    formData.parameters.query
                      ? null
                      : { required: [], properties: {} }
                  )
                }
                disabled={!selectedTable}
              >
                {formData.parameters.query ? "Remove" : "Add"} Query Parameters
              </Button>
            </div>

            {formData.parameters.query && (
              <div className="space-y-4">
                <ParameterBuilder
                  parameters={queryParams}
                  onChange={handleQueryParamsChange}
                  onRequiredChange={(paramName: string, required: boolean) =>
                    handleRequiredChange("query", paramName, required)
                  }
                />

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Allowed Filters
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(formData.parameters.query.properties).map(
                      (paramName) => (
                        <label key={paramName} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowedFilters.includes(
                              paramName
                            )}
                            onChange={(e) =>
                              handleAllowedFiltersChange(
                                paramName,
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {paramName}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request Body
              </h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={
                  formData.parameters.body ? (
                    <Minus size={16} />
                  ) : (
                    <Plus size={16} />
                  )
                }
                onClick={() =>
                  handleParameterChange(
                    "body",
                    formData.parameters.body
                      ? null
                      : { required: [], properties: {} }
                  )
                }
                disabled={!selectedTable}
              >
                {formData.parameters.body ? "Remove" : "Add"} Request Body
              </Button>
            </div>

            {formData.parameters.body && (
              <div className="space-y-4">
                <ParameterBuilder
                  parameters={bodyParams}
                  onChange={handleBodyParamsChange}
                  onRequiredChange={(paramName: string, required: boolean) =>
                    handleRequiredChange("body", paramName, required)
                  }
                />

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Allowed Filters
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(formData.parameters.body.properties).map(
                      (paramName) => (
                        <label key={paramName} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowedFilters.includes(
                              paramName
                            )}
                            onChange={(e) =>
                              handleAllowedFiltersChange(
                                paramName,
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {paramName}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      title: "Responses",
      content: (
        <div className="space-y-6">
          <ResponseBuilder
            responses={formData.responses}
            onChange={handleResponsesChange}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Create API</h2>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<Code size={16} />}
            onClick={() => setShowJsonEditor(!showJsonEditor)}
            disabled={tables.length === 0}
          >
            {showJsonEditor ? "Form View" : "JSON View"}
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
            disabled={tables.length === 0}
          >
            Save API
          </Button>
        </div>
      </div>

      {showJsonEditor ? (
        <Card className="p-4">
          <Editor
            height="600px"
            defaultLanguage="json"
            value={JSON.stringify(formData, null, 2)}
            onChange={handleJsonChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {steps.map((step, index) => (
                <button
                  key={index}
                  className={`
                    pb-4 pt-2 px-1 border-b-2 font-medium text-sm
                    ${
                      currentStep === index
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                  onClick={() => setCurrentStep(index)}
                >
                  {step.title}
                </button>
              ))}
            </nav>
          </div>

          <div
            key={currentStep}
            className="transition-all duration-200 ease-in-out"
          >
            {steps[currentStep].content}
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || tables.length === 0}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleSave();
                }
              }}
              disabled={tables.length === 0}
            >
              {currentStep === steps.length - 1 ? "Create API" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateApiForm;
