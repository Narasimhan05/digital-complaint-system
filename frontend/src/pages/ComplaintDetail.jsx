import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/endpoints';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, User, AlertTriangle, Calendar } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, histRes] = await Promise.all([
        complaintAPI.getById(id),
        complaintAPI.getHistory(id),
      ]);
      setComplaint(compRes.data.data);
      setHistory(histRes.data.data);
    } catch (err) {
      toast.error('Failed to load complaint details');
      navigate('/complaints');
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading complaint...</span>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '12px' }}
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1 className="page-title">Complaint #{complaint.id}</h1>
          <StatusBadge status={complaint.status} />
          {complaint.slaBreach && (
            <span className="sla-breach">
              <AlertTriangle size={14} />
              SLA Breached
            </span>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left — Details */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Complaint Details</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <PriorityBadge priority={complaint.priority} />
                <CategoryBadge category={complaint.category} />
              </div>
            </div>
            <div className="card-body">
              <div className="detail-section">
                <h3 style={{
                  fontSize: '20px', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '12px',
                }}>
                  {complaint.title}
                </h3>
                <p className="detail-description">{complaint.description}</p>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
                borderTop: '1px solid var(--border-default)', paddingTop: '20px',
              }}>
                <div className="detail-field">
                  <div className="detail-field-label">
                    <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Raised By
                  </div>
                  <div className="detail-field-value">{complaint.raisedByName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {complaint.raisedByEmail}
                  </div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">
                    <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Assigned To
                  </div>
                  <div className="detail-field-value">
                    {complaint.assignedToName || 'Unassigned'}
                  </div>
                  {complaint.assignedToEmail && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {complaint.assignedToEmail}
                    </div>
                  )}
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Created At
                  </div>
                  <div className="detail-field-value">{formatDate(complaint.createdAt)}</div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    SLA Deadline
                  </div>
                  <div className="detail-field-value" style={{
                    color: complaint.slaBreach ? 'var(--accent-red)' : 'var(--text-primary)',
                  }}>
                    {formatDate(complaint.slaDeadline)}
                  </div>
                </div>

                {complaint.resolvedAt && (
                  <div className="detail-field">
                    <div className="detail-field-label">Resolved At</div>
                    <div className="detail-field-value">{formatDate(complaint.resolvedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Timeline */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Status History</span>
            </div>
            <div className="card-body">
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  No history available
                </p>
              ) : (
                <div className="timeline">
                  {history.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className={`timeline-dot ${
                        item.toStatus === 'ESCALATED' ? 'escalated' :
                        item.toStatus === 'RESOLVED' ? 'resolved' : ''
                      }`} />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-status-change">
                            {item.fromStatus === item.toStatus
                              ? item.toStatus
                              : `${item.fromStatus} → ${item.toStatus}`}
                          </span>
                          <span className="timeline-date">{formatDate(item.changedAt)}</span>
                        </div>
                        {item.comment && (
                          <p className="timeline-comment">{item.comment}</p>
                        )}
                        <p className="timeline-actor">by {item.changedByName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
