import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import { Send, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['IT', 'HR', 'INFRASTRUCTURE', 'BILLING', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function RaiseComplaint() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.title || form.title.length < 5) errs.title = 'Title must be at least 5 characters';
    if (!form.description || form.description.length < 10)
      errs.description = 'Description must be at least 10 characters';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.priority) errs.priority = 'Please select a priority';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await complaintAPI.create(form);
      toast.success('Complaint raised successfully!');
      navigate('/complaints');
    } catch (err) {
      const data = err.response?.data;
      if (data?.data && typeof data.data === 'object') {
        setErrors(data.data);
      } else {
        toast.error(data?.message || 'Failed to raise complaint');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

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
        <h1 className="page-title">Raise a Complaint</h1>
        <p className="page-subtitle">Describe your issue and we'll get it resolved</p>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="complaint-title">Title</label>
              <input
                id="complaint-title"
                type="text"
                className="form-input"
                placeholder="Brief summary of your complaint"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="complaint-description">Description</label>
              <textarea
                id="complaint-description"
                className="form-textarea"
                placeholder="Provide detailed description of the issue..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="complaint-category">Category</label>
                <select
                  id="complaint-category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="complaint-priority">Priority</label>
                <select
                  id="complaint-priority"
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                >
                  <option value="">Select priority</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.priority && <span className="form-error">{errors.priority}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                id="submit-complaint"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Send size={16} />
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
