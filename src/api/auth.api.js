import api from './axios'

export const authApi = {
  login:   (data) => api.post('/admin/auth/login', data),
  logout:  ()     => api.post('/admin/auth/logout'),
  getMe:   ()     => api.get('/admin/auth/me'),
  refresh: ()     => api.post('/admin/auth/refresh'),
}