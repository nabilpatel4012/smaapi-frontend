import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, User, Settings, LogOut } from 'lucide-react';
import Breadcrumbs from '../common/Breadcrumbs';

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects') && path.split('/').length > 2) return 'Project Details';
    if (path === '/projects') return 'Projects';
    if (path === '/services') return 'Services';
    if (path === '/data') return 'Data';
    if (path.startsWith('/settings')) return 'Settings';
    return '';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          
          {/* Breadcrumbs */}
          <div className="ml-4">
            <Breadcrumbs />
          </div>
        </div>
        
        {/* User profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.name}
            </span>
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user?.name || 'User'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={18} />
              )}
            </div>
          </button>
          
          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
              <Link
                to="/settings/account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User size={16} className="mr-2" />
                Account
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;