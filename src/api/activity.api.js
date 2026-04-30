import api from './axios'

export const activityApi = {
  list: (params) => api.get('/admin/activities', { params }),
  create: (data) => api.post('/admin/activities', data),
}
