import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  registerAdmin: (data) => api.post('/auth/register-admin', data),
};

export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  getMyComplaints: (page = 0, size = 10, status = '') => {
    const params = { page, size };
    if (status) params.status = status;
    return api.get('/complaints', { params });
  },
  getById: (id) => api.get(`/complaints/${id}`),
  getHistory: (id) => api.get(`/complaints/${id}/history`),
};

export const adminAPI = {
  getAllComplaints: (page = 0, size = 10, status = '') => {
    const params = { page, size };
    if (status) params.status = status;
    return api.get('/admin/complaints', { params });
  },
  assignComplaint: (id, assigneeId) =>
    api.put(`/admin/complaints/${id}/assign`, { assigneeId }),
  updateStatus: (id, status, comment = '') =>
    api.put(`/admin/complaints/${id}/status`, { status, comment }),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
};
