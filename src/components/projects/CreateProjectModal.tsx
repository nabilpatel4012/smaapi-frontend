import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Database } from "lucide-react";
import Button from "../common/Button";
import apiClient from "../../utils/apiClient";

// Database types constants
const SUPPORTED_DB = {
  POSTGRES: "PG",
  MYSQL: "MQL",
  MONGODB: "MNGDB",
  SQLITE: "SQLTE",
};

// Instance types constants
const DB_INSTANCE_TYPES = {
  CUSTOM: "CUSTOM",
  SMAAPI_GEN: "SMAAPI_GEN",
};

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (projectData: {
    project_id: number;
    user_id: number;
    project_name: string;
    project_description: string;
    db_type: string;
    db_instance_type: string;
    created_at: string;
  }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    project_name: "",
    project_description: "",
    db_type: SUPPORTED_DB.POSTGRES,
    db_instance_type: DB_INSTANCE_TYPES.CUSTOM,
    db_creds: {
      host: "",
      port: "",
      username: "",
      password: "",
      database: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitProgress, setSubmitProgress] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
    }

    if (!formData.db_type) {
      newErrors.db_type = "Database type is required";
    }

    if (!formData.db_instance_type) {
      newErrors.db_instance_type = "Database instance type is required";
    }

    if (formData.db_instance_type === DB_INSTANCE_TYPES.CUSTOM) {
      if (!formData.db_creds.host.trim()) {
        newErrors.db_creds_host = "Host is required";
      }
      if (!formData.db_creds.port || isNaN(Number(formData.db_creds.port))) {
        newErrors.db_creds_port = "Valid port is required";
      }
      if (!formData.db_creds.database.trim()) {
        newErrors.db_creds_database = "Database name is required";
      }
    }

    if (!formData.db_creds.username.trim()) {
      newErrors.db_creds_username = "Username is required";
    }
    if (!formData.db_creds.password.trim()) {
      newErrors.db_creds_password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setSubmitProgress("submitting");

        // Construct API payload
        const payload = {
          project_name: formData.project_name,
          project_description: formData.project_description,
          db_type: formData.db_type,
          db_instance_type: formData.db_instance_type,
          db_creds:
            formData.db_instance_type === DB_INSTANCE_TYPES.CUSTOM
              ? {
                  host: formData.db_creds.host,
                  port: Number(formData.db_creds.port),
                  username: formData.db_creds.username,
                  password: formData.db_creds.password,
                  database: formData.db_creds.database,
                }
              : {
                  username: formData.db_creds.username,
                  password: formData.db_creds.password,
                },
        };

        // Make API call to create project
        const response = await apiClient.post("/core/projects", payload);

        // Set success state
        setSubmitProgress("success");

        // Call the onSubmit prop with the created project data
        if (onSubmit) {
          onSubmit({
            ...response.data,
            db_instance_type: formData.db_instance_type,
          });
        }

        // Short delay to show success state before closing
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Reset form and close modal
        setFormData({
          project_name: "",
          project_description: "",
          db_type: SUPPORTED_DB.POSTGRES,
          db_instance_type: DB_INSTANCE_TYPES.CUSTOM,
          db_creds: {
            host: "",
            port: "",
            username: "",
            password: "",
            database: "",
          },
        });
        setErrors({});
        onClose();
      } catch (error: any) {
        console.error("Error creating project:", error);
        setApiError(
          error.response?.data?.message ||
            "Failed to create project. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const databaseTypes = [
    {
      id: SUPPORTED_DB.POSTGRES,
      name: "PostgreSQL",
      description: "Advanced open-source database",
      icon: <Database className="h-5 w-5 text-blue-500" />,
    },
    {
      id: SUPPORTED_DB.MYSQL,
      name: "MySQL",
      description: "Popular open-source database",
      icon: <Database className="h-5 w-5 text-orange-500" />,
    },
    {
      id: SUPPORTED_DB.MONGODB,
      name: "MongoDB",
      description: "NoSQL document database",
      icon: <Database className="h-5 w-5 text-green-500" />,
    },
    {
      id: SUPPORTED_DB.SQLITE,
      name: "SQLite",
      description: "Lightweight file-based database",
      icon: <Database className="h-5 w-5 text-purple-500" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 h-full w-full"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Project
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4">
                {apiError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600">{apiError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Project Name */}
                  <div>
                    <label
                      htmlFor="project_name"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="project_name"
                      value={formData.project_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          project_name: e.target.value,
                        })
                      }
                      className={`mt-0.5 block w-full rounded-md shadow-sm text-sm ${
                        errors.project_name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      }`}
                    />
                    {errors.project_name && (
                      <p className="mt-0.5 text-xs text-red-600">
                        {errors.project_name}
                      </p>
                    )}
                  </div>

                  {/* Project Description */}
                  <div>
                    <label
                      htmlFor="project_description"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="project_description"
                      rows={2}
                      value={formData.project_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          project_description: e.target.value,
                        })
                      }
                      className="mt-0.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Database Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Database Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {databaseTypes.map((db) => (
                        <div
                          key={db.id}
                          className={`cursor-pointer rounded-md border p-3 ${
                            formData.db_type === db.id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setFormData({ ...formData, db_type: db.id })
                          }
                        >
                          <div className="flex items-center">
                            {db.icon}
                            <div className="ml-2">
                              <h4 className="text-xs font-medium text-gray-900">
                                {db.name}
                              </h4>
                              <p className="text-[0.65rem] text-gray-500">
                                {db.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.db_type && (
                      <p className="mt-0.5 text-xs text-red-600">
                        {errors.db_type}
                      </p>
                    )}
                  </div>

                  {/* Database Instance Type Toggle */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Database Instance Type
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                          formData.db_instance_type === DB_INSTANCE_TYPES.CUSTOM
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            db_instance_type: DB_INSTANCE_TYPES.CUSTOM,
                          })
                        }
                      >
                        Custom
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                          formData.db_instance_type ===
                          DB_INSTANCE_TYPES.SMAAPI_GEN
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            db_instance_type: DB_INSTANCE_TYPES.SMAAPI_GEN,
                          })
                        }
                      >
                        Auto Generated
                      </button>
                    </div>
                    {errors.db_instance_type && (
                      <p className="mt-0.5 text-xs text-red-600">
                        {errors.db_instance_type}
                      </p>
                    )}
                  </div>

                  {/* Database Credentials */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Database Credentials
                    </label>
                    <div className="space-y-3">
                      {formData.db_instance_type ===
                        DB_INSTANCE_TYPES.CUSTOM && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="db_creds_host"
                                className="block text-xs font-medium text-gray-700"
                              >
                                Host
                              </label>
                              <input
                                type="text"
                                id="db_creds_host"
                                value={formData.db_creds.host}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    db_creds: {
                                      ...formData.db_creds,
                                      host: e.target.value,
                                    },
                                  })
                                }
                                className={`mt-0.5 block w-full rounded-md shadow-sm text-sm ${
                                  errors.db_creds_host
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                }`}
                              />
                              {errors.db_creds_host && (
                                <p className="mt-0.5 text-xs text-red-600">
                                  {errors.db_creds_host}
                                </p>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="db_creds_port"
                                className="block text-xs font-medium text-gray-700"
                              >
                                Port
                              </label>
                              <input
                                type="text"
                                id="db_creds_port"
                                value={formData.db_creds.port}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    db_creds: {
                                      ...formData.db_creds,
                                      port: e.target.value,
                                    },
                                  })
                                }
                                className={`mt-0.5 block w-full rounded-md shadow-sm text-sm ${
                                  errors.db_creds_port
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                }`}
                              />
                              {errors.db_creds_port && (
                                <p className="mt-0.5 text-xs text-red-600">
                                  {errors.db_creds_port}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="db_creds_database"
                              className="block text-xs font-medium text-gray-700"
                            >
                              Database
                            </label>
                            <input
                              type="text"
                              id="db_creds_database"
                              value={formData.db_creds.database}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  db_creds: {
                                    ...formData.db_creds,
                                    database: e.target.value,
                                  },
                                })
                              }
                              className={`mt-0.5 block w-full rounded-md shadow-sm text-sm ${
                                errors.db_creds_database
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                              }`}
                            />
                            {errors.db_creds_database && (
                              <p className="mt-0.5 text-xs text-red-600">
                                {errors.db_creds_database}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="db_creds_username"
                            className="block text-xs font-medium text-gray-700"
                          >
                            Username
                          </label>
                          <input
                            type="text"
                            id="db_creds_username"
                            value={formData.db_creds.username}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                db_creds: {
                                  ...formData.db_creds,
                                  username: e.target.value,
                                },
                              })
                            }
                            className={`mt-0.5 block w-full rounded-md shadow-sm text-sm ${
                              errors.db_creds_username
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            }`}
                          />
                          {errors.db_creds_username && (
                            <p className="mt-0.5 text-xs text-red-600">
                              {errors.db_creds_username}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="db_creds_password"
                            className="block text-xs font-medium text-gray-700"
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            id="db_creds_password"
                            value={formData.db_creds.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                db_creds: {
                                  ...formData.db_creds,
                                  password: e.target.value,
                                },
                              })
                            }
                            className={`mt-0.5 block w-full rounded-md shadow-sm text-sm ${
                              errors.db_creds_password
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            }`}
                          />
                          {errors.db_creds_password && (
                            <p className="mt-0.5 text-xs text-red-600">
                              {errors.db_creds_password}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 text-sm relative ${
                      submitProgress === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }`}
                  >
                    {submitProgress === "idle" && "Create Project"}
                    {submitProgress === "submitting" && (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </span>
                    )}
                    {submitProgress === "success" && (
                      <span className="flex items-center">
                        <svg
                          className="-ml-1 mr-1.5 h-3 w-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Created!
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
