import api from './api';

export const noticeService = {
  getAllNotices: async () => {
    const response = await api.get('/notices');
    return response.data;
  },

  createNoticeAdmin: async (noticeData) => {
    const response = await api.post('/admin/notices', noticeData);
    return response.data;
  },

  updateNoticeAdmin: async (id, noticeData) => {
    const response = await api.patch(`/admin/notices/${id}`, noticeData);
    return response.data;
  },

  deleteNoticeAdmin: async (id) => {
    const response = await api.delete(`/admin/notices/${id}`);
    return response.data;
  }
};
