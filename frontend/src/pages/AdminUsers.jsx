import { useState, useEffect } from 'react';
import { adminAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import { Users, Shield, User } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">All registered users in the system</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Users</span>
            <div className="stat-card-icon blue"><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{users.length}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Admins</span>
            <div className="stat-card-icon purple"><Shield size={18} /></div>
          </div>
          <div className="stat-card-value">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-card-header">
            <span className="stat-card-label">Regular Users</span>
            <div className="stat-card-icon emerald"><User size={18} /></div>
          </div>
          <div className="stat-card-value">
            {users.filter((u) => u.role === 'USER').length}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{u.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: u.role === 'ADMIN'
                        ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))'
                        : 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: 'white',
                    }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'badge-escalated' : 'badge-raised'}`}
                        style={{ animation: 'none' }}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
