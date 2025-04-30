import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import {
  Plus,
  Filter,
  Database as DatabaseIcon,
  Search,
  Loader,
} from "lucide-react";
import apiClient from "../utils/apiClient";
import { AuthContext } from "../context/AuthContext";

// Define the project interface based on API response
interface Project {
  project_id: number;
  user_id: number;
  project_name: string;
  project_description: string;
  db_type: string;
  created_at: string;
}

const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [databaseFilter, setDatabaseFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useContext(AuthContext);

  // Database type mapping for display
  const dbTypeMap: Record<string, string> = {
    PG: "PostgreSQL",
    MQL: "MySQL",
    MNGDB: "MongoDB",
    SQLTE: "SQLite",
  };

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get("/core/projects");
        setProjects(response.data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search term and database filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.project_description &&
        project.project_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesDatabase =
      !databaseFilter || dbTypeMap[project.db_type] === databaseFilter;

    return matchesSearch && matchesDatabase;
  });

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
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

  // Database type badge color mapping
  const databaseColors: Record<string, string> = {
    MongoDB: "bg-green-100 text-green-800",
    PostgreSQL: "bg-blue-100 text-blue-800",
    MySQL: "bg-orange-100 text-orange-800",
    SQLite: "bg-purple-100 text-purple-800",
  };

  const handleCreateProject = async (projectData: Project) => {
    // Add the newly created project to the state
    setProjects([projectData, ...projects]);
  };

  // Get database display name
  const getDbDisplayName = (dbType: string) => {
    return dbTypeMap[dbType] || dbType;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader size={32} className="animate-spin mx-auto text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">
          Error loading projects
        </h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your API projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            leftIcon={<Filter size={16} />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Updated search input with proper icon positioning */}
          <div className="relative flex-grow search-input-container">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              className="block w-full pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filterOpen && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Database:</span>
              {Object.values(dbTypeMap).map((db) => (
                <Badge
                  key={db}
                  variant="default"
                  className={`cursor-pointer ${
                    databaseFilter === db
                      ? "!bg-indigo-100 !text-indigo-800"
                      : ""
                  }`}
                  onClick={() =>
                    setDatabaseFilter(databaseFilter === db ? null : db)
                  }
                >
                  {db}
                </Badge>
              ))}

              {databaseFilter && (
                <button
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                  onClick={() => setDatabaseFilter(null)}
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.project_id} variants={cardVariants}>
              <Link to={`/projects/${project.project_id}`}>
                <Card className="h-full" interactive>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {project.project_name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          databaseColors[getDbDisplayName(project.db_type)] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDbDisplayName(project.db_type)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {project.project_description || "No description"}
                    </p>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <DatabaseIcon size={16} className="text-gray-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          API Project
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <DatabaseIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No projects found
          </h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="primary"
            className="mt-4"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Project
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
