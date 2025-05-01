// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Plus,
//   Trash,
//   Save,
//   Code,
//   Eye,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import Button from "../common/Button";
// import Card from "../common/Card";
// import Badge from "../common/Badge";
// import Editor from "@monaco-editor/react";
// import BasicInfoForm from "./BasicInfoForm";
// import BodyParameter from "./BodyParameter";
// import {
//   FieldDefinition,
//   ResponseDefinition,
//   ArrayItemsDefinition,
// } from "./apiTypes";

// const CreateAPI: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();

//   // Basic Info
//   const [apiName, setApiName] = useState("");
//   const [apiDescription, setApiDescription] = useState("");
//   const [httpMethod, setHttpMethod] = useState("GET");
//   const [endpointPath, setEndpointPath] = useState("");
//   const [endpointDescription, setEndpointDescription] = useState("");
//   const [selectedTable, setSelectedTable] = useState("");

//   // Parameters
//   const [queryParams, setQueryParams] = useState<FieldDefinition[]>([]);
//   const [bodyParams, setBodyParams] = useState<FieldDefinition[]>([]);
//   const [nestedObjects, setNestedObjects] = useState<
//     Record<string, { required: string[]; properties: Record<string, any> }>
//   >({});
//   const [arrayFields, setArrayFields] = useState<
//     Record<string, ArrayItemsDefinition>
//   >({});
//   const [enumValues, setEnumValues] = useState<Record<string, string[]>>({});

//   // Filters and Responses
//   const [allowedFilters, setAllowedFilters] = useState<string[]>([]);
//   const [currentFilter, setCurrentFilter] = useState("");
//   const [responses, setResponses] = useState<ResponseDefinition[]>([
//     {
//       code: "200",
//       description: "Success response",
//       properties: { message: { type: "string" } },
//     },
//     {
//       code: "400",
//       description: "Error response",
//       properties: { error: { type: "string" } },
//     },
//   ]);

//   // UI States
//   const [activeTab, setActiveTab] = useState("basic");
//   const [viewMode, setViewMode] = useState<"form" | "json">("form");
//   const [jsonValue, setJsonValue] = useState("{}");
//   const [expandedSections, setExpandedSections] = useState<
//     Record<string, boolean>
//   >({
//     queryParams: true,
//     bodyParams: true,
//     filters: true,
//     responses: true,
//   });

//   // Generate API schema from form data
//   const generateApiSchema = () => {
//     const requiredQueryParams = queryParams
//       .filter((param) => param.required)
//       .map((param) => param.name);
//     const requiredBodyParams = bodyParams
//       .filter((param) => param.required)
//       .map((param) => param.name);

//     const queryProperties: Record<string, any> = {};
//     const bodyProperties: Record<string, any> = {};

//     queryParams.forEach((param) => {
//       queryProperties[param.name] = { type: param.type, ...param.options };
//     });

//     bodyParams.forEach((param) => {
//       const baseProperties = {
//         type: param.type,
//         ...(param.mapped ? { mapped: param.mapped } : {}),
//         ...param.options,
//       };

//       if (param.type === "array") {
//         bodyProperties[param.name] = {
//           ...baseProperties,
//           items: arrayFields[param.name] || { type: "string" },
//         };
//       } else if (param.type === "object") {
//         bodyProperties[param.name] = {
//           ...baseProperties,
//           ...(nestedObjects[param.name] || { type: "object", properties: {} }),
//         };
//       } else {
//         bodyProperties[param.name] = baseProperties;
//       }
//     });

//     const formattedResponses: Record<string, any> = {};
//     responses.forEach((response) => {
//       formattedResponses[response.code] = {
//         description: response.description,
//         properties: response.properties,
//       };
//     });

//     return {
//       project_id: Number(projectId),
//       api_name: apiName,
//       api_description: apiDescription,
//       http_method: httpMethod,
//       endpoint_path: endpointPath,
//       endpoint_description: endpointDescription,
//       table: selectedTable,
//       parameters: {
//         query:
//           queryParams.length > 0
//             ? { required: requiredQueryParams, properties: queryProperties }
//             : null,
//         body:
//           bodyParams.length > 0
//             ? { required: requiredBodyParams, properties: bodyProperties }
//             : null,
//       },
//       allowedFilters,
//       responses: formattedResponses,
//     };
//   };

//   // Update JSON view when form changes
//   useEffect(() => {
//     const schema = generateApiSchema();
//     setJsonValue(JSON.stringify(schema, null, 2));
//   }, [
//     apiName,
//     apiDescription,
//     httpMethod,
//     endpointPath,
//     endpointDescription,
//     selectedTable,
//     queryParams,
//     bodyParams,
//     allowedFilters,
//     responses,
//     nestedObjects,
//     arrayFields,
//   ]);

//   // Parse JSON and update form
//   const handleJsonChange = (value: string | undefined) => {
//     if (!value) return;
//     setJsonValue(value);

//     try {
//       const parsed = JSON.parse(value);

//       setApiName(parsed.api_name || "");
//       setApiDescription(parsed.api_description || "");
//       setHttpMethod(parsed.http_method || "GET");
//       setEndpointPath(parsed.endpoint_path || "");
//       setEndpointDescription(parsed.endpoint_description || "");
//       setSelectedTable(parsed.table || "");

//       const queryParamsArray: FieldDefinition[] = [];
//       const bodyParamsArray: FieldDefinition[] = [];
//       const newNestedObjects: Record<string, any> = {};
//       const newArrayFields: Record<string, any> = {};

//       if (parsed.parameters?.query?.properties) {
//         Object.entries(parsed.parameters.query.properties).forEach(
//           ([name, def]: [string, any]) => {
//             const required =
//               parsed.parameters.query.required?.includes(name) || false;
//             const { type, ...options } = def;
//             queryParamsArray.push({ name, type, required, options });
//           }
//         );
//       }

//       if (parsed.parameters?.body?.properties) {
//         Object.entries(parsed.parameters.body.properties).forEach(
//           ([name, def]: [string, any]) => {
//             const required =
//               parsed.parameters.body.required?.includes(name) || false;
//             const { type, mapped, ...options } = def;

