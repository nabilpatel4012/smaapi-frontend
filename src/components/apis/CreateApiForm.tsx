import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Minus, Code, Save, AlertCircle } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Editor from "@monaco-editor/react";
import ResponseBuilder from "./ResponseBuilder";
import ParameterBuilder from "./ParameterBuilder";

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
  default?: any;
  items?: any;
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

const CreateApiForm: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ApiFormData>({
    project_id: projectId,
    api_name: "",
    api_description: "",
    http_method: "GET",
    endpoint_path: "",
    endpoint_description: "",
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

  const handleBasicInfoChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear validation error when field is updated
    if (validationErrors[e.target.name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[e.target.name];
      setValidationErrors(newErrors);
    }
  };

  const handleJsonChange = (value: string | undefined) => {
    try {
      if (value) {
        const parsedValue = JSON.parse(value);
        setFormData(parsedValue);
      }
    } catch (error) {
      console.error("Invalid JSON");
    }
  };

  const handleParameterChange = (
    paramType: "query" | "body",
    paramData: {
      required: string[];
      properties: Record<string, any>;
    } | null
  ) => {
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [paramType]: paramData,
      },
    });
  };

  const handleResponsesChange = (responses: Record<string, Response>) => {
    setFormData({
      ...formData,
      responses,
    });
  };

  const handleAllowedFiltersChange = (filterName: string, checked: boolean) => {
    const newFilters = checked
      ? [...formData.allowedFilters, filterName]
      : formData.allowedFilters.filter((f) => f !== filterName);

    setFormData({
      ...formData,
      allowedFilters: newFilters,
    });
  };

  const convertParamsToSchema = (params: Parameter[]) => {
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
      if (param.default !== undefined) paramSchema.default = param.default;
      if (param.items) paramSchema.items = param.items;

      properties[param.name] = paramSchema;
      if (param.required) required.push(param.name);
    });

    return { properties, required };
  };

  const handleQueryParamsChange = (params: Parameter[]) => {
    const { properties, required } = convertParamsToSchema(params);
    handleParameterChange("query", {
      properties,
      required,
    });
  };

  const handleBodyParamsChange = (params: Parameter[]) => {
    const { properties, required } = convertParamsToSchema(params);
    handleParameterChange("body", {
      properties,
      required,
    });
  };

  const handleRequiredChange = (
    paramType: "query" | "body",
    paramName: string,
    isRequired: boolean
  ) => {
    const currentParams = formData.parameters[paramType];
    if (!currentParams) return;

    const newRequired = isRequired
      ? [...currentParams.required, paramName]
      : currentParams.required.filter((name) => name !== paramName);

    handleParameterChange(paramType, {
      ...currentParams,
      required: newRequired,
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.api_name) {
      errors.api_name = "API name is required";
    }

    if (!formData.endpoint_path) {
      errors.endpoint_path = "Endpoint path is required";
    } else if (!formData.endpoint_path.startsWith("/")) {
      errors.endpoint_path = "Endpoint path must start with /";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Focus on the first step if there are basic info errors
      if (validationErrors.api_name || validationErrors.endpoint_path) {
        setCurrentStep(0);
      }
      return;
    }

    try {
      console.log("Saving API:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to save API:", error);
    }
  };

  // Convert parameters from schema format back to array format for ParameterBuilder
  const schemaToParameterArray = (
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
      default: props.default,
      items: props.items,
    }));
  };

  const steps = [
    {
      title: "Basic Information",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              API Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="api_name"
              value={formData.api_name}
              onChange={handleBasicInfoChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                validationErrors.api_name ? "border-red-500" : ""
              }`}
              placeholder="e.g., GetUsers, CreateUser"
            />
            {validationErrors.api_name && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.api_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              API Description
            </label>
            <textarea
              name="api_description"
              value={formData.api_description}
              onChange={handleBasicInfoChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe what this API does"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                HTTP Method <span className="text-red-500">*</span>
              </label>
              <select
                name="http_method"
                value={formData.http_method}
                onChange={handleBasicInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                Endpoint Path <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="endpoint_path"
                value={formData.endpoint_path}
                onChange={handleBasicInfoChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  validationErrors.endpoint_path ? "border-red-500" : ""
                }`}
                placeholder="/api/v1/users"
              />
              {validationErrors.endpoint_path && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.endpoint_path}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Endpoint Description
            </label>
            <textarea
              name="endpoint_description"
              value={formData.endpoint_description}
              onChange={handleBasicInfoChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe what this endpoint does"
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
              >
                {formData.parameters.query ? "Remove" : "Add"} Query Parameters
              </Button>
            </div>

            {formData.parameters.query && (
              <div className="space-y-4">
                <ParameterBuilder
                  parameters={schemaToParameterArray(formData.parameters.query)}
                  onChange={handleQueryParamsChange}
                  onRequiredChange={(paramName: any, required: any) =>
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
              >
                {formData.parameters.body ? "Remove" : "Add"} Request Body
              </Button>
            </div>

            {formData.parameters.body && (
              <div className="space-y-4">
                <ParameterBuilder
                  parameters={schemaToParameterArray(formData.parameters.body)}
                  onChange={handleBodyParamsChange}
                  onRequiredChange={(paramName: any, required: any) =>
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
          >
            {showJsonEditor ? "Form View" : "JSON View"}
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
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
              disabled={currentStep === 0}
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
