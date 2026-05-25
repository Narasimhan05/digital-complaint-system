export function StatusBadge({ status }) {
  const statusMap = {
    RAISED: 'badge-raised',
    IN_PROGRESS: 'badge-in-progress',
    ESCALATED: 'badge-escalated',
    RESOLVED: 'badge-resolved',
    CLOSED: 'badge-closed',
  };

  const labelMap = {
    RAISED: 'Raised',
    IN_PROGRESS: 'In Progress',
    ESCALATED: 'Escalated',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  };

  return (
    <span className={`badge ${statusMap[status] || 'badge-raised'}`}>
      {labelMap[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const priorityMap = {
    LOW: 'badge-low',
    MEDIUM: 'badge-medium',
    HIGH: 'badge-high',
    CRITICAL: 'badge-critical',
  };

  return (
    <span className={`badge ${priorityMap[priority] || ''}`}>
      {priority}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="badge" style={{
      background: 'rgba(139, 92, 246, 0.15)',
      color: '#a78bfa',
      border: '1px solid rgba(139, 92, 246, 0.3)',
    }}>
      {category}
    </span>
  );
}
