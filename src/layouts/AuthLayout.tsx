import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Database, Server, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      icon: <Server className="h-6 w-6 text-indigo-500" />,
      title: 'API Management',
      description: 'Build, deploy and manage your APIs with ease'
    },
    {
      icon: <Database className="h-6 w-6 text-indigo-500" />,
      title: 'Data Monitoring',
      description: 'Real-time metrics and performance analytics'
    },
    {
      icon: <Lock className="h-6 w-6 text-indigo-500" />,
      title: 'Secure Access',
      description: 'Enterprise-grade security for your APIs'
    }
  ];

  // Stagger animation for features
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Features */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-500 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">API Builder Platform</h1>
          <p className="text-indigo-100 mb-10">The complete solution for building, managing, and scaling your APIs with ease.</p>
          
          <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {features.map((feature, index) => (
              <motion.div key={index} className="flex items-start space-x-4" variants={item}>
                <div className="bg-white/10 p-2 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                  <p className="text-indigo-100">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex flex-col flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 mb-4">
              <Server className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">API Builder</h2>
            <p className="mt-2 text-sm text-gray-600">Manage your APIs with confidence</p>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;