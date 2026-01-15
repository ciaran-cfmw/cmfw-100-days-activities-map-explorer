import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapExplorer from './pages/MapExplorer';
import { RequireAuth } from './components/RequireAuth';
import { Loader } from './components/Loader';

// Lazy-load Admin routes to reduce initial bundle size
const Login = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));

const AdminFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-brandBlack">
    <div className="text-center">
      <Loader />
      <p className="mt-4 text-brandCream text-sm">Loading Admin...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<AdminFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MapExplorer />} />

          {/* Admin Routes - Lazy Loaded */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;