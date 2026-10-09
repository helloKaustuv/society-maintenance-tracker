import api from './api';

export const dashboardService = {
  getAdminDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }
};
