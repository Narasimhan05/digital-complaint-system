import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import {
  BarChart3, AlertTriangle, Clock, CheckCircle, Archive,
  PlusCircle, Users, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#64748b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const barData = [
    { name: 'Raised', value: stats.raisedCount, fill: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgressCount, fill: '#f59e0b' },
    { name: 'Escalated', value: stats.escalatedCount, fill: '#ef4444' },
    { name: 'Resolved', value: stats.resolvedCount, fill: '#10b981' },
    { name: 'Closed', value: stats.closedCount, fill: '#64748b' },
  ];

  const pieData = barData.filter((d) => d.value > 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and complaint statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Complaints</span>
            <div className="stat-card-icon blue"><BarChart3 size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalComplaints}</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-card-header">
            <span className="stat-card-label">In Progress</span>
            <div className="stat-card-icon amber"><Clock size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.inProgressCount}</div>
        </div>

        <div className="stat-card red">
          <div className="stat-card-header">
            <span className="stat-card-label">SLA Breaches</span>
            <div className="stat-card-icon red"><AlertTriangle size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.slaBreachCount}</div>
        </div>

        <div className="stat-card emerald">
          <div className="stat-card-header">
            <span className="stat-card-label">Resolved</span>
            <div className="stat-card-icon emerald"><CheckCircle size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.resolvedCount}</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Users</span>
            <div className="stat-card-icon purple"><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Complaints by Status</span>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(59,130,246,0.15)' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(59,130,246,0.15)' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 22, 41, 0.95)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Distribution</span>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: '#64748b' }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 22, 41, 0.95)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-state-desc">No data to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/admin/complaints')}>
          <AlertTriangle size={16} /> View All Complaints
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
          <Users size={16} /> Manage Users
        </button>
      </div>
    </div>
  );
}