//             if (type === "array") {
//               bodyParamsArray.push({
//                 name,
//                 type,
//                 required,
//                 mapped,
//                 options: { minItems: def.minItems },
//               });
//               newArrayFields[name] = def.items;
//             } else if (type === "object") {
//               bodyParamsArray.push({
//                 name,
//                 type,
//                 required,
//                 mapped,
//                 options: {},
//               });
//               newNestedObjects[name] = {
//                 required: def.required || [],
//                 properties: def.properties || {},
//               };
//             } else {
//               bodyParamsArray.push({ name, type, required, mapped, options });
//             }
//           }
//         );
//       }

//       setAllowedFilters(parsed.allowedFilters || []);
//       const responsesArray: ResponseDefinition[] = [];
//       if (parsed.responses) {
//         Object.entries(parsed.responses).forEach(
//           ([code, def]: [string, any]) => {
//             responsesArray.push({
//               code,
//               description: def.description || "",
//               properties: def.properties || {},
//             });
//           }
//         );
//       }

//       setQueryParams(queryParamsArray);
//       setBodyParams(bodyParamsArray);
//       setNestedObjects(newNestedObjects);
//       setArrayFields(newArrayFields);
//       setResponses(responsesArray);
//     } catch (e) {
//       console.error("Invalid JSON:", e);
//     }
//   };

//   // Parameter management
//   const addQueryParam = () => {
//     setQueryParams([
//       ...queryParams,
//       { name: "", type: "string", required: false, options: {} },
//     ]);
//   };

//   const addBodyParam = () => {
//     setBodyParams([
//       ...bodyParams,
//       { name: "", type: "string", required: false, options: {} },
//     ]);
//   };

//   const removeQueryParam = (index: number) => {
//     setQueryParams(queryParams.filter((_, i) => i !== index));
//   };

//   const removeBodyParam = (index: number) => {
//     const param = bodyParams[index];
//     setBodyParams(bodyParams.filter((_, i) => i !== index));

//     if (param.type === "array") {
//       setArrayFields((prev) => {
//         const updated = { ...prev };
//         delete updated[param.name];
//         return updated;
//       });
//     } else if (param.type === "object") {
//       setNestedObjects((prev) => {
//         const updated = { ...prev };
//         delete updated[param.name];
//         return updated;
//       });
//     }
//   };

//   const updateQueryParam = (index: number, field: string, value: any) => {
//     setQueryParams((prev) =>
//       prev.map((param, i) =>
//         i === index ? { ...param, [field]: value } : param
//       )
//     );
//   };

//   const updateBodyParam = (index: number, field: string, value: any) => {
//     setBodyParams((prev) => {
//       const updated = [...prev];
//       if (field === "type" && updated[index].type !== value) {
//         updated[index] = { ...updated[index], [field]: value, options: {} };
//         const paramName = updated[index].name;
//         if (value === "array" && !arrayFields[paramName]) {
//           setArrayFields((prev) => ({
//             ...prev,
//             [paramName]: { type: "string" },
//           }));
//         } else if (value === "object" && !nestedObjects[paramName]) {
//           setNestedObjects((prev) => ({
//             ...prev,
//             [paramName]: { required: [], properties: {} },
//           }));
//         }
//       } else {
//         updated[index] = { ...updated[index], [field]: value };
//       }
//       return updated;
//     });
//   };

//   const updateQueryParamOption = (
//     index: number,
//     option: string,
//     value: any
//   ) => {
//     setQueryParams((prev) =>
//       prev.map((param, i) =>
//         i === index
//           ? { ...param, options: { ...param.options, [option]: value } }
//           : param
//       )
//     );
//   };

//   const updateBodyParamOption = (index: number, option: string, value: any) => {
//     setBodyParams((prev) =>
//       prev.map((param, i) =>
//         i === index
//           ? { ...param, options: { ...param.options, [option]: value } }
//           : param
//       )
//     );
//   };

//   const updateArrayField = (
//     fieldName: string,
//     property: string,
//     value: any
//   ) => {
//     setArrayFields((prev) => ({
//       ...prev,
//       [fieldName]: { ...prev[fieldName], [property]: value },
//     }));
//   };

//   const addEnumValue = (fieldName: string) => {
//     setEnumValues((prev) => ({
//       ...prev,
//       [fieldName]: [...(prev[fieldName] || []), ""],
//     }));
//   };

//   const updateEnumValue = (fieldName: string, index: number, value: string) => {
//     setEnumValues((prev) => {
//       const current = [...(prev[fieldName] || [])];
//       current[index] = value;
//       return { ...prev, [fieldName]: current };
//     });

//     const bodyParamIndex = bodyParams.findIndex((p) => p.name === fieldName);
//     if (bodyParamIndex >= 0) {
//       updateBodyParamOption(
//         bodyParamIndex,
//         "enum",
//         enumValues[fieldName] || []
//       );
//     }

//     Object.keys(arrayFields).forEach((arrayField) => {
//       if (
//         arrayFields[arrayField].type === "string" &&
//         fieldName === `${arrayField}.items`
//       ) {
//         setArrayFields((prev) => ({
//           ...prev,
//           [arrayField]: {
//             ...prev[arrayField],
//             enum: enumValues[fieldName] || [],
//           },
//         }));
//       }
//     });
//   };

//   const removeEnumValue = (fieldName: string, index: number) => {
//     setEnumValues((prev) => {
//       const current = [...(prev[fieldName] || [])];
//       current.splice(index, 1);
//       return { ...prev, [fieldName]: current };
//     });

//     const bodyParamIndex = bodyParams.findIndex((p) => p.name === fieldName);
//     if (bodyParamIndex >= 0) {
//       updateBodyParamOption(
//         bodyParamIndex,
//         "enum",
//         enumValues[fieldName] || []
//       );
//     }

//     Object.keys(arrayFields).forEach((arrayField) => {
//       if (
//         arrayFields[arrayField].type === "string" &&
//         fieldName === `${arrayField}.items`
//       ) {
//         setArrayFields((prev) => ({
//           ...prev,
//           [arrayField]: {
//             ...prev[arrayField],
//             enum: enumValues[fieldName] || [],
//           },
//         }));
//       }
//     });
//   };

//   const addFilter = () => {
//     if (currentFilter && !allowedFilters.includes(currentFilter)) {
//       setAllowedFilters([...allowedFilters, currentFilter]);
//       setCurrentFilter("");
//     }
//   };

//   const removeFilter = (filter: string) => {
//     setAllowedFilters(allowedFilters.filter((f) => f !== filter));
//   };

//   const addResponse = () => {
//     setResponses([
//       ...responses,
//       {
//         code: "",
//         description: "",
//         properties: { message: { type: "string" } },
//       },
//     ]);
//   };

