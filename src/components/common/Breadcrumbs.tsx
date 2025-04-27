import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Map of path segments to display names
  const pathMap: Record<string, string> = {
    'projects': 'Projects',
    'services': 'Services',
    'data': 'Data',
    'settings': 'Settings',
    'account': 'Account',
    'project': 'Project',
    'appearance': 'Appearance',
  };
  
  // Don't show breadcrumbs on the dashboard
  if (pathnames.length === 0) {
    return null;
  }
  
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-sm">
        <li>
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Home"
          >
            <Home size={14} />
          </Link>
        </li>
        
        {pathnames.map((name, index) => {
          // For dynamic segments like :projectId, try to use a sensible display name
          let displayName = pathMap[name] || 
                            (name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) ? 'Details' : name);
          
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <li key={name} className="flex items-center">
              <ChevronRight size={14} className="text-gray-400" />
              {isLast ? (
                <span className="ml-1 text-gray-700 font-medium">{displayName}</span>
              ) : (
                <Link
                  to={routeTo}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;