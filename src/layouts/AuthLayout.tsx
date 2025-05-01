import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Database, Server, Lock, Code, Layers } from "lucide-react";
import { motion } from "framer-motion";

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      icon: <Code className="h-6 w-6 text-indigo-100" />,
      title: "No-Code API Building",
      description: "Create powerful APIs in minutes without writing code",
    },
    {
      icon: <Database className="h-6 w-6 text-indigo-100" />,
      title: "Database Compatibility",
      description: "Connect to any database with our seamless integrations",
    },
    {
      icon: <Layers className="h-6 w-6 text-indigo-100" />,
      title: "API Management",
      description: "Monitor, scale, and secure your APIs effortlessly",
    },
    {
      icon: <Lock className="h-6 w-6 text-indigo-100" />,
      title: "Enterprise Security",
      description: "Bank-grade protection for your API endpoints",
    },
  ];

  // Stagger animation for features
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Features */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-500 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <defs>
              <pattern
                id="pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#pattern)" />
          </svg>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-5xl font-bold text-white mb-3">Smaapi</h1>
            <p className="text-2xl text-indigo-100 font-light">
              APIs made simple
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                variants={item}
              >
                <div className="bg-white/10 p-3 rounded-xl shadow-inner">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {feature.title}
                  </h3>
                  <p className="text-indigo-100">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex flex-col flex-1 px-6 py-12 sm:px-8 lg:px-16 xl:px-24 justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 mb-4 shadow-lg"
            >
              <Server className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900">Smaapi</h2>
              <p className="mt-1 text-center text-sm text-gray-600">
                APIs made simple
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