//   const removeResponse = (index: number) => {
//     setResponses(responses.filter((_, i) => i !== index));
//   };

//   const updateResponse = (index: number, field: string, value: any) => {
//     setResponses((prev) =>
//       prev.map((response, i) =>
//         i === index ? { ...response, [field]: value } : response
//       )
//     );
//   };

//   const toggleSection = (section: string) => {
//     setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   const handleSave = () => {
//     const apiSchema = generateApiSchema();
//     console.log("Saving API:", apiSchema);
//     alert("API saved successfully!");
//     navigate(`/projects/${projectId}`);
//   };

//   const renderOptionsForType = (
//     type: string,
//     index: number,
//     isQuery: boolean
//   ) => {
//     const updateOption = isQuery
//       ? updateQueryParamOption
//       : updateBodyParamOption;
//     const params = isQuery ? queryParams : bodyParams;
//     const param = params[index];

//     switch (type) {
//       case "string":
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Min Length
//               </label>
//               <input
//                 type="number"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.minLength || ""}
//                 onChange={(e) =>
//                   updateOption(
//                     index,
//                     "minLength",
//                     parseInt(e.target.value) || ""
//                   )
//                 }
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Max Length
//               </label>
//               <input
//                 type="number"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.maxLength || ""}
//                 onChange={(e) =>
//                   updateOption(
//                     index,
//                     "maxLength",
//                     parseInt(e.target.value) || ""
//                   )
//                 }
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Pattern (regex)
//               </label>
//               <input
//                 type="text"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.pattern || ""}
//                 onChange={(e) => updateOption(index, "pattern", e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Format
//               </label>
//               <select
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.format || ""}
//                 onChange={(e) => updateOption(index, "format", e.target.value)}
//               >
//                 <option value="">None</option>
//                 <option value="email">Email</option>
//                 <option value="uri">URI</option>
//                 <option value="date">Date</option>
//                 <option value="date-time">Date-Time</option>
//               </select>
//             </div>
//             {!isQuery && (
//               <div className="col-span-2">
//                 <div className="flex justify-between items-center">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Enum Values
//                   </label>
//                   <button
//                     type="button"
//                     className="text-indigo-600 hover:text-indigo-900 text-sm"
//                     onClick={() => addEnumValue(param.name)}
//                   >
//                     Add Value
//                   </button>
//                 </div>
//                 {(enumValues[param.name] || []).map((value, enumIndex) => (
//                   <div key={enumIndex} className="flex items-center mt-2">
//                     <input
//                       type="text"
//                       className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                       value={value}
//                       onChange={(e) =>
//                         updateEnumValue(param.name, enumIndex, e.target.value)
//                       }
//                     />
//                     <button
//                       type="button"
//                       className="ml-2 text-red-600 hover:text-red-900"
//                       onClick={() => removeEnumValue(param.name, enumIndex)}
//                     >
//                       <Trash size={16} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         );

//       case "number":
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Minimum
//               </label>
//               <input
//                 type="number"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.minimum || ""}
//                 onChange={(e) =>
//                   updateOption(index, "minimum", parseInt(e.target.value) || "")
//                 }
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Maximum
//               </label>
//               <input
//                 type="number"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.maximum || ""}
//                 onChange={(e) =>
//                   updateOption(index, "maximum", parseInt(e.target.value) || "")
//                 }
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Default
//               </label>
//               <input
//                 type="number"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.default || ""}
//                 onChange={(e) =>
//                   updateOption(index, "default", parseInt(e.target.value) || "")
//                 }
//               />
//             </div>
//           </div>
//         );

//       case "array":
//         if (isQuery) return null;

//         const paramName = param.name;
//         const arrayDef = arrayFields[paramName] || { type: "string" };

//         return (
//           <div className="mt-2 border-l-2 border-indigo-200 pl-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Min Items
//               </label>
//               <input
//                 type="number"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={param.options.minItems || ""}
//                 onChange={(e) =>
//                   updateOption(
//                     index,
//                     "minItems",
//                     parseInt(e.target.value) || ""
//                   )
//                 }
//               />
//             </div>

//             <div className="mt-3">
//               <label className="block text-sm font-medium text-gray-700">
//                 Array Items Type
//               </label>
//               <select
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                 value={arrayDef.type}
//                 onChange={(e) =>
//                   updateArrayField(paramName, "type", e.target.value)
//                 }
//               >
//                 <option value="string">String</option>
//                 <option value="number">Number</option>
//                 <option value="boolean">Boolean</option>
//                 <option value="object">Object</option>
//               </select>
//             </div>

//             {arrayDef.type === "string" && (
//               <div className="mt-3">
//                 <div className="flex justify-between items-center">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Enum Values for Array Items
//                   </label>
//                   <button
//                     type="button"
//                     className="text-indigo-600 hover:text-indigo-900 text-sm"
//                     onClick={() => addEnumValue(`${paramName}.items`)}
//                   >
//                     Add Value
//                   </button>
//                 </div>
//                 {(enumValues[`${paramName}.items`] || []).map(
//                   (value, enumIndex) => (
//                     <div key={enumIndex} className="flex items-center mt-2">
//                       <input
//                         type="text"
//                         className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                         value={value}
//                         onChange={(e) =>
//                           updateEnumValue(
//                             `${paramName}.items`,
//                             enumIndex,
//                             e.target.value
//                           )
//                         }
//                       />
//                       <button
//                         type="button"
//                         className="ml-2 text-red-600 hover:text-red-900"
//                         onClick={() =>
//                           removeEnumValue(`${paramName}.items`, enumIndex)
//                         }
//                       >
//                         <Trash size={16} />
//                       </button>
//                     </div>
//                   )
//                 )}
//               </div>
//             )}

