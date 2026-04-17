import api from './axios'
export const userApi = {
  list:           (params) => api.get('http://localhost:8086/api/v1/admin/admins', { params }),
  getById:        (id)     => api.get(`http://localhost:8086/api/v1/admin/admins/${id}`),
  create:         (data)   => api.post('http://localhost:8086/api/v1/admin/admins', data),
  update:         (id, d)  => api.patch(`http://localhost:8086/api/v1/admin/admins/${id}`, d),
  toggle:         (id)     => api.patch(`http://localhost:8086/api/v1/admin/admins/${id}/toggle`),
  delete:         (id)     => api.delete(`http://localhost:8086/api/v1/admin/admins/${id}`),
  changePassword: (data)   => api.patch('http://localhost:8086/api/v1/admin/admins/me/password', data),
}