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

interface PropertyField {
  name: string;
  type: string;
  items?: any;
  properties?: Record<string, any>;
}

interface Response {
  statusCode: string;
  description: string;
  properties: Record<string, any>;
}

interface ResponseBuilderProps {
  responses: Record<string, Response>;
  onChange: (responses: Record<string, Response>) => void;
}

const ResponseBuilder: React.FC<ResponseBuilderProps> = ({
  responses,
  onChange,
}) => {
  const [expandedResponses, setExpandedResponses] = useState<
    Record<string, boolean>
  >({});
  const [expandedProperties, setExpandedProperties] = useState<
    Record<string, boolean>
  >({});

  // Common status codes with descriptions
  const commonStatusCodes = [
    { code: "200", description: "OK - The request has succeeded" },
    {
      code: "201",
      description:
        "Created - The request has been fulfilled and a new resource has been created",
    },
    {
      code: "204",
      description:
        "No Content - The server successfully processed the request but is not returning any content",
    },
    {
      code: "400",
      description: "Bad Request - The server could not understand the request",
    },
    {
      code: "401",
      description:
        "Unauthorized - Authentication is required and has failed or not been provided",
    },
    {
      code: "403",
      description:
        "Forbidden - The server understood the request but refuses to authorize it",
    },
    {
      code: "404",
      description: "Not Found - The requested resource could not be found",
    },
    {
      code: "500",
      description:
        "Internal Server Error - The server encountered an unexpected condition",
    },
  ];

  const addResponse = () => {
    // Find a status code that hasn't been used yet
    const unusedCode = commonStatusCodes.find(
      ({ code }) => !responses[code]
    ) || { code: "200", description: "OK" };

    const newResponses = {
      ...responses,
      [unusedCode.code]: {
        statusCode: unusedCode.code,
        description:
          unusedCode.description.split(" - ")[1] || unusedCode.description,
        properties: {},
      },
    };

    onChange(newResponses);
    setExpandedResponses({
      ...expandedResponses,
      [unusedCode.code]: true,
    });
  };

  const removeResponse = (statusCode: string) => {
    const newResponses = { ...responses };
    delete newResponses[statusCode];
    onChange(newResponses);
  };

  const updateResponse = (
    statusCode: string,
    field: keyof Response,
    value: any
  ) => {
    const newResponses = { ...responses };

    if (field === "statusCode" && statusCode !== value) {
      // Handle status code change (which is the key in the responses object)
      const responseData = newResponses[statusCode];
      delete newResponses[statusCode];
      newResponses[value] = {
        ...responseData,
        statusCode: value,
      };

      // Update expanded state for new status code
      setExpandedResponses({
        ...expandedResponses,
        [value]: expandedResponses[statusCode],
      });
      delete expandedResponses[statusCode];
    } else {
      newResponses[statusCode] = {
        ...newResponses[statusCode],
        [field]: value,
      };
    }

    onChange(newResponses);
  };

  const toggleExpandResponse = (statusCode: string) => {
    setExpandedResponses({
      ...expandedResponses,
      [statusCode]: !expandedResponses[statusCode],
    });
  };

  const toggleExpandProperty = (key: string) => {
    setExpandedProperties({
      ...expandedProperties,
      [key]: !expandedProperties[key],
    });
  };

  const addProperty = (statusCode: string) => {
    const newResponses = { ...responses };
    const propertyName = `property${
      Object.keys(newResponses[statusCode].properties).length + 1
    }`;

    newResponses[statusCode] = {
      ...newResponses[statusCode],
      properties: {
        ...newResponses[statusCode].properties,
        [propertyName]: {
          type: "string",
        },
      },
    };

    onChange(newResponses);
  };

  const removeProperty = (statusCode: string, propertyName: string) => {
    const newResponses = { ...responses };
    const newProperties = { ...newResponses[statusCode].properties };
    delete newProperties[propertyName];

    newResponses[statusCode] = {
      ...newResponses[statusCode],
      properties: newProperties,
    };

    onChange(newResponses);
  };

  const updateProperty = (
    statusCode: string,
    propertyName: string,
    field: string,
    value: any
  ) => {
    const newResponses = { ...responses };
    const propertyData = {
      ...newResponses[statusCode].properties[propertyName],
    };

    // Handle property name change
    if (field === "name" && propertyName !== value) {
      const newProperties = { ...newResponses[statusCode].properties };
      delete newProperties[propertyName];
      newProperties[value] = propertyData;

      newResponses[statusCode] = {
        ...newResponses[statusCode],
        properties: newProperties,
      };
    } else {
      // Handle other property field changes
      if (field === "type") {
        // Reset type-specific fields when changing type
        const newType = value;
        if (newType === "array") {
          propertyData.items = { type: "string" };
        } else if (newType === "object") {
          propertyData.properties = {};
        } else {
          delete propertyData.items;
          delete propertyData.properties;
        }
      }

      newResponses[statusCode].properties[propertyName] = {
        ...propertyData,
        [field]: value,
      };
    }

    onChange(newResponses);
  };

  const updateArrayItemType = (
    statusCode: string,
    propertyName: string,
    field: string,
    value: any
  ) => {
    const newResponses = { ...responses };
    const propertyData = {
      ...newResponses[statusCode].properties[propertyName],
    };

    if (!propertyData.items) {
      propertyData.items = { type: "string" };
    }

    propertyData.items = {
      ...propertyData.items,
      [field]: value,
    };

    newResponses[statusCode].properties[propertyName] = propertyData;
    onChange(newResponses);
  };

  const propertyTypes = [
    "string",
    "number",
    "integer",
    "boolean",
    "array",
    "object",
  ];

  return (
    <div className="space-y-6">
      {Object.values(responses).map((response) => (
        <Card key={response.statusCode} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Status {response.statusCode}
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={
                  expandedResponses[response.statusCode] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )
                }
                onClick={() => toggleExpandResponse(response.statusCode)}
              >
                {expandedResponses[response.statusCode] ? "Collapse" : "Expand"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={16} />}
                onClick={() => removeResponse(response.statusCode)}
              >
                Remove
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status Code
              </label>
              <select
                value={response.statusCode}
                onChange={(e) =>
                  updateResponse(
                    response.statusCode,
                    "statusCode",
                    e.target.value
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {commonStatusCodes.map(({ code, description }) => (
                  <option key={code} value={code}>
                    {code} - {description.split(" - ")[1] || description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={response.description}
                onChange={(e) =>
                  updateResponse(
                    response.statusCode,
                    "description",
                    e.target.value
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Response description"
              />
            </div>
          </div>

          {expandedResponses[response.statusCode] && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">
                  Response Properties
                </h4>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={() => addProperty(response.statusCode)}
                >
                  Add Property
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(response.properties).map(
                  ([propertyName, propertyData]) => (
                    <Card key={propertyName} className="p-3 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Property Name
                          </label>
                          <input
                            type="text"
                            value={propertyName}
                            onChange={(e) =>
                              updateProperty(
                                response.statusCode,
                                propertyName,
                                "name",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            value={propertyData.type}
                            onChange={(e) =>
                              updateProperty(
                                response.statusCode,
                                propertyName,
                                "type",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {propertyTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Array item type */}
                      {propertyData.type === "array" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-700">
                              Array Item Type
                            </h5>
                            <button
                              type="button"
                              onClick={() =>
                                toggleExpandProperty(
                                  `${response.statusCode}-${propertyName}`
                                )
                              }
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-200"
                            >
                              {expandedProperties[
                                `${response.statusCode}-${propertyName}`
                              ] ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          </div>

                          {expandedProperties[
                            `${response.statusCode}-${propertyName}`
                          ] && (
                            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700">
                                Item Type
                              </label>
                              <select
                                value={propertyData.items?.type || "string"}
                                onChange={(e) =>
                                  updateArrayItemType(
                                    response.statusCode,
                                    propertyName,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                {propertyTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 size={16} />}
                          onClick={() =>
                            removeProperty(response.statusCode, propertyName)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}
        </Card>
      ))}

      <Button
        variant="secondary"
        leftIcon={<Plus size={16} />}
        onClick={addResponse}
      >
        Add Response
      </Button>
    </div>
  );
};

export default ResponseBuilder;