//             {arrayDef.type === "object" && (
//               <div className="mt-3">
//                 <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
//                   <span className="text-sm font-medium text-gray-700">
//                     Object properties for array items can be defined in JSON
//                     view
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       case "object":
//         if (isQuery) return null;
//         return (
//           <div className="mt-2 border-l-2 border-indigo-200 pl-4">
//             <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
//               <span className="text-sm font-medium text-gray-700">
//                 Object properties can be defined in JSON view
//               </span>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const renderFormView = () => {
//     return (
//       <div className="space-y-6">
//         {activeTab === "basic" && (
//           <Card className="p-6">
//             <h2 className="text-lg font-medium text-gray-900 mb-4">
//               Basic Information
//             </h2>
//             <BasicInfoForm
//               apiName={apiName}
//               setApiName={setApiName}
//               apiDescription={apiDescription}
//               setApiDescription={setApiDescription}
//               httpMethod={httpMethod}
//               setHttpMethod={setHttpMethod}
//               endpointPath={endpointPath}
//               setEndpointPath={setEndpointPath}
//               endpointDescription={endpointDescription}
//               setEndpointDescription={setEndpointDescription}
//               selectedTable={selectedTable}
//               setSelectedTable={setSelectedTable}
//             />
//           </Card>
//         )}

//         {activeTab === "parameters" && (
//           <div className="space-y-6">
//             <Card className="p-6">
//               <div
//                 className="flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleSection("queryParams")}
//               >
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Query Parameters
//                 </h2>
//                 {expandedSections.queryParams ? (
//                   <ChevronUp size={20} />
//                 ) : (
//                   <ChevronDown size={20} />
//                 )}
//               </div>

//               {expandedSections.queryParams && (
//                 <>
//                   <p className="text-sm text-gray-500 mt-1 mb-4">
//                     Define parameters that will be passed in the URL query
//                     string.
//                   </p>

//                   {queryParams.length === 0 ? (
//                     <div className="text-center py-4 text-gray-500">
//                       No query parameters defined yet.
//                     </div>
//                   ) : (
//                     queryParams.map((param, index) => (
//                       <div
//                         key={index}
//                         className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
//                       >
//                         <div className="flex justify-between items-start">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700">
//                                 Name
//                               </label>
//                               <input
//                                 type="text"
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                 value={param.name}
//                                 onChange={(e) =>
//                                   updateQueryParam(
//                                     index,
//                                     "name",
//                                     e.target.value
//                                   )
//                                 }
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700">
//                                 Type
//                               </label>
//                               <select
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                                 value={param.type}
//                                 onChange={(e) =>
//                                   updateQueryParam(
//                                     index,
//                                     "type",
//                                     e.target.value
//                                   )
//                                 }
//                               >
//                                 <option value="string">String</option>
//                                 <option value="number">Number</option>
//                                 <option value="boolean">Boolean</option>
//                               </select>
//                             </div>
//                             <div>
//                               <div className="flex items-center">
//                                 <input
//                                   id={`required-query-${index}`}
//                                   type="checkbox"
//                                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                   checked={param.required}
//                                   onChange={(e) =>
//                                     updateQueryParam(
//                                       index,
//                                       "required",
//                                       e.target.checked
//                                     )
//                                   }
//                                 />
//                                 <label
//                                   htmlFor={`required-query-${index}`}
//                                   className="ml-2 block text-sm text-gray-700"
//                                 >
//                                   Required
//                                 </label>
//                               </div>
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             className="ml-4 text-red-600 hover:text-red-900"
//                             onClick={() => removeQueryParam(index)}
//                           >
//                             <Trash size={16} />
//                           </button>
//                         </div>
//                         {renderOptionsForType(param.type, index, true)}
//                       </div>
//                     ))
//                   )}

//                   <div className="mt-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={addQueryParam}
//                     >
//                       Add Query Parameter
//                     </Button>
//                   </div>
//                 </>
//               )}
//             </Card>

//             <Card className="p-6">
//               <div
//                 className="flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleSection("bodyParams")}
//               >
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Body Parameters
//                 </h2>
//                 {expandedSections.bodyParams ? (
//                   <ChevronUp size={20} />
//                 ) : (
//                   <ChevronDown size={20} />
//                 )}
//               </div>

//               {expandedSections.bodyParams && (
//                 <>
//                   <p className="text-sm text-gray-500 mt-1 mb-4">
//                     Define parameters that will be passed in the request body.
//                   </p>

//                   {bodyParams.length === 0 ? (
//                     <div className="text-center py-4 text-gray-500">
//                       No body parameters defined yet.
//                     </div>
//                   ) : (
//                     bodyParams.map((param, index) => (
//                       <BodyParameter
//                         key={index}
//                         param={param}
//                         index={index}
//                         updateBodyParam={updateBodyParam}
//                         updateBodyParamOption={updateBodyParamOption}
//                         removeBodyParam={removeBodyParam}
//                         renderOptionsForType={renderOptionsForType}
//                         selectedTable={selectedTable}
//                       />
//                     ))
//                   )}

//                   <div className="mt-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={addBodyParam}
//                     >
//                       Add Body Parameter
//                     </Button>
//                   </div>
//                 </>
//               )}
//             </Card>
//           </div>
//         )}

//         {activeTab === "filters" && (
//           <Card className="p-6">
//             <div
//               className="flex justify-between items-center cursor-pointer"
//               onClick={() => toggleSection("filters")}
//             >
//               <h2 className="text-lg font-medium text-gray-900">
//                 Allowed Filters
//               </h2>
//               {expandedSections.filters ? (
//                 <ChevronUp size={20} />
//               ) : (
//                 <ChevronDown size={20} />
//               )}
//             </div>

//             {expandedSections.filters && (
//               <>
//                 <p className="text-sm text-gray-500 mt-1 mb-4">
//                   Configure which filter operations are allowed on your API
//                   endpoint.
//                 </p>

