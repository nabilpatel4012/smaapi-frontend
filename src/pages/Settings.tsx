import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, Sliders, Palette } from 'lucide-react';

const Settings: React.FC = () => {
  // Navigation items
  const navItems = [
    { 
      to: '/settings/account', 
      label: 'Account Settings', 
      icon: <UserCircle size={20} />,
      description: 'Manage your personal account information'
    },
    { 
      to: '/settings/project', 
      label: 'Project Settings', 
      icon: <Sliders size={20} />,
      description: 'Configure database and API project settings'
    },
    { 
      to: '/settings/appearance', 
      label: 'Appearance', 
      icon: <Palette size={20} />,
      description: 'Customize the UI appearance'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  block border-l-4 px-4 py-3 transition-colors
                  ${isActive 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-transparent hover:bg-gray-50'}
                `}
              >
                {({ isActive }) => (
                  <div className="flex items-start">
                    <div className={`mr-3 mt-0.5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className={isActive ? 'text-indigo-700 font-medium' : 'text-gray-700'}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;