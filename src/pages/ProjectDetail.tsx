import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  MoreVertical,
  Globe,
  AlertCircle,
  Play,
  Pause,
  Clipboard,
  Code,
  Loader,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import apiClient from "../utils/apiClient";

// Define interfaces for API responses
interface Project {
  project_id: number;
  user_id: number;
  project_name: string;
  project_description: string;
  db_type: string;
  created_at: string;
}

interface API {
  api_id: number;
  project_id: number;
  name: string;
  description: string;
  method: string;
  endpoint: string;
  status: string;
  created_at: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // State variables
  const [project, setProject] = useState<Project | null>(null);
  const [apis, setApis] = useState<API[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project details and APIs on component mount
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch project details
        const projectResponse = await apiClient.get(
          `/core/projects/${projectId}`
        );
        setProject(projectResponse.data);

        // Fetch project APIs
        const apisResponse = await apiClient.get(
          `/core/apis?project_id=${projectId}`
        );
        setApis(apisResponse.data);
      } catch (err: any) {
        console.error("Error fetching project data:", err);
        setError(err.response?.data?.message || "Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Filter APIs based on search and filters
  const filteredApis = apis.filter((api) => {
    const matchesSearch =
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || api.status === statusFilter;
    const matchesMethod = !methodFilter || api.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

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

  // Handle API actions
  const handleApiAction = async (api: API, action: string) => {
    setMenuOpen(null);

    try {
      switch (action) {
        case "start":
          await apiClient.put(`/core/apis/${api.api_id}/status`, {
            status: "active",
          });
          // Update API in local state
          setApis(
            apis.map((a) =>
              a.api_id === api.api_id ? { ...a, status: "active" } : a
            )
          );
          break;
        case "stop":
          await apiClient.put(`/core/apis/${api.api_id}/status`, {
            status: "inactive",
          });
          // Update API in local state
          setApis(
            apis.map((a) =>
              a.api_id === api.api_id ? { ...a, status: "inactive" } : a
            )
          );
          break;
        case "copy":
          navigator.clipboard.writeText(api.endpoint);
          break;
        case "delete":
          if (
            window.confirm(
              `Are you sure you want to delete the API "${api.name}"?`
            )
          ) {
            await apiClient.delete(`/core/apis/${api.api_id}`);
            // Remove API from local state
            setApis(apis.filter((a) => a.api_id !== api.api_id));
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error performing ${action} operation:`, err);
    }
  };

  // Database type badge color mapping
  const getDatabaseColor = (dbType: string) => {
    const dbTypeMap: Record<string, string> = {
      PG: "bg-blue-100 text-blue-800",
      MQL: "bg-orange-100 text-orange-800",
      MNGDB: "bg-green-100 text-green-800",
      SQLTE: "bg-purple-100 text-purple-800",
    };

    return dbTypeMap[dbType] || "bg-gray-100 text-gray-800";
  };

  // Database type display name
  const getDbDisplayName = (dbType: string) => {
    const dbTypeMap: Record<string, string> = {
      PG: "PostgreSQL",
      MQL: "MySQL",
      MNGDB: "MongoDB",
      SQLTE: "SQLite",
    };

    return dbTypeMap[dbType] || dbType;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader size={32} className="animate-spin mx-auto text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">
          Error loading project
        </h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Link to="/projects">
          <Button className="mt-4" variant="primary">
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  // Project not found state
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Project not found
          </h3>
          <p className="mt-2 text-gray-500">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link to="/projects">
            <Button className="mt-4" variant="primary">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.project_name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDatabaseColor(
                  project.db_type
                )}`}
              >
                {getDbDisplayName(project.db_type)}
              </span>
            </div>
            <p className="mt-1 text-gray-600">{project.project_description}</p>
            <p className="mt-2 text-sm text-gray-500">
              Created on {formatDate(project.created_at)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <Button
              variant="outline"
              leftIcon={<Globe size={16} />}
              onClick={() =>
                alert("Project documentation functionality would go here")
              }
            >
              View Docs
            </Button>
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate(`/projects/${projectId}/apis/new`)}
            >
              Create API
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow search-input-container">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              className="w-full pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Status:</span>
            {["active", "inactive", "draft"].map((status) => (
              <span
                key={status}
                className="cursor-pointer"
                onClick={() =>
                  setStatusFilter(statusFilter === status ? null : status)
                }
              >
                <Badge
                  variant={
                    status === "active"
                      ? "success"
                      : status === "inactive"
                      ? "default"
                      : "warning"
                  }
                  className={
                    statusFilter === status
                      ? "!ring-2 !ring-offset-1 !ring-indigo-300"
                      : ""
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Method:</span>
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
              <span
                key={method}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getMethodColor(
                  method
                )} ${
                  methodFilter === method
                    ? "ring-2 ring-offset-1 ring-indigo-300"
                    : ""
                }`}
                onClick={() =>
                  setMethodFilter(methodFilter === method ? null : method)
                }
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* APIs List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
          <div className="col-span-4">NAME</div>
          <div className="col-span-2">METHOD</div>
          <div className="col-span-3">ENDPOINT</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-1">ACTIONS</div>
        </div>

        {filteredApis.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredApis.map((api) => (
              <motion.div
                key={api.api_id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="col-span-4">
                  <Link
                    to={`/projects/${projectId}/apis/${api.api_id}`}
                    className="hover:text-indigo-600"
                  >
                    <h3 className="font-medium text-gray-900">{api.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {api.description}
                    </p>
                  </Link>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(
                      api.method
                    )}`}
                  >
                    {api.method}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center">
                    <code className="text-sm text-gray-700 truncate max-w-[180px]">
                      {api.endpoint}
                    </code>
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={() => handleApiAction(api, "copy")}
                      title="Copy endpoint"
                    >
                      <Clipboard size={14} />
                    </button>
                  </div>
                </div>
                <div className="col-span-2">{getStatusBadge(api.status)}</div>
                <div className="col-span-1 text-right relative">
                  <button
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    onClick={() =>
                      setMenuOpen(
                        menuOpen === api.api_id.toString()
                          ? null
                          : api.api_id.toString()
                      )
                    }
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {menuOpen === api.api_id.toString() && (
                      <motion.div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="py-1">
                          <Link
                            to={`/projects/${projectId}/apis/${api.api_id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Code size={16} className="mr-2" />
                            View Details
                          </Link>
                          {api.status === "active" ? (
                            <button
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleApiAction(api, "stop")}
                            >
                              <Pause size={16} className="mr-2" />
                              Stop API
                            </button>
                          ) : (
                            <button
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleApiAction(api, "start")}
                            >
                              <Play size={16} className="mr-2" />
                              Start API
                            </button>
                          )}
                          <button
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => handleApiAction(api, "delete")}
                          >
                            <AlertCircle size={16} className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No APIs found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || statusFilter || methodFilter
                ? "Try adjusting your search or filter criteria"
                : "Add your first API to this project"}
            </p>
            <Button
              variant="primary"
              className="mt-4"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate(`/projects/${projectId}/apis/new`)}
            >
              Create New API
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
