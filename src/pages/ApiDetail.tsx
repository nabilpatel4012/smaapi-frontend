import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { motion } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  Clock,
  ActivityIcon,
  Edit2,
  Globe,
  Code,
  BookOpen,
  Settings,
  Copy,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { getApiDetails, getProject } from "../mock/data";
import ApiTester from "../components/apis/ApiTester";

const ApiDetail: React.FC = () => {
  const { projectId, apiId } = useParams<{
    projectId: string;
    apiId: string;
  }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  try {
    const project = getProject(projectId || "");
    const api = getApiDetails(apiId || "");

    if (!project || !api) {
      throw new Error("Project or API not found");
    }

    // Helper for method badge colors
    const getMethodColor = (method: string) => {
      switch (method) {
        case "GET":
          return "bg-blue-100 text-blue-800";
        case "POST":
          return "bg-green-100 text-green-800";
        case "PUT":
          return "bg-yellow-100 text-yellow-800";
        case "DELETE":
          return "bg-red-100 text-red-800";
        case "PATCH":
          return "bg-purple-100 text-purple-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    // Helper for status badge
    const getStatusBadge = (status: string) => {
      switch (status) {
        case "active":
          return <Badge variant="success">Active</Badge>;
        case "inactive":
          return <Badge variant="default">Inactive</Badge>;
        case "draft":
          return <Badge variant="warning">Draft</Badge>;
        default:
          return <Badge variant="default">{status}</Badge>;
      }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Copy endpoint to clipboard
    const copyEndpoint = () => {
      navigator.clipboard.writeText(api.endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-6">
        {/* API Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  to={`/projects/${projectId}`}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <ChevronLeft size={16} />
                  <span>{project.name}</span>
                </Link>
                <ChevronRight size={16} className="text-gray-400" />
                <h1 className="text-2xl font-bold text-gray-900">{api.name}</h1>
                {getStatusBadge(api.status)}
              </div>

              <p className="text-gray-600">{api.description}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(
                      api.method
                    )}`}
                  >
                    {api.method}
                  </span>
                  <div className="ml-2 flex items-center bg-gray-100 rounded-md px-3 py-1 text-sm text-gray-800 font-mono">
                    {api.endpoint}
                    <button
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={copyEndpoint}
                      title="Copy endpoint"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                <span>
                  Version {api.version} • Last updated{" "}
                  {formatDate(api.lastUpdated)}
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <Button
                variant={api.status === "active" ? "outline" : "primary"}
                leftIcon={
                  api.status === "active" ? (
                    <PauseIcon size={16} />
                  ) : (
                    <PlayIcon size={16} />
                  )
                }
                onClick={() =>
                  alert(
                    api.status === "active"
                      ? "API would be stopped"
                      : "API would be started"
                  )
                }
              >
                {api.status === "active" ? "Stop API" : "Start API"}
              </Button>

              <Button
                variant="secondary"
                leftIcon={<Edit2 size={16} />}
                onClick={() => alert("Edit API functionality would go here")}
              >
                Edit API
              </Button>
            </div>
          </div>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg. Response Time
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {api.avgResponseTime.toFixed(2)} ms
                </h3>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="text-indigo-600 h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Uptime</p>
                <h3 className="text-2xl font-bold mt-1">
                  {api.uptime.toFixed(2)}%
                </h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <ActivityIcon className="text-green-600 h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${api.uptime}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Requests
                </p>
                <h3 className="text-2xl font-bold mt-1">4,523</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="text-blue-600 h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Today</p>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "schema"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("schema")}
            >
              Schema
            </button>
            <button
              className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "testing"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("testing")}
            >
              Testing
            </button>
            <button
              className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "docs"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("docs")}
            >
              Documentation
            </button>
            <button
              className={`pb-4 pt-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  API Details
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">Method</td>
                      <td className="py-2 text-gray-900">{api.method}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">
                        Endpoint
                      </td>
                      <td className="py-2 text-gray-900 font-mono text-sm">
                        {api.endpoint}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">Status</td>
                      <td className="py-2">{getStatusBadge(api.status)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">
                        Created
                      </td>
                      <td className="py-2 text-gray-900">
                        {formatDate(api.createdAt)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">
                        Last Updated
                      </td>
                      <td className="py-2 text-gray-900">
                        {formatDate(api.lastUpdated)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">
                        Version
                      </td>
                      <td className="py-2 text-gray-900">{api.version}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-500 font-medium">
                        Project
                      </td>
                      <td className="py-2">
                        <Link
                          to={`/projects/${projectId}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {project.name}
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Available Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {api.filters.map((filter, index) => (
                    <Badge key={index} variant="default">
                      {filter}
                    </Badge>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">
                  Sample Code
                </h3>
                <div className="bg-gray-800 rounded-md p-4 text-white font-mono text-sm overflow-x-auto">
                  <pre>
                    {`fetch("${api.endpoint}", {
  method: "${api.method}",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`}
                  </pre>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Request Schema
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Copy size={14} />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(api.requestSchema, null, 2)
                      );
                      alert("Schema copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-800">
                    {JSON.stringify(api.requestSchema, null, 2)}
                  </pre>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Response Schema
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Copy size={14} />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(api.responseSchema, null, 2)
                      );
                      alert("Schema copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-800">
                    {JSON.stringify(api.responseSchema, null, 2)}
                  </pre>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "testing" && (
            // <Card className="p-6">
            //   <h3 className="text-lg font-semibold text-gray-800 mb-4">API Testing</h3>
            //   <p className="text-gray-600 mb-6">Test your API endpoint with different parameters and see the response.</p>

            //   <div className="space-y-4">
            //     <div>
            //       <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
            //       <div className="flex">
            //         <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            //           {api.method}
            //         </span>
            //         <input
            //           type="text"
            //           className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            //           value={api.endpoint}
            //           readOnly
            //         />
            //       </div>
            //     </div>

            //     <div>
            //       <label className="block text-sm font-medium text-gray-700 mb-1">Headers</label>
            //       <div className="bg-gray-50 rounded-md p-4 font-mono text-sm">
            //         <div className="flex items-center mb-2">
            //           <span className="w-1/3 text-gray-700">Content-Type</span>
            //           <span className="w-2/3 text-gray-900">application/json</span>
            //         </div>
            //         <div className="flex items-center">
            //           <span className="w-1/3 text-gray-700">Authorization</span>
            //           <span className="w-2/3 text-gray-900">Bearer YOUR_API_KEY</span>
            //         </div>
            //       </div>
            //     </div>

            //     <div>
            //       <label className="block text-sm font-medium text-gray-700 mb-1">Request Body</label>
            //       <textarea
            //         rows={5}
            //         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
            //         placeholder="{ }"
            //       ></textarea>
            //     </div>

            //     <Button variant="primary" fullWidth>
            //       Send Request
            //     </Button>
            //   </div>
            // </Card>
            <ApiTester
              method={api.method}
              endpoint={api.endpoint}
              parameters={api.schema} // or api.requestSchema
            />
          )}

          {activeTab === "docs" && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen size={20} className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  API Documentation
                </h3>
              </div>

              <div className="prose max-w-none">
                <h4>Description</h4>
                <p>{api.description}</p>

                <h4>Endpoint</h4>
                <code className="px-2 py-1 bg-gray-100 rounded">
                  {api.endpoint}
                </code>

                <h4>Method</h4>
                <p>{api.method}</p>

                <h4>Headers</h4>
                <pre className="bg-gray-50 p-3 rounded">
                  {`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                </pre>

                <h4>Request Parameters</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        name
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Name parameter for filtering
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        No
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        email
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Email parameter for filtering
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        No
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h4>Response</h4>
                <p>Example success response:</p>
                <pre className="bg-gray-50 p-3 rounded">
                  {`{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}`}
                </pre>

                <h4>Error Codes</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        400
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Bad Request - Invalid parameters
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        401
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Unauthorized - Invalid API key
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        404
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Not Found - Resource not found
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        500
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        Internal Server Error
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings size={20} className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  API Settings
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    General Settings
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Name
                        </label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          defaultValue={api.name}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          defaultValue={api.description}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          HTTP Method
                        </label>
                        <select
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          defaultValue={api.method}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Endpoint Path
                        </label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          defaultValue={api.endpoint}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    Advanced Settings
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Enable cache (improves performance)
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Enable rate limiting
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate Limit (requests per minute)
                      </label>
                      <input
                        type="number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue="60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue="30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button variant="secondary">Cancel</Button>
                  <Button
                    variant="primary"
                    onClick={() => alert("Settings would be saved")}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">API not found</h3>
          <p className="mt-2 text-gray-500">
            The API you're looking for doesn't exist or you don't have access to
            it.
          </p>
          <Link to={`/projects${projectId ? `/${projectId}` : ""}`}>
            <Button className="mt-4" variant="primary">
              Back to Project
            </Button>
          </Link>
        </div>
      </div>
    );
  }
};

// Helper component for Check mark icon when copying endpoint
const Check = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default ApiDetail;
