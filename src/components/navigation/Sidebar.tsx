import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Server, 
  Database as DatabaseIcon, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Table
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Animation variants
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '72px' }
  };

  const logoVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none', transition: { duration: 0.2 } }
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/projects', icon: <FolderKanban size={20} />, label: 'Projects' },
    { path: '/tables', icon: <Table size={20} />, label: 'Tables' },
    { path: '/services', icon: <Server size={20} />, label: 'Services', comingSoon: true },
    { path: '/data', icon: <DatabaseIcon size={20} />, label: 'Data', comingSoon: true },
  ];

  return (
    <motion.aside 
      className="bg-white border-r border-gray-200 z-20 h-full flex flex-col"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <motion.div 
          variants={logoVariants}
          animate={collapsed ? 'collapsed' : 'expanded'}
          initial={false}
          className="flex items-center"
        >
          <Server className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-semibold text-gray-800">API Builder</span>
        </motion.div>
        
        {/* Toggle button */}
        <button 
          onClick={toggleSidebar} 
          className={`p-1 rounded-full hover:bg-gray-100 ${collapsed ? 'ml-auto' : 'ml-auto'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              group flex items-center px-2 py-2 text-sm font-medium rounded-md relative
            `}
          >
            <div className="flex items-center">
              {item.icon}
              <motion.span 
                className="ml-3"
                variants={logoVariants}
                animate={collapsed ? 'collapsed' : 'expanded'}
                initial={false}
              >
                {item.label}
              </motion.span>
            </div>
            
            {item.comingSoon && (
              <motion.span 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 ml-auto"
                variants={logoVariants}
                animate={collapsed ? 'collapsed' : 'expanded'}
                initial={false}
              >
                Soon
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Bottom actions */}
      <div className="p-2 border-t border-gray-200">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            group flex items-center px-2 py-2 text-sm font-medium rounded-md
          `}
        >
          <Settings size={20} />
          <motion.span 
            className="ml-3"
            variants={logoVariants}
            animate={collapsed ? 'collapsed' : 'expanded'}
            initial={false}
          >
            Settings
          </motion.span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="w-full mt-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
        >
          <LogOut size={20} />
          <motion.span 
            className="ml-3"
            variants={logoVariants}
            animate={collapsed ? 'collapsed' : 'expanded'}
            initial={false}
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;