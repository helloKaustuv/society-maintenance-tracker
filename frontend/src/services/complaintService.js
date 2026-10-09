import api from './api';

export const complaintService = {
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyComplaints: async (params = {}) => {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  getAllComplaintsAdmin: async (params = {}) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  updateComplaintStatusAdmin: async (id, { status, note }) => {
    const response = await api.patch(`/admin/complaints/${id}/status`, { status, note });
    return response.data;
  },

  updateComplaintPriorityAdmin: async (id, { priority }) => {
    const response = await api.patch(`/admin/complaints/${id}/priority`, { priority });
    return response.data;
  },

  getComplaintHistoryAdmin: async (id) => {
    const response = await api.get(`/admin/complaints/${id}/history`);
    return response.data;
  }
};