//                 <div className="space-y-6">
//                   {/* Select Filter */}
//                   <div className="border-t border-gray-200 pt-4">
//                     <div className="flex items-center mb-2">
//                       <input
//                         id="select-filter"
//                         type="checkbox"
//                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                         checked={allowedFilters.includes("select")}
//                         onChange={(e) => {
//                           const isCompatible = bodyParams.some(
//                             (param) => param.options?.selectable !== false
//                           );
//                           if (e.target.checked && !isCompatible) {
//                             alert(
//                               "Warning: Select filter is not compatible. No fields are marked as selectable."
//                             );
//                             return;
//                           }
//                           if (e.target.checked) {
//                             setAllowedFilters([...allowedFilters, "select"]);
//                           } else {
//                             setAllowedFilters(
//                               allowedFilters.filter((f) => f !== "select")
//                             );
//                           }
//                         }}
//                       />
//                       <label
//                         htmlFor="select-filter"
//                         className="ml-2 block text-sm font-medium text-gray-700"
//                       >
//                         Select Filter
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500 mb-2">
//                       Allow clients to select specific fields in the response
//                     </p>
//                     {allowedFilters.includes("select") && (
//                       <div className="ml-6 bg-gray-50 p-3 rounded-md">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Fields available for selection:
//                         </label>
//                         <div className="grid grid-cols-2 gap-2">
//                           {bodyParams.map((param, idx) => (
//                             <div key={idx} className="flex items-center">
//                               <input
//                                 id={`select-field-${param.name}`}
//                                 type="checkbox"
//                                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                 checked={param.options?.selectable !== false}
//                                 onChange={(e) => {
//                                   updateBodyParamOption(
//                                     idx,
//                                     "selectable",
//                                     e.target.checked
//                                   );
//                                 }}
//                               />
//                               <label
//                                 htmlFor={`select-field-${param.name}`}
//                                 className="ml-2 text-sm text-gray-700"
//                               >
//                                 {param.name}
//                               </label>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Search Filter */}
//                   <div className="border-t border-gray-200 pt-4">
//                     <div className="flex items-center mb-2">
//                       <input
//                         id="search-filter"
//                         type="checkbox"
//                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                         checked={allowedFilters.includes("search")}
//                         onChange={(e) => {
//                           const isCompatible = bodyParams.some(
//                             (param) =>
//                               param.type === "string" &&
//                               param.options?.searchable !== false
//                           );
//                           if (e.target.checked && !isCompatible) {
//                             alert(
//                               "Warning: Search filter is not compatible. No string fields are marked as searchable."
//                             );
//                             return;
//                           }
//                           if (e.target.checked) {
//                             setAllowedFilters([...allowedFilters, "search"]);
//                           } else {
//                             setAllowedFilters(
//                               allowedFilters.filter((f) => f !== "search")
//                             );
//                           }
//                         }}
//                       />
//                       <label
//                         htmlFor="search-filter"
//                         className="ml-2 block text-sm font-medium text-gray-700"
//                       >
//                         Search Filter
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500 mb-2">
//                       Allow clients to search across text fields
//                     </p>
//                     {allowedFilters.includes("search") && (
//                       <div className="ml-6 bg-gray-50 p-3 rounded-md">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Fields available for search:
//                         </label>
//                         <div className="grid grid-cols-2 gap-2">
//                           {bodyParams
//                             .filter((param) => param.type === "string")
//                             .map((param, idx) => (
//                               <div key={idx} className="flex items-center">
//                                 <input
//                                   id={`search-field-${param.name}`}
//                                   type="checkbox"
//                                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                   checked={param.options?.searchable !== false}
//                                   onChange={(e) => {
//                                     const paramIndex = bodyParams.findIndex(
//                                       (p) => p.name === param.name
//                                     );
//                                     updateBodyParamOption(
//                                       paramIndex,
//                                       "searchable",
//                                       e.target.checked
//                                     );
//                                   }}
//                                 />
//                                 <label
//                                   htmlFor={`search-field-${param.name}`}
//                                   className="ml-2 text-sm text-gray-700"
//                                 >
//                                   {param.name}
//                                 </label>
//                               </div>
//                             ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Sort Filter */}
//                   <div className="border-t border-gray-200 pt-4">
//                     <div className="flex items-center mb-2">
//                       <input
//                         id="sort-filter"
//                         type="checkbox"
//                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                         checked={allowedFilters.includes("sort")}
//                         onChange={(e) => {
//                           const isCompatible = bodyParams.some(
//                             (param) => param.options?.sortable !== false
//                           );
//                           if (e.target.checked && !isCompatible) {
//                             alert(
//                               "Warning: Sort filter is not compatible. No fields are marked as sortable."
//                             );
//                             return;
//                           }
//                           if (e.target.checked) {
//                             setAllowedFilters([...allowedFilters, "sort"]);
//                           } else {
//                             setAllowedFilters(
//                               allowedFilters.filter((f) => f !== "sort")
//                             );
//                           }
//                         }}
//                       />
//                       <label
//                         htmlFor="sort-filter"
//                         className="ml-2 block text-sm font-medium text-gray-700"
//                       >
//                         Sort Filter
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500 mb-2">
//                       Allow clients to sort results (asc/desc)
//                     </p>
//                     {allowedFilters.includes("sort") && (
//                       <div className="ml-6 bg-gray-50 p-3 rounded-md">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Fields available for sorting:
//                         </label>
//                         <div className="grid grid-cols-2 gap-2">
//                           {bodyParams.map((param, idx) => (
//                             <div key={idx} className="flex items-center">
//                               <input
//                                 id={`sort-field-${param.name}`}
//                                 type="checkbox"
//                                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                                 checked={param.options?.sortable !== false}
//                                 onChange={(e) => {
//                                   const paramIndex = bodyParams.findIndex(
//                                     (p) => p.name === param.name
//                                   );
//                                   updateBodyParamOption(
//                                     paramIndex,
//                                     "sortable",
//                                     e.target.checked
//                                   );
//                                 }}
//                               />
//                               <label
//                                 htmlFor={`sort-field-${param.name}`}
//                                 className="ml-2 text-sm text-gray-700"
//                               >
//                                 {param.name}
//                               </label>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
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
import Editor from "@monaco-editor/react";
import BasicInfoForm from "./BasicInfoForm";
import BodyParameter from "./BodyParameter";
import {
  FieldDefinition,
  ResponseDefinition,
  ArrayItemsDefinition,
} from "./apiTypes";
import apiClient from "../../utils/apiClient"; // Import apiClient from TableManager
import { Table, RawTable } from "../tables/table.types";

// // Interface for tables
// interface Table {
//   id: string;
//   name: string;
// }

