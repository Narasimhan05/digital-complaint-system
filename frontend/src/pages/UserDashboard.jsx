import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/endpoints';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  PlusCircle, Clock, AlertTriangle, CheckCircle, Archive, Inbox,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All', icon: Inbox },
  { value: 'RAISED', label: 'Raised', icon: PlusCircle },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
  { value: 'ESCALATED', label: 'Escalated', icon: AlertTriangle },
  { value: 'RESOLVED', label: 'Resolved', icon: CheckCircle },
  { value: 'CLOSED', label: 'Closed', icon: Archive },
];

export default function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getMyComplaints(page, 10, statusFilter);
      setComplaints(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getSlaInfo = (complaint) => {
    if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
      return <span className="sla-ok">✓ Completed</span>;
    }
    if (complaint.slaBreach) {
      return <span className="sla-breach">⚠ SLA Breached</span>;
    }
    const deadline = new Date(complaint.slaDeadline);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.floor((deadline - now) / (1000 * 60 * 60)));
    return <span className="sla-ok">{hoursLeft}h remaining</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Complaints</h1>
        <p className="page-subtitle">Track and manage your submitted complaints</p>
        <div className="page-header-actions">
          <button
            id="raise-complaint-btn"
            className="btn btn-primary"
            onClick={() => navigate('/complaints/new')}
          >
            <PlusCircle size={16} />
            Raise New Complaint
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-chip ${statusFilter === f.value ? 'active' : ''}`}
            onClick={() => { setStatusFilter(f.value); setPage(0); }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading complaints...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Inbox size={28} />
          </div>
          <h3 className="empty-state-title">No complaints found</h3>
          <p className="empty-state-desc">
            {statusFilter
              ? `No complaints with status "${statusFilter}". Try a different filter.`
              : 'You haven\'t raised any complaints yet. Click "Raise New Complaint" to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="complaint-list">
            {complaints.map((c, idx) => (
              <div
                key={c.id}
                className="complaint-card"
                onClick={() => navigate(`/complaints/${c.id}`)}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="complaint-card-top">
                  <div>
                    <span className="complaint-card-id">#{c.id}</span>
                    <h3 className="complaint-card-title">{c.title}</h3>
                    <p className="complaint-card-desc">{c.description}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="complaint-card-meta">
                  <PriorityBadge priority={c.priority} />
                  <CategoryBadge category={c.category} />
                  <span className="complaint-card-meta-item">
                    <Clock size={12} />
                    {formatDate(c.createdAt)}
                  </span>
                  <span className="complaint-card-meta-item">
                    {getSlaInfo(c)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`pagination-btn ${page === i ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
