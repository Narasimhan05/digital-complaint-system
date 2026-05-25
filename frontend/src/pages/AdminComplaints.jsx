import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/endpoints';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import toast from 'react-hot-toast';
import {
  Inbox, Clock, AlertTriangle, CheckCircle, Archive, PlusCircle,
  UserPlus, RefreshCw, X,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'RAISED', label: 'Raised' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ESCALATED', label: 'Escalated' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const STATUS_OPTIONS = ['IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, usersRes] = await Promise.all([
        adminAPI.getAllComplaints(page, 10, statusFilter),
        adminAPI.getAllUsers(),
      ]);
      setComplaints(compRes.data.data.content);
      setTotalPages(compRes.data.data.totalPages);
      setUsers(usersRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assigneeId) {
      toast.error('Please select an assignee');
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.assignComplaint(selectedComplaint.id, parseInt(assigneeId));
      toast.success('Complaint assigned successfully');
      setShowAssignModal(false);
      setAssigneeId('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.updateStatus(selectedComplaint.id, newStatus, statusComment);
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      setNewStatus('');
      setStatusComment('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Complaints</h1>
        <p className="page-subtitle">Manage and resolve complaints across the system</p>
      </div>

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

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Inbox size={28} /></div>
          <h3 className="empty-state-title">No complaints found</h3>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Raised By</th>
                  <th>Assigned To</th>
                  <th>SLA</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{c.id}</td>
                    <td>
                      <span
                        style={{
                          cursor: 'pointer', color: 'var(--accent-blue-light)',
                          fontWeight: 600,
                        }}
                        onClick={() => navigate(`/complaints/${c.id}`)}
                      >
                        {c.title}
                      </span>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td style={{ fontSize: '13px' }}>{c.raisedByName}</td>
                    <td style={{ fontSize: '13px' }}>
                      {c.assignedToName || (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      {c.slaBreach ? (
                        <span className="sla-breach">
                          <AlertTriangle size={12} /> Breached
                        </span>
                      ) : c.status === 'RESOLVED' || c.status === 'CLOSED' ? (
                        <span className="sla-ok">✓ Done</span>
                      ) : (
                        <span className="sla-ok">OK</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Assign"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setShowAssignModal(true);
                          }}
                        >
                          <UserPlus size={13} />
                        </button>
                        {c.status !== 'CLOSED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Update Status"
                            onClick={() => {
                              setSelectedComplaint(c);
                              setShowStatusModal(true);
                            }}
                          >
                            <RefreshCw size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Complaint #{selectedComplaint?.id}</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Assignee</label>
                <select
                  className="form-select"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — {u.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={actionLoading}
              >
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Update Status — #{selectedComplaint?.id}
              </h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Current status: <StatusBadge status={selectedComplaint?.status} />
              </p>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select new status...</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Comment (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add a comment about this status change..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
