import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoadingScreen from "./components/common/LoadingScreen";

// Lazy-loaded components
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ApiDetail = lazy(() => import("./pages/ApiDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const AccountSettings = lazy(() => import("./pages/settings/AccountSettings"));
const ProjectSettings = lazy(() => import("./pages/settings/ProjectSettings"));
const AppearanceSettings = lazy(
  () => import("./pages/settings/AppearanceSettings")
);
const TableManager = lazy(() => import("./components/tables/TableManager"));
const CreateApiForm = lazy(() => import("./components/apis/CreateApiForm"));

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route
            path="projects/:projectId/apis/new"
            element={<CreateApiForm />}
          />
          <Route
            path="projects/:projectId/apis/:apiId"
            element={<ApiDetail />}
          />
          <Route path="tables" element={<TableManager />} />
          <Route path="services" element={<ComingSoon title="Services" />} />
          <Route path="data" element={<ComingSoon title="Data" />} />

          {/* Settings routes */}
          <Route path="settings" element={<Settings />}>
            <Route
              index
              element={<Navigate to="/settings/account" replace />}
            />
            <Route path="account" element={<AccountSettings />} />
            <Route path="project" element={<ProjectSettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

// Simple coming soon component
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
    <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
    <p className="text-lg text-gray-600">This feature is coming soon!</p>
  </div>
);

export default App;
