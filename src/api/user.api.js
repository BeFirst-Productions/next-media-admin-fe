import api from './axios'

export const userApi = {
  list:           (params) => api.get('/admin/admins', { params }),
  getById:        (id)     => api.get(`/admin/admins/${id}`),
  create:         (data)   => api.post('/admin/admins', data),
  update:         (id, d)  => api.patch(`/admin/admins/${id}`, d),
  toggle:         (id)     => api.patch(`/admin/admins/${id}/toggle`),
  delete:         (id)     => api.delete(`/admin/admins/${id}`),
  changePassword: (data)   => api.patch('/admin/admins/me/password', data),
}