import api from './axios'

export const activityApi = {
  list: (params) => api.get('http://localhost:8086/api/v1/admin/activities', { params }),
  create: (data) => api.post('http://localhost:8086/api/v1/admin/activities', data),
}
