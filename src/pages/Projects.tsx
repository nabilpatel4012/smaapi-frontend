import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { Plus, Filter, Database as DatabaseIcon, Search } from 'lucide-react';
import { mockProjects } from '../mock/data';

const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [databaseFilter, setDatabaseFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter projects based on search term and database filter
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDatabase = !databaseFilter || project.databaseType === databaseFilter;
    
    return matchesSearch && matchesDatabase;
  });

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Database type badge color mapping
  const databaseColors: Record<string, string> = {
    'MongoDB': 'bg-green-100 text-green-800',
    'PostgreSQL': 'bg-blue-100 text-blue-800',
    'MySQL': 'bg-orange-100 text-orange-800',
    'DynamoDB': 'bg-purple-100 text-purple-800'
  };

  const handleCreateProject = (projectData: {
    name: string;
    description: string;
    databaseType: string;
  }) => {
    // In a real app, this would make an API call to create the project
    console.log('Creating project:', projectData);
    // For now, we'll just close the modal
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Projects</h1>
          <p className="text-gray-600 mt-1">Manage and organize your API projects</p>
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
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filterOpen && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Database:</span>
              {["MongoDB", "PostgreSQL", "MySQL", "DynamoDB"].map((db) => (
                <Badge
                  key={db}
                  variant="default"
                  className={`cursor-pointer ${databaseFilter === db ? '!bg-indigo-100 !text-indigo-800' : ''}`}
                  onClick={() => setDatabaseFilter(databaseFilter === db ? null : db)}
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
            <motion.div key={project.id} variants={cardVariants}>
              <Link to={`/projects/${project.id}`}>
                <Card className="h-full" interactive>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${databaseColors[project.databaseType] || 'bg-gray-100 text-gray-800'}`}>
                        {project.databaseType}
                      </span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <DatabaseIcon size={16} className="text-gray-400" />
                        <span className="ml-1 text-sm text-gray-600">{project.apiCount} APIs</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(project.createdAt)}</span>
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
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
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