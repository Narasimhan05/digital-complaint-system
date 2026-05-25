import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Shield,
  Users,
  BarChart3,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={22} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">DigiComplaint</span>
            <span className="sidebar-logo-subtitle">Management System</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} className="sidebar-link-icon" />
          Dashboard
        </NavLink>

        <NavLink
          to="/complaints/new"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <PlusCircle size={18} className="sidebar-link-icon" />
          Raise Complaint
        </NavLink>

        <NavLink
          to="/complaints"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <List size={18} className="sidebar-link-icon" />
          My Complaints
        </NavLink>

        {isAdmin() && (
          <>
            <div className="sidebar-section-label">Admin</div>

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} className="sidebar-link-icon" />
              Admin Dashboard
            </NavLink>

            <NavLink
              to="/admin/complaints"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <AlertTriangle size={18} className="sidebar-link-icon" />
              All Complaints
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} className="sidebar-link-icon" />
              Users
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%' }}>
          <LogOut size={18} className="sidebar-link-icon" />
          Logout
        </button>
      </div>
    </aside>
  );
}
