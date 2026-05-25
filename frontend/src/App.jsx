import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected Routes — wrapped in Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* User Routes */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/complaints" element={<UserDashboard />} />
        <Route path="/complaints/new" element={<RaiseComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/complaints" element={
          <ProtectedRoute adminOnly><AdminComplaints /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}