const CreateAPI: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // State for Basic Info
  const [apiName, setApiName] = useState("");
  const [apiDescription, setApiDescription] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [endpointPath, setEndpointPath] = useState("");
  const [endpointDescription, setEndpointDescription] = useState("");
  const [selectedTable, setSelectedTable] = useState<Table | "">("");
  const [tables, setTables] = useState<Table[]>([]); // State for fetched tables
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // Parameters (unchanged)
  const [queryParams, setQueryParams] = useState<FieldDefinition[]>([]);
  const [bodyParams, setBodyParams] = useState<FieldDefinition[]>([]);
  const [nestedObjects, setNestedObjects] = useState<
    Record<string, { required: string[]; properties: Record<string, any> }>
  >({});
  const [arrayFields, setArrayFields] = useState<
    Record<string, ArrayItemsDefinition>
  >({});
  const [enumValues, setEnumValues] = useState<Record<string, string[]>>({});

  // Filters and Responses (unchanged)
  const [allowedFilters, setAllowedFilters] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState("");
  const [responses, setResponses] = useState<ResponseDefinition[]>([
    {
      code: "200",
      description: "Success response",
      properties: { message: { type: "string" } },
    },
    {
      code: "400",
      description: "Error response",
      properties: { error: { type: "string" } },
    },
  ]);

  // UI States (unchanged)
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

  // New state for save operation
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoadingTables(true);
        setTableError(null);
        const response = await apiClient.get(
          `/core/tables?project_id=${projectId}`
        );
        const tableData = Array.isArray(response.data)
          ? response.data.map((raw: RawTable) => ({
              id: raw.table_id.toString(),
              name: raw.table_name,
              columns: raw.table_schema.columns || [],
              indexes: raw.table_schema.indexes || [],
              createdAt: raw.created_at,
            }))
          : [];
        setTables(tableData);
      } catch (err) {
        console.error("Error fetching tables:", err);
        setTableError("Failed to load tables. Please try again.");
      } finally {
        setIsLoadingTables(false);
      }
    };

    if (projectId) {
      fetchTables();
    }
  }, [projectId]);

  // Generate API schema (unchanged)
  const generateApiSchema = () => {
    const requiredQueryParams = queryParams
      .filter((param) => param.required)
      .map((param) => param.name);
    const requiredBodyParams = bodyParams
      .filter((param) => param.required)
      .map((param) => param.name);

    const queryProperties: Record<string, any> = {};
    const bodyProperties: Record<string, any> = {};

    queryParams.forEach((param) => {
      queryProperties[param.name] = { type: param.type, ...param.options };
    });

    bodyParams.forEach((param) => {
      const baseProperties = {
        type: param.type,
        ...(param.mapped ? { mapped: param.mapped } : {}),
        ...param.options,
      };

      if (param.type === "array") {
        bodyProperties[param.name] = {
          ...baseProperties,
          items: arrayFields[param.name] || { type: "string" },
        };
      } else if (param.type === "object") {
        bodyProperties[param.name] = {
          ...baseProperties,
          ...(nestedObjects[param.name] || { type: "object", properties: {} }),
        };
      } else {
        bodyProperties[param.name] = baseProperties;
      }
    });

    const formattedResponses: Record<string, any> = {};
    responses.forEach((response) => {
      formattedResponses[response.code] = {
        description: response.description,
        properties: response.properties,
      };
    });

    return {
      project_id: Number(projectId),
      api_name: apiName,
      api_description: apiDescription,
      http_method: httpMethod,
      endpoint_path: endpointPath,
      endpoint_description: endpointDescription,
      table: selectedTable ? selectedTable.id : "",
      parameters: {
        query:
          queryParams.length > 0
            ? { required: requiredQueryParams, properties: queryProperties }
            : null,
        body:
          bodyParams.length > 0
            ? { required: requiredBodyParams, properties: bodyProperties }
            : null,
      },
      allowedFilters,
      responses: formattedResponses,
    };
  };

  // Update JSON view (unchanged)
  useEffect(() => {
    const schema = generateApiSchema();
    setJsonValue(JSON.stringify(schema, null, 2));
  }, [
    apiName,
    apiDescription,
    httpMethod,
    endpointPath,
    endpointDescription,
    selectedTable,
    queryParams,
    bodyParams,
    allowedFilters,
    responses,
    nestedObjects,
    arrayFields,
  ]);

  // Parse JSON and update form (unchanged)
  const handleJsonChange = (value: string | undefined) => {
    if (!value) return;
    setJsonValue(value);

    try {
      const parsed = JSON.parse(value);

      setApiName(parsed.api_name || "");
      setApiDescription(parsed.api_description || "");
      setHttpMethod(parsed.http_method || "GET");
      setEndpointPath(parsed.endpoint_path || "");
      setEndpointDescription(parsed.endpoint_description || "");
      setSelectedTable(parsed.table || "");

      const queryParamsArray: FieldDefinition[] = [];
      const bodyParamsArray: FieldDefinition[] = [];
      const newNestedObjects: Record<string, any> = {};
      const newArrayFields: Record<string, any> = {};

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

      if (parsed.parameters?.body?.properties) {
        Object.entries(parsed.parameters.body.properties).forEach(
          ([name, def]: [string, any]) => {
            const required =
              parsed.parameters.body.required?.includes(name) || false;
            const { type, mapped, ...options } = def;

            if (type === "array") {
              bodyParamsArray.push({
                name,
                type,
                required,
                mapped,
                options: { minItems: def.minItems },
              });
              newArrayFields[name] = def.items;
            } else if (type === "object") {
              bodyParamsArray.push({
                name,
                type,
                required,
                mapped,
                options: {},
              });
              newNestedObjects[name] = {
                required: def.required || [],
                properties: def.properties || {},
              };
            } else {
              bodyParamsArray.push({ name, type, required, mapped, options });
            }
          }
        );
      }

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

      setQueryParams(queryParamsArray);
      setBodyParams(bodyParamsArray);
      setNestedObjects(newNestedObjects);
      setArrayFields(newArrayFields);
      setResponses(responsesArray);
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  };

  // Modified handleSave to call API
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const apiSchema = generateApiSchema();

    try {
      await apiClient.post("/core/apis", apiSchema);
      alert("API saved successfully!");
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      console.error("Error saving API:", err);
      setSaveError(
        err.response?.data?.message || "Failed to save API. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Parameter management (unchanged)
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
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const removeBodyParam = (index: number) => {
    const param = bodyParams[index];
    setBodyParams(bodyParams.filter((_, i) => i !== index));

    if (param.type === "array") {
      setArrayFields((prev) => {
        const updated = { ...prev };
        delete updated[param.name];
        return updated;
      });
    } else if (param.type === "object") {
      setNestedObjects((prev) => {
        const updated = { ...prev };
        delete updated[param.name];
        return updated;
      });
    }
  };

  const updateQueryParam = (index: number, field: string, value: any) => {
    setQueryParams((prev) =>
      prev.map((param, i) =>
        i === index ? { ...param, [field]: value } : param
      )
    );
  };

  const updateBodyParam = (index: number, field: string, value: any) => {
    setBodyParams((prev) => {
      const updated = [...prev];
      if (field === "type" && updated[index].type !== value) {
        updated[index] = { ...updated[index], [field]: value, options: {} };
        const paramName = updated[index].name;
        if (value === "array" && !arrayFields[paramName]) {
          setArrayFields((prev) => ({
            ...prev,
            [paramName]: { type: "string" },
          }));
        } else if (value === "object" && !nestedObjects[paramName]) {
          setNestedObjects((prev) => ({
            ...prev,
            [paramName]: { required: [], properties: {} },
          }));
        }
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const updateQueryParamOption = (
    index: number,
    option: string,
    value: any
  ) => {
    setQueryParams((prev) =>
      prev.map((param, i) =>
        i === index
          ? { ...param, options: { ...param.options, [option]: value } }
          : param
      )
    );
  };

  const updateBodyParamOption = (index: number, option: string, value: any) => {
    setBodyParams((prev) =>
      prev.map((param, i) =>
        i === index
          ? { ...param, options: { ...param.options, [option]: value } }
          : param
      )
    );
  };

  const updateArrayField = (
    fieldName: string,
    property: string,
    value: any
  ) => {
    setArrayFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], [property]: value },
    }));
  };

  const addEnumValue = (fieldName: string) => {
    setEnumValues((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ""],
    }));
  };

  const updateEnumValue = (fieldName: string, index: number, value: string) => {
    setEnumValues((prev) => {
      const current = [...(prev[fieldName] || [])];
      current[index] = value;
      return { ...prev, [fieldName]: current };
    });

    const bodyParamIndex = bodyParams.findIndex((p) => p.name === fieldName);
    if (bodyParamIndex >= 0) {
      updateBodyParamOption(
        bodyParamIndex,
        "enum",
        enumValues[fieldName] || []
      );
    }

    Object.keys(arrayFields).forEach((arrayField) => {
      if (
        arrayFields[arrayField].type === "string" &&
        fieldName === `${arrayField}.items`
      ) {
        setArrayFields((prev) => ({
          ...prev,
          [arrayField]: {
            ...prev[arrayField],
            enum: enumValues[fieldName] || [],
          },
        }));
      }
    });
  };

  const removeEnumValue = (fieldName: string, index: number) => {
    setEnumValues((prev) => {
      const current = [...(prev[fieldName] || [])];
      current.splice(index, 1);
      return { ...prev, [fieldName]: current };
    });

    const bodyParamIndex = bodyParams.findIndex((p) => p.name === fieldName);
    if (bodyParamIndex >= 0) {
      updateBodyParamOption(
        bodyParamIndex,
        "enum",
        enumValues[fieldName] || []
      );
    }

    Object.keys(arrayFields).forEach((arrayField) => {
      if (
        arrayFields[arrayField].type === "string" &&
        fieldName === `${arrayField}.items`
      ) {
        setArrayFields((prev) => ({
          ...prev,
          [arrayField]: {
            ...prev[arrayField],
            enum: enumValues[fieldName] || [],
          },
        }));
      }
    });
  };

  const addFilter = () => {
    if (currentFilter && !allowedFilters.includes(currentFilter)) {
      setAllowedFilters([...allowedFilters, currentFilter]);
      setCurrentFilter("");
    }
  };

  const removeFilter = (filter: string) => {
    setAllowedFilters(allowedFilters.filter((f) => f !== filter));
  };

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
    setResponses(responses.filter((_, i) => i !== index));
  };

  const updateResponse = (index: number, field: string, value: any) => {
    setResponses((prev) =>
      prev.map((response, i) =>
        i === index ? { ...response, [field]: value } : response
      )
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Render options for parameter types (unchanged)
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

  const renderFormView = () => {
    return (
      <div className="space-y-6">
        {activeTab === "basic" && (
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>
            {tableError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{tableError}</p>
              </div>
            )}
            <BasicInfoForm
              apiName={apiName}
              setApiName={setApiName}
              apiDescription={apiDescription}
              setApiDescription={setApiDescription}
              httpMethod={httpMethod}
              setHttpMethod={setHttpMethod}
              endpointPath={endpointPath}
              setEndpointPath={setEndpointPath}
              endpointDescription={endpointDescription}
              setEndpointDescription={setEndpointDescription}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              tables={tables} // Pass fetched tables
              isLoadingTables={isLoadingTables}
            />
          </Card>
        )}

        {activeTab === "parameters" && (
          <div className="space-y-6">
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
                        {renderOptionsForType(param.type, index, true)}
                      </div>
                    ))
                  )}

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addQueryParam}
                    >
                      Add Query Parameter
                    </Button>
                  </div>
                </>
              )}
            </Card>

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
                      <BodyParameter
                        key={index}
                        param={param}
                        index={index}
                        updateBodyParam={updateBodyParam}
                        updateBodyParamOption={updateBodyParamOption}
                        removeBodyParam={removeBodyParam}
                        renderOptionsForType={renderOptionsForType}
                        selectedTable={selectedTable || undefined} // Pass full table or undefined
                      />
                    ))
                  )}

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addBodyParam}
                    >
                      Add Body Parameter
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

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
                  Configure which filter operations are allowed on your API
                  endpoint.
                </p>

                <div className="space-y-6">
                  {/* Select Filter */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        id="select-filter"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={allowedFilters.includes("select")}
                        onChange={(e) => {
                          const isCompatible = bodyParams.some(
                            (param) => param.options?.selectable !== false
                          );
                          if (e.target.checked && !isCompatible) {
                            alert(
                              "Warning: Select filter is not compatible. No fields are marked as selectable."
                            );
                            return;
                          }
                          if (e.target.checked) {
                            setAllowedFilters([...allowedFilters, "select"]);
                          } else {
                            setAllowedFilters(
                              allowedFilters.filter((f) => f !== "select")
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor="select-filter"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        Select Filter
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Allow clients to select specific fields in the response
                    </p>
                    {allowedFilters.includes("select") && (
                      <div className="ml-6 bg-gray-50 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fields available for selection:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {bodyParams.map((param, idx) => (
                            <div key={idx} className="flex items-center">
                              <input
                                id={`select-field-${param.name}`}
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={param.options?.selectable !== false}
                                onChange={(e) => {
                                  updateBodyParamOption(
                                    idx,
                                    "selectable",
                                    e.target.checked
                                  );
                                }}
                              />
                              <label
                                htmlFor={`select-field-${param.name}`}
                                className="ml-2 text-sm text-gray-700"
                              >
                                {param.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Filter */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        id="search-filter"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={allowedFilters.includes("search")}
                        onChange={(e) => {
                          const isCompatible = bodyParams.some(
                            (param) =>
                              param.type === "string" &&
                              param.options?.searchable !== false
                          );
                          if (e.target.checked && !isCompatible) {
                            alert(
                              "Warning: Search filter is not compatible. No string fields are marked as searchable."
                            );
                            return;
                          }
                          if (e.target.checked) {
                            setAllowedFilters([...allowedFilters, "search"]);
                          } else {
                            setAllowedFilters(
                              allowedFilters.filter((f) => f !== "search")
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor="search-filter"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        Search Filter
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Allow clients to search across text fields
                    </p>
                    {allowedFilters.includes("search") && (
                      <div className="ml-6 bg-gray-50 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fields available for search:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {bodyParams
                            .filter((param) => param.type === "string")
                            .map((param, idx) => (
                              <div key={idx} className="flex items-center">
                                <input
                                  id={`search-field-${param.name}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={param.options?.searchable !== false}
                                  onChange={(e) => {
                                    const paramIndex = bodyParams.findIndex(
                                      (p) => p.name === param.name
                                    );
                                    updateBodyParamOption(
                                      paramIndex,
                                      "searchable",
                                      e.target.checked
                                    );
                                  }}
                                />
                                <label
                                  htmlFor={`search-field-${param.name}`}
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  {param.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Filter */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        id="sort-filter"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={allowedFilters.includes("sort")}
                        onChange={(e) => {
                          const isCompatible = bodyParams.some(
                            (param) => param.options?.sortable !== false
                          );
                          if (e.target.checked && !isCompatible) {
                            alert(
                              "Warning: Sort filter is not compatible. No fields are marked as sortable."
                            );
                            return;
                          }
                          if (e.target.checked) {
                            setAllowedFilters([...allowedFilters, "sort"]);
                          } else {
                            setAllowedFilters(
                              allowedFilters.filter((f) => f !== "sort")
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor="sort-filter"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        Sort Filter
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Allow clients to sort results (asc/desc)
                    </p>
                    {allowedFilters.includes("sort") && (
                      <div className="ml-6 bg-gray-50 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fields available for sorting:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {bodyParams.map((param, idx) => (
                            <div key={idx} className="flex items-center">
                              <input
                                id={`sort-field-${param.name}`}
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={param.options?.sortable !== false}
                                onChange={(e) => {
                                  const paramIndex = bodyParams.findIndex(
                                    (p) => p.name === param.name
                                  );
                                  updateBodyParamOption(
                                    paramIndex,
                                    "sortable",
                                    e.target.checked
                                  );
                                }}
                              />
                              <label
                                htmlFor={`sort-field-${param.name}`}
                                className="ml-2 text-sm text-gray-700"
                              >
                                {param.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GTE/LTE Filters */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        id="comparison-filter"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={
                          allowedFilters.includes("gte") ||
                          allowedFilters.includes("lte")
                        }
                        onChange={(e) => {
                          const isCompatible = bodyParams.some(
                            (param) =>
                              (param.type === "number" ||
                                (param.type === "string" &&
                                  param.options?.format === "date")) &&
                              param.options?.comparable !== false
                          );
                          if (e.target.checked && !isCompatible) {
                            alert(
                              "Warning: Comparison filters (GTE/LTE) are not compatible. No compatible fields are marked as comparable."
                            );
                            return;
                          }
                          if (e.target.checked) {
                            const newFilters = [...allowedFilters];
                            if (!newFilters.includes("gte"))
                              newFilters.push("gte");
                            if (!newFilters.includes("lte"))
                              newFilters.push("lte");
                            setAllowedFilters(newFilters);
                          } else {
                            setAllowedFilters(
                              allowedFilters.filter(
                                (f) => f !== "gte" && f !== "lte"
                              )
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor="comparison-filter"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        Comparison Filters (GTE/LTE)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Allow greater than/equal and less than/equal filtering
                    </p>
                    {(allowedFilters.includes("gte") ||
                      allowedFilters.includes("lte")) && (
                      <div className="ml-6 bg-gray-50 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fields available for comparison:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {bodyParams
                            .filter(
                              (param) =>
                                param.type === "number" ||
                                (param.type === "string" &&
                                  param.options?.format === "date")
                            )
                            .map((param, idx) => (
                              <div key={idx} className="flex items-center">
                                <input
                                  id={`comparison-field-${param.name}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={param.options?.comparable !== false}
                                  onChange={(e) => {
                                    const paramIndex = bodyParams.findIndex(
                                      (p) => p.name === param.name
                                    );
                                    updateBodyParamOption(
                                      paramIndex,
                                      "comparable",
                                      e.target.checked
                                    );
                                  }}
                                />
                                <label
                                  htmlFor={`comparison-field-${param.name}`}
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  {param.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logical Operators */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-2">
                      <input
                        id="logical-operators"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={
                          allowedFilters.includes("and") ||
                          allowedFilters.includes("or")
                        }
                        onChange={(e) => {
                          const isCompatible = allowedFilters.some((f) =>
                            ["select", "search", "sort", "gte", "lte"].includes(
                              f
                            )
                          );
                          if (e.target.checked && !isCompatible) {
                            alert(
                              "Warning: Logical operators (AND/OR) are not compatible. No other filters are selected."
                            );
                            return;
                          }
                          if (e.target.checked) {
                            const newFilters = [...allowedFilters];
                            if (!newFilters.includes("and"))
                              newFilters.push("and");
                            if (!newFilters.includes("or"))
                              newFilters.push("or");
                            setAllowedFilters(newFilters);
                          } else {
                            setAllowedFilters(
                              allowedFilters.filter(
                                (f) => f !== "and" && f !== "or"
                              )
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor="logical-operators"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        Logical Operators (AND/OR)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Allow combining multiple filters with logical operators
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

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
                  <Button type="button" variant="outline" onClick={addResponse}>
                    Add Response
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

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
          >
            {viewMode === "form" ? "View JSON" : "View Form"}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save API
          </Button>
        </div>
      </div>

      {viewMode === "form" ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {["basic", "parameters", "filters", "responses", "json"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    activeTab === tab
                      ? "bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() +
                    tab.slice(1).replace("json", "JSON Schema")}
                </button>
              )
            )}
          </div>
          <div>{renderFormView()}</div>
        </div>
      ) : (
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
